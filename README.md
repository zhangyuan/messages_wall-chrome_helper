messages\_wall\-chrome\_helper
====================

Chrome Extension for WeChat to post messages to other servers. The extension will add a button to each message in Wechat Pulic Platform management page.

## How to use it?

1. Clone or download the source code.
2. Replace the server `uri` and `token` in main.js, which is used in server side for simple authentication.
3. Open Chrome extensions: <chrome://extensions>, then check `Developer mode`. Load unpacked extension from the source code foler.
4. The button will appear below each message. Then click the button to send request to server side to create or delete messages.
