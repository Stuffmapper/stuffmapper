stuffMapp.controller('loginStepsController', ['$scope', '$http', '$ionicSlideBoxDelegate', '$state', '$timeout', LoginStepsController]);
function LoginStepsController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	var $ionicSlideBoxDelegate = arguments[2];
	var $state = arguments[3];
	var $timeout = arguments[4];

	$scope.options = {
		loop: false,
		effect: 'slide',
		speed: 500
	};

	$scope.toSetup = function() {
		$state.go('setup1');
	};

	$scope.previousSlide = function() {
		$scope.slider.slideTo(($scope.slider.activeIndex - 1), 500);
	};

	$scope.nextSlide = function() {
		$scope.slider.slideTo(($scope.slider.activeIndex + 1), 500);
	};

	$scope.$on('$ionicSlides.sliderInitialized', function(event, data){
		$scope.slider = data.slider;
		$('#login-step-one').css({'height':$('#login-step-one').height()+'px'});
		$('#login-step-two').css({'height':$('#login-step-two').height()+'px'});
		$('#login-step-three').css({'height':$('#login-step-three').height()+'px'});
	});

	var slideOneTimeout;
	var slideTwoTimeout;
	function initSlideOne() {
		$('#login-step-one img').addClass('move-in');
		slideOneTimeout = $timeout(function() {
			$('#login-step-one img').addClass('move-across');
		}, 1500);
	}
	function resetSlideOne() {
		$timeout.cancel(slideOneTimeout);
		$('#login-step-one img').removeClass('animate-750');
		requestAnimationFrame(function() {requestAnimationFrame(function() {
			$('#login-step-one img').removeClass('move-in').removeClass('move-across');
			requestAnimationFrame(function() {requestAnimationFrame(function() {
				$('#login-step-one img').addClass('animate-750');
			});});
		});});
	}
	function initSlideTwo() {
		slideTwoTimeout = $timeout(function(){
			$('#login-step-two img').removeClass('move-in');
			slideTwoTimeout = $timeout(function() {
				$('#login-step-two img').addClass('bounce');
			}, 500);
		}, 500);
	}
	function resetSlideTwo() {
		$timeout.cancel(slideTwoTimeout);
		$('#login-step-two img').removeClass('animate-750');
		requestAnimationFrame(function() {requestAnimationFrame(function() {
			$('#login-step-two img').addClass('move-in').removeClass('bounce');
			requestAnimationFrame(function() {requestAnimationFrame(function() {
				$('#login-step-two img').addClass('animate-750');
			});});
		});});
	}

	$timeout(initSlideOne, 2000);

	$scope.$on('$ionicSlides.slideChangeStart', function(event, data){
		if($scope.slider) {
			if($scope.slider.activeIndex === 0) {
				$('#slide-container').css({'background-color' : '#8BC34A'});
				$('#login-steps-prev-button').removeClass('inactive').removeClass('active');
				$('#login-steps-skip-button').addClass('active').removeClass('inactive');
				$('#login-steps-message-one').addClass('active').removeClass('inactive');
				$('#login-steps-message-two').removeClass('active').removeClass('inactive');
			}
			else if($scope.slider.activeIndex === 1) {
				$('#login-steps-skip-button').addClass('inactive').removeClass('active');
				$('#login-steps-prev-button').addClass('active').removeClass('inactive');
				$('#login-steps-next-button').addClass('active').removeClass('inactive');
				$('#login-steps-message-one').addClass('inactive').removeClass('active');
				$('#login-steps-message-two').addClass('active').removeClass('inactive');
				$('#login-steps-continue-button').removeClass('inactive').removeClass('active');
			}
			else if($scope.slider.activeIndex === 2) {
				$('#slide-container').css({'background-color' : '#555555'});
				$('#login-steps-next-button').addClass('inactive').removeClass('active');
				$('#login-steps-message-two').addClass('inactive').removeClass('active');
				$('#login-steps-continue-button').addClass('active').removeClass('inactive');
			}
		}
	});

	$scope.$on('$ionicSlides.slideChangeEnd', function(event, data){
		if($scope.slider) {
			if($scope.slider.activeIndex === 0) {
				initSlideOne();
				resetSlideTwo();
			}
			else if($scope.slider.activeIndex === 1) {
				initSlideTwo();
				resetSlideOne();
			}
			else if($scope.slider.activeIndex === 2) {
				resetSlideTwo();
			}
		}
	});

	$scope.$on('$destroy', function() {

	});
}
