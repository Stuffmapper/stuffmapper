stuffMapp.controller('loginPageController', ['$scope', '$http', '$state', '$userData', LoginPageController]);
function LoginPageController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	var $state = arguments[2];
	var $userData = arguments[3];
	$('#content').addClass('fre');
	$scope.loginPagelogin = function() {
		$http.post(config.api.host + '/api/v' + config.api.version + '/account/login', {
			username: $('#login-page-login-uname').val(),
			password: $('#login-page-login-password').val()
		}, {
			headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},transformRequest: function(data) {return $.param(data);}
		}).success(function(data) {
			console.log(data);
			location.hash = '';
			resetAllInputsIn('#modal-windows');
			$('html').addClass('loggedIn');
			$userData.setUserId(data.res.user.id);
			$userData.setBraintreeToken(data.res.user.braintree_token);
			$userData.setUserName(data.res.user.uname);
			$userData.setLoggedIn(true);
			$scope.hideModal('sign-in-up-modal');
			location.hash = '';
			$state.go('stuff.get');
			$u.toast('Welcome!');
			// if(config.ionic.isIonic) {
				// $ionicPlatform.ready(function () {
					// $cordovaPush.register({
					// 	badge: true,
					// 	sound: true,
					// 	alert: true
					// }).then(function (result) {
					// 	UserService.registerDevice({
					// 		user: user,
					// 		token: result
					// 	}).then(function () {
					// 		$ionicLoading.hide();
					// 		$state.go('tab.news');
					// 	}, function (err) {
					// 		console.log(err);
					// 	});
					// }, function (err) {
					// 	console.log('reg device error', err);
					// });
				// });
			// }
		});
	};

	$scope.loginPageCancel = function() {
		history.back();
	};

	$scope.$on('$destroy', function() {
		$('#content').removeClass('fre');
	});
}
