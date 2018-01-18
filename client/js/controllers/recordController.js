var app = angular.module('controllers');

app.controller('recordsController', function($route, $routeParams, $location, $scope, $rootScope, $http, $cookies, $cookieStore) {
    $scope.name = 'recordsController';
    $scope.params = $routeParams;

    $scope.records = [];
    $scope.allRecords = [];
    $scope.startDate = '';
    $scope.endDate = '';
    $scope.recordDate = '';
    $scope.startMessage = '';
    $scope.endMessage = '';
    console.log('anything test');
    $scope.user = '';
    function getAverageSpeed(record){
        var kms = record.meters / 1000;
        var hours = record.seconds / 60 / 60;

        return (Math.round((kms/hours)*100)/100);
    }
    $scope.getRecords = function() {
        var url = '';
        $scope.averageDistance = 0;
        $scope.averageSpeed = 0;
        $scope.averageKMs = 0;
        if($scope.params.user_id && $scope.params.user_id != "undefined" && ($cookieStore.get('user').permission_level == "MANAGER" || $cookieStore.get('user').permission_level == "ADMIN")) {
            url = '/record/get/user/' + $scope.params.user_id;
            $scope.user = $scope.params.user_id;
        }
        else {
            url = '/record/get/all';
            if($cookieStore.get('user'))
                $scope.user = $cookieStore.get('user')._id;
        }
        $http.get(url, {headers: {'x-access-token': $cookieStore.get('login_token')}}).then(function (result) {
            var records = result.data.data;
            var totalTime = 0;
            var counter = 0;
            var averageDistance = 0;
            // console.log(records);
            var startdate = new Date(records[0].date);
            var maxDistance = records[0].meters;
            var fastSpeed = getAverageSpeed(records[0]);
            var slowSpeed = getAverageSpeed(records[0]);

            for(var i = 0; i < records.length; i++) {
                
                var date = new Date(records[i].date);
                records[i].dateStr = date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate();;
                records[i].confirmDelete = false;
                totalTime += records[i].seconds;
                averageDistance += records[i].meters;
                
                if(maxDistance < parseInt(records[i].meters))
                    maxDistance = parseInt(records[i].meters);
                
                var aver = getAverageSpeed(records[i]);
                if(fastSpeed < aver)
                    fastSpeed = aver;
                if(slowSpeed > aver)
                    slowSpeed = aver;
                counter++;
            }
            $scope.maxDistance = maxDistance;
            $scope.totalTime = totalTime;
            $scope.fastSpeed = fastSpeed;
            $scope.slowSpeed = slowSpeed;
            
            $scope.averageSpeed = Math.round((averageDistance/totalTime)*100 * 3.6)/100;
            $scope.averageDistance = Math.round((averageDistance/counter)*100)/100;
            if($scope.averageDistance > 1000) {
                $scope.averageKMs = Math.round($scope.averageDistance/1000);
            }
            if($scope.maxDistance > 1000) {
                $scope.maxDistanceKMs = Math.round($scope.maxDistance/1000);
            }
           
            $scope.records = records;
            $scope.allRecords = $scope.records;
        }, function(err) {
            $rootScope.errorMessage = err.data.message;
            if(url == '/record/get/user/' + $scope.params.user_id) {
                $rootScope.navigatePath('/users');
            }
            else {
                $rootScope.navigatePath('/');
            }
        });
    };

    $scope.resetRecords = function() {
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        $scope.startDate = '';
        $scope.endDate = '';
        $scope.startMessage = '';
        $scope.endMessage = '';
        $scope.getRecords();
    };

    $scope.updateRecords = function() {
        $scope.startMessage = '';
        $scope.endMessage = '';

        $scope.averageDistance = 0;
        $scope.averageSpeed = 0;
        $scope.averageKMs = 0;

        var currStartDate = new Date(startDate.value);
        var currEndDate = new Date(endDate.value);

        var regEx = /^\d{4}\/\d{2}\/\d{2}$/;

        var error = false;

        if (!(moment(currStartDate, 'DD/MM/YYYY', true).isValid()) || !startDate.value.match(regEx)) {
            $scope.startMessage = 'Invalid start date entered.';
            error = true;
        }
        if (!(moment(currEndDate, 'DD/MM/YYYY', true).isValid()) || moment(currEndDate).isBefore(currStartDate, 'day') || !endDate.value.match(regEx)) {
            $scope.endMessage = 'Invalid end date entered.';
            error = true;
        }

        if(error) { return; }

        var records = [];
        var counter = 0;
        var totalTime = 0;
        var averageDistance = 0;
        for (var i = 0; i < $scope.allRecords.length; i++) {
            if (moment($scope.allRecords[i].date).isSameOrAfter(currStartDate, 'day') && moment($scope.allRecords[i].date).isSameOrBefore(currEndDate, 'day')) {
                records.push($scope.allRecords[i]);
                totalTime += $scope.allRecords[i].seconds;
                averageDistance += $scope.allRecords[i].meters;
                counter++;
            }
        }
        
        //$scope.totalTime = totalTime;
        $scope.averageSpeed = Math.round((averageDistance/totalTime)*100 * 3.6)/100;
        $scope.averageDistance = Math.round((averageDistance/counter)*100)/100;
        if($scope.averageDistance > 1000) {
            $scope.averageKMs = Math.round($scope.averageDistance/1000);
        }
        $scope.records = records;
    };

    $scope.removeRecordConfirm = function(record) {
        record.confirmDelete = true;
    };

    $scope.removeRecord = function(record) {
        var data = {record_id: record._id};
        var login_token = $cookieStore.get('login_token');

        var req = {
            method: 'DELETE',
            url: '/record/delete/' + record._id,
            headers: {
                'x-access-token': login_token
            },
            data: data
        };

        $http(req).then(function(response) {
            if($scope.params.user_id) {
                $rootScope.navigatePath('/records/' + $scope.params.user_id);
            }
            else {
                $rootScope.navigatePath('/');
            }
            $scope.getRecords();
        }, function(response) {
            $rootScope.errorMessage = response.data.message;
            $scope.getRecords();
        });
    };

    $scope.hideConfirmDelete = function(record) {
        record.confirmDelete = false;
    };

    $scope.prettyTime = function(time) {
        var minutes = Math.floor(time / 60);
        var seconds = time - minutes * 60;
        return minutes + "m " + seconds + "s";
    };

    $scope.prettyDistance = function(distance) {
        var kms = Math.floor(distance/1000);
        var meters = distance - kms * 1000;

        return kms + "km " + meters + "m";
    };

    //Set up date pickers on document.ready
    jQuery(function($){
        $('#startDate').datepicker();
        $('#startDate').datepicker( "option", "dateFormat", 'yy/mm/dd' );
        $('#endDate').datepicker();
        $('#endDate').datepicker( "option", "dateFormat", 'yy/mm/dd' );
        
    });

    $scope.updateRecord = function(record) {
        
        $rootScope.updateUser = $scope.user;
        $rootScope.navigatePath('/record/' + record._id);
    };

    $scope.createRecordPage = function() {
        $rootScope.updateUser = $scope.user;
        $rootScope.navigatePath('/record');
    };

    $scope.getAverageSpeed = function(record) {
        var kms = record.meters / 1000;
        var hours = record.seconds / 60 / 60;

        return (Math.round((kms/hours)*100)/100);
    };

    $scope.getRecords();
});

var app = angular.module('controllers');

app.controller('recordController', function($route, $routeParams, $location, $scope, $rootScope, $http, $cookies, $cookieStore) {
    var initialaddress = "tokyo";
    this.name = 'recordController';
    this.params = $routeParams;
    $scope.currentUpdateRecord = '';

    if(this.params.id) {
        $http.get('/record/get/' + this.params.id, {headers: {'x-access-token': $cookieStore.get('login_token')}}).then(function (result) {
            var date = new Date(result.data.record.date);

            $scope.currentUpdateRecord = result.data.record;
            $scope.currentUpdateRecord.date = date;

            $scope.currentUpdateRecord.kms = Math.floor($scope.currentUpdateRecord.meters/1000);
            $scope.currentUpdateRecord.meters = $scope.currentUpdateRecord.meters - $scope.currentUpdateRecord.kms * 1000;

            $scope.currentUpdateRecord.minutes = Math.floor($scope.currentUpdateRecord.seconds/60);
            $scope.currentUpdateRecord.seconds = $scope.currentUpdateRecord.seconds - $scope.currentUpdateRecord.minutes * 60;
            $scope.currentUpdateRecord.location = result.data.record.location;
            
            initialaddress = result.data.record.location;
            var address = initialaddress;
            console.log(address);
            address = address.toLowerCase();
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode( { 'address': address}, function(results, status) {
                var latitude = 0, longitude = 0;
                if (status == google.maps.GeocoderStatus.OK) {
                    latitude = results[0].geometry.location.lat();
                    longitude = results[0].geometry.location.lng();
                    
                    var uluru = {lat: latitude, lng: longitude};
                    var map = new google.maps.Map(document.getElementById('map'), {
                        zoom: 4,
                        center: uluru
                    });
                    var marker = new google.maps.Marker({
                        position: uluru,
                        map: map
                    });
                } 
            }); 
            jQuery(function($){
                $('#updateRecordDate').datepicker();
                $('#updateRecordDate').datepicker( "option", "dateFormat", 'yy/mm/dd' );
                $("#updateRecordDate").datepicker('setDate', $scope.currentUpdateRecord.date);
            });

        }, function(err) {
            $rootScope.errorMessage = err.data.message;
            $rootScope.navigatePath('/record');
        });
    }

    $scope.getSeconds = function(minutes, seconds) {
        var timeInSeconds = 0;
        if(minutes) {
            timeInSeconds += parseInt(minutes) * 60;
        }
        if(seconds) {
            timeInSeconds += parseInt(seconds);
        }
        return timeInSeconds;
    };

    $scope.getMeters = function(km, m) {
        var distance = 0;

        if(km) {
            distance += parseInt(km) * 1000;
        }
        if(m) {
            distance += parseInt(m);
        }
        return distance;
    };

    $scope.validateRecordForm = function(rec) {
        var regEx = /^\d*$/;
        if(rec.seconds >= 60) {
            $rootScope.errorMessage = "Seconds must be less than 60";
            return false;
        }
        if(rec.meters >= 1000) {
            $rootScope.errorMessage = "Meters must be less than 1000";
            return false;
        }
        if(rec.kms != undefined && rec.kms % 1 !== 0 && !rec.kms.match(regEx)) {
            $rootScope.errorMessage = "Kilometers must be a positive integer. (No decimals)";
            return false;
        }
        if(rec.meters != undefined && rec.meters % 1 !== 0 && !rec.meters.match(regEx)) {
            $rootScope.errorMessage = "Meters must be a positive integer. (No decimals)";
            return false;
        }
        if(rec.meters <= 0 && rec.kms <= 0) {
            $rootScope.errorMessage = "Meters/KMs should be greater than 0.";
            return false;
        }
        if(rec.minutes != undefined && rec.minutes % 1 !== 0 && !rec.minutes.match(regEx)) {
            $rootScope.errorMessage = "Minutes must be a positive integer. (No decimals)";
            return false;
        }
        if(rec.seconds != undefined && rec.seconds % 1 !== 0 && !rec.seconds.match(regEx)) {
            $rootScope.errorMessage = "Seconds must be a positive integer. (No decimals)";
            return false;
        }
        if(rec.minutes <= 0 && rec.seconds <= 0) {
            $rootScope.errorMessage = "Minutes/seconds should be greater than 0.";
            return false;
        }
        return true;
    };

    $scope.createRecord = function() {
        var user = $rootScope.updateUser ? $rootScope.updateUser : $cookieStore.get('user')._id;
        $rootScope.errorMessage = '';

        if($scope.validateRecordForm($scope)) {
            var timeInSeconds = $scope.getSeconds($scope.minutes, $scope.seconds);

            var distance = $scope.getMeters($scope.kms, $scope.meters);
            var location = $scope.location;

            $scope.recordDate = document.getElementById("recordDate").value;

            var data = {user_id: user, date: $scope.recordDate, time: timeInSeconds, distance: distance, location: location}

            $http.post('/record/create', data, {headers: {'x-access-token': $cookieStore.get('login_token')}}).then(function(response) {
                if($rootScope.updateUser == undefined) {
                    $rootScope.navigatePath('/records');
                }
                else {
                    $rootScope.navigatePath('/records/' + $rootScope.updateUser);
                }
            }, function(response) {
                $rootScope.errorMessage = response.data.message;
            });
        }
    };

    $scope.updateRecord = function(record) {
        $rootScope.navigatePath('/record/' + record._id);
    };

    $scope.confirmUpdateRecord = function() {
        $rootScope.errorMessage = "";
        $scope.currentUpdateRecord.date = document.getElementById("updateRecordDate").value;

        if($scope.validateRecordForm($scope.currentUpdateRecord)) {
            var timeInSeconds = $scope.getSeconds($scope.currentUpdateRecord.minutes, $scope.currentUpdateRecord.seconds);

            var distance = $scope.getMeters($scope.currentUpdateRecord.kms, $scope.currentUpdateRecord.meters);

            var data = {record_id: $scope.currentUpdateRecord._id, date: $scope.currentUpdateRecord.date, time: timeInSeconds, distance: distance, location:$scope.currentUpdateRecord.location}
            

            $http.put('/record/update', data, {headers: {'x-access-token': $cookieStore.get('login_token')}}).then(function(response) {
                if($rootScope.updateUser == undefined) {
                    $rootScope.navigatePath('/records');
                }
                else {
                    $rootScope.navigatePath('/records/' + $rootScope.updateUser);
                }
            }, function(response) {
                $rootScope.errorMessage = response.data.message;
                $scope.getRecords();
            });
        }
    };

    $scope.cancel = function () {
        if($rootScope.updateUser == undefined) {
            $rootScope.navigatePath('/');
        }
        else {
            $rootScope.navigatePath('/records/' + $rootScope.updateUser);
        }
    };
    $scope.showMap = function() {
        var geocoder = new google.maps.Geocoder();
        var address = document.getElementById('location').value;
        console.log(address);
        address = address.toLowerCase();
        
        geocoder.geocode( { 'address': address}, function(results, status) {
        var latitude = 0, longitude = 0;
        if (status == google.maps.GeocoderStatus.OK) {
                latitude = results[0].geometry.location.lat();
                longitude = results[0].geometry.location.lng();
                
                var uluru = {lat: latitude, lng: longitude};
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 4,
                    center: uluru
                });
                var marker = new google.maps.Marker({
                    position: uluru,
                    map: map
                });
            } 
        }); 
    }
    $scope.initialUpdateMap = function(){
        
    }
    $scope.updateMap = function() {
        var geocoder = new google.maps.Geocoder();
        var address = document.getElementById('updateLocation').value;
        
        console.log(address);
        address = address.toLowerCase();
        
        geocoder.geocode( { 'address': address}, function(results, status) {
        var latitude = 0, longitude = 0;
        if (status == google.maps.GeocoderStatus.OK) {
                latitude = results[0].geometry.location.lat();
                longitude = results[0].geometry.location.lng();
                
                var uluru = {lat: latitude, lng: longitude};
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 4,
                    center: uluru
                });
                var marker = new google.maps.Marker({
                    position: uluru,
                    map: map
                });
            } 
        }); 
    }
    //Set up date pickers on document.ready
    jQuery(function($){
        
        $('#recordDate').datepicker();
        $('#recordDate').datepicker( "option", "dateFormat", 'yy/mm/dd' );
    });
});