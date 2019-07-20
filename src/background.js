chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	let channels = JSON.parse(localStorage.getItem('channels')) || [];
	let key_words = JSON.parse(localStorage.getItem('key_words')) || [];

	if (request.msg === 'page_load') {
		sendResponse({
			channels,
			key_words
		});
	}
	else if (request.msg === 'add_channel') {
		if (!channels.includes(request.channel)){
			channels.push(request.channel);
			localStorage.setItem('channels', JSON.stringify(channels));
			sendResponse({message: 'updated_channels', channels});
		}
	}
});
