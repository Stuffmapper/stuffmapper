function MainController($scope, $http, $timeout, $userData, $state, $location) {
	//TODO: loading http://tobiasahlin.com/spinkit/ http://projects.lukehaas.me/css-loaders/
	$scope.counterFlipper = new CounterFlipper('landfill-tracker', 0, 7);
	$scope.counterFlipper.setCounter(1283746);
	$scope.counterFlipper.setCounter(2738391);
	$scope.counterFlipper.setCounter(3345678);
	$scope.counterFlipper.setCounter(4765432);
	$scope.counterFlipper.setCounter(3);
	$scope.popUpOpen = false;
	$scope.showModal = function() {
		if(config.html5) location.hash = 'signin';
		$('.modal-window').removeClass('modal-window-open');
		requestAnimationFrame(function() {
			$scope.$apply(function() {
				if($scope.popUpOpen === false) {
					$scope.popUpOpen = true;
					$('#modal-windows').addClass('modal-windows-open');
					$('.modal-container').css({'z-index':''});
					requestAnimationFrame(function() {
						$('#modal-windows .modal-windows-bg').addClass('modal-windows-bg-open');
						$('#modal-windows .modal-container').addClass('modal-window-open');
						$('#modal-windows .modal-container').parent().css({'z-index':'3'});
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
		if(config.html5) location.hash = '';
		else console.log('this should close popups... not sure what to do without html5 :<');
		if($scope.popUpTimeout) clearTimeout($scope.popUpTimeout);
		$scope.popUpOpen = false;
		$('#modal-windows .modal-windows-bg').removeClass('modal-windows-bg-open');
		$('#modal-windows .modal-container').removeClass('modal-window-open');
		$scope.popUpTimeout = $timeout(function() {
			$('#modal-windows').removeClass('modal-windows-open');
			$('#sign-in-step').css({'transform':''});
			$('#sign-in-step .modal-title').css({'transform':''});
			$('#sign-in-step .modal-title').removeClass('visible');
			$('#sign-up-step').addClass('hidden-modal').removeClass('active');
		}, 550);
	};
	$scope.socialSignIn = function(type) {
		var url = '';
		if(type === 'google') url = '/api/v1/account/login/google';
		else if(type === 'facebook') url = '/api/v1/account/login/facebook';
		if(url) open(url, 'Social Login', 'menubar=1,resizable=1,scrollbars=1,width=800,height=600');
	};
	if(config.html5) {
		var value = location.hash;
		if(value) {
			if($scope.popUpTimeout) clearTimeout($scope.popUpTimeout);
			var hash = value.split('#').pop();
			if(hash === "signin") $scope.showModal();
		}
		else {
			removeHash();
		}
		$(window).on('hashchange', function(event) {
			var value = location.hash;
			if(value) {
				if($scope.popUpTimeout) clearTimeout($scope.popUpTimeout);
				var hash = value.split('#').pop();
				if(hash === "signin") $scope.showModal();
			}
			else if($scope.popUpOpen) {
				$scope.hideModal();
			}
			if(!value) {
				removeHash();
			}
		});
	}
	function removeHash () {
		var scrollV, scrollH, loc = window.location;
		if ("pushState" in history) {
			history.pushState("", document.title, loc.pathname + loc.search);
		}
		else {
			scrollV = document.body.scrollTop;
			scrollH = document.body.scrollLeft;
			loc.hash = "";
			document.body.scrollTop = scrollV;
			document.body.scrollLeft = scrollH;
		}
	}
	var popupOpen = false;
	$scope.showPopup = function() {
		if(!popupOpen) {
			popupOpen = true;
			requestAnimationFrame(function() {
				$('#profile-popup').removeClass('hidden-popup');
				requestAnimationFrame(function() {
					$('body').one('click',function(){popupOpen = false;$('#profile-popup').addClass('hidden-popup');});
				});
			});
		}
	};
	$scope.userButton = function() {
		if($userData.isLoggedIn()) {
			$scope.showPopup();
		}
		else {
			$scope.showModal();
		}
	};
	$scope.aboutUs = function() {
		$state.go('about');
	};
	$scope.login = function() {
		// set step to loading
		$http.post("/api/v1/account/login", {
			username: $('#sign-in-email').val(),
			password: $('#sign-in-password').val()
		},{
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			},
			transformRequest: function(data){
				return $.param(data);
			}
		}).success(function(data) {
			if(data.err || !data.res.isValid) {
				console.log(data.err);
				return;
			}
			location.hash = '';
			$('html').addClass('loggedIn');
			$userData.setLoggedIn(true);
			if($scope.redirectState) $state.go($scope.redirectState);
			// $scope.redirectState = '';
		});
	};
	$scope.logout = function() {
		$http.post("/api/v1/account/logout")
		.success(function(data) {
			$('html').removeClass('loggedIn');
			$userData.setLoggedIn(false);
			if(/\/stuff\/(give|mine|mine\/*|settings|messages|messages\/*|watchlist|)/.test($location.$$path)) {
				$location.path('/stuff/get');
			}
		});
	};
	$scope.toGiveStuff = function() {
		if($userData.isLoggedIn()) {
			$state.go('stuff.give');
		} else {
			$scope.redirectState = 'stuff.give';
			location.hash = 'signin';
		}
	};
	$scope.signUpStep = function() {
		$('#sign-in-step').css({
			'transform':'translate3d(-100%, 0%, 0)'
		});
		$('#sign-in-step .modal-title').css({
			'transform':'translate3d(65%, 0%, 0) scale3d(0.75, 0.75, 1)'
		});
		$('#sign-in-step .modal-title').addClass('visible');
		$('#sign-up-step').removeClass('hidden-modal').addClass('active');
	};
	$scope.signUpBack = function() {
		$('#sign-in-step').css({'transform':''});
		$('#sign-in-step .modal-title').css({'transform':''});
		$('#sign-in-step .modal-title').removeClass('visible');
		$('#sign-up-step').addClass('hidden-modal').removeClass('active');
	};
	$scope.signUp = function() {
		var fd = {
			uname : $('#sign-up-uname').val(),
			email : $('#sign-up-email').val(),
			password : $('#sign-up-password1').val(),
			fname : $('#sign-up-fname').val(),
			lname : $('#sign-up-lname').val()
		};
		$http.post('/api/v1/account/register', fd,{
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			},
			transformRequest: function(data){
				return $.param(data);
			}
		})
		.success(function(data) {
			if(data.err) {
				console.log(data.err);
				return;
			}
			location.hash = '';
		});
	};
	$scope.resetModal = function() {
		$('#sign-in-step').css({'transform':''});
		$('#sign-in-step .modal-title').css({'transform':''});
		$('#sign-in-step .modal-title').removeClass('visible');
		$('#sign-up-step').addClass('hidden-modal').removeClass('active');
	};
}

var working = false;

function openModalWindow(windowName) {
	if(!working) {
		working = true;
		requestAnimationFrame(function() {
			$('#modal-windows').addClass('reveal-modals');
			requestAnimationFrame(function() {
				$('#modal-window-bg').addClass('reveal-modal-window-bg');
				$('#'+windowName+'.modal-window').addClass('reveal-modal-window');
				requestAnimationFrame(function() {
					working = false;
				});
			});
		});
	}
}
function closeModalWindow(windowName) {
	if(!working) {
		working = true;
		requestAnimationFrame(function() {
			$('#modal-window-bg').removeClass('reveal-modal-window-bg');
			$('#'+windowName+'.modal-window').removeClass('reveal-modal-window');
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
