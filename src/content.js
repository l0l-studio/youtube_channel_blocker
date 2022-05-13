/*----------------------------
GLOBALS
----------------------------*/
let data = null;
let should_reload = false;

const thumbnail_tags = {
    main: 'ytd-rich-item-renderer',
    watch: 'ytd-compact-video-renderer',
};

const channel_name_element = 'yt-formatted-string';

window.onload = () => {
    const contents = document.getElementById('page-manager');
    const secondary = document.getElementById('secondary');

    const observer_0 = new MutationObserver(handle_mutation);
    const observer_1 = new MutationObserver(handle_mutation);

    observer_0.observe(contents, { childList: true, subtree: true });
    if (secondary) {
        observer_1.observe(secondary, { childList: true, subtree: true });
    }

    window.onbeforeunload = () => {
        observer_0.disconnect();
        observer_1.disconnect();
    };

    let timeout;
    timeout = setInterval(() => {
        if (data) {
            clearTimeout(timeout);
            return;
        }

        chrome.runtime.sendMessage({ msg: 'page_load' }, (response) => {
            data = new Set(response.channels);
            console.log(data);
            remove_features(data);
        });
    });
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.message) {
        case 'updated_channels':
            data.add(request.channel);
            remove_features(data);
            break;

        case 'reset':
            data.clear();
            break;

        default:
            throw 'event does not exist';
    }

    sendResponse();
});

const handle_mutation = (mutation_list, observer) => {
    //TODO: use the mutation_list to only process new elements
    remove_features(data);
};

const remove_features = (data) => {
    const page = !window.location.href.match('watch') ? 'main' : 'watch';
    const videos = document.getElementsByTagName(thumbnail_tags[page]);

    for (let i = 0; i < videos.length; i++) {
        const cn_containers = videos[i].getElementsByTagName(channel_name_element);

        if (cn_containers.length > 0) {
            //watch page [0] cause there's only 1 'yt-formatted-string'
            //main page [1] cause there's 2 'yt-formatted-string'
            const channel_name = page === 'watch' ? 0 : 1;

            if (data.has(cn_containers[channel_name].innerText)) {
                videos[i].remove();
            }
        }
    }
};
