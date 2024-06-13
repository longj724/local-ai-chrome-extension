// External Dependencies
import { Radio,Trash } from "lucide-react"
import { useQuery } from '@tanstack/react-query';

// Relative Dependencies
import { Message } from '../types';
import { cn } from '../lib/utils';
import { WithTooltip } from "./ui/with-tooltip";

type Props = {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const ChatToolbar = ({ messages, setMessages }: Props) => {

  const { data: isConnectionEstablished, isLoading } = useQuery({
    queryKey: ['test-connection'],
    queryFn: async () => {
      const data = await chrome.storage.local.get(['hostUrl']);
      const response = await fetch(data.hostUrl ?`${data.hostUrl}` : 'http://localhost:11434', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status !== 200) {
        return false;
      }

      return true;
    },
  });

  const deleteMessages = () => {
    chrome.storage.local.remove('chatMessages');
    setMessages([]);
  }

  return (
    <div className='ml-auto flex flex-row mr-2 gap-2'>
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
      <WithTooltip 
        delayDuration={200}
        display={<p>{!isConnectionEstablished || isLoading ? 'Ollama not connected' : 'Ollama connected'}</p>}
        side="top"
        trigger={
          <Radio
            className={cn(!isConnectionEstablished || isLoading ? 'text-red-400' : 'text-green-400')}
            onClick={deleteMessages}
            size={22}
          />
        }
      />
    </div>
  )
}

export default ChatToolbar