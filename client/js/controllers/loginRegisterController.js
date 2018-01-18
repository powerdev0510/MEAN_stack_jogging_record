var app = angular.module('controllers');

app.controller('loginController', function($rootScope, $route, $routeParams, $location, $scope, $rootScope, $http, $cookies, $cookieStore, $window) {
    this.name = 'loginController';
    this.params = $routeParams;
    $rootScope.errorMessage = "";

    $scope.onSubmit = function() {
        $rootScope.errorMessage = "";
        $rootScope.successMessage = "";
        var data = {email: $scope.email, password: $scope.password}

        $http.post('/user/login', data).then(function(response) {
            if(response.data.token) {
                $cookieStore.put("login_token", response.data.token);
            }
            $scope.email = "";
            $scope.password = "";

            $rootScope.checkLogin();
            $location.path('/');
        }, function(response) {
            $rootScope.errorMessage = response.data.message;
        });
    }
});

app.controller('registerController', function($rootScope, $scope, $http, $location, $cookies, $cookieStore) {
    $scope.email = "";
    $scope.password = "";
    $scope.confirmPassword ="";
    $rootScope.errorMessage = "";

    /**
     * Submits the user registration data to server.
     */
    $scope.onSubmit = function() {
        if($scope.password.length < 5 || $scope.password.length > 20) {
            $rootScope.errorMessage = "Password length must be between 5 and 20 characters."
        }
        else if($scope.password == $scope.confirmPassword) {
            var data = {email: $scope.email, password: $scope.password, confirmPassword: $scope.confirmPassword}

            $http.post('/user/register', data).then(function(response) {
                if(response.data.token) {
                    $cookieStore.put("login_token", response.data.token);
                }
                $scope.email = "";
                $scope.password = "";
                $scope.confirmPassword = "";

                $rootScope.checkLogin();

                $location.path('/');
            }, function(response) {
                //console.log(response);
                $rootScope.errorMessage = response.data.message;
            });

        }
        else {
            $rootScope.errorMessage = "Passwords must match.";
        }
    }
});


