(function () {
  function bindPlayer(shell) {
    var video = shell.querySelector('.movie-player');
    var cover = shell.querySelector('.player-cover');
    var hlsInstance = null;
    var started = false;

    if (!video || !cover) {
      return;
    }

    function start() {
      if (!started) {
        var stream = video.getAttribute('data-play');
        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      cover.classList.add('is-hidden');
      var attempt = video.play();

      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          cover.classList.remove('is-hidden');
        });
      }
    }

    cover.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!started || video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      cover.classList.add('is-hidden');
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(bindPlayer);
})();
