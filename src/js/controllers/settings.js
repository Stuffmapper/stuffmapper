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

				var emailRe = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
				$('#setting-phone, #setting-uname, #setting-email').css({border:''});
				$('#setting-error-warning-container').html('');
				var valid = true;
				var message = '';
				var formSetting = {
					email: $('#setting-email').val().toLowerCase(),
					uname: $('#setting-uname').val(),
					phone: $('#setting-phone').val()
				};
				if(!formSetting.uname) {valid=false;$('#setting-uname').css({border:'1px solid red'});message='please insert a username name';}
				if(!formSetting.phone) {valid=false;$('#setting-phone').css({border:'1px solid red'});message='please insert a phone name';}
				if(!formSetting.email || !emailRe.test(formSetting.email)) {valid=false;$('#setting-email').css({border:'1px solid red'});message='invalid email address';}

				if(!valid) {
					$('#setting-error-warning-container').html('<div class="sm-full-width sm-negative-warning">'+message+'</div>');
					return;
				} else {
					if(!$scope.userSettings.uname.$valid){
						$('#setting-error-warning-container').html('<div class="sm-full-width sm-negative-warning">Uname is not valid</div>');
						return;
					}
					if(!$scope.userSettings.phone.$valid){
						$('#setting-error-warning-container').html('<div class="sm-full-width sm-negative-warning">Phone # is not valid</div>');
						return;
					}
					if(!$scope.userSettings.email.$valid){
						$('#setting-error-warning-container').html('<div class="sm-full-width sm-negative-warning">Email is not valid</div>');
						return;
					}
				}		
				$scope.users.phone_number = $scope.users.phone_number.replace(/-|\s+/g,"");
				$http.put('/api/v1/account/info', $scope.users,{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					},
					transformRequest: function(data){
						return $.param(data);
					}
				}).success(function(data) {
					//console.log(data);
					$u.toast('Changes have been saved.');
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
