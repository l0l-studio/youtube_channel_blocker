chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //const raw_channels = chrome.storage.sync.get(["channels"], function (res) {
  //  console.log(res.channels);
  //});
  const storage = chrome.storage.sync.get(["channels"], (res) => {
    let channels = JSON.parse(res.channels) || [];
    console.log(channels);
    //let key_words = JSON.parse(await chrome.storage.sync.get("key_words")) || [];
    if (request.msg === "page_load") {
      sendResponse({
        channels,
        //key_words,
      });
    } else if (request.msg === "add_channel") {
      if (!channels.includes(request.channel)) {
        channels.push(request.channel);
        chrome.storage.sync.set("channels", JSON.stringify(channels));
        //sendResponse({ message: "updated_channels", channels });
        sendResponse(channels);
      }
    }
  });
  return true;
});
