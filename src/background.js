let channels = [];
chrome.storage.sync.get(['channels'], (res) => {
  if (res.channels) {
    channels = [...channels, ...JSON.parse(res.channels)];
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.msg === 'page_load') {
    sendResponse({
      channels,
      //key_words,
    });
  } else if (request.msg === 'block_channel') {
    if (!channels.includes(request.channel)) {
      channels.push(request.channel);

      chrome.storage.sync.set({ channels: JSON.stringify(channels) });
      chrome.tabs.query({}, function (tabs) {
        //const tab = tabs[0];

        let data = {
          message: 'updated_channels',
          channels,
        };

        for (let i = 0; i < tabs.length; i++) {
          chrome.tabs.sendMessage(tabs[i].id, data);
        }
      });
    }
  } else if (request.msg === 'reset') {
    chrome.storage.sync.clear();
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];

      let data = {
        message: 'reset',
      };

      chrome.tabs.sendMessage(tab.id, data);
    });
    sendResponse(channels);
  }
  return true;
});
