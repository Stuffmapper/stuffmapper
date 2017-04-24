stuffMapp.controller('giveController', ['$scope', '$http', '$timeout', '$state', '$location', '$stuffTabs', 'authenticator', GiveController]);
function GiveController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	var $timeout = arguments[2];
	var $state = arguments[3];
	var $location = arguments[4];
	// var $stuffTabs = arguments[5];
	var authenticator = arguments[6];
	var givePostId = 0;
	fbq('trackCustom', 'GiveStuff');
	$http.post(config.api.host + '/api/v' + config.api.version + '/account/status').success(function(data){
		if(!data.res.user) {
			$state.go('stuff.get', {'#':'signin'});
			$scope.openModal('modal');
		} else {
			// $stuffTabs.init($scope, '#tab-container .stuff-tabs .give-stuff-tab a');
			$http.get(config.api.host + '/api/v' + config.api.version + '/categories').success(function(data) {
				$scope.giveMarker = '';
				$scope.data = data.res;
				$scope.categories = [];
				$scope.data.forEach(function(e, i) {
					$scope.categories.push({
						name: e.category,
						value: parseInt(e.id)
					});
				});
				$scope.category = 7;
				$scope.published = false;

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
					$('#give-image-select').click();
				};
				$('#give-image-select').change(function(event) {
					if (this.files && this.files[0]) {
						var loadingImage = loadImage(this.files[0],
							function(img) {
								requestAnimationFrame(function() {
									$('#give-image-verify-container').css({'display':'block'});
									requestAnimationFrame(function() {
										var canvas1 = $('#give-image-canvas')[0];
										var canvas2 = $('#give-image-canvas-uploader')[0];
										canvas1.width = $('#give-image-canvas').width();
										canvas1.height = $('#give-image-canvas').height();
										canvas2.width = img.width;
										canvas2.height = img.height;
										var ctx1 = canvas1.getContext('2d');
										var ctx2 = canvas2.getContext('2d');
										var w = canvas1.width/img.width;
										ctx1.drawImage(img, (canvas1.width/2)-(img.width*w)/2, (canvas1.height/2)-(img.height*w)/2, img.width*w, img.height*w);
										ctx2.drawImage(img,0,0,img.width,img.height);
										$('#give-image-verify-container').addClass('visible');
										$('#give-photo-button').addClass('sm-hidden');
									});
								});
							},
							{maxWidth: 450,orientation:true});
						}
					});
					$scope.rejectPhoto = function() {
						$('#give-photo-button').removeClass('sm-hidden');
						$('#give-image-verify-container').removeClass('visible');
						$timeout(function() {
							requestAnimationFrame(function() {
								$('#give-image-verify').css({'background-image': ''});
								$('#give-image-verify-container').css({'display':'none'});
							});
							var input = $('#give-image-select')[0];
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
						// $('#give-photo-button').removeClass('sm-hidden');
					};
					/* STEP 1 - Get photo -  END  */
					/* STEP 2 - Get location - START */
					function watchSize() {
						if(window.width > 436) $('#tab-content-container').css({'pointer-events':'all'});
						else $('#tab-content-container').css({'pointer-events':'none'});
						// var canvas = $('#give-image-canvas')[0];
						// canvas.width = $('#give-image-canvas').width();
						// canvas.height = $('#give-image-canvas').height();
					}
					$scope.initStep1 = function() {
						if($('#center-marker').hasClass('dropped')) {
							$('#center-marker').removeClass('dropped');
							$timeout(function() {
								requestAnimationFrame(function() {
									$('#center-marker').css({'display':'none'});
								});
							}, 250);
						}
					};
					$scope.initStep2 = function() {
						if($scope.giveMarker) $scope.giveMarker.setMap(null);
						requestAnimationFrame(function() {
							$('#center-marker').css({'display':'block'});
							requestAnimationFrame(function() {
								$('#center-marker').addClass('dropped');
							});
						});
						$(window).on('resize', watchSize);
						watchSize();
					};

					$scope.setMarker = function() {
						$('#center-marker').addClass('dropped');
						var mapCenter = $scope.map.getCenter();
						$scope.lat = mapCenter.lat();
						$scope.lng = mapCenter.lng();
						var mapZoom = $scope.map.getZoom();
						var mapSize = (mapZoom*mapZoom*2)/(45/mapZoom);
						var mapAnchor = mapSize/2;
						$scope.giveMarker = new google.maps.Marker({
							position: {
								lat: $scope.lat,
								lng : $scope.lng
							},
							icon: {
								url: 'img/Marker-all.png',
								scaledSize: new google.maps.Size(mapSize, mapSize),
								anchor: new google.maps.Point(mapAnchor, mapAnchor)
							},
							map: $scope.map
						});
						if($('#center-marker').hasClass('dropped')) {
							$('#center-marker').removeClass('dropped');
							$timeout(function() {
								requestAnimationFrame(function() {
									$('#center-marker').css({'display':'none'});
								});
							}, 250);
						}
						nextStep();
					};

					/* STEP 2 - Get location -  END  */
					/* STEP 3 - Set description - START */

					$scope.initStep3 = function() {
						$(window).off('resize', watchSize);
						$('#tab-content-container').css({'pointer-events':'all'});
						$('#give-static-map1-container').css({'background-image': 'url('+$scope.googleMapStaticUrl.replace('{lat}',$scope.lat).replace('{lng}', $scope.lng)+')'});
						$('#give-image-details').attr('src', $('#give-image-canvas-uploader')[0].toDataURL());
						$('#center-marker').css({'display':'none'});
						$('#center-marker').removeClass('dropped');
					};

					var lockUpload = false;
					$scope.uploadItem = function() {
						$('#give-description-submit').attr('disabled', '');
						$('#give-description-title').css({border: ''});
						$('#give-description').css({border: ''});
						if(!lockUpload){
							lockUpload = true;
							if(!$scope.giveItem || !$scope.giveItem.title) {
								$('#give-description-title').css({border: '1px solid red'});
								lockUpload = false;
								$('#give-description-submit').removeAttr('disabled');
								return;
							}
							requestAnimationFrame(function() {
								$('#give-item-uploading-screen-container').css({'display':'block'});
								requestAnimationFrame(function() {
									$('#give-item-uploading-screen-container').addClass('visible');
								});
							});

							var original = $('#give-image-select')[0].files[0];
							var reader = new FileReader();
							reader.addEventListener('load', function () {
								var fd = new FormData();
								fd.append('title', $scope.giveItem.title);
								fd.append('description', $scope.giveItem.description || ' ');
								fd.append('attended', !$scope.giveItem.outside);
								fd.append('lat', $scope.lat);
								fd.append('lng', $scope.lng);
								fd.append('test', $('#give-image-canvas-uploader')[0].toDataURL());
								fd.append('original', reader.result);
								fd.append('category', ($scope.category==="General"?7:$scope.category));
								$http.post(config.api.host+'/api/v'+config.api.version+'/stuff', fd, {
									transformRequest: angular.identity,
									headers: {'Content-Type': undefined}
								}).success(function(data){
									givePostId = data.res.id;
									$scope.published = true;
									fd = null;
									nextStep();
									lockUpload = false;
									$('#give-description-submit').removeAttr('disabled');
								});
							}, false);
							reader.readAsDataURL(original);
						}
					};

					/* STEP 3 - Set description -  END  */
					/* STEP 4 - Done! - START */

					$scope.initStep4 = function() {
						setTimeout(function() {
							requestAnimationFrame(function() {
								$('#give-item-uploading-screen-container').css({'display':'sm-hidden'});
								$('#give-item-uploading-screen-container').removeClass('visible');
							});
						}, 250);
						$('#give-finished-map').attr('src', $scope.googleMapStaticUrl.replace('{lat}',$scope.lat).replace('{lng}', $scope.lng));
						$('#give-finished-image').attr('src', $('#give-image-canvas-uploader')[0].toDataURL());


						fbq('trackCustom', 'GiveStuffComplete');
						$u.toast('Your stuff has been mapped! Find it in My Stuff!');
					};

					$scope.editPost = function() {
						$scope.prevStep();
					};

					/* STEP 4 - Done! -  END  */

					/* Misc Functions - START */

					function nextStep() {
						$('#give-stuff-progress').addClass('step'+(++$scope.currentStep)+'-done');
						$('#give-step' + ($scope.currentStep - 1)).addClass('completed').removeClass('active');
						$('#give-step' + $scope.currentStep).addClass('active');
						$scope['initStep' + $scope.currentStep]();
					}

					$scope.prevStep = function() {
						$('#tab-content-container').css({'pointer-events':'all'});
						$(window).off('resize', watchSize);
						// $('#center-marker').removeClass('dropped');
						// $timeout(function() {
						// 	requestAnimationFrame(function() {
						// 		$('#center-marker').css({'display':'none'});
						// 	});
						// }, 250);
						$('#give-step' + $scope.currentStep).removeClass('active');
						$('#give-stuff-progress').removeClass('step'+$scope.currentStep+'-done');
						$('#give-step' + (--$scope.currentStep)).removeClass('completed').addClass('active');
						$scope['initStep' + $scope.currentStep]();
					};

					$scope.goToMyStuffItem = function() {
						$state.go('stuff.my.items.item', {id:givePostId});
					};

					$scope.resetGiveStuff = function() {
						$('#give-description-title').val('');
						$('#give-description').val('');
						$("#give-category-selector select option:eq(0)").prop("selected", true);
						$('#give-item-uploading-screen-container').css({'display':''});
						$scope.giveItem.title = '';
						$scope.giveItem.description = '';
						$scope.giveItem.outside = false;
						$scope.category = 7;
						$scope.rejectPhoto();
						$scope.prevStep();
						$scope.prevStep();
						$scope.prevStep();
					};

					/* Misc Functions -  END  */
					$scope.$on('$destroy', function() {
						if($scope.giveMarker) $scope.giveMarker.setMap(null);
						$('#center-marker').css({'display':''});
						$('#center-marker').removeClass('dropped');
						$(window).off('resize', watchSize);
					});
				});
			}
		});
	}
