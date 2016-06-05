function SettingsController($scope, $http) {
	$('#mystuff a').addClass('selected');
	$scope.$on("$destroy", function() {
		$('#mystuff a').removeClass('selected');
	});
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
	$http.get('/api/v1/user').success(function(data){
		if(data.err) {
			console.log(data.err);
			return;
		}
		$scope.userData = data.res;
	});
	
	// Editing user data
	//
	// $scope.update = function(userData) {
	// userData.editing = false;
	// $http.put('/api/userData/' + userData._id, userData)
	// 	.then(function(res) {
	// 		console.log('this user has a been modified');
	// 	}, function(err) {
	// 		$scope.errors.push('could not get user: ' + userData.name);
	// 		console.log(err.data);
	// 	});
	// };
	//
	// $scope.edit = function(userData) {
	// $scope.orig = angular.copy(userData);
	// userData.editing = true;
	// };
	//
	// $scope.cancelEdit = function(userData) {
	// 		angular.copy($scope.orig, userData);
	// 		userData.editing = false;
	// };
	// directive('settingsDirective', function() {
	//   return {
	//     restrict: 'AC',
	//     replace: true,
	//     templateUrl: 'templates/partial-home-settings.html',
	//     transclude: true,
	//     scope: {
	//       formName: '@',
	//       userData: '=',
	//       save: '&'
	//     }
	//   };
	// });
}
