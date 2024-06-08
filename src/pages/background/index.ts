chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener(
  (message: { text: string; name: string }, sender, sendResponse) => {
    if (message.name === 'selectedText') {
      console.log('Selected text is: ', message.text);

      chrome.runtime.sendMessage({
        name: 'selectedTextResponse',
        text: message.text,
      });
    }
  }
);

console.log('background loaded');
