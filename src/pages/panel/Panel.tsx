// External Dependencies
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Relative Dependencies
import ChatInput from './components/ChatInput';
import Message from './components/ChatMessage';
import ChatMessages from './components/ChatMessages';
import ChatHeader from './components/ChatHeader';
import { Model } from './types';
import { Switch } from './components/ui/switch';
import { getHtmlContent } from '../content/index';

const Panel = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [parseWebpage, setParseWebpage] = useState<boolean>(false);
  const [embeddingsLoadingText, setEmbeddingsLoadingText] = useState<string | null>(null);

  const { data: models, isLoading } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const response = await fetch(`http://localhost:11434/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const models = (await response.json()).models as Model[];

      if (models.length !== 0) setSelectedModel(models[0]);

      return models;
    },
  });

  useEffect(() => {
    chrome.storage.local.get('chatMessages', (result) => {
      if (result.chatMessages) {
        setMessages(result.chatMessages);
      }
    });
  }, [messages]);

  useEffect(() => {
    const handleMessage = (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: any) => void
    ) => {
      if (message.type === 'CHECK_PANEL_READY') {
        sendResponse({ ready: true });
      } else if (message.type === 'SELECTED_TEXT_MENU_OPTION_RESPONSE') {
        setSelectedText(message.text);
      } else if (message.type === 'PARSE_WEBPAGE_RESPONSE') {
        if (message.done) {
          setEmbeddingsLoadingText(null);
        } else {
          setEmbeddingsLoadingText(`Generating embeddings for ${message.docNumber} of ${message.docCount}`);
        }
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  useEffect(() => {
    if (parseWebpage) {
      let activeTabUrl: URL;
      chrome.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => {
        const activeTab = tabs[0];
        const activeTabId = activeTab.id || 0;

        activeTabUrl = new URL(activeTab.url || "");

        // Todo: Add support for attachments
        if (activeTabUrl.protocol === "chrome:") {
          const result = new Array(1);
          result[0] = { result: ["", false, []] };
          return result;
        } else {
          return chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            injectImmediately: true,
            func: getHtmlContent,
          });
        }
      }).then(async (results) => {
        const pageContent = results[0].result[0];
        const isHighlightedContent = results[0].result[1];
        const imageURLs = results[0].result[2];
        
        console.log('pageContent is:', pageContent);

        // if an attachment is present, the URL gets set to a fake file URL
        // const attachments = [];
        let url = activeTabUrl.toString();
        // if (attachment) {
        //   attachments.push(attachment);
        //   url = `file://${attachment.name}/${attachment.lastModified}`;
        // }

        chrome.runtime
          .sendMessage({ type: "PARSE_WEBPAGE", context: pageContent, chunkSize: 500, chunkOverlap: 0, url: url })
          // .then(() => {
          //   chrome.runtime.sendMessage({
          //     // skipCache: isHighlightedContent,
          //     chunkOverlap: 0,
          //     chunkSize: 500,
          //     context: pageContent,
          //     // imageURLs: imageURLs,
          //     url: url,
          //   });
          // });
      })
      .catch((error) => {
        console.log(`Error: ${error}`);
      });
    }
  }, [parseWebpage]);

  return (
    <div className="flex h-screen max-h-screen flex-col items-center bg-muted/40">
      <ChatHeader
        isLoading={isLoading}
        models={models}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />
      <ChatMessages messages={messages} />
      <div className="flex flex-row gap-1 w-4/5 mt-3">
        <Switch id="toggle-1" onCheckedChange={(e) => setParseWebpage(e)} />
        <p>Parse Webpage for Chat</p>
        <p>{embeddingsLoadingText}</p>
      </div>
      <ChatInput
        messages={messages}
        model={selectedModel}
        selectedText={selectedText}
        setMessages={setMessages}
        setSelectedText={setSelectedText}
      />
    </div>
  );
};

export default Panel;
