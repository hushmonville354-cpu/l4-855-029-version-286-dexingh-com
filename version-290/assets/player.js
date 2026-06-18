function startMoviePlayer(videoId, buttonId, url) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  if (!video || !button || !url) {
    return;
  }

  var ready = false;
  var hlsInstance = null;

  function attach() {
    if (ready) {
      return;
    }
    ready = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
    } else {
      video.src = url;
    }
  }

  function play() {
    attach();
    button.classList.add("hidden");
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {
        button.classList.remove("hidden");
      });
    }
  }

  button.addEventListener("click", play);
  video.addEventListener("click", function () {
    if (!ready) {
      play();
    }
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
