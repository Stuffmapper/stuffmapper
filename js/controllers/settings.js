function SettingsController($scope, $http) {
	$scope.userInfo = {};
	var testing = true;
	if(testing) {
		$scope.userData = {
			uname : 'username',
			fname : 'firstname',
			lname : 'lastname',
			email : 'email',
			phone : 'phone_number',
			address	:	'address',
			city : 'city',
			state	:	'state',
			zipcode	:	'zipcode',
			country	:	'country',
			googleConnected : false,
			facebookConnected : true
		};
	}
	$http.get('/api/v1/account/info').success(function(data){
		if(data.err) {
			console.log(data.err);
			return;
		}
		$scope.users = data.res;
	});

	// Editing user data

	$scope.update = function(users) {
	users.editing = false;
	$http.put('/api/v1/account/info/' + users._id).success(function(data) {
			console.log(data);
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
