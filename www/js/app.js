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
        controller: GetStuffController
    })
    .state('menu.get.item', {
        url: '/:id',
        controller: GetItemController
    })
    .state('menu.give', {
        url: '/givestuff',
        templateUrl: '/partials/home/partial-home-givestuff' + config.ext,
        controller: GiveStuffController
    })
    .state('menu.my', {
        url: '/mystuff',
        templateUrl: '/partials/home/partial-home-mystuff' + config.ext,
        controller: MyStuffController
    })
    .state('menu.my.item', {
        url: '/:id',
        controller: MyStuffController
    })
    .state('about', {
    });
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
