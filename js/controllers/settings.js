stuffMapp.controller('settingsController', ['$scope', '$http', SettingsController]);

function SettingsController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	// $scope.userInfo = {};
	// var testing = true;
	// if(testing) {
	// 	$scope.userData = {
	// 		uname : 'username',
	// 		fname : 'firstname',
	// 		lname : 'lastname',
	// 		email : 'email',
	// 		phone : 'phone_number',
	// 		address	:	'address',
	// 		city : 'city',
	// 		state	:	'state',
	// 		zipcode	:	'zipcode',
	// 		country	:	'country',
	// 		googleConnected : false,
	// 		facebookConnected : true
	// 	};
	// }
	$http.get(config.api.host + 'api/' + config.api.version + '/account/info').success(function(data){
		if(data.err) {
			console.log(data.err);
			return;
		}
		$scope.users = data.res;
	});

	// Editing user data

	$scope.update = function(users) {

	$http.put('/api/v1/account/info', $scope.users,{
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
		},
		transformRequest: function(data){
			return $.param(data);
		}
	}).success(function(data) {

			console.log(data);
		});
	};
	$scope.showSuccess = function() {
		$('.edit-profile button:first-of-type').click(function () {
    $('.success').fadeIn(400).delay(1000).fadeOut(400).stop();
		});
	};

	$scope.edit = function(users) {
	$scope.orig = angular.copy(users);
	users.editing = true;
	};

	$scope.cancelEdit = function(users) {
			angular.copy($scope.orig, users);
			users.editing = false;
	};
}
