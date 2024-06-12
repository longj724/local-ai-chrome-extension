// External Dependencies
import { Trash } from "lucide-react"

// Relative Dependencies
import { Message } from '../types';
import { cn } from '../lib/utils';

type Props = {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const ChatToolbar = ({ messages, setMessages }: Props) => {

  const deleteMessages = () => {
    chrome.storage.local.remove('chatMessages');
    setMessages([]);
  }

  return (
    <div className='ml-auto flex flex-row mr-2'>
      <Trash
        className={cn(
          'rounded bg-primary p-1 text-secondary hover:opacity-50 hover:cursor-pointer',
          !messages.length && 'cursor-not-allowed opacity-50'
        )}
        onClick={deleteMessages}
        size={24}
      />
    </div>
  )
}

export default ChatToolbar