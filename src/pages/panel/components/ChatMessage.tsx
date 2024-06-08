// External Dependencies

// Relative Dependencies
import { Message } from '../types';
import MessageMarkdown from './MessageMarkdown';

type Props = {
  message: Message;
};

const Message = ({ message }: Props) => {
  return message.role === 'assistant' ? (
    <div className="flex items-start gap-3">
      <div className="max-w-[75%] space-y-1">
        <div className="rounded-lg bg-gray-100 p-3 text-sm dark:bg-gray-800">
          <MessageMarkdown content={message.content} />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex justify-end items-start gap-3">
      <div className="max-w-[75%] space-y-1">
        <div className="rounded-lg bg-blue-500 p-3 text-sm text-white">
          <MessageMarkdown content={message.content} />
        </div>
      </div>
    </div>
  );
};

export default Message;
