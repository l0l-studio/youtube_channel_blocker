let channels = new Set();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.msg) {
        case 'page_load': {
            if (channels.size > 0) {
                sendResponse({
                    channels: set_to_array(channels),
                });
            } else {
                get_data(sendResponse);
            }
            break;
        }

        case 'block_channel': {
            if (!channels.has(request.channel)) {
                channels.add(request.channel);

                chrome.storage.local.set({
                    //channels: JSON.stringify(set_to_array(channels)),
                    //channels: set_to_array(channels),
                    [request.channel]: '',
                });

                chrome.tabs.query({}, function(tabs) {
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
        }

        case 'reset': {
            chrome.storage.local.clear();
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                const data = {
                    message: 'reset',
                };

                for (let i = 0; i < tabs.length; i++) {
                    chrome.tabs.sendMessage(tabs[i].id, data);
                }
            });
            sendResponse();
            break;
        }

        default: {
            throw 'action not supported';
        }
    }
    return true;
});

const get_data = (sendResponse) => {
    chrome.storage.local.get(null).then((results) => {
        const blocked_channels = Object.keys(results);
        for (let channel of blocked_channels) {
            channels.add(channel);
        }
    }, on_error);
};

const set_to_array = (set) => {
    return [...set];
};

const on_error = (e) => {
    console.log(e);
};
