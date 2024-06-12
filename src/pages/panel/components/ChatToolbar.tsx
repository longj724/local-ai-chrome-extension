// External Dependencies
import { Trash } from "lucide-react"

// Relative Dependencies
import { Message } from '../types';
import { cn } from '../lib/utils';
import { WithTooltip } from "./ui/with-tooltip";

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
      <WithTooltip 
        delayDuration={200}
        display={<p>Clear Messages</p>}
        side="top"
        trigger={
          <Trash
            className={cn(
            'rounded bg-primary p-1 text-secondary hover:opacity-50 hover:cursor-pointer',
            !messages.length && 'cursor-not-allowed opacity-50'
            )}
            onClick={deleteMessages}
            size={22}
          />
        }
      />
    </div>
  )
}

export default ChatToolbar