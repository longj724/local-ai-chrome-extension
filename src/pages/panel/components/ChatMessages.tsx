// External Dependencies
import { forwardRef, useCallback, useEffect, useState } from 'react';

// Relative Dependencies
import { Message } from '../types';
import ChatMessage from './ChatMessage';

type Props = {
  messages: Message[];
};

const ChatMessages = forwardRef<HTMLDivElement, Props>(({ messages }, ref) => {
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isAtTop, setIsAtTop] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if ((ref as React.MutableRefObject<HTMLDivElement>).current !== null) {
      (ref as React.MutableRefObject<HTMLDivElement>).current.scrollTop = (
        ref as React.MutableRefObject<HTMLDivElement>
      ).current.scrollHeight;
    }
  }, [messages]);

  const handleScroll = useCallback((e: any) => {
    const bottom =
      Math.round(e.target.scrollHeight) - Math.round(e.target.scrollTop) ===
      Math.round(e.target.clientHeight);
    setIsAtBottom(bottom);

    const top = e.target.scrollTop === 0;
    setIsAtTop(top);

    const isOverflow = e.target.scrollHeight - 32 > e.target.clientHeight;
    setIsOverflowing(isOverflow);
  }, []);

  return messages.length > 0 ? (
    <div className="flex-1 overflow-auto p-4 w-full" onScroll={handleScroll} ref={ref}>
      <div className="flex flex-col gap-4">
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
});

export default ChatMessages;
