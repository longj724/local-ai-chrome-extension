# Local AI Web Chat

Local AI Web Chat is an open-source Chrome Extension that provides a sidebar to allow you to easily chat with any local Ollama model from within your browser.

## Installation

Local AI Web Chat supports Chromium-based browsers like Chrome, Brave, Edge, and Firefox.

<!-- [![Chrome Web Store](https://pub-35424b4473484be483c0afa08c69e7da.r2.dev/UV4C4ybeBTsZt43U4xis.png)](https://chrome.google.com/webstore/detail/page-assist/jfgfiigpkhlkbnfnbobbkinehhfdhndo)
[![Firefox Add-on](https://pub-35424b4473484be483c0afa08c69e7da.r2.dev/get-the-addon.png)](https://addons.mozilla.org/en-US/firefox/addon/page-assist/) -->

<!-- Checkout the Demo (v1.0.0):

<div align="center"> -->

<!-- [![Page Assist Demo](https://img.youtube.com/vi/8VTjlLGXA4s/0.jpg)](https://www.youtube.com/watch?v=8VTjlLGXA4s) -->

</div>

## Features

- **Sidebar**: A sidebar can be opened on any webpage. This allows you to quickly interact with any Ollama model.

- **Chat With Webpages**: The content of any webpage can parsed and sent to your Ollama server for chatting.

- **Custom Prompts**: Prompts can be created and saved for future use.

<!-- ## Usage -->

<!-- ### Sidebar

Once the extension is installed, you can open the sidebar via context menu or keyboard shortcut.

Default Keyboard Shortcut: `Ctrl+Shift+P` -->

### Manual Installation <a name="manual-installation"></a>

1. Clone this repository ｀
2. Run `yarn` or `npm i` (check your node version >= 16)
3. Run `yarn dev` or `npm run dev`
4. Load Extension in Chrome
   1. Open - Chrome browser
   2. Access - chrome://extensions
   3. Tick - Developer mode
   4. Find - Load unpacked extension
   5. Select - `dist` folder in this project (after dev or build)
5. On your Mac or PC set the following environment variables:
   1. OLLAMA_ORIGINS=chrome-extension://
   2. OLLAMA_HOST=0.0.0.0

<!-- ## Browser Support

| Browser | Sidebar | Chat With Webpage | Web UI |
| ------- | ------- | ----------------- | ------ |
| Chrome  | ✅      | ✅                | ✅     |
| Brave   | ✅      | ✅                | ✅     |
| Firefox | ✅      | ✅                | ✅     |
| Vivaldi | ✅      | ✅                | ✅     |
| Edge    | ✅      | ❌                | ✅     |
| Opera   | ❌      | ❌                | ✅     |
| Arc     | ❌      | ❌                | ✅     | -->

## Privacy

Local AI Web Chat does not collect any personal data. All chat requests are only sent to your Ollama server.

Prompts and chat history are stored locally in the browser storage.
