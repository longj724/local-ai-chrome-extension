// External Dependencies
import { CircleStop, Send } from 'lucide-react';
import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

// Relative Dependencies
import { TextareaAutosize } from '../components/ui/textarea-autosize';
import { cn } from '../lib/utils';
import { ChatRequest, ChatResponse, Message } from '../types';
import { Model } from '../types';
import SelectedText from './SelectedText';

type Props = {
  currentTab: chrome.tabs.Tab | null;
  messageContainerRef: React.RefObject<HTMLDivElement>;
  messages: Message[];
  model: Model | null;
  parseWebpage: boolean;
  selectedText: string | null;
  setMessages: Dispatch<SetStateAction<Message[]>>;
  setSelectedText: Dispatch<SetStateAction<string | null>>;
};

const ChatInput = ({
  currentTab,
  messageContainerRef,
  messages,
  model,
  parseWebpage,
  selectedText,
  setMessages,
  setSelectedText,
}: Props) => {
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { mutate: sendMessage } = useMutation({
    mutationFn: async () => {
      const chatRequest: ChatRequest = {
        model: model?.name ?? 'llama3',
        messages: [...messages, { role: 'user', content: selectedText ? `${selectedText}\n ${userInput}` : userInput }],
      };

      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        body: JSON.stringify(chatRequest),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.body?.getReader();
    },
    onSuccess: async (
      data: ReadableStreamDefaultReader<Uint8Array> | undefined
    ) => {
      setUserInput('');
      const newMessage: Message = {
        role: 'assistant',
        content: '',
      };
      const decoder = new TextDecoder();
      let firstPass = true;

      if (data) {
        while (true && isGenerating) {
          const result = await data.read();
          const { done, value } = result;

          if (done) {
            break;
          }

          const decodedValue: ChatResponse = JSON.parse(
            decoder.decode(value, { stream: true })
          );
          newMessage.content += decodedValue.message.content;
          console.log(decodedValue.message.content);

          if (value) {
            if (firstPass) {
              setMessages((prev: Message[]) => [...prev!, newMessage]);
              firstPass = false;
            } else {
              setMessages((prev: Message[]) => {
                if (prev) {
                  const existingMessages = prev.slice(0, -1);
                  const lastMessage = prev[prev.length - 1]!;
                  const updatedLastMessage = {
                    ...lastMessage,
                    content: newMessage.content,
                  };
                  return [...existingMessages, updatedLastMessage];
                }
                return prev;
              });
            }
          }
        }
      }

      setIsGenerating(false);
    },
    onError: (error) => {
      // TODO: Display some message about handling error
    },
  });

  useEffect(() => {
    const handleMessage = (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: any) => void
    ) => {
      if (message.type === 'SEND_MESSAGE_RESPONSE') {
        if (!message.done) {
          setMessages((prev: Message[]) => {
            if (!message.firstCompletion) {
              const existingMessages = prev.slice(0, -1);
              const lastMessage = prev[prev.length - 1]!;
              const updatedLastMessage = {
                ...lastMessage,
                content: message.completion,
              };
              return [...existingMessages, updatedLastMessage];
            } else {
              return [...prev!, { role: 'assistant', content: message.completion }];
            }
          });
        } else {
          setIsGenerating(false);
        }
      } 
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (text: string) => {
    setUserInput(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent<Element>) => {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    setIsGenerating(true);
    updateUserMessageOptimistically();
    chrome.runtime.sendMessage({ 
      content: selectedText ? `"""\n${selectedText}\n"""\n${userInput}` : userInput,
      model: model?.name ?? 'llama3',
      ollamaUrl: 'http://localhost:11434',
      type: 'SEND_MESSAGE',
      url: currentTab?.url ? currentTab.url : '',
      useWebPageContext: parseWebpage,
    });
  };

  const updateUserMessageOptimistically = (prompt = '') => {
    const newUserQuestion: Message = {
      role: 'user',
      content: selectedText ? `"""\n${selectedText}\n"""\n${userInput}` : userInput,
    };

    setMessages((prev) => [...prev!, newUserQuestion]);
    setUserInput('');

    if (messageContainerRef.current) {
      (
        messageContainerRef as React.MutableRefObject<HTMLDivElement>
      ).current.scrollTop = (
        messageContainerRef as React.MutableRefObject<HTMLDivElement>
      ).current.scrollHeight;
    }
  };

  const stopGenerating = () => {
    setIsGenerating(false);
  };

  return (
    <div className="mb-4 mt-2 flex w-4/5">
      <div className="relative flex flex-col min-h-[60px] w-full items-center justify-center rounded-xl border-2 border-input">
        {selectedText && <SelectedText setSelectedText={setSelectedText} text={selectedText} />}
        <div className='flex flex-row items-center justify-center relative w-full'>
          <TextareaAutosize
            textareaRef={chatInputRef}
            className="text-md flex h-[40px] max-h-[150px] w-full resize-none rounded-md border-none bg-transparent py-2 pl-4 pr-16 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={`Send a message...`}
            onValueChange={handleInputChange}
            value={userInput}
            minRows={1}
            maxRows={18}
            onKeyDown={handleKeyPress}
            onPaste={() => {}}
            onCompositionStart={() => setIsTyping(true)}
            onCompositionEnd={() => setIsTyping(false)}
          />

          <div className="absolute bottom-[2px] right-3 ml-[2px] flex cursor-pointer flex-row gap-1">
            {isGenerating ? (
              <CircleStop
                className="animate-pulse rounded bg-transparent p-1 hover:bg-background"
                onClick={stopGenerating}
                size={30}
              />
            ) : (
              <Send
                className={cn(
                  'rounded bg-primary p-1 text-secondary hover:opacity-50',
                  !userInput && 'cursor-not-allowed opacity-50'
                )}
                onClick={handleSendMessage}
                size={30}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
