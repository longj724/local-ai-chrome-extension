// External Dependencies
import { useQuery } from "@tanstack/react-query";

// Relative Dependencies
import { Model } from '../types';

export const useModelsQuery = (selectedModel: Model | null, setSelectedModel: React.Dispatch<React.SetStateAction<Model | null>>) => {

  return useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const response = await fetch(`http://localhost:11434/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const models = (await response.json()).models as Model[];

      const savedSelectedModel = await chrome.storage.local.get(['selectedChatModel']);
      if (savedSelectedModel.selectedChatModel) {
        setSelectedModel(savedSelectedModel.selectedChatModel);
      }  else if (models.length !== 0 && !selectedModel) {
        setSelectedModel(models[0]);
      }

      return models;
    },
  })
}