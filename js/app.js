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
    $urlRouterProvider.otherwise('/stuff/get');
    $locationProvider.html5Mode(config.html5);
    $stateProvider
    .state('stuff', {
        url: '/stuff',
        templateUrl: 'templates/partial-home.html',
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
    .state('stuff.get', {
        url: '/get',
        templateUrl: 'templates/partial-home-getstuff.html',
        controller: GetStuffController
    })
    .state('stuff.get.item', { //  http://www.stuffmapper.com/stuff/get/232
        url: '/:id',
        controller: GetItemController
    })
    .state('stuff.give', { //  http://www.stuffmapper.com/stuff/give#step1
        url: '/give',
        templateUrl: 'templates/partial-home-givestuff.html',
        controller: GiveStuffController
    })
    .state('stuff.my', {
        url: '/my',
        templateUrl: 'templates/partial-home-mystuff.html',
        controller: MyStuffController
    })
    .state('stuff.my.item', {
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
