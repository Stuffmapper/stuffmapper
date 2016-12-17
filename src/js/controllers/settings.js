stuffMapp.controller('settingsController', ['$scope', '$http', 'authenticator', '$state', SettingsController]);

function SettingsController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	var authenticator = arguments[2];
	var $state = arguments[3];
	$http.post(config.api.host + '/api/v' + config.api.version + '/account/status?nocache='+new Date().getTime()).success(function(data){
		if(!data.res.user) {
			$state.go('stuff.get', {'#':'signin'});
			$scope.openModal('modal');
		} else {
			$http.get(config.api.host + '/api/v' + config.api.version + '/account/info').success(function(data){
				if(data.err) return console.log(data.err);
				$scope.users = data.res;
				if($scope.users.google_id) {
					$('#sm-settings-google').css({'pointer-events':'none','opacity':'0.7'});
					$('#sm-settings-google span').text('Connected to Google');
				}
				if($scope.users.facebook_id) {
					$('#sm-settings-facebook').css({'pointer-events':'none','opacity':'0.7'});
					$('#sm-settings-facebook span').text('Connected to Facebook');
				}
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
					//console.log(data);
					$u.toast('Changes saved');
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
	});
}
