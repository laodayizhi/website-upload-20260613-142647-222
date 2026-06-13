(function () {
  window.initMoviePlayer = function (sourceUrl) {
    var video = document.getElementById('movie-player');
    var layer = document.getElementById('player-layer');
    var status = document.getElementById('player-status');
    if (!video || !layer || !sourceUrl) {
      return;
    }

    var hlsInstance = null;

    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function enableControls() {
      video.controls = true;
      layer.classList.add('is-hidden');
    }

    function beginPlay() {
      enableControls();
      setStatus('');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          layer.classList.remove('is-hidden');
          video.controls = false;
          setStatus('点击播放按钮开始播放');
        });
      }
    }

    function attachSource() {
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
            return;
          }
          setStatus('播放暂时不可用，请刷新重试');
        });
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        return;
      }
      setStatus('播放暂时不可用，请刷新重试');
    }

    attachSource();
    layer.addEventListener('click', beginPlay);
    video.addEventListener('click', function () {
      if (video.paused) {
        beginPlay();
      }
    });
    video.addEventListener('play', enableControls);
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
