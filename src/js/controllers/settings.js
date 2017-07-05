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
	$scope.emailPattern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
	$scope.errorHtml = '';

	$scope.checkValidPhone = function () {
		//$scope.errorHtml = '';
		if(!$('#setting-phone').intlTelInput("isValidNumber")) {
			$scope.settings.phone_number = null;
			$scope.settings.verified_phone = false;
			$('#setting-phone').css({border:'1px solid red'})
		} else {
			$scope.settings.phone_number = $('#setting-phone').intlTelInput("getNumber");
			$('#setting-phone').css({border:''});
			var user_org_phone = $userData.getPhone().trim();
			var user_chng_phone = $scope.settings.phone_number.trim();
			if(user_chng_phone === user_org_phone) {
				$scope.settings.verified_phone = $userData.getPhoneVerified();
			} else {
				$scope.settings.verified_phone = false;
			}
		}
	}
	
	$scope.notificationChange = function () {
		//$scope.errorHtml = '';
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
		//$scope.errorHtml = '';
		var emailRe = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
		if(!emailRe.test($('#setting-email').val())) {
			$scope.settings.verified_email = false;
		} else {
			if($scope.settings.email == $userData.getEmail()){
				$scope.settings.verified_phone = $userData.getPhoneVerified();
			} else {
				$scope.settings.verified_email = false;
			}
		}
	}

	$scope.keyUp = function () {
		var valid = true;
		var emailRe = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
		var email = $('#setting-email').val();
		var username = $('#setting-uname').val();
		var phone_number = $('#setting-phone').intlTelInput("getNumber");

		if (!username.length) {
			valid = false;
		}

		if(!$('#setting-phone').intlTelInput("isValidNumber")){
			valid = false;
		}

		if (email.length && !emailRe.test(email)) {
			valid = false;
		}

		// if(email != $userData.getEmail()){
		// 	valid = false;
		// }
        //
		// if(phone_number != $userData.getPhone()){
		// 	valid = false;
		// }

		if (!valid) {
			$('#setting-button').addClass('sm-button-ghost-light-solid');
		} else {
			$('#setting-button').removeClass('sm-button-ghost-light-solid');
		}
	};

/*
	$scope.userSettingPhoneVerificationCodeKeyUp = function () {
		$('#user-setting-phone-update-confirm-error-warning-container').children().remove();
		var valid = true;
		var message = '';
		var fd = {
			phone_token: $('#user-setting-phone-update-confirm-code').val(),
			phone_number: $userData.getPhone()
		};
		$('#user-setting-phone-update-confirm-code').css({border:''});
		if (!fd.phone_token) {
			valid = false;
			// $('#phone-update-confirm-code').css({border: '1px solid red'});
			message = 'please insert 6-digit confirmation code';
		}
		else if (fd.phone_token.length > 6) {
			valid = false;
			// $('#phone-update-confirm-code').css({border: '1px solid red'});
			message = 'please insert 6-digit confirmation code';
		} else if (fd.phone_token.length < 6) {
			valid = false;
			// $('#phone-update-confirm-code').css({border: '1px solid red'});
			message = 'please insert 6-digit confirmation code';
		}
		if (!valid) {
			$('#user-setting-phone-update-confirm-modal-button').addClass('sm-button-ghost-light-solid');
			//$('#user-setting-phone-update-confirm-error-warning-container').html('<div class="sm-full-width sm-negative-warning">'+message+'</div>');
		} else {
			$('#user-setting-phone-update-confirm-modal-button').removeClass('sm-button-ghost-light-solid');
		}
	};

	$scope.userSettingPhoneVerificationCode = function () {
		$('#user-setting-phone-update-confirm-error-warning-container').children().remove();
		$('#user-setting-phone-update-confirm-code').css({border:''});

		var userPhone = $userData.getPhone();

		var valid = true;
		var message = '';
		var fd = {
			phone_number: userPhone,
			phone_token: $('#user-setting-phone-update-confirm-code').val(),
		};

		if (!fd.phone_token) {
			valid = false;
			// $('#phone-update-confirm-code').css({border: '1px solid red'});
			message = 'please insert 6-digit confirmation code';
		}
		else if (fd.phone_token.length > 6) {
			valid = false;
			// $('#phone-update-confirm-code').css({border: '1px solid red'});
			message = 'please insert 6-digit confirmation code';
		} else if (fd.phone_token.length < 6) {
			valid = false;
			// $('#phone-update-confirm-code').css({border: '1px solid red'});
			message = 'please insert 6-digit confirmation code';
		}
		if (!valid) {
			$('#phone-update-confirm-modal-button').addClass('sm-button-ghost-light-solid');
			//$('#phone-update-modal-error-warning-container').html('<div class="sm-full-width sm-negative-warning">'+message+'</div>');
		} else {
			$('#phone-update-confirm-modal-button').removeClass('sm-button-ghost-light-solid');
			$http.post(config.api.host + '/api/v' + config.api.version + '/account/login/phone/update/code', fd,
				{
					headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
					transformRequest: function (data) {
						return $.param(data);
					}
				})
				.success(function (data) {
					if (data.err) return $('#user-setting-phone-update-confirm-error-warning-container').html('<div class="sm-full-width sm-negative-warning">' + data.err || data.message || "" + '</div>');
					else if (data.res.verified_phone) {
						$scope.settings.verified_phone = true;
						$u.toast('Phone # verified successfully!');
						$u.modal.close('user-setting-phone-update-modal');

					} else if (!data.res.verified_phone) {
						$('#phone-update-confirm-error-warning-container').html('<div class="sm-full-width sm-negative-warning">This phone # can not verified. Either confirm code or phone # is incorrect. Pleae try again.</div>');
					}
				});
		}
	}

*/


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
			$userData.setPhoneVerified(dataUser.res.user.verified_phone);
			$userData.setEmailVerified(dataUser.res.user.verified_email);

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
			$scope.updateUser = function() {
				$http.put('/api/v1/account/info', $scope.settings,{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					},
					transformRequest: function(data){
						return $.param(data);
					}
				}).success(function(data) {

					if(data.err){
						$scope.errorHtml = '<div class="sm-full-width sm-negative-warning">'+(data.message || 'Error occured' || '')+'</div>';
					} else {
						$userData.setUserName(data.res.uname);
						$userData.setEmail(data.res.email);
						$userData.setPhone(data.res.phone_number);
						if(!$scope.settings.verified_phone)
							$u.modal.open('user-setting-phone-update-modal');
						else{
							$u.toast('Changes have been saved.');
						}
					}
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
