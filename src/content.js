/*----------------------------
GLOBALS
----------------------------*/
let data = {};
let should_reload = false;
let loop;

window.onload = () => {
	chrome.runtime.sendMessage({msg: "page_load"}, (response) => {
		data = response;
		loop = setInterval(() => remove_features(data, loop), 100);
	});
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	if(request.message === 'updated_channels'){
		data.channels = request.channels;
		clearInterval(loop);
		loop = setInterval(() => remove_features(data, loop), 100);
	}
	else if (request.message === 'reset') {
		data = {
			channels: [],
			key_words: []
		};
	}
  }
);

function remove_features(data){
	
	if (window.location.href !== 'https://www.youtube.com/'){
		should_reload = true;
		return;
	}
	if(should_reload){
		location.reload();
		should_reload = false;
	}

	let vid_groups = document.getElementsByTagName('ytd-item-section-renderer');
	let videos = document.getElementsByTagName('ytd-grid-video-renderer');
	for (let i = 0; i < videos.length; i ++){
		let video_data = videos[i].children[0].innerText.split('\n');
		let video_channel= video_data[1];

		if (data.channels.includes(video_channel)){
			videos[i].style.display = 'none';
		}
	}

	for (let i = 0; i < vid_groups.length; i ++){
		let group_data = vid_groups[i].innerText.split('\n');
		let group_channel = group_data[0];
		if (data.channels.includes(group_channel) || group_data.length === 0){
			vid_groups[i].style.display = 'none';
		}
		else {
			if (
				!(group_channel.includes('viewers also watch...') ||
				group_channel.includes('Recommended') ||
				group_channel.includes('YouTube Mixes') ||
				group_channel.includes('Latest YouTube posts') ||
				group_channel.includes('From your subscriptions'))
				&& !vid_groups[i].children[4] && group_channel.length != 0
				){
					let button = generate_block_btn(group_channel);
					vid_groups[i].appendChild(button);
			}
		}
	}
}

function generate_block_btn(channel_name) {
	let btn = document.createElement('Button');
	let text_node = document.createTextNode(`Block ${channel_name}`);
	btn.appendChild(text_node);
	btn.setAttribute(`style`, `
					background: #cc0000;
					color: wheat;
					border: none; 
					border-radius: 1px;
					font-size: 1.4rem;
					`);
	btn.onmouseover = () => {
		btn.style.cursor = 'pointer';
	}
	btn.onfocus = () => {
		btn.style.border = 'none';
	}
	btn.onclick = () => {
		chrome.runtime.sendMessage({msg: "add_channel", channel: channel_name }, (response) => {
			data.channels = response.channels;
		});
	}

	return btn;
}