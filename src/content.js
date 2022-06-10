/*----------------------------
GLOBALS
----------------------------*/
let DATA = null;

const THUMBNAIL_TAGS = {
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
        if (DATA) {
            clearTimeout(timeout);
            return;
        }

        chrome.runtime.sendMessage({ msg: 'page_load' }, (response) => {
            DATA = new Set(response.channels);
            console.log('yt_blocker loaded:', DATA.size);
        });
    });
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.message) {
        case 'updated_channels':
            DATA.add(request.channel);

            const { page, channel_index } = get_location_data();

            //Getting video elements here doesn't feel good?
            const videos_elements = document.getElementsByTagName(
                THUMBNAIL_TAGS[page]
            );
            remove_features(channel_index, DATA, videos_elements);
            break;

        case 'reset':
            DATA.clear();
            break;

        default:
            throw 'event does not exist';
    }

    sendResponse();
});

const handle_mutation = (mutation_list, observer) => {
    const { page, channel_index } = get_location_data();

    const nodes = mutation_list.flatMap((mut) => [
        ...mut.target.getElementsByTagName(THUMBNAIL_TAGS[page]),
    ]);

    add_block_buttons(channel_index, nodes);
    remove_features(channel_index, DATA, nodes);
};

const remove_features = (channel_index, data, video_elements) => {
    for (let i = 0; i < video_elements.length; i++) {
        const cn_containers =
            video_elements[i].getElementsByTagName(channel_name_element);

        if (cn_containers.length > 0) {
            //watch page [0] cause there's only 1 'yt-formatted-string'
            //main page [1] cause there's 2 'yt-formatted-string'
            const channel_name =
                cn_containers[channel_index].innerText.split('\n')[1];

            if (data.has(channel_name)) {
                video_elements[i].remove();
            }
        }
    }
};

const add_block_buttons = (channel_index, video_elements) => {
    for (let i = 0; i < video_elements.length; i++) {
        const cn_container =
            video_elements[i].getElementsByTagName(channel_name_element)[
                channel_index
            ];

        if (cn_container.getElementsByClassName('block_btn').length > 0)
            continue;

        if (cn_container.firstElementChild) {
            cn_container.insertBefore(
                create_button(cn_container.innerText),
                cn_container.firstElementChild
            );
        }
    }
};

const create_button = (channel_name) => {
    let button = document.createElement('button');
    button.innerText = 'block';
    button.classList.add('block_btn');

    button.style.backgroundColor = 'rgba(255, 16, 15, 0.8)';
    button.style.borderRadius = '5px';
    button.style.marginRight = '5px';
    button.style.color = 'white';
    button.style.border = 'none';

    button.addEventListener('click', (e) => {
        e.stopPropagation();

        if (!confirm(`Block: ${channel_name}?`)) {
            return;
        }

        chrome.runtime.sendMessage({
            msg: 'block_channel',
            channel: channel_name,
        });
    });

    return button;
};

const get_location_data = () => {
    const page = !window.location.href.match('watch') ? 'main' : 'watch';
    const channel_index = page === 'watch' ? 0 : 1;

    return { page, channel_index };
};
