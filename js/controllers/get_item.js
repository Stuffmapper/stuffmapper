stuffMapp.controller('getItemController', ['$scope', '$http', '$stateParams', '$userData', '$state', GetItemController]);
function GetItemController() {
	'use strict';
	var $scope = arguments[0];
	var $http = arguments[1];
	var $stateParams = arguments[2];
	var $userData = arguments[3];
	var $state = arguments[4];

	var singleItemTemplateMap;

	$http.get(config.api.host + '/api/v' + config.api.version + '/stuff/id/' + $stateParams.id).success(function(data) {
		$scope.listItem = data.res;
		$scope.listItem.date_created = new Date(data.res.date_created).getTime();
		function openInfoWindow(e) {
			e.category = 'test-category';
			var template = $('#templates\\/partial-home-get-item-single-map\\.html').text();
			getWordsBetweenCurlies(template).forEach(function(f) {
				template = template.replace('{{'+f+'}}',e[f]);
			});
			singleItemTemplateMap = $(template);
			singleItemTemplateMap.appendTo($('#map-view-container'));
			requestAnimationFrame(function() {
				requestAnimationFrame(function() {
					singleItemTemplateMap.removeClass('hidden');
					$('.info-windows').click(function() {
						$scope.toggleMap();
					});
				});
			});
		}
		/* jshint ignore:start */
		function getWordsBetweenCurlies(str) {
			var results = [], re = /{{([^}]+)}}/g, text;
			while(text = re.exec(str)) {
				results.push(text[1]);
			}
			return results;
		}
		/* jshint ignore:end */
		openInfoWindow(data.res);
		$scope.markers.forEach(function(e) {
			if(e.data.id === $scope.listItem.id) {
				e.data.selected = true;
				//$scope.resizeMarkers();
				google.maps.event.trigger($scope.map, 'zoom_changed');
				$scope.map.panTo(new google.maps.LatLng(e.data.lat, e.data.lng));
				$scope.googleMapStaticUrl = [
					'https://maps.googleapis.com/maps/api/staticmap?',
					'zoom=13&size=600x300&maptype=roadmap&',
					'markers=color:red%7C'+e.data.lat+','+e.data.lng+'&',
					'key=AIzaSyC9wZTqNMPxl86PtJuR4Dq3TzS_hByOs3U'
				].join('');
			}
		});
		$scope.imgScale = 1;
		var aspectRatio = (($('#get-item-single-container-'+$stateParams.id).width()/$('#get-item-single-container-'+$stateParams.id).height())>(($('#get-item-single-'+$stateParams.id+' .get-item-single-image-container').width()/$('#get-item-single-'+$stateParams.id+' .get-item-single-image-container').height())));
		$scope.imgScale = ($('#post-item-' + $stateParams.id + ' img').height())/($('#masonry-container').height()*0.4);
		$scope.container = $('<div>', {id:'get-item-single-'+$stateParams.id, class:'get-item-single-container animate-250'});
		$scope.imageContainer = $('<div>', {class:'get-item-single-image-container animate-250'});
		$scope.detailsContainer = $('<div>', {class:'get-item-single-details-container hidden animate-250'});
		$scope.containerBackground = $('<div>', {class:'get-item-single-background animate-250 hidden'});
		$scope.imageContainer.css({
			'transform' : 'translate3d(' + ($('#post-item-' + $stateParams.id).offset().left - $('#masonry-container').offset().left)+'px, '+($('#post-item-' + $stateParams.id).offset().top - $('#masonry-container').offset().top) + 'px, ' + '0)'
		});

		$scope.detailsContainer.html([
			'<a id="get-single-item-dibs-button'+$stateParams.id+'" class="get-item-single-dibs-button">Dibs!</a>',
			'<div class="get-item-single-payment-modal animate-250 hidden">',
			'	<form id="checkout" method="post" action="/checkout" target="_blank">',
			'		<div id="payment-form'+$stateParams.id+'"></div>',
			'		<input id="dibs-submit-button" type="submit" value="Pay">',
			'	</form>',
			'</div>',
			'<p class="get-item-single-description">'+data.res.description+'</p>',
			'<div class="">',
			'	<div class="get-item-single-category"></div><div class="get-item-single-time"></div>',
			'</div>',
			'<img style="width: 100%; padding-top: 10px;" src="'+$scope.googleMapStaticUrl+'" />'
		].join('\n'));
		$scope.singleItem = $('#post-item-' + $stateParams.id + ' img')
		.clone()
		.attr('id', 'get-item-single-container-' + $stateParams.id)
		.addClass('animate-250')
		.css({
			'position': 'absolute',
			'top':'0px',
			'left':'0px',
			'transform': 'scale3d('+$scope.imgScale+', '+$scope.imgScale+', 1) translate3d(0px, 0px, 0)',
			'z-index': '2',
			'transform-origin': '0 0',
			'width': (($(this).width()/$(this).height())>(($('#get-item-single-'+$stateParams.id+' .get-item-single-image-container animate-250').width()/$('#get-item-single-'+$stateParams.id+' .get-item-single-image-container animate-250').height()))?'100%':'auto'),
			'height': (($(this).width()/$(this).height())<=(($('#get-item-single-'+$stateParams.id+' .get-item-single-image-container animate-250').width()/$('#get-item-single-'+$stateParams.id+' .get-item-single-image-container animate-250').height()))?'auto':'100%')
		});
		$scope.containerBackground.appendTo($scope.container);
		$scope.singleItem.appendTo($scope.imageContainer);
		$scope.imageContainer.appendTo($scope.container);
		$scope.detailsContainer.appendTo($scope.container);
		$scope.container.appendTo('#get-stuff-container');
		requestAnimationFrame(function() {
			requestAnimationFrame(function() {
				initPayment();
				initListener();
				$('#post-item-'+$stateParams.id+' img').css({'opacity':0.0001});
				$scope.containerBackground.removeClass('hidden');
				$scope.detailsContainer.removeClass('hidden');
				$scope.imageContainer.css({
					'transform' : 'translate3d(0px, 0px, 0)'
				});
				$scope.singleItem.css({
					'z-index': '3',
					'transform': 'scale3d(1, 1, 1) translate3d('+($('#masonry-container').width()/2-$scope.singleItem.width()/2)+'px, 0px, 0)'
				});
				$('#get-item-single-'+$stateParams.id + ' .get-stuff-item-info').addClass('get-single-item-info').append([
					'<h3 class="get-single-item-description hidden animate-250">',
					'	'+$scope.listItem.description,
					'</h3>'
				].join('\n'));
				var $el = ($('#get-item-single'+$stateParams.id).append('<button class="get-single-item-dibs-button hidden animate-250">Dibs!</button>'));
				requestAnimationFrame(function() {
					$('.get-single-item-description, .get-single-item-dibs-button').removeClass('hidden');
					$('#get-stuff-back-button-container').removeClass('hidden');
					$('#get-stuff-item-title').text($scope.listItem.title);
					setTimeout(function() {
						$('.get-stuff-back-button').removeClass('hidden');
					},100);
					setTimeout(function() {
						$('#get-stuff-item-title').removeClass('hidden');
					},300);
					checkScroll();
				});
			});
		});
	});
	function initPayment() {
		var clientToken = $userData.getBraintreeToken();
		if(clientToken) {
			braintree.setup(clientToken, 'dropin', {
				container: 'payment-form'+$stateParams.id,
				paymentMethodNonceReceived: function (event, nonce) {
					if($userData.isLoggedIn()) {
						var currentTime = new Date().getTime();
						if(currentTime - $scope.listItem.date_created < 900000) {
							$.post('/checkout/earlydibs', {payment_method_nonce:nonce}, function(data, textStatus, xhr) {
								console.log('earlydibs!');
							});
						}
						else if(currentTime - $scope.listItem.date_created < 5400000) {
							$.post('/checkout/paiddibs', {payment_method_nonce:nonce}, function(data, textStatus, xhr) {
								console.log('paiddibs!');
							});
						}
						else dibsItem();
					}
					else window.location.hash = 'signin';
				}
			});
		}
	}
	function initListener() {
		$('#get-single-item-dibs-button'+$stateParams.id).on('click', dibs);
	}
	function dibs() {
		if($userData.isLoggedIn()) {
			var currentTime = new Date().getTime();
			if(currentTime - $scope.listItem.date_created < 900000) earlyDibs();
			else if(currentTime - $scope.listItem.date_created < 5400000) paidDibs();
			else dibsItem();
		}
		else window.location.hash = 'signin';
	}
	var dibbing = false;
	function earlyDibs() {
		$('#dibs-submit-button').val('5 Dollar Dibs!')
		if(!dibbing) {
			dibbing = true;
			$('get-single-item-dibs-button'+$stateParams.id).css({
				'background-color': 'gray'
			}).html('dibsing...');
			$http.post(config.api.host + '/api/v' + config.api.version + '/dibs/' + $scope.listItem.id, {}, {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				transformRequest: function(data) {
					return $.param(data);
				}
			}).success(function(data) {
				if(!data.err) {
					$('html').addClass('loggedIn');
					$userData.setUserId(data.res.user.id);
					$userData.setLoggedIn(true);
					return $state.go('stuff.get');
				}
			});
		}
	}
	function paidDibs() {
		$('#dibs-submit-button').val('1 Dollar Dibs!');
		if(!dibbing) {
			dibbing = true;
			$('get-single-item-dibs-button'+$stateParams.id).css({
				'background-color': 'gray'
			}).html('dibsing...');
			$http.post(config.api.host + '/api/v' + config.api.version + '/dibs/' + $scope.listItem.id, {}, {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				transformRequest: function(data) {
					return $.param(data);
				}
			}).success(function(data) {
				if(!data.err) {
					$('html').addClass('loggedIn');
					$userData.setUserId(data.res.user.id);
					$userData.setLoggedIn(true);
					return $state.go('stuff.get');
				}
			});
		}
	}
	function dibsItem() {
		if(!dibbing) {
			dibbing = true;
			$('get-single-item-dibs-button'+$stateParams.id).css({
				'background-color': 'gray'
			}).html('dibsing...');
			$http.post(config.api.host + '/api/v' + config.api.version + '/dibs/' + $scope.listItem.id, {}, {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				transformRequest: function(data) {
					return $.param(data);
				}
			}).success(function(data) {
				if(!data.err) {
					$('html').addClass('loggedIn');
					$userData.setUserId(data.res.user.id);
					$userData.setLoggedIn(true);
					return $state.go('stuff.get');
				}
			});
		}
	}
	function paidDibsItem() {
		$http.post(config.api.host + '/api/v' + config.api.version + '/paiddibs/' + $scope.listItem.id, {}, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			},
			transformRequest: function(data) {
				return $.param(data);
			}
		}).success(function(data) {
			if(!data.err) {
				$('html').addClass('loggedIn');
				$userData.setUserId(data.res.user.id);
				$userData.setLoggedIn(true);
				return $state.go('stuff.get');
			}
		});
	}

	function earlyDibsItem() {
		$http.post(config.api.host + '/api/v' + config.api.version + '/earlydibs/' + $scope.listItem.id, {}, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			},
			transformRequest: function(data) {
				return $.param(data);
			}
		}).success(function(data) {
			if(!data.err) {
				$('html').addClass('loggedIn');
				$userData.setUserId(data.res.user.id);
				$userData.setLoggedIn(true);
				return $state.go('stuff.get');
			}
		});
	}

	function checkScroll() {
		var div = $scope.detailsContainer[0];
		var hasVerticalScrollbar = div.scrollHeight > div.clientHeight;
	}
	$('#map-view').on('mousedown', backToGetStuff);
	function backToGetStuff() {
		//if($scope.mapMode){
		$state.go('stuff.get');
		//}
		//else {

		//}
	}
	$scope.$on('$destroy', function() {
		$('#map-view').off('mousedown', backToGetStuff);
		if(singleItemTemplateMap) {
			singleItemTemplateMap.addClass('hidden');
			setTimeout(function() {
				singleItemTemplateMap.remove();
				singleItemTemplateMap = undefined;
			}, 250);
		}
		$('#get-stuff-back-button-container').addClass('hidden');
		$('.get-stuff-back-button').addClass('hidden');
		$('#get-stuff-item-title').addClass('hidden');
		$('#get-single-item-dibs-button'+$stateParams.id).off('click', dibs);
		$scope.markers.forEach(function(e) {
			if(e.data.id === $scope.listItem.id) {
				e.data.selected = false;
				//$scope.resizeMarkers();
				google.maps.event.trigger($scope.map, 'zoom_changed');
			}
		});
		$scope.imageContainer.css({
			'transform' : 'translate3d(' + ($('#post-item-' + $stateParams.id).offset().left - $('#masonry-container').offset().left)+'px, '+($('#post-item-' + $stateParams.id).offset().top - $('#masonry-container').offset().top) + 'px, ' + '0)'
		});
		$scope.containerBackground.addClass('hidden');
		$scope.detailsContainer.addClass('hidden');
		$scope.singleItem.css({
			'transform':'scale3d('+$scope.imgScale+', '+$scope.imgScale+', 1) translate3d(0px, 0px, 0)',
			'z-index': '2'
		});
		$('.get-single-item-description, .get-single-item-dibs-button').addClass('hidden');
		setTimeout(function() {
			$('#post-item-'+$stateParams.id + ' img').css({'opacity': ''});
			requestAnimationFrame(function() {
				requestAnimationFrame(function() {
					$scope.container.remove();
				});
			});
		}, 250);
	});
}
