var myApp = angular.module('myApp', ['ngRoute']);

myApp.config(function($routeProvider){
    $routeProvider
        .when('/trang-chu', {
            templateUrl: "views/trang-chu.html",
        })
        .when('/list', {
            templateUrl: "views/list.html",
            controller: ListController
        })
        .when('/detail/:id', {
            templateUrl: "views/detail.html",
            controller: DetailController
        })
        .when('/add', {
            templateUrl: "views/add.html",
            controller: AddController
        })
        .otherwise({
            redirectTo: '/list'
        })
})