(function () {
    function loadLibrary(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = document.querySelector('script[data-hls-lib]');
        if (existing) {
            existing.addEventListener('load', callback, { once: true });
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
        script.async = true;
        script.setAttribute('data-hls-lib', '1');
        script.addEventListener('load', callback, { once: true });
        document.head.appendChild(script);
    }

    function attach(video, url, done) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            done();
            return;
        }
        loadLibrary(function () {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(url);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = url;
            }
            done();
        });
    }

    function init() {
        var video = document.querySelector('[data-player-video]');
        var trigger = document.querySelector('[data-player-trigger]');
        if (!video || !trigger) {
            return;
        }
        var url = trigger.getAttribute('data-m3u8');
        var ready = false;
        function play() {
            trigger.classList.add('is-hidden');
            video.controls = true;
            if (ready) {
                video.play().catch(function () {});
                return;
            }
            attach(video, url, function () {
                ready = true;
                video.play().catch(function () {});
            });
        }
        trigger.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', function () {
            trigger.classList.add('is-hidden');
        });
    }

    document.addEventListener('DOMContentLoaded', init);
})();
