/*----------------------------
GLOBALS
----------------------------*/
let data = {};
let should_reload = false;
let loop;

let thumbnail_tags = {
  main: 'ytd-compact-video-renderer',
  watch: 'ytd-rich-item-renderer',
};

window.onload = () => {
  const contents = document.getElementById('page-manager');

  const observer = new MutationObserver(handle_mutation);
  observer.observe(contents, { childList: true, subtree: true });

  window.onbeforeunload = () => {
    observer.disconnect();
  };

  chrome.runtime.sendMessage({ msg: 'page_load' }, (response) => {
    data = response.channels;
    remove_features(data);
  });
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === 'updated_channels') {
    data = request.channels;
    remove_features(data);
  } else if (request.message === 'reset') {
    data = [];
  }
  sendResponse();
});

const handle_mutation = (mutation_list, observer) => {
  for (const mutation of mutation_list) {
    if (mutation.type === 'childList') {
      remove_features(data);
    }
  }
};

function remove_features(data) {
  let page = window.location.href.match('watch') ? 'main' : 'watch';

  let vid_groups = document.getElementsByTagName('ytd-item-section-renderer');
  let videos = document.getElementsByTagName(thumbnail_tags[page]);

  for (let i = 0; i < videos.length; i++) {
    let channel_name = videos[i].getElementsByClassName(
      'yt-simple-endpoint style-scope yt-formatted-string'
    );

    if (channel_name.length > 0) {
      channel_name = channel_name[0].innerHTML;

      if (data.includes(channel_name)) {
        videos[i].remove();
      }
    }
  }

  //for (let i = 0; i < vid_groups.length; i++) {
  //  let group_data = vid_groups[i].innerText.split("\n");
  //  let group_channel = group_data[0];
  //  if (data.includes(group_channel) || group_data.length === 0) {
  //    vid_groups[i].style.display = "none";
  //  } else {
  //    if (
  //      !(
  //        group_channel.includes("viewers also watch...") ||
  //        group_channel.includes("Recommended") ||
  //        group_channel.includes("YouTube Mixes") ||
  //        group_channel.includes("Latest YouTube posts") ||
  //        group_channel.includes("From your subscriptions")
  //      ) &&
  //      !vid_groups[i].children[4] &&
  //      group_channel.length != 0
  //    ) {
  //      let button = generate_block_btn(group_channel);
  //      vid_groups[i].appendChild(button);
  //    }
  //  }
  //}
}

function generate_block_btn(channel_name) {
  let btn = document.createElement('Button');
  let text_node = document.createTextNode(`Block ${channel_name}`);
  btn.appendChild(text_node);
  btn.setAttribute(
    `style`,
    `
    background: #cc0000;
    color: wheat;
    border: none;
    border-radius: 1px;
    font-size: 1.4rem;
    `
  );
  btn.onmouseover = () => {
    btn.style.cursor = 'pointer';
  };
  btn.onfocus = () => {
    btn.style.border = 'none';
  };
  btn.onclick = () => {
    chrome.runtime.sendMessage(
      { msg: 'block_channel', channel: channel_name },
      (response) => {
        data.channels = response.channels;
      }
    );
  };

  return btn;
}
