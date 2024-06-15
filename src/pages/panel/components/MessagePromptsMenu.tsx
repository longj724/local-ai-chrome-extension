// External Dependencies
import { useEffect, useState } from "react";
import { ChevronUp, FilePenLine, Send, SquarePlus } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { WithTooltip } from "./ui/with-tooltip";

// Relative Dependencies
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { cn } from "../lib/utils";
import CreatePromptModal from "./modals/CreatePromptModal";
import EditPromptModal from "./modals/EditPromptModal";
import { Prompt } from "../types";

type Props = {
  sendMessageWithPrompt: (prompt: string) => void;
  userInput: string;
};

const MessagePromptsMenu = ({ userInput, sendMessageWithPrompt }: Props) => {
  const [isCreatePromptOpen, setIsCreatePromptOpen] = useState(false);
  const [isEditPromptOpen, setIsEditPromptOpen] = useState(false);
  const [selectedPromptToEdit, setSelectedPromptToEdit] = useState<Prompt | null>(null);

  const handleEditPrompt = (prompt: string, id: string) => {
    setSelectedPromptToEdit({ id, content: prompt });
  };

  const { data: prompts } = useQuery({
    queryKey: ['prompts'],
    queryFn: async () => {
      const data = await chrome.storage.local.get(["prompts"]);
      
      return data.prompts ? data.prompts as Prompt[] : [];
    },
  })

  useEffect(() => {
    if (selectedPromptToEdit) {
      setIsEditPromptOpen(true);
    }
  }, [selectedPromptToEdit]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ChevronUp
            className={cn(
              "rounded bg-primary p-1 text-secondary hover:opacity-50",
              !userInput && "cursor-not-allowed opacity-50",
            )}
            size={30}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {prompts?.map(({ content, id }) => (
            <>
              <DropdownMenuItem
                className="hover:bg-transparent focus:bg-transparent"
                onSelect={(e) => e.preventDefault()}
              >
                <div className="flex w-full flex-row items-center gap-2">
                  <p>{content}</p>
                  <WithTooltip
                    delayDuration={200}
                    display={<p>Send Message With Prompt</p>}
                    side="top"
                    trigger={
                      <Send
                        className="hover:cursor-pointer rounded-sm p-[3px] hover:bg-gray-300"
                        onClick={() => sendMessageWithPrompt(content)}
                        size={22}
                      />
                    }
                  />
                  <div
                    className="flex flex-row items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <WithTooltip
                      delayDuration={200}
                      display={<p>Edit Prompt</p>}
                      side="top"
                      trigger={
                        <FilePenLine
                          size={22}
                          className="hover:cursor-pointer rounded-sm p-[3px] hover:bg-gray-300"
                          onClick={() => handleEditPrompt(content, id)}
                        />
                      }
                    />
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ))}
          <DropdownMenuItem
            className="hover:cursor-pointer"
            onSelect={(e) => e.preventDefault()}
          >
            <div className="flex w-full flex-row items-center gap-2" onClick={() => setIsCreatePromptOpen(true)}>
              <p>Create Prompt</p>
              <SquarePlus
                className="rounded-sm p-[3px]"
                size={22}
              />
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Render Modals here */}
      <CreatePromptModal
        open={isCreatePromptOpen}
        setOpen={setIsCreatePromptOpen}
      />
      
      <EditPromptModal
        existingPrompt={selectedPromptToEdit}
        isOpen={isEditPromptOpen}
        setIsOpen={setIsEditPromptOpen}
      />
      
    </>
  );
};

export default MessagePromptsMenu;
