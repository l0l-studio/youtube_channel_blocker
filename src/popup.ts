import { NotificationOptions } from 'chrome';

const channel_input = <HTMLInputElement>document.getElementById('channel');
const block_button = document.getElementById('block');
const reset = document.getElementById('reset');

const options: NotificationOptions = {
    type: 'basic',
    title: 'Channel Blocker',
    iconUrl: './icon.png',
};

block_button.addEventListener('click', () => {
    chrome.runtime.sendMessage({
        msg: 'block_channel',
        channel: channel_input.value,
    });

    channel_input.value = '';
});

reset.addEventListener('click', () => {
    chrome.runtime.sendMessage({ msg: 'reset' });
    chrome.notifications.create({ ...options, message: 'Reset successful' });
});
