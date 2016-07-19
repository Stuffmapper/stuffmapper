stuffMapp.controller('getStuffController', ['$scope', '$http', '$state', '$timeout', '$userData', '$stuffTabs', GetStuffController]);
function GetStuffController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	var $state = arguments[2];
	var $timeout = arguments[3];
	var $userData = arguments[4];
	var $stuffTabs = arguments[5];
	$stuffTabs.init($scope, '#tab-container .stuff-tabs .get-stuff-tab a');
	$scope.listItems = [];
	$scope.markers = [];
	google.maps.event.addListenerOnce($scope.map, 'idle', function() {
		console.log(this.getBounds());
	});
	$http.get(config.api.host + '/api/v' + config.api.version + '/stuff/').success(function(data) {
		$scope.listItems = data.res;
		if($scope.listItems) {
			$scope.initMasonry = function() {
				$('.masonry-grid').masonry({
					columnWidth: $('.masonry-grid').width()/2,
					itemSelector: '.masonry-grid-item',
					isAnimated: true
				}).imagesLoaded(function(){
					$('.masonry-grid').masonry('reloadItems').masonry();
					$('#loading-get-stuff').addClass('hidden');
				});
				$(window).resize(function() {
					$('.masonry-grid').masonry({
						columnWidth: $('.masonry-grid').width()/2,
						itemSelector: '.masonry-grid-item',
						isAnimated: true
					});
				});
			};
			var tempSearchText = '';
			var searchTextTimeout;
			var lastSearch;
			$scope.$watch('searchStuff', function (val) {
				if (searchTextTimeout) $timeout.cancel(searchTextTimeout);
				tempSearchText = val;
				searchTextTimeout = $timeout(function() {
					$scope.filterSearch();
					if(tempSearchText) {
						$scope.filterText = tempSearchText;
						if(tempSearchText !== lastSearch) lastSearch = tempSearchText;
					}
					else if(tempSearchText !== undefined) console.log('Search for everything');
				}, 250);
			});
			if ($scope.mapbox) {
				$scope.listItems.forEach(function(e) {
					$scope.markers.push({
						"type": "Feature",
						"geometry": {
							"type": "Point",
							"coordinates": [e.lng, e.lat]
						},
						"properties": {
							"title": "Stuff",
							"iconUrl": $('base').attr('href')+"img/circle.png",
							"icon": {
								"iconUrl": $('base').attr('href')+"img/circle.png",
								"iconSize": [100, 100],
								"iconAnchor": [50, 50],
								"popupAnchor": [0, -55],
								"className": "dot"
							}
						}
					});
				});
				$scope.map.on('load', function () {
					$scope.map.addSource("markers", {
						"type": "geojson",
						"data": {
							"type": "FeatureCollection",
							"features": $scope.markers
						}
					});
					$scope.map.addLayer({
						"id": "markers",
						"type": "symbol",
						"source": "markers",
						"layout": {
							"icon-image": "{marker-symbol}",
							"text-field": "{title}",
							"text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
							"text-offset": [0, 0.6],
							"text-anchor": "top"
						}
					});
				});
			}
			else initMarkers();
		}
	});

	google.maps.event.addListenerOnce($scope.map, 'idle', function(){
		$scope.getLocation();
	});
	$scope.map.addListener('zoom_changed', resizeMarkers);
	function initMarkers() {
		$scope.markers.forEach(function(e) {
			e.setMap(null);
			$scope.markers = [];
		});
		var mapZoom = $scope.map.getZoom();
		var mapSize = (mapZoom*mapZoom*2)/(20/mapZoom);
		var mapAnchor = mapSize/2;
		$scope.listItems.forEach(function(e) {
			$scope.markers.push(new google.maps.Marker({
				position: {
					lat: e.lat,
					lng : e.lng
				},
				icon: {
					url: 'img/Marker-all.png',
					scaledSize: new google.maps.Size(mapSize, mapSize),
					anchor: new google.maps.Point(mapAnchor, mapAnchor)
				},
				map: $scope.map,
				data: e
			}));
			$scope.markers[$scope.markers.length - 1].addListener('click', function(event) {
				$state.go('stuff.get.item', {id:this.data.id});
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
			}, function() {
				//handleLocationError(true, infoWindow, map.getCenter());
			});
		} else {
			//handleLocationError(false, infoWindow, map.getCenter());
		}
	};
	$scope.setGetStuff = function() {
		$state.go('stuff.get');
	};
	$('#get-location').click($scope.getLocation);
	function resizeMarkers() {
		var mapZoom = $scope.map.getZoom();
		var mapSize = (mapZoom*mapZoom*2)/(20/mapZoom);
		var mapAnchor = mapSize/2;
		$scope.markers.forEach(function(e) {
			e.setIcon({
				url: e.data.selected?'img/marker-selected.png':'img/Marker-all.png',
				scaledSize: new google.maps.Size(mapSize, mapSize),
				anchor: new google.maps.Point(mapAnchor, mapAnchor)
			});
		});
	}
	$('#search-stuff').focus(function() {
		if($scope.mapIsOpen) $scope.toggleMap();
		$('#filter-pane').addClass('open-filter-pane');
		$('.search-stuff-container .fa-map', '.search-stuff-container .toggle-stuff').css({'display': 'none'});
		$('.stuff-input').css({'width': 'calc(100% - 57px)', 'left': '5px'});
		$('.search-stuff-container .fa-search').css({'margin-left': '20px', 'display': 'inline-block'});
		$('#get-stuff-container .settings-header').css({'display': 'block', 'height': '24px'});
		$('.fa-map').css({'display': 'none'});
	});
	$('.search-stuff-container .fa-search').click(function() {
		$('#filter-pane').removeClass('open-filter-pane');
		$('.search-stuff-container .fa-map', '.search-stuff-container .toggle-stuff').css({'display': ''});
		$('.stuff-input').css({'width': '', 'left': ''});
		$('.search-stuff-container .fa-search').css({'margin-left': '', 'display': ''});
		$('#get-stuff-container .settings-header').css({'display': '', 'height': ''});
		$('.fa-map').css({'display': ''});
	});
	$scope.toggleSwitch = function() {
		$('.toggle-button').toggleClass('toggle-button-selected');
	};
	$scope.mapIsOpen = false;
	$scope.toggleMap = function() {
		if($scope.mapIsOpen) {
			$('#tab-content-container').css({'pointer-events':''});
			$('#get-stuff-container').removeClass('hide-masonry-container');
			$('#masonry-container').removeClass('hide-masonry-container');
			$('#map-toggle-switch').removeClass('fa-th-large').addClass('fa-map');
		}
		else {
			$('#tab-content-container').css({'pointer-events':'none'});
			$('#get-stuff-container').addClass('hide-masonry-container');
			$('#masonry-container').addClass('hide-masonry-container');
			$('#map-toggle-switch').removeClass('fa-map').addClass('fa-th-large');
		}
		$scope.mapIsOpen = !$scope.mapIsOpen;
	};
	$scope.toggleMap();
	$scope.watchSize = function() {
		if($(document).width() > 436) $('#tab-content-container').css({'pointer-events':''});
		else {
			if($scope.mapIsOpen) $('#tab-content-container').css({'pointer-events':'none'});
			else $('#tab-content-container').css({'pointer-events':''});
		}
	};
	$(window).on('resize', $scope.watchSize);
	$scope.watchSize();
	$scope.$on('$destroy', function() {
		$(window).off('resize', $scope.watchSize);
		$('#tab-content-container').css({'pointer-events':''});
		if($scope.mapbox) $scope.map.removeLayer('markers');
		else {
			$scope.markers.forEach(function(e) {
				e.setMap(null);
			});
		}
	});
	$scope.filterSearch = function () {
		var searchQuery = $('#search-stuff').val().toLowerCase();
		var sliderValue = parseInt($('.distance-slider').val());
		var convertValue = sliderValue * 1609.344;
		var categories = [];
		$('#categories .filter input').each(function(i, e){
			if($(e).is(':checked')) {
				categories.push($(e).val());
			}
		});
		categories = categories.join(' ');
		if (categories || searchQuery || sliderValue) {
			$scope.getLocation(function(position){
				$scope.listItems.forEach(function(e) {
					var radius = google.maps.geometry.spherical.computeDistanceBetween(
						new google.maps.LatLng(position.lat, position.lng),
						new google.maps.LatLng(e.lat, e.lng)
					);
					var matches = false;
					e.title.split(' ').forEach(function(f) {
						if(f.toLowerCase().startsWith(searchQuery) &&
						(categories.toLowerCase().indexOf(e.category.toLowerCase()) > -1)) {
							matches = true;
						}
					});

					if(convertValue <= radius || !matches) {
						// hide the element
						$('#post-item-' + e.id).css({'display': 'none'});
					} else {
						$('#post-item-' + e.id).css({'display': ''});
					}
				});
			});
		}
		//refresh masonry
		setTimeout(function () {
			$('.masonry-grid').masonry({
				columnWidth: function(columnWidth) {
					return $('.masonry-grid').width()/2;
				}(),
				itemSelector: '.masonry-grid-item',
				isAnimated: true
			}).imagesLoaded(function(){
				$('#loading-get-stuff').addClass('hidden');
				$('.masonry-grid').masonry('reloadItems').masonry();
			});
		},100);
	};
	$scope.attendedUnattended = function() {
		var attended;
		if($('#item-status-unattended').is(':checked')) {
			$scope.listItems.forEach(function(e) {
				if(e.attended) {
					// hide the element
					$('#post-item-' + e.id).css({'display': 'none'});
				} else {
					$('#post-item-' + e.id).css({'display': ''});
				}
			});
		}
	};
	$scope.showDistance = function() {
		var rangeValues = {};
		for(var i = 1; i < 21; i++) {
			rangeValues[i.toString()] = i + " mile(s)";
		}
		$(function () {
			$('#rangeText').text(rangeValues[$('#rangeInput').val()]);
			$('#rangeInput').on('input change', function () {
				$('#rangeText').text(rangeValues[$(this).val()]);
			});
		});
	};
	$scope.selectAll = function() {
		if($('#select-all').is(':checked')) {
			$('#categories .filter input').prop(':checked', true);
		}
	};
	$scope.deselectAll = function() {
		if($('#deselect-all').is(':checked')) {
			$('#select-all').prop(':checked', false);
		}
	};
}
