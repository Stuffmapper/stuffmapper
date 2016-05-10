function MainController($scope, $http, $timeout, $userData) {
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
		if(config.html5) history.pushState("", document.title, window.location.pathname + window.location.search + '#');
		else console.log('this should close popups... not sure what to do without html5 :<');
		clearTimeout($scope.popUpTimeout);
		$scope.popUpOpen = false;
		$('#modal-windows .modal-windows-bg').removeClass('modal-windows-bg-open');
		$('#modal-windows .modal-container').removeClass('modal-window-open');
		$scope.popUpTimeout = setTimeout(function() {
			$('#modal-windows').removeClass('modal-windows-open');
		}, 250);
	};
	$scope.socialSignIn = function(type) {
		var url = '';
		if(type==='google') url='https://www.google.com';
		else if(type==='facebook') url='https://www.facebook.com';
		if(url) open(url, 'Social Login', 'menubar=1,resizable=1,scrollbars=1,width=350,height=250');
	};
	if(config.html5) {
		var value = location.hash;
		if(value) {
			clearTimeout($scope.popUpTimeout);
			var hash = value.split('#').pop();
			if(hash === "signin") $scope.showModal();
		}
		$(window).on('hashchange', function(event) {
			var value = location.hash;
			if(value) {
				clearTimeout($scope.popUpTimeout);
				var hash = value.split('#').pop();
				if(hash === "signin") $scope.showModal();
			}
			else if($scope.popUpOpen) {
				$scope.hideModal();
			}
		});
	}
	$scope.showPopup = function() {
		requestAnimationFrame(function() {
			$('#profile-popup').removeClass('hidden-popup');
			requestAnimationFrame(function() {
				$('body').one('click',function(){$('#profile-popup').addClass('hidden-popup');});
			});
		});
	};
	$scope.userButton = function() {
		if($userData.isLoggedIn()) {
			$scope.showPopup();
		}
		else {
			$scope.showModal();
		}
	};
	$scope.logIn = function() {
		// set step to loading
		$http.post("/api/v1/account/login",
		{
			email: $('#sign-in-email').val(),
			password: $('#sign-in-password').val()
		},{
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			},
			transformRequest: function(data){
				return $.param(data);
			}
		}).then(function(data) {
			data = data.data;
			console.log(data);
			if(data.err) {
				console.log(data);
			}
			if(data.res.isValid) {
				// show login success, add badges
				location.hash = '';
				console.log(data);
				$('html').addClass('loggedIn');
				$userData.setLoggedIn(true);
			} else {
				// go back to sign in step and red highlight the email address and password for one second
			}
		});
	};
	$scope.logOut = function() {
		console.log('asdfasdfasdf');
		$http.post("/api/v1/account/logout")
		.success(function(data) {
			$('html').removeClass('loggedIn');
		});
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
			setTimeout(function() {
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
