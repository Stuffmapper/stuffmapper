stuffMapp.controller('settingsController', ['$scope', '$http', 'authenticated', '$state', SettingsController]);

function SettingsController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	var authenticated = arguments[2];
	if((authenticated.res && !authenticated.res.user) || authenticated.err) return $state.go('stuff.get');

	$http.get(config.api.host + '/api/v' + config.api.version + '/account/info').success(function(data){
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

	// $scope.showSuccess = function() {
	// 	$('.edit-profile button:first-of-type').click(function () {
  //   	// $('.success').css({});
	// 		requestAnimationFrame(function(){
	//
	// 		})
	// 	});
	// };

	$scope.edit = function(users) {
		$scope.orig = angular.copy(users);
		users.editing = true;
	};

	$scope.cancelEdit = function(users) {
		angular.copy($scope.orig, users);
		users.editing = false;
	};
}
