let channel = document.getElementById("channel");
let block_button = document.getElementById("block");
let reset = document.getElementById("reset");

let channels = [];
chrome.storage.sync.get(["channels"], (res) => {
  channels = [...channels, ...res.channels];
});

reset.addEventListener("click", function (e) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var activeTab = tabs[0];
    let data = {
      message: "reset",
    };
    chrome.storage.sync.clear();

    let options = {
      type: "basic",
      title: "Channel Blocker",
      message: "Reset Successful",
      iconUrl: "./icon.png",
    };
    chrome.notifications.create(options);
    chrome.tabs.sendMessage(activeTab.id, data);
  });
});

block_button.addEventListener("click", function (e) {
  if (channel.value.length > 0) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var activeTab = tabs[0];

      channels = [...channels, channel.value];
      chrome.storage.sync.set({ channels: JSON.stringify(channels) });

      console.log(channels);
      let data = {
        message: "updated_channels",
        channels,
      };

      let options = {
        type: "basic",
        title: "Channel Blocker",
        message: `Blocked ${channel.value}`,
        iconUrl: "./icon.png",
      };

      channel.value = "";

      chrome.notifications.create(options);
      chrome.tabs.sendMessage(activeTab.id, data, (res) => {});
    });
  }
});
