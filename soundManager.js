var SoundManager = function () {
    this.soundMap = {};
};

SoundManager.prototype = {
    add:function (options) {
        if (this.soundMap[options.key]) {
            return this.soundMap[options.key];
        }

        // Don't create duplicates...
        var domElement = window.document.getElementById("soundmanager-" + options.key);
        if (domElement) {
            return domElement;
        }

        var audioElement = window.document.createElement('audio');
        audioElement.setAttribute('src', options.src);
        audioElement.setAttribute('id', "soundmanager-" + options.key);
        audioElement.setAttribute('preload', "auto");
        window.document.body.appendChild(audioElement);
        audioElement.volume = options.volume || 1;

        this.soundMap[options.key] = audioElement;

        return audioElement;
    },
    play:function (key) {
        this.soundMap[key].play();
    }
};
