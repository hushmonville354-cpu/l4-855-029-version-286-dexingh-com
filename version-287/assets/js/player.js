(function () {
    window.startMoviePlayer = function (videoId, buttonId, overlayId, streamUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var overlay = document.getElementById(overlayId);
        var loaded = false;
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                return;
            }

            video.src = streamUrl;
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }

        function keyboard(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                play();
            }
        }

        if (button) {
            button.addEventListener('click', play);
            button.addEventListener('keydown', keyboard);
        }

        if (overlay) {
            overlay.addEventListener('click', play);
            overlay.addEventListener('keydown', keyboard);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
