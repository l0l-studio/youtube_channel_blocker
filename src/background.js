let channels = new Set();
chrome.storage.sync.get(['channels'], (res) => {
  if (res.channels) {
    for (const channel of JSON.parse(res.channels)) {
      channels.add(channel);
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.msg) {
    case 'page_load':
      sendResponse({
        channels: set_to_array(channels),
      });
      break;

    case 'block_channel':
      debugger;
      if (!channels.has(request.channel)) {
        channels.add(request.channel);

        chrome.storage.sync.set({
          channels: JSON.stringify(set_to_array(channels)),
        });

        chrome.tabs.query({}, function (tabs) {
          const data = {
            message: 'updated_channels',
            channel: request.channel,
          };

          for (let i = 0; i < tabs.length; i++) {
            chrome.tabs.sendMessage(tabs[i].id, data);
          }
        });
      }
      break;

    case 'reset':
      chrome.storage.sync.clear();
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tab = tabs[0];

        const data = {
          message: 'reset',
        };

        chrome.tabs.sendMessage(tab.id, data);
      });
      sendResponse();
      break;

    default:
      throw 'action not supported';
  }
  return true;
});

const set_to_array = (set) => {
  return [...set];
};
