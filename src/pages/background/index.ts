// External Dependencies
import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { Ollama } from '@langchain/community/llms/ollama';
import { Document } from '@langchain/core/documents';
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  MessageContent,
} from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { Runnable, RunnableSequence } from '@langchain/core/runnables';
import { ConsoleCallbackHandler } from '@langchain/core/tracers/console';
import { IterableReadableStream } from '@langchain/core/utils/stream';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { formatDocumentsAsString } from 'langchain/util/document';

// Relative Dependencies
import { EnhancedMemoryVectorStore } from '@src/vector-stores/enhancedMemory';
import { Message } from '../panel/types';

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'SELECTED_TEXT_MENU_OPTION',
    title: 'Ask Local AI',
    contexts: ['all'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'SELECTED_TEXT_MENU_OPTION') {
    chrome.sidePanel.open({ windowId: tab!.windowId });

    const message = {
      type: 'SELECTED_TEXT_MENU_OPTION_RESPONSE',
      text: info.selectionText,
    };

    const checkIfPanelReady = () =>
      new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { type: 'CHECK_PANEL_READY' },
          (response) => {
            if (response && response.ready) {
              resolve(true);
            } else {
              setTimeout(() => resolve(checkIfPanelReady()), 100);
            }
          }
        );
      });

    await checkIfPanelReady();
    chrome.runtime.sendMessage(message);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    chrome.runtime.sendMessage({ type: 'TAB_CHANGED', tab });
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.runtime.sendMessage({ type: 'TAB_CHANGED', tab });
  }
});

interface VectorStoreMetadata {
  vectorStore: EnhancedMemoryVectorStore;
  createdAt: number;
}

const vectorStoreMap = new Map<string, VectorStoreMetadata>();
// let attachments: Attachment[] = [];
let completion = '';
let controller = new AbortController();

const SYS_PROMPT_TEMPLATE = `Use the following context when responding to the prompt.\n\nBEGIN CONTEXT\n\n{filtered_context}\n\nEND CONTEXT`;
const MAX_CHAT_HISTORY = 3;

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type === 'PARSE_WEBPAGE') {
    const { context, chunkSize, chunkOverlap, url } = message;

    // Delete all vector stores that are expired
    vectorStoreMap.forEach(
      (vectorStoreMetdata: VectorStoreMetadata, url: string) => {
        // Default to 60 minutes
        if (Date.now() - vectorStoreMetdata.createdAt > 60 * 60 * 1000) {
          vectorStoreMap.delete(url);
          console.log(`Deleting vector store for url: ${url}`);
        }
      }
    );

    let vectorStore: EnhancedMemoryVectorStore;
    let documentsCount: number;

    if (!vectorStoreMap.has(url)) {
      const documents = await createDocuments(chunkSize, chunkOverlap, context);
      documentsCount = documents.length;

      console.log('documents', documents.length);

      // Load Documents into the vector store
      // TODO: Add support for selecting embedding model
      vectorStore = new EnhancedMemoryVectorStore(
        new OllamaEmbeddings({
          baseUrl: 'http://localhost:11434',
          model: 'mxbai-embed-large',
          keepAlive: '60m',
        })
      );

      for (let index = 0; index < documents.length; index++) {
        if (controller.signal.aborted) {
          chrome.runtime.sendMessage({
            type: 'PARSE_WEBPAGE_RESPONSE',
            docNumber: index + 1,
            docCount: documentsCount,
            done: true,
          });
          return;
        }
        const doc = documents[index];

        await vectorStore.addDocuments([
          new Document({
            pageContent: doc.pageContent,
            metadata: { ...doc.metadata, docId: index }, // add document ID
          }),
        ]);
        chrome.runtime
          .sendMessage({
            type: 'PARSE_WEBPAGE_RESPONSE',
            docNumber: index + 1,
            docCount: documentsCount,
            done: index === documents.length - 1,
          })
          .catch(() => {
            console.log(
              'Sending document embedding message, but panel is closed...'
            );
          });
      }
    }
  } else if (message.type === 'SEND_MESSAGE') {
    const { content, url, useWebPageContext, host } = message;
    const prompt = content.trim();

    if (useWebPageContext && vectorStoreMap.has(url)) {
      let vectorStore: EnhancedMemoryVectorStore =
        vectorStoreMap.get(url)?.vectorStore!;
      let documentsCount: number = vectorStore.memoryVectors.length;

      const retriever = vectorStore.asRetriever({
        k: computeK(documentsCount),
        searchType: 'hybrid',
        callbacks: [new ConsoleCallbackHandler()],
      });

      const chatPrompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(SYS_PROMPT_TEMPLATE),
        ...(await getMessages()),
      ]);

      const model = getChatModel(host, message.model);
      const chain = RunnableSequence.from([
        {
          filtered_context: retriever.pipe(formatDocumentsAsString),
        },
        chatPrompt,
        model,
        new StringOutputParser(),
      ]);

      const stream = await chain.stream(prompt);
      streamChunks(stream);
    } else {
      const chatPrompt = ChatPromptTemplate.fromMessages(await getMessages());
      const model = getChatModel(host, message.model);
      const chain = chatPrompt.pipe(model).pipe(new StringOutputParser());

      const stream = await chain.stream({});
      streamChunks(stream);
    }
  } else if (message.type === 'CANCEL_REQUEST') {
    console.log('Cancelling request...');
    controller.abort();

    await sleep(300); // hack to allow embeddings generation to stop
    chrome.runtime.sendMessage({ done: true }).catch(() => {
      chrome.storage.sync.set({
        completion: completion,
        sender: 'assistant',
      });
    });

    // reset abort controller
    controller = new AbortController();
  }
});

const streamChunks = async (stream: IterableReadableStream<string>) => {
  completion = '';
  try {
    for await (const chunk of stream) {
      completion += chunk;
      chrome.runtime
        .sendMessage({ completion: completion, sender: 'assistant' })
        .catch(() => {
          console.log('Sending partial completion, but popup is closed...');
        });
    }
  } catch (error) {
    console.log('Cancelling LLM request...');
    return;
  }
  chrome.runtime.sendMessage({ done: true }).catch(() => {
    console.log('Sending done message, but popup is closed...');
    chrome.storage.sync.set({ completion: completion, sender: 'assistant' });
  });
};

const createDocuments = async (
  chunkSize: number,
  chunkOverlap: number,
  context: string
): Promise<Document[]> => {
  const documents: Document[] = [];

  // if (attachments.length > 0) {
  //   for (const attachment of attachments) {
  //     const extension = getExtension(attachment.name);
  //     if (!SUPPORTED_IMG_FORMATS.includes(extension)) {
  //       // only add non-image attachments
  //       documents.push(...(await getDocuments(attachment)));
  //     }
  //   }
  // }

  if (context !== '') {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: chunkSize,
      chunkOverlap: chunkOverlap,
    });
    documents.push(...(await splitter.createDocuments([context])));
  }

  return documents;
};

const getMessages = async (): Promise<BaseMessage[]> => {
  let chatMsgs: BaseMessage[] = [];
  // the array of persisted messages includes the current prompt
  const data = await chrome.storage.session.get(['messages']);

  if (data.messages) {
    const lumosMsgs = data.messages as Message[];
    chatMsgs = lumosMsgs
      .slice(-1 * MAX_CHAT_HISTORY)
      .map(({ role, content }: Message) => {
        return role === 'user'
          ? new HumanMessage({
              content: content,
            })
          : new AIMessage({
              content: content,
            });
      });

    // add images to the content array
    // if (base64EncodedImages.length > 0) {
    //   // get the last element (current user prompt) from chatMsgs
    //   const lastMsg = chatMsgs[chatMsgs.length - 1];

    //   // remove the last element from chatMsgs
    //   chatMsgs = chatMsgs.slice(0, chatMsgs.length - 1);

    //   const content: MessageContent = [
    //     {
    //       type: 'text',
    //       text: lastMsg.content.toString(),
    //     },
    //   ];
    //   base64EncodedImages.forEach((image) => {
    //     content.push({
    //       type: 'image_url',
    //       image_url: image,
    //     });
    //   });

    //   // replace the last element with a new HumanMessage that contains the image content
    //   chatMsgs.push(
    //     new HumanMessage({
    //       content: content,
    //     })
    //   );
    // }
  }
  return chatMsgs;
};

const getChatModel = (ollamaHost: string, ollamaModel: string): Runnable => {
  return new ChatOllama({
    baseUrl: ollamaHost,
    model: ollamaModel,
    keepAlive: '60m',
    callbacks: [new ConsoleCallbackHandler()],
  }).bind({
    signal: controller.signal,
  });
};

const computeK = (documentsCount: number): number => {
  return Math.ceil(Math.sqrt(documentsCount));
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const keepAlive = () => {
  setInterval(chrome.runtime.getPlatformInfo, 20e3);
  console.log('Keep alive...');
};
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();

console.log('background loaded');
