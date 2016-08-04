var mainControllerArgs = ['$scope', '$http', '$timeout', '$userData', '$state', '$location', '$rootScope','$window'];
if (config.ionic.isIonic) {
	mainControllerArgs.push('$cordovaOauth');
	mainControllerArgs.push('$ionicPlatform');
	mainControllerArgs.push('$cordovaSQLite');
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
	var $cordovaOauth = (typeof arguments[7] !== 'function') ? arguments[8] : undefined;
	var $ionicPlatform = (typeof arguments[8] !== 'function') ? arguments[9] : undefined;
	var $cordovaSQLite = (typeof arguments[9] !== 'function') ? arguments[10] : undefined;
	if ($ionicPlatform && $cordovaSQLite) {
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
	$scope.counterFlipperHeader.setCounter(1283746);
	$scope.counterFlipperHeader.setCounter(2738391);
	$scope.counterFlipperHeader.setCounter(3345678);
	$scope.counterFlipperHeader.setCounter(4765432);
	initChatra();
	$http.post(config.api.host + '/api/v' + config.api.version + '/account/status').success(function(data) {
		if(data.res.user) {
			$('html').addClass('loggedIn');
			$userData.setUserId(data.res.user.id);
			$userData.setBraintreeToken(data.res.user.braintree_token);
			$userData.setLoggedIn(true);
		}
		$scope.counterFlipperHeader.setCounter(data.res.lt);
		$scope.counterFlipperMenu.setCounter(data.res.lt);
		if ($cordovaSQLite) {
			$scope.initDB = function() {
				$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS user (id integer primary key, username text, email text, firstname text, lastname text, password text, verified boolean)').then(function(res) {
				}, function(err) {
				});
			};
			$scope.addTestUser = function() {
				$cordovaSQLite.execute(db, 'INSERT INTO user(id, username, email, firstname, lastname, password, verified) VALUES(1, \'RyanTheFarmer\', \'ryandafarmer@gmail.com\', \'Ryan\', \'Farmer\', \'Password1!\', \'true\')').then(function(res) {
				}, function(err) {
				});
			};
			$scope.setUser = function(email, password, verified) {
				$scope.deleteUser();
				$cordovaSQLite.execute(db, 'INSERT INTO user(id, email, password, verified) VALUES(1, $1, $2, $3)', [email, password, verified]).then(function(res) {
				}, function(err) {
				});
			};
			$scope.deleteUser = function() {
				$cordovaSQLite.execute(db, 'DELETE FROM user WHERE id = 1').then(function(res) {
				}, function(err) {
				});
			};
			$scope.getUserData = function() {
				$cordovaSQLite.execute(db, 'SELECT * FROM user').then(function(result) {
					if(result.rows.length > 0) {
						return result.rows.item(0);
					}
					else {
						console.log('no user data');
					}
				}, function(error) {
					console.log('err: ');
					console.log(error);
				});
			};
			$ionicPlatform.ready(function() {
				$scope.initDB();
				$scope.addTestUser();
				var userData = $scope.getUserData();
				if(!data.res) {

				} else {
					//$state.go('stuff.get');
				}
				// console.log(data);
				// console.log(userData);
			});
		}
		else initUserData(data);
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
			$scope.socket = io('http://localhost:3000');
			$scope.socket.on((data.res.user.id), function(data) {
				var lPath = $location.$$path.split('/');
				lPath.shift();
				var out = document.getElementById('conversation-messages');
				if (out && lPath[0] === 'stuff' && lPath[1] === 'my' && lPath[2] === 'messages' && lPath.length === 4 && parseInt(lPath[3]) === parseInt(data.messages.conversation)) {
					var isScrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;
					$('#conversation-messages').append([
						'<li class="conversation-message-container" ng-repeat="message in conversation | reverse"><div class="conversation-message conversation-in-message">',
						'	'+data.messages.message,
						'</div></li>'
					].join(''));
					if (isScrolledToBottom) {
						$(out).animate({
							scrollTop: out.scrollHeight - out.clientHeight
						}, 250);
					}
				}
			});
		} else {
			//if(config.ionic.isIonic) location.hash = 'signin';
		}
	}
	$scope.popUpOpen = false;
	$scope.showModal = function() {
		if (config.html5) location.hash = 'signin';
		$('.modal-window').removeClass('modal-window-open');
		requestAnimationFrame(function() {
			$scope.$apply(function() {
				if ($scope.popUpOpen === false) {
					$scope.popUpOpen = true;
					$('#modal-windows').addClass('modal-windows-open');
					$('.modal-container').css({
						'z-index': ''
					});
					requestAnimationFrame(function() {
						$('#modal-windows .modal-windows-bg').addClass('modal-windows-bg-open');
						$('#modal-windows .modal-container').addClass('modal-window-open');
						$('#modal-windows .modal-container').parent().css({
							'z-index': '3'
						});
					});
				} else {
					requestAnimationFrame(function() {
						$('#modal-windows-bg').addClass('modal-windows-bg-open');
						$('#sign').addClass('modal-window-open');
					});
				}
			});
		});
	};
	$scope.hideModal = function() {
		if (config.html5) location.hash = '';
		else console.log('this should close popups... not sure what to do without html5 :<');
		if ($scope.popUpTimeout) clearTimeout($scope.popUpTimeout);
		$scope.popUpOpen = false;
		$('#modal-windows .modal-windows-bg').removeClass('modal-windows-bg-open');
		$('#modal-windows .modal-container').removeClass('modal-window-open');
		$scope.popUpTimeout = $timeout(function() {
			$('#modal-windows').removeClass('modal-windows-open');
			$('#sign-in-step').css({
				'transform': ''
			});
			$('#sign-in-step .modal-title').css({
				'transform': ''
			});
			$('#sign-in-step .modal-title').removeClass('visible');
			$('#sign-up-step').addClass('hidden-modal').removeClass('active');
		}, 550);
	};
	$scope.googleOAuth = function() {
		var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
		var dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;
		var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
		var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
		var left = ((width / 2) - (800 / 2)) + dualScreenLeft;
		var top = ((height / 2) - (600 / 2)) + dualScreenTop;
		var w = window.open('http://localhost:3000/api/v1/account/login/google', '_blank', 'location=no, scrollbars=yes, width=800, height=600, top=' + top + ', left=' + left);
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
		var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
		var dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;
		var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
		var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
		var left = ((width / 2) - (800 / 2)) + dualScreenLeft;
		var top = ((height / 2) - (600 / 2)) + dualScreenTop;
		var w = window.open('http://localhost:3000/api/v1/account/login/facebook', '_blank', 'location=no, scrollbars=yes, width=800, height=600, top=' + top + ', left=' + left);
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
			if (data.err) return console.log(data.err);
			location.hash = '';
			$('html').addClass('loggedIn');
			$userData.setUserId(data.res.user.id);
			$userData.setBraintreeToken(data.res.user.braintree_token);
			$userData.setLoggedIn(true);
		});
	}
	if (config.html5) {
		var value = location.hash;
		if (value) {
			if ($scope.popUpTimeout) clearTimeout($scope.popUpTimeout);
			var hash = value.split('#').pop();
			if (hash === 'signin') $scope.showModal();
		} else removeHash();
		$(window).on('hashchange', function(event) {
			var value = location.hash;
			if (value) {
				if ($scope.popUpTimeout) clearTimeout($scope.popUpTimeout);
				var hash = value.split('#').pop();
				if (hash === 'signin') $scope.showModal();
			} else if ($scope.popUpOpen) $scope.hideModal();
			if (!value) removeHash();
		});
	}
	function removeHash() {
		var scrollV, scrollH, loc = window.location;
		if ('pushState' in history) history.pushState('', document.title, loc.pathname + loc.search);
		else {
			scrollV = document.body.scrollTop;
			scrollH = document.body.scrollLeft;
			loc.hash = '';
			document.body.scrollTop = scrollV;
			document.body.scrollLeft = scrollH;
		}
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
	$scope.userButton = function() {
		if ($userData.isLoggedIn()) $scope.showPopup();
		else $scope.showModal();
	};
	$scope.aboutUs = function() {
		$state.go('about');
	};
	$scope.login = function() {
		// set step to loading
		$http.post(config.api.host + '/api/v' + config.api.version + '/account/login', {
			email: $('#sign-in-email').val(),
			password: $('#sign-in-password').val()
		}, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			},
			transformRequest: function(data) {
				return $.param(data);
			}
		}).success(function(data) {
			if (data.err || !data.res.isValid) return console.log(data.err);
			location.hash = '';
			$('html').addClass('loggedIn');
			$userData.setUserId(data.res.user.id);
			$userData.setBraintreeToken(data.res.user.braintree_token);
			$userData.setLoggedIn(true);
			if ($scope.redirectState) $state.go($scope.redirectState);
			// $scope.redirectState = '';
		});
	};
	$scope.logout = function() {
		$http.post(config.api.host + '/api/v' + config.api.version + '/account/logout')
		.success(function(data) {
			$('html').removeClass('loggedIn');
			$userData.setLoggedIn(false);
			if (/\/stuff\/(give|mine|mine\/*|settings|messages|messages\/*|watchlist|)/.test($location.$$path)) {
				$location.path('/stuff/get');
			}
		});
	};
	$scope.toGiveStuff = function() {
		if ($userData.isLoggedIn()) $state.go('stuff.give');
		else {
			$scope.redirectState = 'stuff.give';
			location.hash = 'signin';
		}
	};
	$scope.signUpStep = function() {
		$('#sign-in-step').css({
			'transform': 'translate3d(-100%, 0%, 0)'
		});
		$('#sign-in-step .modal-title').css({
			'transform': 'translate3d(65%, 0%, 0) scale3d(0.75, 0.75, 1)'
		});
		$('#sign-in-step .modal-title').addClass('visible');
		$('#sign-up-step').removeClass('hidden-modal').addClass('active');
	};
	$scope.signUpBack = function() {
		$('#sign-in-step').css({
			'transform': ''
		});
		$('#sign-in-step .modal-title').css({
			'transform': ''
		});
		$('#sign-in-step .modal-title').removeClass('visible');
		$('#sign-up-step').addClass('hidden-modal').removeClass('active');
	};
	$scope.signUp = function() {
		var fd = {
			uname: $('#sign-up-uname').val(),
			email: $('#sign-up-email').val(),
			password: $('#sign-up-password1').val(),
			fname: $('#sign-up-fname').val(),
			lname: $('#sign-up-lname').val()
		};
		$http.post(config.api.host + '/api/v' + config.api.version + '/account/register', fd, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			},
			transformRequest: function(data) {
				return $.param(data);
			}
		})
		.success(function(data) {
			if (data.err) return console.log(data.err);
			location.hash = '';
		});
	};
	$scope.resetModal = function() {
		$('#sign-in-step').css({
			'transform': ''
		});
		$('#sign-in-step .modal-title').css({
			'transform': ''
		});
		$('#sign-in-step .modal-title').removeClass('visible');
		$('#sign-up-step').addClass('hidden-modal').removeClass('active');
	};
	$scope.toggleSideMenu = function() {
		$('#side-menu, #side-menu-background').toggleClass('hidden');
	};
}

function onResize() {
	var sideMenuHeight = 0;
	$('.side-menu-item').each(function(i,e){
		sideMenuHeight += $(e).outerHeight();
	});
	if(sideMenuHeight > ($(document).height() - $('.side-menu-footer').height() - $('.side-menu-header').height())) {
		$('.side-menu-footer').css({'position':'relative'});
	} else {
		$('.side-menu-footer').css({'position':'absolute'});
	}
}

$(document).ready(onResize);
$(window).on('resize', onResize);

var working = false;

function openModalWindow(windowName) {
	if (!working) {
		working = true;
		requestAnimationFrame(function() {
			$('#modal-windows').addClass('reveal-modals');
			requestAnimationFrame(function() {
				$('#modal-window-bg').addClass('reveal-modal-window-bg');
				$('#' + windowName + '.modal-window').addClass('reveal-modal-window');
				requestAnimationFrame(function() {
					working = false;
				});
			});
		});
	}
}

function closeModalWindow(windowName) {
	if (!working) {
		working = true;
		requestAnimationFrame(function() {
			$('#modal-window-bg').removeClass('reveal-modal-window-bg');
			$('#' + windowName + '.modal-window').removeClass('reveal-modal-window');
			$timeout(function() {
				requestAnimationFrame(function() {
					$('#modal-windows').removeClass('reveal-modals');
					requestAnimationFrame(function() {
						working = false;
					});
				});
			}, 250);
		});
	}
}
