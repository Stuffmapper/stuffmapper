var config = setDefaultConfig();
var stuffMapp = angular
.module('stuffMapp', config.modules)
.controller("MainController", MainController)
.config(appConfig)
.factory('$userData', function() {
    var data = { FirstName: '', LastName: '', email: '', userId: 0 };
    return {
        getFirstName: function () { return data.FirstName; },
        setFirstName: function (firstName) { data.FirstName = firstName; },
        getLastName: function () { return data.LastName; },
        setLastName: function (lastName) { data.LastName = lastName; },
        getUserId: function () { return data.UserId; },
        setUserId: function (userId) { data.UserId = userId; },
        getEmail: function () { return data.Email; },
        setEmail: function (email) { data.Email = email; },
        clearData: function () {
            data = { FirstName: '', LastName: '', email: '', userId: 0 };
        }
    };
});

if(config.ionic.isIonic) {
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

function MainController($scope, $http, $timeout) {
    $scope.popUpOpen = false;
    $scope.signInOrUp = function(type) {
        if(config.html5) location.hash = 'sign'+type.charAt(0).toUpperCase()+type.slice(1);
        $('.modal-window').removeClass('modal-window-open');
        requestAnimationFrame(function(){
            $scope.$apply(function() {
                if($scope.popUpOpen === false) {
                    $scope.popUpOpen = true;
                    $('#modal-windows').addClass('modal-windows-open');
                    $('.modal-container').css({'z-index':''});
                    requestAnimationFrame(function() {
                        $('#modal-windows-bg').addClass('modal-windows-bg-open');
                        $('#sign-'+type).addClass('modal-window-open');
                        $('#sign-'+type).addClass('modal-window-open');
                        $('#sign-'+type).parent().css({'z-index':'3'});
                    });
                } else {
                    requestAnimationFrame(function() {
                        $('#modal-windows-bg').addClass('modal-windows-bg-open');
                        $('#sign-'+type).addClass('modal-window-open');
                    });
                }
            });
        });
    };
    $scope.closePopups = function() {
        if(config.html5) history.pushState("", document.title, window.location.pathname + window.location.search);
        else console.log('this should close popups... not sure what to do without html5 :<');
    };
    if(config.html5) {
        $scope.$watch(function () {
            return location.hash;
        }, function (value) {
            if(value) {
                clearTimeout($scope.popUpTimeout);
                var hash = value.split('#').pop();
                if(/signIn|signUp/.test(hash)) $scope.signInOrUp(hash.slice(-2).toLowerCase());
            }
            else if($scope.popUpOpen) {
                clearTimeout($scope.popUpTimeout);
                $scope.popUpOpen = false;
                $('#modal-windows-bg').removeClass('modal-windows-bg-open');
                $('.modal-window').removeClass('modal-window-open');
                $scope.popUpTimeout = setTimeout(function() {
                    $('#modal-windows').removeClass('modal-windows-open');
                }, 250);
            }
        });
    }
}

function appConfig($locationProvider, $stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/menu/getstuff');
    $locationProvider.html5Mode(config.html5);
    $stateProvider
    .state('menu', {
        url: '/menu',
        templateUrl: '/partials/home/partial-home' + config.ext,
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
        templateUrl: '/partials/home/partial-home-getstuff' + config.ext,
        controller: function($scope, $http, $timeout, $userData) {
            $('#getstuff a').addClass('selected');
            $http({
                method: 'GET',
                url: config.api.host + 'api/' + config.api.version + '/stuff/'
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
                        position: {
                            lat: e.lat,
                            lng : e.lng
                        },
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
        }
    })
    .state('menu.getItem', {
        url: '/getstuff/:id',
        templateUrl: '/partials/home/partial-home-getstuff-id' + config.ext,
        controller: function($scope, $http, $stateParams, $userData) {
            $http({
                method: 'GET',
                url: config.api.host + 'api/' + config.api.version + '/stuff/' + $stateParams.id
            }).then(function(data) {
                $scope.listItem = data.data[0];
                console.log($scope.listItem);
                $scope.marker = {};
                $scope.infowindow = {};
                $scope.marker = new google.maps.Marker({
                    position: {
                        lat: $scope.listItem.lat,
                        lng : $scope.listItem.lng
                    },
                    icon: '/img/circle.png',
                    map: $scope.map
                });
                var contentString = [
                    '<div style="width: 180px; height: 300px;">',
                    '   <div style="font-size: 16px">'+$scope.listItem.title+'</div>',
                    '   <div style="background-image: url('+$scope.listItem.img+');position:absolute;width: 200px; height: 270px;top:25px"></div>',
                    '</div>'
                ].join('\n');
                $scope.infowindow = new google.maps.InfoWindow({
                    content: contentString
                });
                $scope.marker.addListener('click', function() {
                    $scope.infowindow.open($scope.map, this);
                });
            });
            $scope.$on("$destroy", function() {
                $('#getstuff a').removeClass('selected');
                $scope.infowindow.close();
                $scope.marker.setMap(null);
            });
        }
    })
    .state('menu.give', {
        url: '/givestuff',
        templateUrl: '/partials/home/partial-home-givestuff' + config.ext,
        controller: function($scope) {
            $('#givestuff a').addClass('selected');
            $scope.$on("$destroy", function() {
                $('#givestuff a').removeClass('selected');
            });
        }
    })
    .state('menu.my', {
        url: '/mystuff',
        templateUrl: '/partials/home/partial-home-mystuff' + config.ext,
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

var working = false;

function openModalWindow(windowName) {
    if(!working) {
        working = true;
        requestAnimationFrame(function() {
            $('#modal-windows').addClass('reveal-modals');
            requestAnimationFrame(function() {
                $('#modal-window-bg').addClass('reveal-modal-window-bg');
                $('#'+windowName+'.modal-window').addClass('reveal-modal-window');
                requestAnimationFrame(function() {
                    working = false;
                });
            });
        });
    }
}
function closeModalWindow(windowName) {
    if(!working) {
        working = true;
        requestAnimationFrame(function() {
            $('#modal-window-bg').removeClass('reveal-modal-window-bg');
            $('#'+windowName+'.modal-window').removeClass('reveal-modal-window');
            setTimeout(function() {
                requestAnimationFrame(function() {
                    $('#modal-windows').removeClass('reveal-modals');
                    requestAnimationFrame(function() {
                        working = false;
                    });
                });
            }, 250);
        });
    }
}

function addMarker($scope) {

}

function updateMarkers($scope) {

}

function clearMarkers($scope) {

}


function setDefaultConfig() {
    var isIonic = $('html').hasClass('ionic');
    var isDev = $('html').hasClass('dev') || $('html').hasClass('test');
    var modules = ['ui.router', 'ngAnimate'];
    if(isIonic) modules.push('ionic');
    return {
        ionic : {
            isIonic : isIonic
        },
        modules : modules,
        ext : isIonic?'.html':'',
        api : {
            host : isIonic?
            isDev?
            '//localhost/':
            /*'//www.stuffmapper.com/'*/'//localhost:3000/':
            '/',
            version : 'v1'
        },
        html5 : !!window.history && !!window.history.pushState
    };
}
