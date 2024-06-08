// External Dependencies
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Relative Dependencies
import ChatInput from './components/ChatInput';
import Message from './components/ChatMessage';
import ChatMessages from './components/ChatMessages';
import ChatHeader from './components/ChatHeader';
import { Model } from './types';

const Panel = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);

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
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  return (
    <div className="flex h-screen max-h-screen flex-col items-center bg-muted/40">
      <ChatHeader
        isLoading={isLoading}
        models={models}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />
      <ChatMessages messages={messages} />
      <ChatInput
        messages={messages}
        model={selectedModel}
        selectedText={selectedText}
        setMessages={setMessages}
      />
    </div>
  );
};

export default Panel;
