// External Dependencies
import { CircleStop, Send } from 'lucide-react';
import { type Dispatch, useEffect,type SetStateAction, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

// Relative Dependencies
import { TextareaAutosize } from '../components/ui/textarea-autosize';
import { cn } from '../lib/utils';
import { ChatRequest, ChatResponse, Message } from '../types';
import { Model } from '../types';

type Props = {
  messages: Message[];
  model: Model | null;
  selectedText: string | null;
  setMessages: Dispatch<SetStateAction<Message[]>>;
};

const ChatInput = ({ messages, model, selectedText,setMessages }: Props) => {
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { mutate: sendMessage } = useMutation({
    mutationFn: async () => {
      const chatRequest: ChatRequest = {
        model: model?.name ?? 'llama3',
        messages: [...messages, { role: 'user', content: userInput }],
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
    sendMessage();
  };

  const updateUserMessageOptimistically = (prompt = '') => {
    const newUserQuestion: Message = {
      role: 'user',
      content: userInput,
    };

    setMessages((prev) => [...prev!, newUserQuestion]);
  };

  const stopGenerating = () => {
    setIsGenerating(false);
  };

  useEffect(() => {
    if (selectedText) {
      setUserInput((curInput: string) => `"""\n${selectedText}\n""" ${curInput}`);
    }
  }, [selectedText]);

  return (
    <div className="mb-4 mt-auto flex w-4/5">
      <div className="relative mt-3 flex min-h-[60px] w-full items-center justify-center rounded-xl border-2 border-input">
        <TextareaAutosize
          textareaRef={chatInputRef}
          className="text-md flex h-[40px] max-h-[100px] w-full resize-none rounded-md border-none bg-transparent py-2 pl-4 pr-20 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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

        <div className="absolute bottom-[14px] right-3 ml-[2px] flex cursor-pointer flex-row gap-1">
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
  );
};

export default ChatInput;
