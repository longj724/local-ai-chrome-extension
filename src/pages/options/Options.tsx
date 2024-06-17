// External Dependencies
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Relative Dependencies
import { Label } from '../panel/components/ui/label';
import { Input } from '../panel/components/ui/input';
import { Button } from '../panel/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../panel/components/ui/select';
import { Model } from '../panel/types';
import { useQuery } from '@tanstack/react-query';

export const EMBEDDING_MODELS = [
  'nomic-embed-text',
  'all-minilm',
  'mxbai-embed-large',
  'snowflake-arctic-embed',
];

const Options = () => {
  const [hostUrl, setHostUrl] = useState<string>('http://localhost:11434');
  const [selectedEmbeddingModel, setSelectedEmbeddingModel] =
    useState<Model | null>(null);

  const { data: embeddingModels } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const response = await fetch(`http://localhost:11434/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const models = (await response.json()).models as Model[];
      const embeddingModels = models.filter((m) =>
        EMBEDDING_MODELS.some((e) => m.name.includes(e))
      );

      const savedSelectedModel = await chrome.storage.local.get([
        'selectedEmbeddingModel',
      ]);
      if (savedSelectedModel.selectedEmbeddingModel) {
        setSelectedEmbeddingModel(savedSelectedModel.selectedEmbeddingModel);
      } else if (embeddingModels.length !== 0 && !selectedEmbeddingModel) {
        setSelectedEmbeddingModel(models[0]);
      }

      return embeddingModels;
    },
  });

  const onModelChange = (model: string) => {
    const newSelectedModel =
      embeddingModels?.find((m) => m.name === model) ?? null;
    setSelectedEmbeddingModel(newSelectedModel);
  };

  useEffect(() => {
    const getSavedEmbeddingModel = async () => {
      const savedEmbeddingModel = await chrome.storage.local.get([
        'selectedEmbeddingModel',
      ]);
      if (savedEmbeddingModel.selectedEmbeddingModel) {
        setSelectedEmbeddingModel(savedEmbeddingModel.selectedEmbeddingModel);
      }
    };

    const getSavedHostUrl = async () => {
      const savedHostModel = await chrome.storage.local.get(['hostUrl']);
      if (savedHostModel.hostUrl) {
        setHostUrl(savedHostModel.hostUrl);
      }
    };

    getSavedEmbeddingModel();
    getSavedHostUrl();
  }, []);

  const onHostUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHostUrl(e.target.value);
  };

  const onSave = () => {
    chrome.storage.local.set({
      hostUrl: hostUrl,
      selectedEmbeddingModel: selectedEmbeddingModel,
    });

    toast.success('Settings Saved');
  };

  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1 bg-gray-100/40 dark:bg-gray-800/40 p-4 md:p-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-semibold mb-2">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Customize your extension settings.
          </p>
          <div className="grid gap-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">General</h2>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="project-name">Ollama Host URL</Label>
                  <Input
                    id="project-name"
                    placeholder="Enter Ollama Host URL"
                    value={hostUrl}
                    onChange={onHostUrlChange}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This is the URL of your Ollama instance.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="root-directory">
                    Ollama Embeddings Model
                  </Label>
                  <Select
                    onValueChange={onModelChange}
                    value={
                      selectedEmbeddingModel?.name ??
                      'No embedding models found on your ollama instance'
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {embeddingModels?.map((model) => (
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This will be the model used for your embeddings.
                  </p>
                </div>
              </div>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4">Trouble Shooting</h2>
              <div>
                <p className="text-sm">
                  In order for the extension to connect to your Ollama Server:
                </p>
                <ol className="list-decimal list-inside">
                  <li className="mt-2">
                    Ensure your Ollama Server is running. Ollama can be
                    downloaded{' '}
                    <a
                      target="_blank"
                      href="https://ollama.com/"
                      className="text-blue-400"
                    >
                      here.
                    </a>
                  </li>
                  <li className="mt-2">
                    On your Mac or PC set the following environment variables:
                    <ul className="list-disc list-inside ml-4">
                      <li>OLLAMA_ORIGINS=chrome-extension://</li>
                      <li>OLLAMA_HOST=0.0.0.0</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </section>
          </div>
        </div>
      </main>
      <footer className="flex justify-end items-center h-16 px-4 md:px-10 border-t">
        <Button className="ml-auto" onClick={onSave}>
          Save
        </Button>
      </footer>
    </div>
  );
};

export default Options;
