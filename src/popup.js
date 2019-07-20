let channel = document.getElementById('channel');
let block_button = document.getElementById('block');
let reset = document.getElementById('reset');

let channels =  JSON.parse(localStorage.getItem('channels')) || [];

reset.addEventListener("click", function(e){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		var activeTab = tabs[0];
		let data = {
			"message": "reset",
		};
		localStorage.removeItem('channels');

		let options = {
			type: "basic",
			title: "Channel Blocker",
			message: "Reset Successful",
			iconUrl: "./icon.png"
		};
		chrome.notifications.create(options);
		chrome.tabs.sendMessage(activeTab.id, data);
	});
})

block_button.addEventListener("click", function(e){
	if(channel.value.length > 0){
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			var activeTab = tabs[0];
			let data = {
				"message": "updated_channels",
				channels
			}

			channels.push(channel.value);
			localStorage.setItem('channels', JSON.stringify(channels));

			let options = {
				type: "basic",
				title: "Channel Blocker",
				message: `Blocked ${channel.value}`,
				iconUrl: "./icon.png"
			}

			// reset
			channel.value = '';

			chrome.notifications.create(options);
			chrome.tabs.sendMessage(activeTab.id, data);
		});
	}
})