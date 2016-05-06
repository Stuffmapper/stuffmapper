var ionicApp = $('html').hasClass('ionic');
var modules = ['ui.router', 'ngAnimate'];
if(ionicApp) modules.push('ionic');
var stuffMapp = angular
.module('stuffMapp', modules)
.controller("MainController", MainController)
.config(config)
.factory('$userData', function() {
    var data = {
        FirstName: '',
        LastName: '',
        email: '',
        userId: 0
    };

    return {
        getFirstName: function () {
            return data.FirstName;
        },
        setFirstName: function (firstName) {
            data.FirstName = firstName;
        },
        getLastName: function () {
            return data.LastName;
        },
        setLastName: function (lastName) {
            data.LastName = lastName;
        },
        getUserId: function () {
            return data.UserId;
        },
        setUserId: function (userId) {
            data.UserId = userId;
        },
        getEmail: function () {
            return data.Email;
        },
        setEmail: function (email) {
            data.Email = email;
        },
        clearData: function () {
            data = {};
            data = {
                FirstName: '',
                LastName: '',
                email: '',
                userId: 0
            };
        }
    };
});

if(ionicApp) {
    stuffMapp.run(function($ionicPlatform) {
        $ionicPlatform.ready(function() {
            if(window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if(window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    });
}

function MainController($scope, $http) {
}

function config($locationProvider, $stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/menu/getstuff');
    $locationProvider.html5Mode(!!window.history && !!window.history.pushState);
    var ext = ionicApp?'.html':'';
    $stateProvider
    .state('menu', {
        url: '/menu',
        templateUrl: '/partials/home/partial-home' + ext,
        controller: function($scope, $userData) {
            $scope.map = new google.maps.Map($('#map-view')[0], {
                center: {
                    lat: 47.608013,
                    lng: -122.335167
                },
                zoom: 13
            });
            $userData.setUserId(1);
        }
    })
    .state('menu.get', {
        url: '/getstuff',
        templateUrl: '/partials/home/partial-home-getstuff' + ext,
        controller: function($scope, $http, $timeout, $userData) {
            $('#getstuff a').addClass('selected');
            $http({
                method: 'GET',
                url: '//localhost:3000/api/v1/stuff/' + $userData.getUserId()
            }).then(function(data) {
                $scope.listItems = data.data;
                $scope.markers = [];
                $scope.infowindows = [];
                $scope.filterOptions = [
                    'thing',
                    'stuff'
                ];
                $scope.filterPaneOpen = false;
                $scope.toggleFilterPane = function() {
                    $('#filter-pane').toggleClass('open-filter-pane');
                    console.log('toggleFilterPane');
                };
                var tempSearchText = '';
                var searchTextTimeout;
                var lastSearch;
                $scope.$watch('searchStuff', function (val) {
                    if (searchTextTimeout) {
                        $timeout.cancel(searchTextTimeout);
                    }
                    else {
                        console.log('Search for everything');
                    }
                    tempSearchText = val;
                    searchTextTimeout = $timeout(function() {
                        if(tempSearchText) {
                            $scope.filterText = tempSearchText;
                            if(tempSearchText !== lastSearch) {
                                console.log('Searching for:', val);
                                lastSearch = tempSearchText;
                            }
                        }
                        else if(tempSearchText !== undefined) {
                            console.log('Search for everything');
                        }
                    }, 250);
                });
                $scope.listItems.forEach(function(e) {
                    $scope.markers.push(new google.maps.Marker({
                        position: e.position,
                        icon: '/img/circle.png',
                        map: $scope.map
                    }));
                    var contentString = [
                        '<div style="width: 180px; height: 300px;">',
                        '   <div style="font-size: 16px">'+e.title+'</div>',
                        '   <div style="background-image: url('+e.img+');position:absolute;width: 200px; height: 270px;top:25px"></div>',
                        '</div>'
                    ].join('\n');
                    $scope.infowindows.push(new google.maps.InfoWindow({
                        content: contentString
                    }));
                    var infowindow = $scope.infowindows[$scope.infowindows.length - 1];
                    $scope.markers[$scope.markers.length - 1].addListener('click', function() {
                        $scope.infowindows.forEach(function(e) {
                            e.close();
                        });
                        infowindow.open($scope.map, this);
                    });
                    $scope.$on("$destroy", function() {
                        $('#getstuff a').removeClass('selected');
                        $scope.infowindows.forEach(function(e) {
                            e.close();
                        });
                        $scope.markers.forEach(function(e) {
                            e.setMap(null);
                        });
                    });
                });
            });
        }
    })
    .state('menu.getItem', {
        url: '/getstuff/:id',
        templateUrl: '/partials/home/partial-home-getstuff-item' + ext,
        controller: function($scope) {

        }
    })
    .state('menu.give', {
        url: '/givestuff',
        templateUrl: '/partials/home/partial-home-givestuff' + ext,
        controller: function($scope) {
            $('#givestuff a').addClass('selected');
            $scope.$on("$destroy", function() {
                $('#givestuff a').removeClass('selected');
            });
        }
    })
    .state('menu.my', {
        url: '/mystuff',
        templateUrl: '/partials/home/partial-home-mystuff' + ext,
        controller: function($scope) {
            $('#mystuff a').addClass('selected');
            $scope.$on("$destroy", function() {
                $('#mystuff a').removeClass('selected');
            });
        }
    })
    .state('about', {
    });
}


function addMarker($scope) {

}

function updateMarkers($scope) {

}

function clearMarkers($scope) {

}
