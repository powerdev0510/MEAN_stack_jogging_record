var app = angular.module('controllers');

app.controller('userController', function($route, $routeParams, $location, $scope, $rootScope, $http, $cookies, $cookieStore) {

    $scope.currentUser = $cookieStore.get('user');

    $rootScope.errorMessage = '';

    if($routeParams.id == undefined) {
        $routeParams.id = $cookieStore.get('user');
    }
    else if($routeParams.id && $routeParams.id != $cookieStore.get('user')._id && $cookieStore.get('user').permission_level != "MANAGER" && $cookieStore.get('user').permission_level != "ADMIN") {
        $rootScope.navigatePath('/updateUser');
        return;
    }
    else {
        $http.get('/user/get/'+$routeParams.id, {headers: {'x-access-token': $cookieStore.get('login_token')}}).then(function (result) {
            if((result.data.user.permission_level == "ADMIN" || result.data.user.permission_level == "MANAGER") && result.data.user.id != $cookieStore.get('user')._id && $cookieStore.get('user').permission_level != "ADMIN") {
                $rootScope.navigatePath('/updateUser');
            }
            else {
                $scope.currentUser = result.data.user;
            }
        }, function (result) {
            $rootScope.errorMessage = "Error getting user.";
        });
    }

    $scope.confirmUpdateUser = function() {
        $rootScope.errorMessage = '';
        if($scope.currentUser.email == $cookieStore.get('user').email && ($scope.currentUser.password == '' || $scope.currentUser.password == undefined) && $scope.currentUser.permission_level == $cookieStore.get('user').permission_level) {
            $rootScope.errorMessage = 'No information to update was entered.';
            return;
        }
        if($scope.currentUser.password == $scope.currentUser.confirmPassword) {
            var data = {id: $scope.currentUser.id, newEmail: $scope.currentUser.email, password: $scope.currentUser.password}
            var path = '/';
            if($cookieStore.get('user').permission_level == "ADMIN") {
                data.permission_level = $scope.currentUser.permission_level;
            }
            $http.put('/user/update', data, {headers: {'x-access-token': $cookieStore.get('login_token')}}).then(function(response) {
                if(response.data.token) {
                    $cookieStore.put("login_token", response.data.token);
                    $rootScope.checkLogin();
                    if($cookieStore.get('user').permission_level == "ADMIN" || $cookieStore.get('user').permission_level == "MANAGER") {
                        path = '/users';
                    }
                }
                $rootScope.navigatePath(path);
            }, function(response) {
                $rootScope.errorMessage = response.data.message;
            });
        }
        else {
            $rootScope.errorMessage = "Please make sure passwords match.";
        }
    };

    $scope.cancel = function () {
        $rootScope.navigatePath('/users/');
    };
});

//Controller for managers and admins to update/delete users
app.controller('usersController', function($route, $routeParams, $location, $scope, $rootScope, $http, $cookies, $cookieStore) {
    $scope.users = [];

    $scope.getUsersList = function() {
        if($cookieStore.get('user').permission_level == "MANAGER" || $cookieStore.get('user').permission_level == "ADMIN") {
            $http.get('/user/all', {headers: {'x-access-token': $cookieStore.get('login_token')}}).then(function (result) {
                $scope.users = result.data.users;
            }, function(err) {
                $rootScope.navigatePath('/');
            });
        }
        else {
            $rootScope.navigatePath('/');
        }
    }

    $scope.updateUser = function(user) {
        $rootScope.navigatePath('/updateUser/' + user._id);
    };

    $scope.removeUserConfirm = function(user) {
        user.confirmDelete = true;
    };

    $scope.hideUserConfirmDelete = function(user) {
        user.confirmDelete = false;
    };

    $scope.removeUser = function(user) {
        $rootScope.errorMessage = '';
        var data = {id: user._id};
        var login_token = $cookieStore.get('login_token');

        var req = {
            method: 'DELETE',
            url: '/user/delete/' + user._id,
            headers: {
                'x-access-token': login_token
            }
        };

        $http(req).then(function(response) {
            $rootScope.navigatePath('/users');
            $scope.getUsersList();
        }, function(response) {
            $rootScope.errorMessage = response.data.message;
            $scope.getUsersList();
        });
    }

    $scope.listRecords = function(user) {
        $rootScope.navigatePath('/records/'+user._id);
    }

    $scope.getUsersList();
});

