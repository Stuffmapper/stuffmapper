function GiveStuffController($scope, authenticated, $timeout, $location, $stuffTabs) {
	$stuffTabs.init($scope, '#tab-container .stuff-tabs .give-stuff-tab a');
	if(!authenticated.res.loggedIn) {
		$location.path('/stuff/get');
		return;
	}

	$scope.currentStep = 1;
	$scope.googleMapStaticUrlTest = [
		'https://maps.googleapis.com/maps/api/staticmap?',
		'center=Brooklyn+Bridge,New+York,NY&zoom=13&size=600x300&maptype=roadmap&',
		'markers=color:blue%7Clabel:S%7C40.702147,-74.015794&',
		'markers=color:green%7Clabel:G%7C40.711614,-74.012318&',
		'markers=color:red%7Clabel:C%7C40.718217,-73.998284&',
		'key=AIzaSyC9wZTqNMPxl86PtJuR4Dq3TzS_hByOs3U'
	].join('');

	$scope.googleMapStaticUrl = [
		'https://maps.googleapis.com/maps/api/staticmap?',
		'zoom=13&size=600x300&maptype=roadmap&',
		'markers=color:red%7C{lat},{lng}&',
		'key=AIzaSyC9wZTqNMPxl86PtJuR4Dq3TzS_hByOs3U'
	].join('');


	/* STEP 1 - Get photo - START */
	$scope.getPhoto = function(){
		$timeout(function () {
			$('#give-image-select').click();
		}, 10);
	};
	function readURL(input) {
		if (input.files && input.files[0]) {
			var reader = new FileReader();
			reader.onload = function (e) {
				requestAnimationFrame(function() {
					$('#give-image-verify-container').css({'display':'block'});
					requestAnimationFrame(function() {
						$('#give-image-verify').css({'background-image': 'url('+e.target.result+')'});
						$('#give-image-verify-container').addClass('visible');
					});
				});
			};
			reader.readAsDataURL(input.files[0]);
		}
	}
	$('#give-image-select').change(function(event){
		readURL(this);
	});
	$scope.rejectPhoto = function() {
		$('#give-image-verify-container').removeClass('visible');
		$timeout(function() {
			requestAnimationFrame(function() {
				$('#give-image-verify').css({'background-image': ''});
				$('#give-image-verify-container').css({'display':'none'});
			});
			var input = $('#give-image-select')[0];
			// super hacky, but totally works.  removes files from input.
			try{
				input.value = '';
				if(input.value){
					input.type = 'text';
					input.type = 'file';
				}
			}catch(e){}
		},260);
	};
	$scope.acceptPhoto = function() {
		nextStep();
	};
	/* STEP 1 - Get photo -  END  */
	/* STEP 2 - Get location - START */

	$scope.initStep2 = function() {
		requestAnimationFrame(function() {
			$('#center-marker').css({'display':'block'});
			requestAnimationFrame(function() {
				$('#center-marker').addClass('dropped');
			});
		});
	};

	$scope.setMarker = function() {
		$('#center-marker').addClass('dropped');
		var mapCenter = $scope.map.getCenter();
		$scope.latCenter = mapCenter.lat();
		$scope.lngCenter = mapCenter.lng();
		$('#center-marker').removeClass('dropped');
		$timeout(function() {
			requestAnimationFrame(function() {
				$('#center-marker').css({'display':'none'});
			});
		}, 250);
		nextStep();
	};

	/* STEP 2 - Get location -  END  */
	/* STEP 3 - Set description - START */

	$scope.initStep3 = function() {
		$('#give-static-map1').attr('src', $scope.googleMapStaticUrl.replace('{lat}',$scope.latCenter).replace('{lng}', $scope.lngCenter));
		$('#give-image-details').css('background-image', $('#give-image-verify').css('background-image'));
	};

	$scope.uploadItem = function() {
		requestAnimationFrame(function() {
			$('#give-item-uploading-screen-container').css({'display':'block'});
			requestAnimationFrame(function() {
				$('#give-item-uploading-screen-container').addClass('visible');
			});
		});
		$timeout(function() {
			nextStep();
		}, 1000);
	};

	/* STEP 3 - Set description -  END  */
	/* STEP 4 - Done! - START */

	$scope.initStep4 = function() {
		setTimeout(function() {
			requestAnimationFrame(function() {
				$('#give-item-uploading-screen-container').css({'display':'hidden'});
				$('#give-item-uploading-screen-container').removeClass('visible');
			});
		}, 250)
		$('#give-finished-map').attr('src', $scope.googleMapStaticUrl.replace('{lat}',$scope.latCenter).replace('{lng}', $scope.lngCenter));
		$('#give-finished-image').css('background-image', $('#give-image-verify').css('background-image'));
	};

	$scope.editPost = function() {
		prevStep();
	};

	/* STEP 4 - Done! -  END  */

	/* Misc Functions - START */

	function nextStep() {
		$scope.currentStep++;
		$('#give-step' + ($scope.currentStep - 1)).addClass('completed').removeClass('active');
		$('#give-step' + $scope.currentStep).addClass('active');
		$scope['initStep' + $scope.currentStep]();
	}

	function prevStep() {
		$scope.currentStep--;
		$('#give-step' + $scope.currentStep).removeClass('completed').addClass('active');
		$('#give-step' + ($scope.currentStep + 1)).removeClass('active');
	}

	/* Misc Functions -  END  */
}
