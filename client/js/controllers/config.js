var app = angular.module('controllers');

app.config(function($routeProvider,$locationProvider) {
    $routeProvider.when('/login', {
        templateUrl: '../views/login.ejs',
        controller: 'loginController'
    }).when('/register', {
        templateUrl: '../views/register.ejs',
        controller: 'registerController'
    }).when('/', {
        templateUrl: '../views/index.ejs',
        controller: 'recordsController'
    }).when('/records/:user_id', {
        templateUrl: '../views/index.ejs',
        controller: 'recordsController'
    }).when('/record', {
        templateUrl: '../views/record.ejs',
        controller: 'recordController'
    }).when('/record/:id', {
        templateUrl: '../views/record.ejs',
        controller: 'recordController'
    }).when('/updateUser', {
        templateUrl: '../views/user.ejs',
        controller: 'userController'
    }).when('/users', {
        templateUrl: '../views/users.ejs',
        controller: 'usersController'
    }).when('/updateUser/:id', {
        templateUrl: '../views/user.ejs',
        controller: 'userController'
    }).otherwise({
        redirectTo: "/"
    });

    $locationProvider.html5Mode(true);
});