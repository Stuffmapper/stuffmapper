stuffMapp.controller('settingsController', ['$scope', '$http', 'authenticator', '$state', '$userData', SettingsController]);

function SettingsController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	var authenticator = arguments[2];
	var $state = arguments[3];
	var $userData = arguments[4];

	$("#setting-phone").intlTelInput({
		getNumberType: "MOBILE",
		utilsScript: $.fn.intlTelInput.loadUtils("js/lib/intl-tel-input/build/js/utils.js"),
		preferredCountries: ["us", "ca"]
	});
	$(".intl-tel-input").css({ 'width' : ''});
	$('.intl-tel-input .flag-container').css({"width": "300px"});
	$('.intl-tel-input .flag-container').css({"max-width": "300px"});


	// $scope.notificationTypes = [
	// 	{ val: '1', value: 'SMS only' },
	// 	{ val: '2', value: 'SMS and email' },
	// 	{ val: '3', value: 'Custom settings' }
	// ];
	// $scope.customNotificationTypes = [
	// 	{ val: '1', value: 'SMS only' },
	// 	{ val: '2', value: 'SMS and email' }
	// ];
	$scope.settings = { };
	$scope.settings.notification = 1;
	$scope.emailPattern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
	// $scope.settings = {
	// 	phone_valid : $('#setting-phone').intlTelInput("isValidNumber"),
	// 	phone_empty: ''
	// }
	
	$scope.hasValidPhone = function () {
		$('#setting-error-warning-container').html('');
		if($scope.settings.phone_number == '' || !$('#setting-phone').intlTelInput("isValidNumber")) {
			$scope.settings.phone_number = '';
			$('#setting-phone').css({border:'1px solid red'})
			$scope.settings.verified_phone = false;
			return true;
		} else {
			$scope.settings.phone_number = $('#setting-phone').intlTelInput("getNumber");
			$('#setting-phone').css({border:''});
			if($scope.settings.phone_number == $userData.getPhone()){
				$scope.settings.verified_phone = true;
			} else {
				$scope.settings.verified_phone = false;
			}
			return false;
		}
	}
	$scope.checkValidPhone = function () {
		$('#setting-error-warning-container').html('');
		if(!$('#setting-phone').intlTelInput("isValidNumber")) {
			$scope.settings.phone_number = '';
			$scope.settings.verified_phone = false;
			$('#setting-phone').css({border:'1px solid red'})
		} else {
			$scope.settings.phone_number = $('#setting-phone').intlTelInput("getNumber");
			$('#setting-phone').css({border:''});
			if($scope.settings.phone_number == $userData.getPhone()){
				console.log($userData.getPhone(), 2)
				$scope.settings.verified_phone = true;
			} else {
				$scope.settings.verified_phone = false;
			}
		}
	}
	
	$scope.notificationChange = function () {
		$('#setting-error-warning-container').html('');
		if($scope.settings.notification_id == '1' || $scope.settings.notification_id == '2' || $scope.settings.notification_id == '3'){
			$scope.settings.chat_message_notify = $scope.settings.notification_id;
			$scope.settings.item_listed_notify = $scope.settings.notification_id;
			$scope.settings.dibs_cancel_notify = $scope.settings.notification_id;
			$scope.settings.dibs_reject_notify = $scope.settings.notification_id;
			$scope.settings.dibs_expire_notify = $scope.settings.notification_id;
		} else {
			$scope.settings.chat_message_notify = '1';
			$scope.settings.item_listed_notify = '1';
			$scope.settings.dibs_cancel_notify = '1';
			$scope.settings.dibs_reject_notify = '1';
			$scope.settings.dibs_expire_notify = '1';
		}
	}

	$scope.checkValidEmail = function () {
		$('#setting-error-warning-container').html('');
		var emailRe = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
		if(!emailRe.test($('#setting-email').val())) {
			$scope.settings.verified_email = false;
		} else {
			if($scope.settings.email == $userData.getEmail()){
				$scope.settings.verified_email = true;
			} else {
				$scope.settings.verified_email = false;
			}
		}
	}



	$http.post(config.api.host + '/api/v' + config.api.version + '/account/status?nocache='+new Date().getTime()).success(function(dataUser){
		if(!dataUser.res.user) {
			$state.go('stuff.get', {'#':'signin'});
			$scope.openModal('modal');
		} else {
			$userData.setUserId(dataUser.res.user.id);
			$userData.setBraintreeToken(dataUser.res.user.braintree_token);
			$userData.setUserName(dataUser.res.user.uname);
			$userData.setLoggedIn(true);
			$userData.setEmail(dataUser.res.user.email);
			$userData.setPhone(dataUser.res.user.phone_number);
			$http.get(config.api.host + '/api/v' + config.api.version + '/account/info').success(function(data){
				if(data.err) return console.log(data.err);
				$scope.settings = data.res;
				$scope.settings.notification_id = data.res.notification_id.toString();
				$scope.settings.chat_message_notify = data.res.chat_message_notify.toString();
				$scope.settings.item_listed_notify = data.res.item_listed_notify.toString();
				$scope.settings.dibs_cancel_notify = data.res.dibs_cancel_notify.toString();
				$scope.settings.dibs_reject_notify = data.res.dibs_reject_notify.toString();
				$scope.settings.dibs_expire_notify = data.res.dibs_expire_notify.toString();

				if(data.res.phone_number){
					$("#setting-phone").intlTelInput("setNumber", data.res.phone_number);
					$scope.settings.phone_number = data.res.phone_number;
				}
				if($scope.settings.google_id) {
					$('#sm-settings-google').css({'pointer-events':'none','opacity':'0.7'});
					$('#sm-settings-google span').text('Connected to Google');
				}
				if($scope.settings.facebook_id) {
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
					phone: $('#setting-phone').intlTelInput("getNumber"),
					phone_valid: $('#setting-phone').intlTelInput("isValidNumber")
				};
				if(!formSetting.uname) {valid=false;$('#setting-uname').css({border:'1px solid red'});message='please insert a username name';}
				if(!formSetting.phone) {valid=false;$('#setting-phone').css({border:'1px solid red'});message='please insert a phone # using correct format: (###) ###-####';}
				if(!formSetting.phone_valid) {valid=false;$('#setting-phone').css({border:'1px solid red'});message='please insert a phone # using correct format: (###) ###-####';}
				if(!formSetting.email || !emailRe.test(formSetting.email)) {valid=false;$('#setting-email').css({border:'1px solid red'});message='invalid email address';}

				if(!valid) {
					$('#setting-error-warning-container').html('<div class="sm-full-width sm-negative-warning">'+message+'</div>');
					return;
				} else {
					if(!$scope.settings.uname.$valid){
						$('#setting-error-warning-container').html('<div class="sm-full-width sm-negative-warning">Uname is not valid</div>');
						return;
					}
					if(!$scope.settings.phone_number.$valid){
						$('#setting-error-warning-container').html('<div class="sm-full-width sm-negative-warning">Phone # is not valid</div>');
						return;
					}
					if(!$scope.settings.email.$valid){
						$('#setting-error-warning-container').html('<div class="sm-full-width sm-negative-warning">Email is not valid</div>');
						return;
					}
				}		
				$scope.settings.phone_number = $scope.settings.phone_number.replace(/-|\s+/g,"");
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

			$scope.updateUser = function() {
				/*
				var emailRe = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
				$('#setting-phone, #setting-uname, #setting-email').css({border:''});
				$('#setting-error-warning-container').html('');
				var valid = true;
				var message = '';
				var formSetting = {
					email: $('#setting-email').val().toLowerCase(),
					uname: $('#setting-uname').val(),
					phone: $('#setting-phone').intlTelInput("getNumber"),
					phone_valid: $('#setting-phone').intlTelInput("isValidNumber")
				};
				if(!formSetting.uname) {valid=false;$('#setting-uname').css({border:'1px solid red'});message='please insert a username name';}
				else if(!formSetting.phone) {valid=false;$('#setting-phone').css({border:'1px solid red'});message='please insert a phone # using correct format: (###) ###-####';}
				else if(!formSetting.phone_valid) {valid=false;$('#setting-phone').css({border:'1px solid red'});message='please insert a phone # using correct format: (###) ###-####';}
				else if(!formSetting.email || !emailRe.test(formSetting.email)) {valid=false;$('#setting-email').css({border:'1px solid red'});message='invalid email address';}

				if(!valid) {
					$('#setting-error-warning-container').html('<div class="sm-full-width sm-negative-warning">'+message+'</div>');
					return;
				} else {
					if(!$scope.settings.uname.$valid){
						$('#setting-error-warning-container').html('<div class="sm-full-width sm-negative-warning">Uname is not valid</div>');
						return;
					}
					if(!$scope.settings.phone_number.$valid){
						$('#setting-error-warning-container').html('<div class="sm-full-width sm-negative-warning">Phone # is not valid</div>');
						return;
					}
					if(!$scope.settings.email.$valid){
						$('#setting-error-warning-container').html('<div class="sm-full-width sm-negative-warning">Email is not valid</div>');
						return;
					}
				}
				*/
				//$scope.settings.phone_number = $scope.settings.phone_number.replace(/-|\s+/g,"");
				$http.put('/api/v1/account/info', $scope.settings,{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					},
					transformRequest: function(data){
						return $.param(data);
					}
				}).success(function(data) {
					if(data.err){
						$('#setting-error-warning-container').html('<div class="sm-full-width sm-negative-warning">'+data.message+'</div>');
						return;
					}
					console.log(data);
					$userData.setUserName($scope.settings.uname);
					$userData.setEmail($scope.settings.email);
					$userData.setPhone($scope.settings.phone_number);
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
