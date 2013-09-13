// Define the menu module.  We have the routing module, the animate module,
// and the game module as dependencies.
var menu = angular.module("menu", ["ngRoute", "ngAnimate", "game"]);

// Configure our routing with the routing provider
menu.config(["$routeProvider", function ($routeProvider) {
    $routeProvider
        .when("/", { controller:"startGame", templateUrl:"tpl/startScreen.html"})
        .when("/game", { controller:"gameScreen", templateUrl:"tpl/gameScreen.html"})
        .otherwise({ redirectTo:"/" });
}]);


// Register our controller with the "menu" module.
menu.controller("startGame", ["$scope", "$location", function ($scope, $location) {

    $scope.startGame = function () {
        $location.path("/game");
    };
}]);
