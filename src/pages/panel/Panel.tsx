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

  return (
    <div className="flex h-screen max-h-screen flex-col items-center bg-muted/40">
      <ChatHeader
        models={models}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        isLoading={isLoading}
      />
      <ChatMessages messages={messages} />
      <ChatInput
        messages={messages}
        setMessages={setMessages}
        model={selectedModel}
      />
    </div>
  );
};

export default Panel;
