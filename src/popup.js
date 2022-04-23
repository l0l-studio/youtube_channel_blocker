let channel_input = document.getElementById('channel');
let block_button = document.getElementById('block');
let reset = document.getElementById('reset');

let options = {
  type: 'basic',
  title: 'Channel Blocker',
  iconUrl: './icon.png',
};

reset.addEventListener('click', () => {
  chrome.runtime.sendMessage({ msg: 'reset' });
  chrome.notifications.create({ ...options, message: 'Reset successful' });
});

block_button.addEventListener('click', () => {
  chrome.runtime.sendMessage({
    msg: 'block_channel',
    channel: channel_input.value,
  });

  chrome.notifications.create({
    ...options,
    message: `Blocked ${channel.value}`,
  });
  channel_input.value = '';
});
