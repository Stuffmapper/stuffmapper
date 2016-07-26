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
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			},
			transformRequest: function(data) {
				return $.param(data);
			}
		}).success(function(data) {
			if(!data.err) {
				$('html').addClass('loggedIn');
				$userData.setUserId(data.res.id);
				$userData.setBraintreeToken(data.res.braintree_token);
				$userData.setLoggedIn(true);
				return $state.go('stuff.get');
			}
		});
	};

	$scope.loginPageCancel = function() {
		history.back();
	};

	$scope.$on('$destroy', function() {
		$('#content').removeClass('fre');
	});
}
