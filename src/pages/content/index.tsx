import { createRoot } from 'react-dom/client';
import './style.css';
const div = document.createElement('div');
div.id = '__root';
document.body.appendChild(div);

chrome.runtime.sendMessage({ text: 'hello' });

document.addEventListener('mouseup', () => {
  const selectedText = window.getSelection()?.toString().trim();
  console.log('selectedText', selectedText);
  if (selectedText) {
    chrome.runtime.sendMessage({ name: 'selectedText', text: selectedText });
  }
});

const rootContainer = document.querySelector('#__root');
if (!rootContainer) throw new Error("Can't find Content root element");
const root = createRoot(rootContainer);
root.render(
  <div className="absolute bottom-0 left-0 text-lg text-black bg-amber-400 z-50">
    content script loaded
  </div>
);

try {
  console.log('content script loaded now');
} catch (e) {
  console.error(e);
}
