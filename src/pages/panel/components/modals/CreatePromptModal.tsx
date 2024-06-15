// External Dependencies
import { useState, type Dispatch, type SetStateAction } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useQueryClient } from '@tanstack/react-query';

// Relative Dependencies
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "../ui/dialog";
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Prompt } from "../../types";

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const CreatePromptModal = ({ open, setOpen }: Props) => {
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState("");

  const handleSavePrompt = async () => {
    if (prompt !== "") {
      const savedPrompts = (await chrome.storage.local.get(["prompts"])).prompts ?? [];

      const newPrompt: Prompt = {
        id: uuidv4(),
        content: prompt,
      };

      savedPrompts.push(newPrompt);
      chrome.storage.local.set({ prompts: savedPrompts });
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      setOpen(false);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-1/2 sm:w-3/5">
        <DialogHeader>
          <DialogTitle className="mb-4">Create Prompt</DialogTitle>
          <div className="flex-col flex sm:flex-row items-start sm:items-center gap-2 sm:gap-0">
            <Label htmlFor="name" className="w-1/5">
              Prompt
            </Label>
            <Input
              autoComplete="off"
              className="w-full sm:w-4/5"
              id="name"
              onChange={handlePromptChange}
              value={prompt}
            />
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button type="submit" onClick={handleSavePrompt}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePromptModal;
