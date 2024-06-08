chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'SELECTED_TEXT_MENU_OPTION',
    title: 'Ask Local AI',
    contexts: ['all'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'SELECTED_TEXT_MENU_OPTION') {
    chrome.sidePanel.open({ windowId: tab!.windowId });

    const message = {
      type: 'SELECTED_TEXT_MENU_OPTION_RESPONSE',
      text: info.selectionText,
    };

    const checkIfPanelReady = () =>
      new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { type: 'CHECK_PANEL_READY' },
          (response) => {
            if (response && response.ready) {
              resolve(true);
            } else {
              setTimeout(() => resolve(checkIfPanelReady()), 100);
            }
          }
        );
      });

    await checkIfPanelReady();
    chrome.runtime.sendMessage(message);
  }
});

console.log('background loaded');
