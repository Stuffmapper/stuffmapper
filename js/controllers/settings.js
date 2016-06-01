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
  //     templateUrl: '/templates/partial-home-settings.html',
  //     transclude: true,
  //     scope: {
  //       formName: '@',
  //       userData: '=',
  //       save: '&'
  //     }
  //   };
  // });
}
