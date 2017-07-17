stuffMapp.controller('myStuffController', ['$scope', '$http', '$userData', 'authenticator', '$state', '$sce', '$log', MyStuffController]);
function MyStuffController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	var $userData = arguments[2];
	var authenticator = arguments[3];
	var $state = arguments[4];
	var $sce = arguments[5];
	var $log = arguments[6];

	$scope.markers = [];
	if($('#center-marker').hasClass('dropped')) {
		$('#center-marker').removeClass('dropped');
		$timeout(function() {
			requestAnimationFrame(function() {
				$('#center-marker').css({'display':'none'});
			});
		}, 250);
	}
	$http.post(config.api.host + '/api/v' + config.api.version + '/account/status?nocache='+new Date().getTime()).success(function(data){
		if(!data.res.user) {
			$state.go('stuff.get', {'#':'signin'});
			$scope.openModal('modal');
		} else {
			$http.get(config.api.host + '/api/v' + config.api.version + '/stuff/my').success(function(data) {
				$scope.dibbedItems = [];
				$scope.givedItems = [];
				data.res = data.res || [];
				data.events = data.events || [];
				data.res.forEach(function(e) {
					if(e.dibber_id === null || parseInt(e.dibber_id) !== parseInt($userData.getUserId())) $scope.givedItems.push(e);
					else $scope.dibbedItems.push(e);
				});
				$scope.listItems = data.res;
				$scope.testItems = data.test;
				$scope.events = data.events;
				$scope.events.forEach(function(e,i) {
					$scope.events[i].message = $sce.trustAsHtml($scope.events[i].message);
				});

				if(!data.res.length && !data.events.length) {
					$('#loading-get-stuff').addClass('sm-hidden');
					$('#my-stuff-empty-list').removeClass('sm-hidden');
				}
				else if(data.events.length || data.res.length) {
					$('#loading-get-stuff').addClass('sm-hidden');
				}
				initMarkers();

				// $('#mystuff a').addClass('selected');
				$scope.$on('$destroy', function() {
					$scope.markers.forEach(function(e) {
						e.setMap(null);
					});
					// $('#mystuff a').removeClass('selected');
				});
				$scope.initMasonry = function() {
					$('.masonry-grid').imagesLoaded( function() {
						$('#loading-get-stuff').addClass('sm-hidden');
						$('.masonry-grid').isotope({
							columnWidth: $('.masonry-grid').width()/2,
							itemSelector: '.masonry-grid-item',
							getSortData: {
								number: '.number parseInt'
							},
							sortBy: 'number',
							isAnimated: false
						});
					});
					requestAnimationFrame(resetBadges);
					function resetBadges() {
						data.res.forEach(function(e) {
							var isDibber = (parseInt(e.dibber_id) === parseInt($userData.getUserId()));
							if(e.dibber_id === null) $('#post-item-'+e.id).append('<div class="my-stuff-badge my-stuff-badge-lister">posted</div>');
							else if(!e.attended && isDibber) $('#post-item-'+e.id).append('<div class="my-stuff-badge my-stuff-badge-warning">!</div>');
							else if(!e.attended && !isDibber) $('#post-item-'+e.id).append('<div class="my-stuff-badge my-stuff-badge-lister">Dibs\'d!</div>');
							else if(parseInt(e.messages.from_user) === 0 && isDibber) $('#post-item-'+e.id).append('<div class="my-stuff-badge my-stuff-badge-warning"><i class="fa fa-commenting" /> !</div>');
							else if(parseInt(e.messages.count) > 0 && isDibber) $('#post-item-'+e.id).append('<div class="my-stuff-badge my-stuff-badge-dibber">My Dibs!  <i class="fa fa-comment" />  '+e.messages.count+'</div>');
							else if(parseInt(e.messages.count) > 0 && !isDibber) $('#post-item-'+e.id).append('<div class="my-stuff-badge my-stuff-badge-lister">Dibs\'d!  <i class="fa fa-comment" />  '+e.messages.count+'</div>');
							else if(parseInt(e.messages.count) === 0 && isDibber) $('#post-item-'+e.id).append('<div class="my-stuff-badge my-stuff-badge-dibber">My Dibs!  <i class="fa fa-comment-o" /></div>');
							else if(parseInt(e.messages.count) === 0 && !isDibber) $('#post-item-'+e.id).append('<div class="my-stuff-badge my-stuff-badge-lister">Dibs\'d!  <i class="fa fa-comment-o" /></div>');
						});
					}
					$(window).resize(function() {
						$('.masonry-grid').isotope({
							columnWidth: $('.masonry-grid').width()/2,
							itemSelector: '.masonry-grid-item',
							getSortData: {
								number: '.number parseInt'
							},
							sortBy: 'number',
							isAnimated: false
						});
					});
				};
				$scope.getDistance = function() {
					var milesAway;
					$scope.getLocation(function(position) {
						$scope.listItems.forEach(function(e) {
							var radius = google.maps.geometry.spherical.computeDistanceBetween(
								new google.maps.LatLng(position.lat, position.lng),
								new google.maps.LatLng(e.lat, e.lng)
							);
							e.milesAway = Math.ceil(radius/1609.344);
							$scope.milesAway = e.milesAway;
						});
					});
				};
			});
		}
	});

	$scope.map.addListener('zoom_changed', resizeMarkers);
	function resizeMarkers() {
		var mapZoom = $scope.map.getZoom();
		var mapSize = (mapZoom*mapZoom*2)/(45/mapZoom);
		var mapAnchor = mapSize/2;
		$scope.markers.forEach(function(e) {
			e.setIcon({
				url: e.data.dibber_id?(e.data.selected?'img/marker-dibsd-selected.png':'img/Marker-dibsd-all.png'):(e.data.selected?'img/marker-selected.png':'img/Marker-all.png'),
				scaledSize: new google.maps.Size(mapSize, mapSize),
				anchor: new google.maps.Point(mapAnchor, mapAnchor)
			});
		});
	}
	function initMarkers() {
		$scope.markers.forEach(function(e) {
			e.setMap(null);
			$scope.markers = [];
		});
		var maxZoom = 20;
		var mapZoom = $scope.map.getZoom();
		var mapSize = (mapZoom*mapZoom*2)/(45/mapZoom);
		var mapAnchor = mapSize/2;
		$scope.listItems.forEach(function(e) {
			$scope.markers.push(new google.maps.Marker({
				position: {
					lat: e.lat,
					lng : e.lng
				},
				icon: {
					url: e.dibber_id?'img/Marker-dibsd-all.png':'img/Marker-all.png',
					scaledSize: new google.maps.Size(mapSize, mapSize),
					anchor: new google.maps.Point(mapAnchor, mapAnchor)
				},
				map: $scope.map,
				data: e
			}));
			$scope.markers[$scope.markers.length - 1].addListener('click', function(event) {
				$state.go('stuff.my.items.item', {id:this.data.id});
			});
		});
	}
	$scope.getLocation = function(callback) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				$scope.map.setCenter({
					lat: position.coords.latitude,
					lng: position.coords.longitude
				});
				if(callback) {
					callback({
						lat: position.coords.latitude,
						lng: position.coords.longitude
					});
				}
				else {
					var marker = new google.maps.Marker({
						position: {
							lat: position.coords.latitude,
							lng: position.coords.longitude
						},
						map: $scope.map,
						icon: {
							url: '/img/currentlocation2.png'
						}
					});
				}
			}, function() {
				//handleLocationError(true, infoWindow, map.getCenter());
			});
		} else {
			//handleLocationError(false, infoWindow, map.getCenter());
		}
	};
}
