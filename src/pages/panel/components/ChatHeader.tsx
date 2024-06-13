// Exteral Dependencies

// Relative Dependencies
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Model } from '../types';
import SettingsMenu from './SettingsMenu';

type Props = {
  isLoading: boolean;
  models: Model[] | undefined;
  selectedModel: Model | null;
  setSelectedModel: React.Dispatch<React.SetStateAction<Model | null>>;
};

const ChatHeader = ({
  isLoading,
  models,
  selectedModel,
  setSelectedModel,
}: Props) => {
  const onModelChange = (model: string) => {
    const newSelectedModel = models?.find((m) => m.name === model) ?? null;
    setSelectedModel(newSelectedModel);
    chrome.storage.local.set({ selectedChatModel: newSelectedModel });
  };

  return (
    <header className="lg:px flex h-14 min-h-[3.5rem] w-full items-center justify-between border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 z-10">
      <div className=" flex w-full flex-1 justify-start">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center">
            Loading Models...
          </div>
        ) : (
          <div className="md:w-4/5 lg:w-3/5">
            <Select
              onValueChange={onModelChange}
              value={selectedModel?.name ?? ''}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models?.map((model) => (
                  <SelectItem
                    key={model.name}
                    value={model.name}
                    className="hover:cursor-pointer"
                  >
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="flex flex-1 justify-center">Local AI Chat</div>
      <div className="flex flex-1 justify-end">
        <SettingsMenu />
      </div>
    </header>
  );
};

export default ChatHeader;
