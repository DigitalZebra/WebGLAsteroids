(function () {

    // Create a new game module.
    var gameModule = angular.module("game", []);

    // Add a directive for the asteroid game
    gameModule.directive("asteroidGame", ["$window", function ($window) {
        return {
            restrict:'A',
            scope:{
                localScore:'=score',
                localIsPaused:'=isPaused'
            },
            controller:["$scope", function ($scope) {
                var game = new AsteroidGame();

                // Keep track of our paused state.
                $scope.localIsPaused = false;

                $scope.localScore = game.gameState.score; // set to default

                // Listen to a "score updated" event, as this event will
                // be fired outside of angular's magic, notice the manual call
                // to $apply
                game.addEventListener('scoreUpdated', function (event) {
                    $scope.$apply(function () {
                        $scope.localScore = event.score;
                    });
                });

                this.startGame = function () {
                    game.start();
                };

                this.triggerResize = function () {
                    game.handleResize();
                };

                this.setParentDomElement = function (parentDomElement) {
                    game.setParentDomElement(parentDomElement);
                };

                this.togglePauseState = function () {
                    $scope.localIsPaused = game.togglePauseState();
                };

                // When this scope is cleared, we need to dispose of our game.
                $scope.$on("$destroy", function () {
                    game.dispose();
                });
            }],
            link:function (scope, iElement, iAttrs, controller) {

                // bind the game to the parent dom element.  This
                // is kind of hacky to do here.
                controller.setParentDomElement(iElement[0]);

                // We need to wire up a window resize function here
                var resizeFunc = function () {
                    controller.triggerResize();
                };

                var keyPressFunc = function (event) {
                    if (event.which == 112 || event.which == 80) /* 'P' */ {
                        scope.$apply(function () {
                            controller.togglePauseState();
                        });
                    }
                };

                $($window).on("resize", resizeFunc);
                $($window).on("keypress", keyPressFunc);

                // remove our DOM events when our directive is cleaned up
                // from the DOM
                scope.$on("$destroy", function () {
                    $($window).off("resize", resizeFunc);
                    $($window).off("keypress", keyPressFunc);
                });

                // finally, start the game once all the correct bindings have
                // been applied.
                controller.startGame();
            }
        }
    }]);

    // A simple controller, really is not used for anything :\
    gameModule.controller("gameScreen", ["$scope", function ($scope) {
        $scope.pausedState = false;
    }]);
})();