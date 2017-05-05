var mainControllerArgs = ['$scope', '$http', '$timeout', '$userData', '$state', '$location', '$rootScope','$window','$stuffTabs'];
if (config.ionic.isIonic) {
	// mainControllerArgs.push('$cordovaOauth');
	mainControllerArgs.push('$ionicPlatform');
	// mainControllerArgs.push('$cordovaPush');
}
mainControllerArgs.push(MainController);
stuffMapp.controller('MainController', mainControllerArgs);
function MainController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	var $timeout = arguments[2];
	var $userData = arguments[3];
	var $state = arguments[4];
	var $location = arguments[5];
	var $rootScope = arguments[6];
	var $window = arguments[7];
	// var $stuffTabs = arguments[8];
	// var $cordovaOauth = (typeof arguments[8] !== 'function') ? arguments[9] : undefined;
	var $ionicPlatform = (typeof arguments[8] !== 'function') ? arguments[10] : undefined;
	// var $cordovaPush = (typeof arguments[10] !== 'function') ? arguments[12] : undefined;
	$scope.delaySignIn = delaySignIn;

	setTimeout(function() {
		$('#tab-container .stuff-tabs li a').removeClass('selected');
		$('#tab-container .stuff-tabs .'+((window.location.pathname.indexOf('stuff/get') > -1)?'get':((window.location.pathname.indexOf('stuff/my') > -1)?'my':((window.location.pathname.indexOf('stuff/give') > -1)?'give':'no')))+'-stuff-tab a').addClass('selected');
	},250);
	$rootScope.$on('$locationChangeSuccess', function() {
		$('#tab-container .stuff-tabs li a').removeClass('selected');
		// console.log(((window.location.pathname.indexOf('stuff/get') > -1)?'get':((window.location.pathname.indexOf('stuff/my') > -1)?'my':((window.location.pathname.indexOf('stuff/give') > -1)?'give':'no'))));
		$('#tab-container .stuff-tabs .'+((window.location.pathname.indexOf('stuff/get') > -1)?'get':((window.location.pathname.indexOf('stuff/my') > -1)?'my':((window.location.pathname.indexOf('stuff/give') > -1)?'give':'no')))+'-stuff-tab a').addClass('selected');
	});
	$scope.openModal = function(modal) {
		if(modal==='modal') {
			if (config.html5) location.hash = 'signin';
			$('#sign-in-error-warning-container, #sign-up-error-warning-container').children().remove();
			$u.modal.open('sign-in-up-modal', function() {
				window.location.hash = '';
			});
		}
		else if(modal==='email-verification-modal') {
			$u.modal.open('email-verification-modal');
			requestAnimationFrame(function() {
				requestAnimationFrame(function() {
					setTimeout(function() {
						$('#email-verification-step i').removeClass('sm-hidden');
					}, 500);
				});
			});
		}
	};
	$scope.openPasswordResetModal = function(token) {
		$.post(config.api.host + '/api/v' + config.api.version + '/account/password/verify', {
			passwordResetToken: token
		}, function(data) {
			if (data.err) {
				$u.modal.open('password-reset-modal-failure', function() {
					$('#password-reset-confirmation-failure-step i').removeClass('sm-hidden');
				});
			}
			else $u.modal.open('password-reset-modal');
		});
	};
	$scope.resetPassword = function() {
		var token = $scope.queries.password_reset_token;
		var password1 = $('#sm-reset-password1').val();
		var password2 = $('#sm-reset-password2').val();
		var passRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,32}/;
		if(password1 && password2 && password1 === password2 && passRe.test(password1)) {
			$.post(config.api.host + '/api/v' + config.api.version + '/account/password/reset', {
				passwordResetToken: token,
				password: password1
			}, function(data) {
				$u.toast('Password Successfully Reset!');
				$u.modal.close('password-reset-modal');
				delaySignIn();
			});
		}
		else {
			$('#sm-reset-password1').css({border:'1px solid red'});
			$('#sm-reset-password2').css({border:'1px solid red'});
			var message = '';
			if(!password1 || !password2) message = 'please enter a new password';
			else if(password1!==password2) message = 'passwords do not match';
			else if(!passRe.test(password1)) message='password must be at least 8 characters long, no spaces, and contain each of the following: an uppercase letter, a lowercase letter, a number, and a symbol';
			$('#sm-reset-password-error-warning-container').html('<div class="sm-full-width sm-negative-warning">'+message+'</div>');
		}
	};
	$scope.openEmailVerificationModal = function(token) {
		$.post(config.api.host + '/api/v' + config.api.version + '/account/verify', {
			emailVerificationToken: token,
		}, function(data) {
			if (data.err) {
				$u.modal.open('email-verification-modal');
				$('#email-verification-step i').addClass('sm-negative-color');
				$('#email-verification-step i').addClass('fa-times-circle');
				$('#email-verification-step h2').text('Account Already Verified!');
				$('#email-verification-message').text('');
				$('#email-verification-button1').css({display:'none'});
			} else {
				$u.modal.open('email-verification-modal');
				$('#email-verification-step i').addClass('sm-positive-color');
				$('#email-verification-step i').addClass('fa-check-circle');
				$('#email-verification-step h2').text('Email Verified!');
				$('#email-verification-message').text('Email address successfully verified for '+data.res);
				$('#email-verification-button2').css({display:'none'});
			}
		});
	};
	$scope.queries = getSearchQueries();
	var visited = localStorage.getItem('visited');
	if(!visited && !$scope.queries.email_verification_token && !$scope.queries.password_reset_token) {
		// $('#lock-screen').css({
		// 	'pointer-events': 'all',
		// 	opacity: 1
		// });
		localStorage.setItem('visited', true);
		window.location.hash = 'signin';
		$('#swiper-container').css({display:'block'});
		var swiperAtEnd = false;
		var mySwiper = new Swiper ('.swiper-container', {
	    direction: 'horizontal',
	    loop: false,
	    pagination: '.swiper-pagination',
	    nextButton: '.swiper-button-next',
	    prevButton: '.swiper-button-prev',
			paginationClickable: true,
			onSlidePrevStart: function() {
				if(swiperAtEnd) {
					swiperAtEnd = false;
					$('#swiper-button-done').css({display:"none"});
				}
			},
			onReachBeginning: function() {
				$('#swiper-container').css({'background-color':'rgba(139, 195, 74, 1.0)'});
			},
			onReachEnd: function() {
				$('#swiper-container').css({'background-color':'rgba(71, 71, 71, 1.0)'});
				$('#swiper-button-done').css({display:"block"});
				swiperAtEnd = true;
			}
	  });
		$('#swiper-button-done, #swiper-button-skip').click(function() {
			$('#swiper-container').css({'opacity':0.001,'pointer-events':'none'});
		});
	}
	else $('#lock-screen').css({display:'none'});
	$scope.openLockScreen = function() {
		$('#lock-screen').css({
			'pointer-events': 'all',
			opacity: 1,
			display:''
		});
	};
	$scope.closeLockScreen = function() {
		$('#lock-screen').css({
			'pointer-events': 'none',
			opacity: 0.0001
		});
		setTimeout(function() {
			requestAnimationFrame(function() {
				$('#lock-screen').css({
					display:'none'
				});
			});
		}, 550);
	};
	if($scope.queries.email_verification_token) $scope.openEmailVerificationModal($scope.queries.email_verification_token);
	else if($scope.queries.password_reset_token) $scope.openPasswordResetModal($scope.queries.password_reset_token);
	if ($ionicPlatform) {
		$ionicPlatform.registerBackButtonAction(function(event) {
			if ($state.current.name !== 'stuff.get') {
				event.preventDefault();
				event.stopPropagation();
				navigator.app.backHistory();
			}
		}, 100);
	}
	$scope.counterFlipperHeader = new CounterFlipper('landfill-tracker-header', 0, 7);
	$scope.counterFlipperMenu = new CounterFlipper('landfill-tracker-menu', 0, 7);
	if(subdomain === 'www') initChatra();
	$http.post(config.api.host + '/api/v' + config.api.version + '/account/status').success(function(data) {
		$scope.toastCounter = 0;
		if(data.err) return console.log(data.err);
		if(data.res && data.res.user) {
			$('html').addClass('loggedIn');
			$userData.setUserId(data.res.user.id);
			$userData.setBraintreeToken(data.res.user.braintree_token);
			$userData.setUserName(data.res.user.uname);
			$userData.setLoggedIn(true);
		}
		if(data.res && data.res.messages) {
			setTimeout(function() {
				$('#tab-container .tab-message-badge').html(data.res.messages);
				$('#tab-container .tab-message-badge').css({display:'inline-block'});
			}, 1500);
		}
		var lt = parseInt(data.res.lt);
		var count = 0;
		for(var i = 0; i < 4; i++) {
			$scope.counterFlipperHeader.setCounter(Math.floor(Math.random() * ((lt/4)*i)) + 1);
			$scope.counterFlipperMenu.setCounter(Math.floor(Math.random() * ((lt/4)*i)) + 1);
		}
		$scope.counterFlipperHeader.setCounter(data.res.lt);
		$scope.counterFlipperMenu.setCounter(data.res.lt);
		// use sql stuff for mobile here
		initUserData(data);
		// console.log(window.location.pathname);
		// console.log(data.res);
		// console.log(data.res.user);
		if(window.location.pathname.indexOf('/login-steps') > -1 && data.res && data.res.user) {
			$state.go('stuff.get');
		}
	});
	function initChatra() {
		ChatraID = '5oMzBM7byxDdNPuMf';
		(function(d, w, c) {
			var n = d.getElementsByTagName('script')[0],
			s = d.createElement('script');
			w[c] = w[c] || function() {
				(w[c].q = w[c].q || []).push(arguments);
			};
			s.async = true;
			s.src = (d.location.protocol === 'https:' ? 'https:': 'http:') + '//call.chatra.io/chatra.js';
			n.parentNode.insertBefore(s, n);
		})(document, window, 'Chatra');
	}
	function initUserData(data) {
		if (data.res.user) {
			$userData.setUserId(data.res.user.id);
			resetSockets($scope, $state, data);
		} else {
			//if(config.ionic.isIonic) location.hash = 'signin';
		}
	}
	$scope.toggleSignInPassword = function() {
		if(!isPasswordVisible) {
			$('#login-setup-show-password').removeClass('fa-eye').addClass('fa-eye-slash');
			$('#login-setup-input-password').attr('type', 'text');
		} else {
			$('#login-setup-show-password').addClass('fa-eye').removeClass('fa-eye-slash');
			$('#login-setup-input-password').attr('type', 'password');
		}
		isPasswordVisible = !isPasswordVisible;
	};
	$scope.popUpOpen = false;
	$scope.hideModal = function(modalToClose) {
		if (config.html5) location.hash = '';
		else console.log('this should close popups... not sure what to do without html5 :<');
		if ($scope.popUpTimeout) clearTimeout($scope.popUpTimeout);
		// $('#tab-container .stuff-tabs li a').removeClass('selected');
		// $('#tab-container .stuff-tabs .get-stuff-tab a').addClass('selected');
		$scope.popUpOpen = false;
		$u.modal.close(modalToClose);
		$scope.popUpTimeout = setTimeout(function() {
			$('#sign-in-step').css({'transform':''});
			$('#sign-in-step .sm-modal-title').css({'transform':''});
			$('#sign-in-step .sm-modal-title').removeClass('visible');
			$('#sign-up-step').addClass('hidden-modal').removeClass('active');
			$('#confirmation-step').addClass('hidden-modal').removeClass('active');
			$('#confirmation-step-icon').addClass('sm-hidden');
			$('#sign-in-error-warning-container, #sign-up-error-warning-container').children().remove();
			$('#sign-up-forgot-password-step').addClass('hidden-modal').removeClass('active');
			$('#sign-up-forgot-password-step').css({'transform': ''});
			$('#sign-up-forgot-password-step .sm-modal-title').css({'transform': ''});
			$('#sign-up-forgot-password-success-step').css({'transform': ''});
			$('#sign-up-forgot-password-success-step .sm-modal-title').css({'transform': '',});
			$('#sign-up-forgot-password-step .sm-modal-title').removeClass('visible');
			$('#sign-up-forgot-password-success-step').addClass('hidden-modal');
			$('#password-confirmation-step-icon').addClass('sm-hidden');
		}, 550);
		resetAllInputsIn('#modal-windows');
	};
	$('.sm-sign-in-text-inputs').keydown(function(e) {
		if(e.keyCode === 13) $('#sign-in-sign-in-button').click();
	});
	$('.sm-sign-up-text-inputs').keydown(function(e) {
		if(e.keyCode === 13) $('#sm-sign-up-button').click();
	});

	$('#sign-up-password-reset-email-input').keydown(function(e) {
		if(e.keyCode === 13) $('#sm-sign-up-reset-password-button1').click();
	});
	$('#sm-reset-password1, #sm-reset-password2').keydown(function(e) {
		if(e.keyCode === 13) $('#password-reset-button').click();
	});
	$('#sign-in-password-eye').click(function() {
		togglePasswordField('#sign-in-password-eye', '#sign-in-password');
	});

	$scope.googleOAuth = function() {
		fbq('trackCustom', 'GoogleSignIn');
		var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
		var dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;
		var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
		var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
		var left = ((width / 2) - (800 / 2)) + dualScreenLeft;
		var top = ((height / 2) - (600 / 2)) + dualScreenTop;
		var w = window.open(subdomain+'/api/v1/account/login/google', '_blank', 'location=no, scrollbars=yes, width=800, height=600, top=' + top + ', left=' + left);
		if(config.ionic.isIonic) {
			w.addEventListener('loadstart', function(event) {
				if (event.url.match('/redirect')) {
					w.close();
					getAccountStatus();
				}
			});
		}
		else {
			var interval = window.setInterval(function() {
				try {
					if (w === null || w.closed) {
						clearInterval(interval);
						getAccountStatus();
					}
				}
				catch (e){}
			}, 500);
		}
	};
	$scope.facebookOAuth = function() {
		fbq('trackCustom', 'FacebookSignIn');
		var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
		var dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;
		var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
		var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
		var left = ((width / 2) - (800 / 2)) + dualScreenLeft;
		var top = ((height / 2) - (600 / 2)) + dualScreenTop;
		var w = window.open(subdomain+'/api/v1/account/login/facebook', '_blank', 'location=no, scrollbars=yes, width=800, height=600, top=' + top + ', left=' + left);
		if(config.ionic.isIonic) {
			w.addEventListener('loadstart', function(event) {
				if (event.url.match('/redirect')) {
					w.close();
					getAccountStatus();
				}
			});
		}
		else {
			var interval = window.setInterval(function() {
				try {
					if (w === null || w.closed) {
						clearInterval(interval);
						getAccountStatus();
					}
				}
				catch (e){}
			}, 500);
		}
	};
	function getAccountStatus() {
		$http.post(config.api.host + '/api/v' + config.api.version + '/account/status').success(function(data){
			if (data.err || !data.res.user) {
				// $('#tab-container .stuff-tabs li a').removeClass('selected');
				// $('#tab-container .stuff-tabs .get-stuff-tab a').addClass('selected');
				return console.log(data.err);
			}
			location.hash = '';
			initUserData(data);
			$scope.hideModal('sign-in-up-modal');
			$('html').addClass('loggedIn');
			$userData.setUserId(data.res.user.id);
			$userData.setBraintreeToken(data.res.user.braintree_token);
			$userData.setUserName(data.res.user.uname);
			$userData.setLoggedIn(true);
			if(window.location.pathname.indexOf('/login-setup1') > -1) $scope.redirectState = 'stuff.get';
			if(!$scope.redirectState) $state.reload();
			else {
				$state.go($scope.redirectState);
				$scope.redirectState = '';
			}
			$u.toast('Welcome!');
			// 	if(config.ionic.isIonic) {
			// 		// $ionicPlatform.ready(function () {
			// 		var push = $cordovaPush.init({
			// 			android: {
			// 				senderID: "11148716793"
			// 			},
			// 			browser: {
			// 				pushServiceURL: 'http://push.api.phonegap.com/v1/push'
			// 			},
			// 			ios: {
			// 				alert: "true",
			// 				badge: "true",
			// 				sound: "true"
			// 			},
			// 			windows: {}
			// 		});
			//
			// 		push.on('registration', function(data) {
			// 			// data.registrationId
			// 			console.log(data);
			// 		});
			//
			// 		push.on('notification', function(data) {
			// 			// data.message,
			// 			// data.title,
			// 			// data.count,
			// 			// data.sound,
			// 			// data.image,
			// 			// data.additionalData
			// 			console.log(data);
			// 		});
			//
			// 		push.on('error', function(e) {
			// 			// e.message
			// 			console.log(e);
			// 		});
			// 		// $cordovaPush.register({
			// 		// 	badge: true,
			// 		// 	sound: true,
			// 		// 	alert: true
			// 		// }).then(function (result) {
			// 		// 	UserService.registerDevice({
			// 		// 		user: user,
			// 		// 		token: result
			// 		// 	}).then(function () {
			// 		// 		console.log('did it.');
			// 		// 		//$ionicLoading.hide();
			// 		// 	}, function (err) {
			// 		// 		console.log(err);
			// 		// 	});
			// 		// }, function (err) {
			// 		// 	console.log('reg device error', err);
			// 		// });
			// 		// });
			// 	}
		});
	}
	// TODO:  Implement url listener.  if the url changes, see if it is has stuff/my, stuff/get, or stuff/give
	function windowLocationPathnameListener() {
		// $stuffTabs.init($scope, '#tab-container .stuff-tabs .give-stuff-tab a');
		$('#tab-container .stuff-tabs').children().each(function(i, e) {
			if(window.location.pathname.split('/')[1] === $(e.className).split(' ')[0].split('-')[0]) $(e).children('a').addClass('selected');
			else $(e).children('a').removeClass('selected');
		});
	}
	if (config.html5) {
		var value = location.hash;
		if (value) {
			if ($scope.popUpTimeout) clearTimeout($scope.popUpTimeout);
			var hash = value.split('#').pop();
			if (hash === 'signin') $scope.openModal('modal');//$u.modal.open('sign-in-up-modal', function() {/*$('#tab-container .stuff-tabs li a').removeClass('selected');$('#tab-container .stuff-tabs .get-stuff-tab a').addClass('selected');*/});//$scope.openModal('modal');
		} else removeHash();
		$(window).on('hashchange', function(event) {
			var value = location.hash;
			if (value) {
				if ($scope.popUpTimeout) clearTimeout($scope.popUpTimeout);
				var hash = value.split('#').pop();
				if (hash === 'signin') $scope.openModal('modal');//$u.modal.open('sign-in-up-modal', function() {/*location.hash='';$('#tab-container .stuff-tabs li a').removeClass('selected');$('#tab-container .stuff-tabs .get-stuff-tab a').addClass('selected');*/});//$scope.openModal('modal');
			} else if ($scope.popUpOpen) {
				// $u.modal.close('sign-in-up-modal');
				$scope.hideModal('sign-in-up-modal');
			}
			if (!value) removeHash();
		});
	}
	function removeHash() {
		var loc = window.location;
		if ('pushState' in history) history.pushState('', document.title, loc.pathname + loc.search);
		else loc.hash = '';
	}
	var popupOpen = false;
	$scope.showPopup = function() {
		if (!popupOpen) {
			popupOpen = true;
			requestAnimationFrame(function() {
				$('#profile-popup').removeClass('hidden-popup');
				requestAnimationFrame(function() {
					$('body').one('click', function() {
						popupOpen = false;
						$('#profile-popup').addClass('hidden-popup');
					});
				});
			});
		}
	};
	$scope.userButton = $scope.showPopup;
	$scope.aboutUs = function() {$state.go('about');};
	var passwordVisible = false;
	$scope.toggleVisibility = function() {
		if(!passwordVisible) {
			$('#toggle-password-visibility').removeClass('fa-eye').addClass('fa-eye-slash');
			$('#sign-up-password1').attr('type', 'text');
		}
		else {
			$('#toggle-password-visibility').addClass('fa-eye').removeClass('fa-eye-slash');
			$('#sign-up-password1').attr('type', 'password');
		}
		passwordVisible = !passwordVisible;
	};
	$scope.login = function() {
		$http.post(config.api.host + '/api/v' + config.api.version + '/account/login', {
			username: $('#sign-in-email').val(),
			password: $('#sign-in-password').val()
		}, {
			headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},transformRequest: function(data) {return $.param(data);}
		}).success(function(data) {
			if (data.err || !data.res.isValid) return $('#sign-in-error-warning-container').html('<div class="sm-full-width sm-negative-warning">'+data.err+'</div>');
			location.hash = '';
			resetAllInputsIn('#modal-windows');
			$('html').addClass('loggedIn');
			$userData.setUserId(data.res.user.id);
			$userData.setBraintreeToken(data.res.user.braintree_token);
			$userData.setUserName(data.res.user.uname);
			$userData.setLoggedIn(true);
			$scope.hideModal('sign-in-up-modal');
			location.hash = '';
			if(!$scope.redirectState) $state.reload();
			else {
				$state.go($scope.redirectState);
				$scope.redirectState = '';
			}
			$u.toast('Welcome!');
			if(config.ionic.isIonic) {
				$ionicPlatform.ready(function () {
					// $cordovaPush.register({
					// 	badge: true,
					// 	sound: true,
					// 	alert: true
					// }).then(function (result) {
					// 	UserService.registerDevice({
					// 		user: user,
					// 		token: result
					// 	}).then(function () {
					// 		$ionicLoading.hide();
					// 		$state.go('tab.news');
					// 	}, function (err) {
					// 		console.log(err);
					// 	});
					// }, function (err) {
					// 	console.log('reg device error', err);
					// });
				});
			}
		});
	};
	$scope.logout = function() {
		$http.post(config.api.host + '/api/v' + config.api.version + '/account/logout')
		.success(function(data) {
			$('html').removeClass('loggedIn');
			$userData.setLoggedIn(false);
			if (/\/stuff\/(give|mine|mine\/*|settings|messages|messages\/*|watchlist|)/.test($location.$$path)) {
				$state.go('stuff.get');
				$state.reload();
				$u.toast('You\'ve been logged out. See you next time, <i>'+$userData.getUserName()+'</i>!');
				setTimeout(function() {
					$('#tab-container .stuff-tabs li a').removeClass('selected');
					$('#tab-container .stuff-tabs .'+(window.location.pathname.indexOf('/stuff/get') >= 0 ?'get':(window.location.pathname.indexOf('/stuff/my') >= 0 ?'my':(window.location.pathname.indexOf('/stuff/give') >= 0 ?'give':'no')))+'-stuff-tab a').addClass('selected');
				},250);
			}
		});
	};
	$scope.secureState = function(state) {
		if ($userData.isLoggedIn()) $state.go(state);
		else {
			// if(/my/.test(state)) {
			// 	// $('#tab-container .stuff-tabs li a').removeClass('selected');
			// 	// $('#tab-container .stuff-tabs .my-stuff-tab a').addClass('selected');
			// }
			// else if(/give/.test(state)) {
			// 	// $('#tab-container .stuff-tabs li a').removeClass('selected');
			// 	// $('#tab-container .stuff-tabs .give-stuff-tab a').addClass('selected');
			// }
			$scope.redirectState = state;
			location.hash = 'signin';
		}
	};
	$scope.forgotPassword = function() {
		$('#sign-in-step').css({
			'transform': 'translate3d(-100%, 0%, 0)'
		});
		$('#sign-in-step .sm-modal-title').css({
			'transform': 'translate3d(65%, 0%, 0) scale3d(0.75, 0.75, 1)'
		});
		$('#sign-in-step .sm-modal-title').addClass('visible');
		$('#sign-up-forgot-password-step').removeClass('hidden-modal').addClass('active');
	};
	$scope.passwordConfirmationStep = function() {
		var emailInput = $('#sign-up-password-reset-email-input').val();
		var emailRe = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
		var valid = true;
		var message = '';
		if(!emailInput || !emailRe.test(emailInput)) {
			valid = false;
			$('#sign-up-password-reset-email-input').css({border:'1px solid red'});
			message = 'invalid email address';
			if (data.err || !data.res.isValid) return $('#sm-password-confirmation-error-warning-container').html('<div class="sm-full-width sm-negative-warning">'+data.err+'</div>');
		}
		if(!valid) return $('#sign-up-password-reset-errors').text('invalid email address');
		else {
			$.post(config.api.host + '/api/v' + config.api.version + '/account/password/token', {
				email: emailInput
			}, function(data) {
				if(data.err) return console.log(err);
				$('#sign-up-forgot-password-step').css({
					'transform': 'translate3d(-100%, 0%, 0)'
				});
				$('#sign-up-forgot-password-step .sm-modal-title').css({
					'transform': 'translate3d(-100%, 0%, 0)',
				});
				$('#sign-up-forgot-password-success-step').css({
					'transform': 'translate3d(0%, 0%, 0)'
				});
				$('#sign-up-forgot-password-success-step .sm-modal-title').css({
					'transform': 'translate3d(0%, 0%, 0)',
				});
				$('#sign-up-forgot-password-step .sm-modal-title').addClass('visible');
				$('#sign-up-forgot-password-success-step').removeClass('hidden-modal');
				$('#sign-up-forgot-password-step').addClass('hidden-modal').removeClass('active');
				setTimeout(function() {
					$('#password-confirmation-step-icon').removeClass('sm-hidden');
				}, 500);
			});
		}
	};
	$scope.signUpStep = function() {
		$('#sign-in-step').css({
			'transform': 'translate3d(-100%, 0%, 0)'
		});
		$('#sign-in-step .sm-modal-title').css({
			'transform': 'translate3d(65%, 0%, 0) scale3d(0.75, 0.75, 1)'
		});
		$('#sign-in-step .sm-modal-title').addClass('visible');
		$('#sign-up-step').removeClass('hidden-modal').addClass('active');
	};
	$scope.signUpConfirmationStep = function() {
		$('#sign-up-step').css({
			'transform': 'translate3d(-100%, 0%, 0)'
		});
		$('#sign-in-step .sm-modal-title').css({
			'transform': 'translate3d(0%, 0%, 0) scale3d(0.75, 0.75, 1)'
		});
		$('#confirmation-step').removeClass('hidden-modal');
		$('#sign-up-step').addClass('hidden-modal').removeClass('active');
		setTimeout(function() {
			$('#confirmation-step-icon').removeClass('sm-hidden');
		}, 500);
	};
	$scope.signUpBack = function() {
		$('#sign-in-error-warning-container, #sign-up-error-warning-container').children().remove();
		$('#sign-in-step').css({'transform':''});
		$('#sign-in-step .sm-modal-title').css({'transform':''});
		$('#sign-in-step .sm-modal-title').removeClass('visible');
		$('#sign-up-step').addClass('hidden-modal').removeClass('active');
		$('#sign-up-step').css({'transform':''});
		$('#confirmation-step').addClass('hidden-modal').removeClass('active');
		$('#confirmation-step-icon').addClass('sm-hidden');
		$('#sign-up-forgot-password-step').addClass('hidden-modal').removeClass('active');
		$('#sign-up-forgot-password-step').css({
			'transform': ''
		});
		$('#sign-up-forgot-password-step .sm-modal-title').css({
			'transform': ''
		});
		signingUp = false;
	};
	var signingUp = false;
	var emailRe = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
	var passRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,32}/;
	$scope.signUp = function() {
		fbq('trackCustom', 'SignedUp');
		if(!signingUp) {
			$('#sign-in-error-warning-container, #sign-up-error-warning-container').children().remove();
			$('#sm-sign-up-button').attr('disabled', '');
			var valid = true;
			var message = '';
			var fd = {
				email: $('#sign-up-email').val().toLowerCase(),
				password: $('#sign-up-password1').val(),
				fname: $('#sign-up-fname').val(),
				lname: $('#sign-up-lname').val()
			};
			$('#sign-up-email, #sign-up-password1, #sign-up-fname, #sign-up-lname').css({border:''});
			if(!fd.lname) {valid=false;$('#sign-up-lname').css({border:'1px solid red'});message='please insert a last name';}
			if(!fd.fname) {valid=false;$('#sign-up-fname').css({border:'1px solid red'});message='please insert a first name';}
			if(!fd.password || !passRe.test(fd.password)) {valid=false;$('#sign-up-password1').css({border:'1px solid red'});message='password must be at least 8 characters long, no spaces, and contain each of the following: an uppercase letter, a lowercase letter, a number, and a symbol';}
			if(!fd.email || !emailRe.test(fd.email)) {valid=false;$('#sign-up-email').css({border:'1px solid red'});message='invalid email address';}

			if(!valid) {
				signingUp = false;
				$('#sm-sign-up-button').removeAttr('disabled');
				//$('#sign-up-step-message').text(message).css({'opacity':1});
				$('#sign-up-error-warning-container').html('<div class="sm-full-width sm-negative-warning">'+message+'</div>');
			}
			else {
				$http.post(config.api.host + '/api/v' + config.api.version + '/account/register', fd,
				{headers:{'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},transformRequest:function(data){return $.param(data);}})
				.success(function(data) {
					$('#sm-sign-up-button').removeAttr('disabled');
					if (data.err) return $('#sign-up-error-warning-container').html('<div class="sm-full-width sm-negative-warning">'+data.err+'</div>');
					resetAllInputsIn('#modal-windows');
					$scope.signUpConfirmationStep();
				});
			}
		}
	};
	$scope.resetModal = function() {
		$('#sign-in-error-warning-container, #sign-up-error-warning-container').children().remove();
		$('#sign-in-step').css({
			'transform': ''
		});
		$('#sign-in-step .sm-modal-title').css({
			'transform': ''
		});
		$('#sign-in-step .sm-modal-title').removeClass('visible');
		$('#sign-up-step').addClass('hidden-modal').removeClass('active');
		$('#confirmation-step').addClass('hidden-modal').removeClass('active');
		$('#confirmation-step-icon').addClass('sm-hidden');
		$('#sign-up-forgot-password-step').css({
			'transform':''
		}).addClass('hidden-modal');
		$('#confirmation-step').css({
			'transform':''
		}).addClass('hidden-modal');
		$('#sign-up-step .sm-modal-title').css({
			'transform': ''
		});
		$('#sign-up-forgot-password-step .sm-modal-title').css({
			'transform': ''
		});
		$('#sign-up-forgot-password-step .sm-modal-title').removeClass('visible');
		$('#confirmation-step').addClass('hidden-modal');
		$('#sign-up-forgot-password-step').addClass('hidden-modal').removeClass('active');
		$('#password-confirmation-step-icon').removeClass('visible').addClass('sm-hidden');
	};
	$scope.toggleSideMenu = function() {
		$('#side-menu, #side-menu-background').toggleClass('sm-hidden');
	};

}

function onResize() {
	var sideMenuHeight = 0;
	$('.side-menu-item').each(function(i,e){
		sideMenuHeight += $(e).outerHeight();
	});
	if(sideMenuHeight > ($(document).height() - $('.side-menu-footer').height() - $('.side-menu-header').height())) $('.side-menu-footer').css({'position':'relative'});
	else $('.side-menu-footer').css({'position':'absolute'});
}

$(document).ready(onResize);
$(window).on('resize', onResize);

function resetAllInputsIn(parent) {
	$(parent+' input[type=text], ' + parent + ' input[type=password],' + parent + ' textarea').each(function(i,e){
		$(e).val('');
	});
}

function getSearchQueries() {
	var searchQuery = {};
	var urlSearch = window.location.search;
	urlSearch.substring(1, urlSearch.length).split('&').forEach(function(e, i) {
		var query = e.split('=');
		searchQuery[query[0]]=query[1];
	});
	return searchQuery;
}

function delaySignIn() {
	setTimeout(function(){
		location.hash = 'signin';
	},550);
}

var smalerts = [];
var smalerting = false;
function SMAlert(title, message, button, time, callback) {
	smalerts.push({
		title: title,
		message: message,
		button: button,
		time: time,
		cb: callback
	});
	if(!smalerting) {
		smalerting = true;
		runSMAlert(smalerts.shift(), smalerts);
	}
}

var runSMAlert;
runSMAlert = function(alert, alerts) {
	$('#smalert-container').html([
		'<div class="message-title sm-full-width" style="font-size:16px;">'+alert.title+'</div>',
		'<div class="message-body sm-full-width" style="font-size:12px;">'+alert.message+'</div>',
		'<div id="tmp-message-button" class="sm-full-width message-button sm-button sm-button-default sm-button-ghost sm-button-ghost-solid sm-text-m">'+alert.button+'</div>'
	].join('\n'));
	$('#smalert-container').removeClass('sm-hidden');
	requestAnimationFrame(function() {
		$('#tmp-message-button').one('click', alert.cb);
	});
	alertTimeout = setTimeout(function() {
		$('#tmp-message-button').off('click', alert.cb);
		$('#smalert-container').addClass('sm-hidden');
		setTimeout(function() {
			callbackFn = null;
			$('#smalert-container').children().remove();
			if(alerts.length !== 0) runSMAlert(alerts.shift(), alerts);
			else smalerting = false;
		}, 250);
	}, alert.time);
};

function resetSockets($scope, $state, data) {
	if($scope.socket) $scope.socket.disconnect();
	$scope.socket = io(subdomain);
	$scope.socket.on((data.res.user.id), function(data) {
		console.log(data);
		if(data.messages && window.location.pathname.indexOf('/items/'+data.messages.conversation+'/messages') <= -1) {
			SMAlert('New Message for <em>'+data.messages.title+'</em>!', data.messages.message, 'Go to Message', 5000, function() {
				$state.go('stuff.my.items.item.conversation', {id: data.messages.conversation});
			});
		}
		else if(data.undibsd) {
			if(window.location.pathname.indexOf('/items/'+data.undibsd) >= -1) {
				$state.reload();
				setTimeout(function() {
					$u.toast('Dibs lost. Failed to message lister within 15 minutes after Dibsing item.');
				});
			}
		}
		if(data.messages) {
			$('#tab-message-badge').html(data.messages.unread);
			var lPath = location.pathname.split('/');
			lPath.shift();
			var out = document.getElementById('conversation-messages');
			if (out && lPath[0] === 'stuff' && lPath[1] === 'my' && lPath[2] === 'items' && parseInt(lPath[3]) === parseInt(data.messages.conversation) && lPath[4] === 'messages' && lPath.length === 5) {
				var isScrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;
				$('#conversation-messages').append([
					'<li class="conversation-message-container" ng-repeat="message in conversation | reverse"><div class="fa fa-user user-icon-message"></div><div class="conversation-message conversation-in-message">',
					data.messages.message,
					'</div></li>'
				].join(''));
				if (isScrolledToBottom) $(out).animate({ scrollTop: out.scrollHeight - out.clientHeight }, 250);
			}
		}
	});
}
function togglePasswordField(button, inputField) {
	$(button).toggleClass('fa-eye').toggleClass('fa-eye-slash');
	if($(inputField).attr('type') === 'password') $(inputField).attr('type', 'text');
	else $(inputField).attr('type', 'password');
}
function resetPasswordField(button, inputField) {
	$(button).addClass('fa-eye').removeClass('fa-eye-slash');
	$(inputField).attr('type', 'password');
}
