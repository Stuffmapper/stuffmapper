stuffMapp.controller('getItemController', ['$scope', '$http', '$stateParams', '$userData', '$state', GetItemController]);
function GetItemController() {
	'use strict';
	var $scope = arguments[0];
	var $http = arguments[1];
	var $stateParams = arguments[2];
	var $userData = arguments[3];
	var $state = arguments[4];
	var singleItemTemplateMap;
	$('#filter-container > .sm-background-semi-opaque').addClass('sm-hidden');
	$('#filter-container > .filter-content-container').addClass('sm-hidden');
	$http.get(config.api.host + '/api/v' + config.api.version + '/stuff/id/' + $stateParams.id).success(function(data) {
		$scope.listItem = data.res;
		$scope.listItem.date_created = new Date(data.res.date_created).getTime();
		$scope.listItem.dateEdited = dateFormat(data.res.date_edited, "ddd, mmm d, h:MM TT");
		// function openInfoWindow(e) {
		// 	e.category = 'test-category';
		// 	var template = $('#templates\\/partial-home-get-item-single-map\\.html').text();
		// 	getWordsBetweenCurlies(template).forEach(function(f) {
		// 		template = template.replace('{{'+f+'}}',e[f]);
		// 	});
		// 	singleItemTemplateMap = $(template);
		// 	singleItemTemplateMap.appendTo($('#map-view-container'));
		// 	requestAnimationFrame(function() {
		// 		requestAnimationFrame(function() {
		// 			singleItemTemplateMap.removeClass('sm-hidden');
		// 			$('.info-windows').click(function() {
		// 				$scope.toggleMap();
		// 			});
		// 		});
		// 	});
		// }
		/* jshint ignore:start */
		function getWordsBetweenCurlies(str) {
			var results = [], re = /{{([^}]+)}}/g, text;
			while(text = re.exec(str)) {
				results.push(text[1]);
			}
			return results;
		}
		/* jshint ignore:end */
		// openInfoWindow(data.res);
		$scope.markers.forEach(function(e) {
			if(e.data.id === $scope.listItem.id) {
				e.data.selected = true;
				//$scope.resizeMarkers();
				google.maps.event.trigger($scope.map, 'zoom_changed');
				$scope.map.panTo(new google.maps.LatLng(e.data.lat, e.data.lng));
				$scope.googleMapStaticUrl = [
					'https://maps.googleapis.com/maps/api/staticmap?',
					'zoom=13&size=600x300&maptype=roadmap&',
					'markers=icon:'+subdomain+'/img/Marker-all-64x64.png%7C'+e.data.lat+','+e.data.lng+'&',
					'key=AIzaSyC9wZTqNMPxl86PtJuR4Dq3TzS_hByOs3U'
				].join('');
			}
		});
		$scope.container = $('<div>', {id:'get-item-single-'+$stateParams.id, class:'get-item-single-container sm-hidden animate-250'});
		$scope.imageContainer = $('<a>', {class:'get-item-single-image-container animate-250'});
		$scope.detailsContainer = $('<div>', {class:'get-item-single-details-container animate-250'});
		$scope.detailsContainer.html([
			((!data.res.attended)?'<div class="get-item-is-unattended sm-full-width" style="text-align: center;margin-top: 5px; margin-bottom: 5px;">This item is <a href="/faq#sm-faq-attended-unattended-item-explanation-for-dibber" target="_blank">unattended</a>.</div>':''),
			((data.res.description==='undefined')?(''):('<p style="white-space: pre-wrap;" class="get-item-single-description sm-text-m sm-full-width">'+data.res.description+'</p>')),
			'<div class="get-item-single-payment-modal animate-250 sm-hidden">',
			'	<a href="https://www.braintreegateway.com/merchants/7t82byzdjdbkwp8m/verified" target="_blank" style="width: 100%;display: block;position: relative;">',
			'		<img src="https://s3.amazonaws.com/braintree-badges/braintree-badge-wide-light.png" width="280px" height ="44px" border="0" style="transform: translateX(-50%);left: 50%;position: relative;" />',
			'	</a>',
			'	<hr>',
			'	<form id="checkout" method="post" action="/checkout" target="_blank">',
			'		<div id="loading-get-item" class="noselect loading-screen sm-hidden animate-250">',
			'			<div class="spinner">',
			'				<div class="double-bounce1"></div>',
			'				<div class="double-bounce2"></div>',
			'			</div>',
			'			<div class="noselect loading-text">Processing Payment...</div>',
			'		</div>',
			'		<div id="payment-form'+$stateParams.id+'" class="payment-form"></div>',
			'		<div class="sm-text-s sm-full-width">By clicking the Dibs! button, you confirm that you are 18 years or older</div>',
			'		<input id="dibs-submit-button" class="sm-button sm-button-default sm-text-l sm-button-full-width" type="submit" value="Confirm Dibs! for $1">',
			'	</form>',
			'</div>',
			$scope.listItem.attended?'<button id="get-single-item-dibs-button'+$stateParams.id+'" class="sm-button sm-button-default sm-text-l sm-button-full-width">Dibs! for a Dollar</button>':'<button id="get-single-item-dibs-button-unattended'+$stateParams.id+'" class="sm-button sm-button-default sm-text-l sm-button-full-width">Dibs!</button>',
			'<div class="">',
			'	<div class="get-item-single-category"></div><div class="get-item-single-time"></div>',
			'</div>',
			'<div class="sm-text-s sm-full-width">Location of item is approximated to protect privacy. Dibs will connect you with lister to learn exact location.</div>',
			'<img style="width: 100%; padding-top: 10px;" src="'+$scope.googleMapStaticUrl+'" />',
			'<div class="sm-text-s sm-full-width">Item last updated on '+ $scope.listItem.dateEdited +'</div>'
		].join('\n'));
		$scope.imageContainer.appendTo($scope.container);
		$scope.detailsContainer.appendTo($scope.container);
		$scope.container.appendTo('#get-stuff-container');
		requestAnimationFrame(function() {
			requestAnimationFrame(function() {
				initPayment();
				initListener();
				$('.get-item-single-image-container').css({'background-image':'url(\'https://cdn.stuffmapper.com'+$scope.listItem.image_url+'\')'});
				$('.get-item-single-image-container').attr({'data-fancybox':''});
				$('.get-item-single-image-container').attr({'data-type':'image'});
				$('.get-item-single-image-container').attr({'data-src':'https://cdn.stuffmapper.com'+$scope.listItem.image_url+'_original'});
				$(".get-item-single-image-container").attr({'href': 'javascript:;'});
				var fallBackImage = $('.get-item-single-image-container').css('background-image').replace(/^url\(["](.+)["]\)/, '$1');
				$("[data-fancybox]").fancybox({
					closeClickOutside: true,
					iframe: {
						scrolling: 'auto',
						preload: false
					},
					errorTpl : '<div class="fancybox-error"><img src=\''+ fallBackImage +'\'/></div>'

				});
				$scope.container.removeClass('sm-hidden');
				($scope.listItem.description === undefined) && $('#get-item-single-'+$stateParams.id + ' .get-stuff-item-info').addClass('get-single-item-info').append([
					'<h3 class="get-single-item-description sm-hidden animate-250">',
					'	'+$scope.listItem.description,
					'</h3>'
				].join('\n'));
				requestAnimationFrame(function() {
					$('.get-single-item-description, .get-single-item-dibs-button').removeClass('sm-hidden');
					$('#get-stuff-back-button-container').removeClass('sm-hidden');
					$('#get-stuff-item-title').text($scope.listItem.title);
					setTimeout(function() {
						$('.get-stuff-back-button').removeClass('sm-hidden');
					},100);
					setTimeout(function() {
						$('#get-stuff-item-title').removeClass('sm-hidden');
					},300);
					checkScroll();
				});
			});
		});
	});
	function initPayment() {
		var clientToken = $userData.getBraintreeToken();
		if(clientToken) {
			if(subdomain==='ducks') clientToken = "eyJ2ZXJzaW9uIjoyLCJhdXRob3JpemF0aW9uRmluZ2VycHJpbnQiOiI5YzI3ZDY3YzQ3MWQ4NjYxNDUyM2E4YzA5ZjgxMDAwMzJhMTkwZjcwMjNmZGZmZDk1YjMwZDJkMGM2MmVmNDRifGNyZWF0ZWRfYXQ9MjAxNi0wOS0zMFQwNDowMjozNy44NTMzNjE1MjMrMDAwMFx1MDAyNm1lcmNoYW50X2lkPTM0OHBrOWNnZjNiZ3l3MmJcdTAwMjZwdWJsaWNfa2V5PTJuMjQ3ZHY4OWJxOXZtcHIiLCJjb25maWdVcmwiOiJodHRwczovL2FwaS5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tOjQ0My9tZXJjaGFudHMvMzQ4cGs5Y2dmM2JneXcyYi9jbGllbnRfYXBpL3YxL2NvbmZpZ3VyYXRpb24iLCJjaGFsbGVuZ2VzIjpbXSwiZW52aXJvbm1lbnQiOiJzYW5kYm94IiwiY2xpZW50QXBpVXJsIjoiaHR0cHM6Ly9hcGkuc2FuZGJveC5icmFpbnRyZWVnYXRld2F5LmNvbTo0NDMvbWVyY2hhbnRzLzM0OHBrOWNnZjNiZ3l3MmIvY2xpZW50X2FwaSIsImFzc2V0c1VybCI6Imh0dHBzOi8vYXNzZXRzLmJyYWludHJlZWdhdGV3YXkuY29tIiwiYXV0aFVybCI6Imh0dHBzOi8vYXV0aC52ZW5tby5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tIiwiYW5hbHl0aWNzIjp7InVybCI6Imh0dHBzOi8vY2xpZW50LWFuYWx5dGljcy5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tLzM0OHBrOWNnZjNiZ3l3MmIifSwidGhyZWVEU2VjdXJlRW5hYmxlZCI6dHJ1ZSwicGF5cGFsRW5hYmxlZCI6dHJ1ZSwicGF5cGFsIjp7ImRpc3BsYXlOYW1lIjoiQWNtZSBXaWRnZXRzLCBMdGQuIChTYW5kYm94KSIsImNsaWVudElkIjpudWxsLCJwcml2YWN5VXJsIjoiaHR0cDovL2V4YW1wbGUuY29tL3BwIiwidXNlckFncmVlbWVudFVybCI6Imh0dHA6Ly9leGFtcGxlLmNvbS90b3MiLCJiYXNlVXJsIjoiaHR0cHM6Ly9hc3NldHMuYnJhaW50cmVlZ2F0ZXdheS5jb20iLCJhc3NldHNVcmwiOiJodHRwczovL2NoZWNrb3V0LnBheXBhbC5jb20iLCJkaXJlY3RCYXNlVXJsIjpudWxsLCJhbGxvd0h0dHAiOnRydWUsImVudmlyb25tZW50Tm9OZXR3b3JrIjp0cnVlLCJlbnZpcm9ubWVudCI6Im9mZmxpbmUiLCJ1bnZldHRlZE1lcmNoYW50IjpmYWxzZSwiYnJhaW50cmVlQ2xpZW50SWQiOiJtYXN0ZXJjbGllbnQzIiwiYmlsbGluZ0FncmVlbWVudHNFbmFibGVkIjp0cnVlLCJtZXJjaGFudEFjY291bnRJZCI6ImFjbWV3aWRnZXRzbHRkc2FuZGJveCIsImN1cnJlbmN5SXNvQ29kZSI6IlVTRCJ9LCJjb2luYmFzZUVuYWJsZWQiOmZhbHNlLCJtZXJjaGFudElkIjoiMzQ4cGs5Y2dmM2JneXcyYiIsInZlbm1vIjoib2ZmIn0=";
			braintree.setup(clientToken, 'dropin', {
				container: 'payment-form'+$stateParams.id,
				paymentMethodNonceReceived: function (event, nonce) {
					if($userData.isLoggedIn()) {
						$('#loading-get-item').removeClass('sm-hidden');
						$.post('/api/v1/dibs/'+$stateParams.id, {payment_method_nonce: nonce}, function(data, textStatus, xhr) {
							if(data.err) {
								$('#loading-get-item').addClass('sm-hidden');
								fbq('trackCustom', 'UnsuccessfulDibs');
								return console.log('Payment Failed');
							}
							fbq('trackCustom', 'SuccessfulDibs');
							if(data.res.res1[0].attended) $state.go('stuff.my.items.item.conversation', {id: data.res.res1[0].id});
							else $state.go('stuff.my.items.item', {id: data.res.res1[0].id});
						});
					}
					else window.location.hash = 'signin';
				}
			});
		}
	}
	function initListener() {
		$('#get-single-item-dibs-button'+$stateParams.id).on('click', dibs);
		$('#get-single-item-dibs-button-unattended'+$stateParams.id).on('click', dibsItem);
	}
	function dibs() {
		if($userData.isLoggedIn()) {
			// var currentTime = new Date().getTime();
			// if(currentTime - $scope.listItem.date_created < 900000) earlyDibs();
			// else if(currentTime - $scope.listItem.date_created < 5400000) paidDibs();
			// else dibsItem();
			$('#get-single-item-dibs-button'+$stateParams.id).remove();
			$('#get-single-item-dibs-button'+$stateParams.id).remove();
			$('#get-item-single-'+$stateParams.id+' .get-item-single-details-container .get-item-single-payment-modal').removeClass('sm-hidden');
			$('#get-single-item-dibs-button'+$stateParams.id).attr('disabled', '');
			//paidDibsItem();
		}
		else window.location.hash = 'signin';
	}
	var dibbing = false;
	function dibsItem() {
		if(!dibbing) {
			dibbing = true;
			// $('get-single-item-dibs-button'+$stateParams.id).css({
			// 	'background-color': 'gray'
			// }).html('dibsing...');
			$http.post(config.api.host + '/api/v' + config.api.version + '/dibs/' + $scope.listItem.id, {}, {
				headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
				transformRequest: function(data) {return $.param(data);}
			}).success(function(data) {
				if(!data.err) {
					//$('#get-single-item-dibs-button'+$scope.listItem.id).attr('disabled', 'disabled').addClass('sm-button-positive').text('You dibsed it!');
					// $('#post-item-'+$scope.listItem.id).parent().parent().remove();
					// requestAnimationFrame(function(){
					// 	$('.masonry-grid').isotope({
					// 		columnWidth: $('.masonry-grid').width()/2,
					// 		itemSelector: '.masonry-grid-item',
					// 		getSortData: {
					// 			number: '.number parseInt'
					// 		},
					// 		animationEngine : 'css',
					// 		sortBy: 'number',
					// 		isAnimated: false
					// 	});
						// setTimeout(function() {
							$state.go('stuff.my.items.item',{id:$scope.listItem.id});
						// }, 250);
					// });
				}
			});
		}
	}
	function paidDibsItem() {
		$http.post(config.api.host + '/api/v' + config.api.version + '/dibs/' + $scope.listItem.id, {}, {
			headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
			transformRequest: function(data) {return $.param(data);}
		}).success(function(data) {
			if(!data.err) {
				$('#post-item-'+$scope.listItem.id).parent().parent().remove();
				requestAnimationFrame(function(){
					$('.masonry-grid').isotope({
						columnWidth: $('.masonry-grid').width()/2,
						itemSelector: '.masonry-grid-item',
						getSortData: {
							number: '.number parseInt'
						},
						animationEngine : 'css',
						sortBy: 'number',
						isAnimated: false
					});
					// $state.go('stuff.my.items.item',{id:$scope.listItem.id});
				});
			}
		});
	}

	function earlyDibsItem() {
		$http.post(config.api.host + '/api/v' + config.api.version + '/earlydibs/' + $scope.listItem.id, {}, {
			headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},transformRequest: function(data) {return $.param(data);}
		}).success(function(data) {
			if(!data.err) {
				$('#post-item-'+$scope.listItem.id).parent().parent().remove();
				requestAnimationFrame(function(){
					$('.masonry-grid').isotope({
						columnWidth: $('.masonry-grid').width()/2,
						itemSelector: '.masonry-grid-item',
						getSortData: {
							number: '.number parseInt'
						},
						animationEngine : 'css',
						sortBy: 'number',
						isAnimated: false
					});
					setTimeout(function() {
						$state.go('stuff.my.items.item',{id:$scope.listItem.id});
					}, 250);
				});
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
			singleItemTemplateMap.addClass('sm-hidden');
			setTimeout(function() {
				singleItemTemplateMap.remove();
				singleItemTemplateMap = undefined;
			}, 250);
		}
		$('#get-stuff-back-button-container').addClass('sm-hidden');
		$('.get-stuff-back-button').addClass('sm-hidden');
		$('#get-stuff-item-title').addClass('sm-hidden');
		$('#get-single-item-dibs-button'+$stateParams.id).off('click', dibs);
		$scope.markers.forEach(function(e) {
			if(e.data.id === $scope.listItem.id) {
				e.data.selected = false;
				//$scope.resizeMarkers();
				google.maps.event.trigger($scope.map, 'zoom_changed');
			}
		});
		$('.get-single-item-description, .get-single-item-dibs-button').addClass('sm-hidden');
		$scope.container.addClass('sm-hidden');
		setTimeout(function() {
			requestAnimationFrame(function() {
				requestAnimationFrame(function() {
					$scope.container.remove();
					$('iframe#braintree-dropin-modal-frame').remove();
				});
			});
		}, 250);
	});
}
