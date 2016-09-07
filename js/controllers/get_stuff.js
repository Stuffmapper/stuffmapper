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
		//console.log(this.getBounds());
	});
	$http.get(config.api.host + '/api/v' + config.api.version + '/stuff/').success(function(data) {
		$scope.listItems = data.res;
		if($scope.listItems) {
			$scope.refresh = function() {
				//console.log('refresh');
			};
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
						isAnimated: true
					});
				});
				$(window).resize(function() {
					$('.masonry-grid').isotope({
						columnWidth: $('.masonry-grid').width()/2,
						itemSelector: '.masonry-grid-item',
						getSortData: {
							number: '.number parseInt'
						},
						sortBy: 'number',
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
				if(!tempSearchText) tempSearchText = '';
				searchTextTimeout = $timeout(function() {
					$scope.filterSearch();
					if(tempSearchText) {
						$scope.filterText = tempSearchText;
						if(tempSearchText !== lastSearch) lastSearch = tempSearchText;
					}
					//else if(tempSearchText !== undefined) console.log('Search for everything');
				}, 250);
			});
			if ($scope.mapbox) {
				$scope.listItems.forEach(function(e) {
					console.log($scope.map.getCenter());
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
	$scope.search = function() {

	};
	$('#search-stuff').focus(function() {
		if($scope.mapIsOpen) $scope.toggleMap();
		$('#filter-container > .sm-background-semi-opaque').removeClass('sm-hidden');
		$('#filter-container > .filter-content-container').removeClass('sm-hidden');
	});
	$scope.hideFilter = function() {
		$('#filter-container > .sm-background-semi-opaque').addClass('sm-hidden');
		$('#filter-container > .filter-content-container').addClass('sm-hidden');
	};
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
	$scope.filterSearch = function () {
		if(!$('#search-stuff').val()) return;
		var searchQuery = $('#search-stuff').val().toLowerCase();
		var sliderValue = parseInt($('.distance-slider').val());
		var convertValue = sliderValue * 1609.344;
		var attended = $('#item-status-contact').is(':checked');
		var unattended = $('#item-status-unattended').is(':checked');
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
						if(f.toLowerCase().startsWith(searchQuery)) {
							matches = true;
						}
					});
					if(((convertValue >= radius) && matches) &&
					((categories.toLowerCase().indexOf(e.category.toLowerCase()) > -1) &&
					((e.attended && attended) || (!e.attended && unattended)))) {
						$('#post-item-' + e.id).css({'display': ''});
					} else {
						$('#post-item-' + e.id).css({'display': 'none'});
					}

				});
			});
		}
		//refresh masonry
		setTimeout(function () {
			$('.masonry-grid').imagesLoaded( function() {
				$('#loading-get-stuff').addClass('sm-hidden');
				$('.masonry-grid').isotope({
					columnWidth: function(columnWidth) {
						return $('.masonry-grid').width()/2;
					}(),
					itemSelector: '.masonry-grid-item',
					getSortData: {
						number: '.number parseInt'
					},
					sortAscending: true,
					sortBy: 'number',
					isAnimated: true
				});
				requestAnimationFrame(function(){
					setTimeout(function(){$(window).resize();},250);
				});
			});
		},100);
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
		$('.category-input').prop('checked', true);
		$('#select-all .fa.fa-check').addClass('select-deselect-checked');
		$('#deselect-all .fa.fa-times').removeClass('select-deselect-checked');
	};
	$scope.deselectAll = function() {
		$('.category-input').prop('checked', false);
		$('#select-all .fa.fa-check').removeClass('select-deselect-checked');
		$('#deselect-all .fa.fa-times').addClass('select-deselect-checked');
	};
	$scope.clearAll = function() {
		$('.category-input, .item-status-checkbox').prop('checked', true);
		$('#rangeInput').val(20);
		$('#rangeText').val(20);
		$('#select-all .fa.fa-check').removeClass('select-deselect-checked');
		$('#deselect-all .fa.fa-times').removeClass('select-deselect-checked');
	};
	$scope.clearSelectDeselect = function() {
		$('#select-all .fa.fa-check').removeClass('select-deselect-checked');
		$('#deselect-all .fa.fa-times').removeClass('select-deselect-checked');
	};
	var maxLength = 110;
	$scope.shorten = function(str) {
		if(str.length < maxLength) return str;
		str = str.substring(0, maxLength).split(' ');
		str.pop();
		str.pop();
		if(str[str.length-1]===',')str.pop();
		if(str[str.length-1]===',')str.pop();
		if(str[str.length-1]===' ')str.pop();
		if(str[str.length-1]===' ')str.pop();
		if(str[str.length-1]==='')str.pop();
		if(str[str.length-1]==='')str.pop();
		if(str[str.length-1]===' ')str.pop();
		if(str[str.length-1]===' ')str.pop();
		str = str.join(' ');
		return str + ' ...';
	};
}
