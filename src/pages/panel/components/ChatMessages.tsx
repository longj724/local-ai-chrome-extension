// External Dependencies

// Relative Dependencies
import { Message } from '../types';
import ChatMessage from './ChatMessage';

type Props = {
  messages: Message[];
};

const ChatMessages = ({ messages }: Props) => {
  return messages.length > 0 ? (
    <div className="flex-1 overflow-auto p-4 w-full">
      <div className="grid gap-4">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
      </div>
    </div>
  ) : (
    <div className="flex flex-1 items-center">
      <h2 className="text-base">Send a message to start chatting!</h2>
    </div>
  );
};

export default ChatMessages;
