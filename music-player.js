(() => {
    const audio = document.getElementById('myAudio');
    if (!audio) return;
    const listenButton = document.getElementById('music-listen');
    let playbackStarted = !audio.paused && audio.readyState >= 3;

    const interactionEvents = ['click', 'touchend', 'keydown'];

    function updateListenButton() {
        if (listenButton) {
            const playing = playbackStarted && !audio.paused && !audio.muted && !audio.error;
            // Keep the control visible, including in mobile emulation with autoplay allowed.
            listenButton.hidden = false;
            listenButton.textContent = playing ? '♪ Đang phát nhạc' : '♪ Ấn để nghe';
            listenButton.setAttribute('data-playing', String(Boolean(playing)));
            listenButton.setAttribute('aria-label', playing ? 'Nhạc sinh nhật đang phát' : 'Ấn để nghe nhạc sinh nhật');
        }
    }

    function onPlaybackStarted() {
        playbackStarted = true;
        removeInteractionListeners();
        updateListenButton();
    }

    function onPlaybackStopped() {
        playbackStarted = false;
        updateListenButton();
    }

    function removeInteractionListeners() {
        interactionEvents.forEach((eventName) => {
            document.removeEventListener(eventName, onInteraction, true);
        });
    }

    async function playMusic() {
        // Audible autoplay still requires permission from the browser.
        audio.muted = false;
        try {
            await audio.play();
            // A pending play request is not confirmation that sound has started.
            onPlaybackStarted();
        } catch {
            // If autoplay is blocked, retry on the next real user gesture.
            updateListenButton();
        }
    }

    function onInteraction(event) {
        if (listenButton && listenButton.contains(event.target)) return;
        if (!playbackStarted || audio.paused || audio.muted) playMusic();
    }

    audio.addEventListener('playing', onPlaybackStarted);
    audio.addEventListener('pause', onPlaybackStopped);
    audio.addEventListener('volumechange', updateListenButton);
    audio.addEventListener('error', onPlaybackStopped);
    audio.addEventListener('emptied', onPlaybackStopped);

    if (listenButton) listenButton.addEventListener('click', playMusic);

    // Keep retries inside real user gestures, including touch and keyboard.
    interactionEvents.forEach((eventName) => {
        document.addEventListener(eventName, onInteraction, { capture: true, passive: true });
    });

    // Do not wait for images, fonts, or the video to finish loading.
    updateListenButton();
    playMusic();
})();
