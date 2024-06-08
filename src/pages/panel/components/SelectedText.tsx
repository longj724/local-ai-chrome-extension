// External Dependencies
import { Lightbulb, X } from "lucide-react"

type Props = {
  text: string | null;
  setSelectedText: React.Dispatch<React.SetStateAction<string | null>>;
}

const SelectedText = ({ setSelectedText,text }: Props) => {
  return (
    <div className="w-full flex items-center justify-center p-3">
      <div className="bg-gray-100 rounded-md flex flex-col p-3 w-full max-h-[75px] relative">
          <div className="flex flex-row items-center">
            <Lightbulb className="h-3 w-3 mr-2" />
            <span className="text-xs">Text From Your Selection</span>
          </div>
          <p className="mt-2 text-xs overflow-hidden text-ellipsis whitespace-nowrap">{text}</p>
          <div className="absolute top-1 right-1 text-gray-500 hover:text-gray-800 hover:cursor-pointer" onClick={() => setSelectedText(null)}>
            <X className="h-4 w-4" />
          </div>
        </div>
    </div>
    
  )
}

export default SelectedText