// External Dependencies
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { useQueryClient } from '@tanstack/react-query';

// Relative Dependencies
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Prompt } from "../../types";

type Props = {
  existingPrompt: Prompt | null;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const EditPromptModal = ({
  existingPrompt,
  isOpen,
  setIsOpen,
}: Props) => {
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState<string>("");

  useEffect(() => {
    setPrompt(existingPrompt?.content ?? "");
  }, [existingPrompt]);

  const editPrompt = async () => {
    const newPrompt: Prompt = {
      id: existingPrompt?.id ?? "",
      content: prompt,
    };

    const savedPrompts = await chrome.storage.local.get(["prompts"]);
    const editedPrompts = savedPrompts.prompts.map((prompt: Prompt) => {
      if (prompt.id === existingPrompt?.id) {
        return newPrompt;
      }
      return prompt;
    });
    chrome.storage.local.set({ prompts: editedPrompts });
    queryClient.invalidateQueries({ queryKey: ["prompts"] });
    setIsOpen(false);
  };

  const deletePrompt = async () => {
    const savedPrompts = await chrome.storage.local.get(["prompts"]);
    const editedPrompts = savedPrompts.prompts.filter(({ id }: Prompt) => id !== existingPrompt?.id);

    chrome.storage.local.set({ prompts: editedPrompts });
    queryClient.invalidateQueries({ queryKey: ["prompts"] });
    setIsOpen(false);
  };

  const handleSavePrompt = async () => {
    if (prompt !== "") {
      editPrompt();
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-1/2 sm:w-3/5">
        <DialogHeader>
          <DialogTitle className="mb-4">Edit Prompt</DialogTitle>
          <div className="flex flex-row items-center">
            <Label htmlFor="name" className="w-1/5">
              Prompt
            </Label>
            <Input
              id="name"
              value={prompt}
              className="w-4/5"
              onChange={handlePromptChange}
            />
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button variant="destructive" onClick={deletePrompt}>Delete</Button>
          <Button type="submit" onClick={handleSavePrompt}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPromptModal;
