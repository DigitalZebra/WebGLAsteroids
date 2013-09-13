var gameLoop = function(obj) {
	var me = {};
	var keys = {
		UP: false,
		DOWN: false,
		LEFT: false,
		RIGHT: false,
        SPACE: false
	};

	var keyMap = [];
	keyMap[38] = "UP";
	keyMap[37] = "LEFT";
	keyMap[40] = "DOWN";
	keyMap[39] = "RIGHT";
    keyMap[32] = "SPACE";

	var gameState = {
		keys: keys,
		elapsedTime: null
	};

	var lastFrameTime = null,
		running = true;

	var looper = function() {
		if (running) {
		  requestAnimationFrame(looper);
			var now = new Date();

			gameState.elapsedTime = now - lastFrameTime;

			obj.update(gameState);
            // The way three js is architected, we don't need a "draw" step
			// obj.draw.call(obj.state, gameState);

			lastFrameTime = now;
		}
	};

	me.resume = function() {
		lastFrameTime = new Date(); // reset frametime.
		running = true;
		requestAnimationFrame(looper);
	};

	me.pause = function() {
		running = false;
	};

	me.init = function() {

		obj.init();

		// wire up key events.
		$(window).keydown(function(e) {
			keys[keyMap[e.keyCode]] = true;
		})
		.keyup(function(e) {
			keys[keyMap[e.keyCode]] = false;
		});

		lastFrameTime = new Date();

		requestAnimationFrame(looper);
	};

    me.stop = function() {
        running = false;
        obj = null;
    };

	return me;

};