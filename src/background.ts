import type { NotificationOptions } from 'chrome';

const CHANNELS: Set<string> = new Set();

const OPTIONS: NotificationOptions = {
    type: 'basic',
    title: 'Channel Blocker',
    iconUrl: './icon.png',
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.msg) {
        case 'page_load': {
            if (CHANNELS.size > 0) {
                sendResponse({
                    channels: set_to_array(CHANNELS),
                });
            } else {
                get_data(sendResponse);
            }
            break;
        }

        case 'block_channel': {
            if (!CHANNELS.has(request.channel)) {
                CHANNELS.add(request.channel);

                chrome.notifications.create('block', {
                    ...OPTIONS,
                    message: `Blocked ${request.channel}`,
                });

                chrome.storage.sync.set({
                    //channels: JSON.stringify(set_to_array(channels)),
                    //channels: set_to_array(channels),
                    [request.channel]: '',
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
        }

        case 'reset': {
            chrome.storage.sync.clear();
            chrome.tabs.query(
                { active: true, currentWindow: true },
                function (tabs) {
                    const data = {
                        message: 'reset',
                    };

                    for (let i = 0; i < tabs.length; i++) {
                        chrome.tabs.sendMessage(tabs[i].id, data);
                    }
                }
            );
            sendResponse();
            break;
        }

        default: {
            throw 'action not supported';
        }
    }
    return true;
});

const get_data = (sendResponse: Function) => {
    chrome.storage.sync.get((results: any) => {
        const blocked_channels = Object.keys(results);
        for (let channel of blocked_channels) {
            CHANNELS.add(channel);
        }
        sendResponse({ channels: set_to_array(CHANNELS) });
    });
};

const set_to_array = (set: Set<string>) => {
    return [...set];
};

const on_error = (e: any) => {
    console.log(e);
};
