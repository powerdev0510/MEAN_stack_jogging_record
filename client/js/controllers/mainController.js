var app = angular.module('controllers', ['ngRoute', 'ngAnimate']);

app.controller('mainController', function($route, $routeParams, $location, $scope, $rootScope, $http, $window, $cookies, $cookieStore) {
    this.$route = $route;
    this.$location = $location;
    this.$routeParams = $routeParams;

    $rootScope.errorMessage = "";
    $rootScope.successMessage = "";

    $rootScope.logged_in = false;
    $rootScope.is_manager = false;
    $rootScope.is_admin = false;

    $rootScope.destroyLogin = function() {
        if($window.location.pathname != "/login" && $window.location.pathname != "/register") {
            $cookieStore.remove("login_token");
            $rootScope.logged_in = false;
            $rootScope.is_manager = false;
            $rootScope.is_admin = false;
            $location.path('/login');
        }
    };

    $rootScope.checkLogin = function() {
        $rootScope.errorMessage = "";
        if($cookieStore.get("login_token") != undefined) {
            $http.get('/user/validToken', {headers: {'x-access-token': $cookieStore.get('login_token')}}).then(function (result) {
                $rootScope.logged_in = true;

                $http.get('/user/get', {headers: {'x-access-token': $cookieStore.get('login_token')}}).then(function (result) {
                    $rootScope.is_manager = false;
                    $rootScope.is_admin = false;
                    $cookieStore.put('user', result.data.user);
                    if(result.data.user.permission_level == "MANAGER") {
                        $rootScope.is_manager = true;
                    }
                    else if(result.data.user.permission_level == "ADMIN") {
                        $rootScope.is_admin = true;
                    }
                }, function (result) {
                    $rootScope.errorMessage = result.data.message;
                    $rootScope.destroyLogin(); //Destroy the invalid login token and redirect to login
                });

                if($window.location.pathname == "/login" || $window.location.pathname == "/register") {
                    $location.path('/');
                }
            }, function (result) {
                $rootScope.errorMessage = result.data.message;
                $rootScope.destroyLogin(); //Destroy the invalid login token and redirect to login
            });
        }
        else {
            $rootScope.destroyLogin();
        }
    };

    $rootScope.navigatePath = function(path) {
        $location.path(path);
        $rootScope.errorMessage = '';
        $rootScope.checkLogin();
    };

    $rootScope.checkLogin();
});