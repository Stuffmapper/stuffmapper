function GetStuffController($scope, $http, $timeout, $userData, $stuffTabs) {
	$stuffTabs.init($scope, '#tab-container .stuff-tabs .get-stuff-tab a');
	$http({
		method: 'GET',
		url: config.api.host + 'api/' + config.api.version + '/stuff/'
	}).success(function(data) {
		console.log('data', data.res);
		$scope.listItems = data.res;
		$scope.markers = [];
		$scope.infowindows = [];
		$scope.filterOptions = [
			'thing',
			'stuff'
		];
		$scope.filterPaneOpen = false;
		$scope.toggleFilterPane = function() {
			$('#filter-pane').toggleClass('open-filter-pane');
		};
		$scope.toggleSwitch = function() {
			$('.toggle-button').toggleClass('toggle-button-selected');
		};
		var mapIsOpen = false;
		$scope.toggleMap = function() {
			if(mapIsOpen) {
				$('#tab-content-container').css({'pointer-events':''});
				$('#masonry-container').removeClass('hide-masonry-container');
			}
			else {
				$('#tab-content-container').css({'pointer-events':'none'});
				$('#masonry-container').addClass('hide-masonry-container');
			}
			mapIsOpen = !mapIsOpen;
		};
		$scope.toggleMap();


		$scope.watchSize = function() {
			if(document.width > 768) {
				$('#tab-content-container').css({'pointer-events':''});
			}
			else {
				if(mapIsOpen) {
					$('#tab-content-container').css({'pointer-events':''});
				}
				else {
					$('#tab-content-container').css({'pointer-events':'none'});
				}
			}
		};
		$(window).resize($scope.watchSize);
		$scope.watchSize();

		$scope.initMasonry = function() {
			$('.masonry-grid').masonry({
				columnWidth: function(columnWidth) {
					return $('.masonry-grid').width()/2;
				}(),
				itemSelector: '.masonry-grid-item',
				isAnimated: true
			}).imagesLoaded(function(){
				$('.masonry-grid').masonry('reloadItems').masonry();
			});
			$(window).resize(function() {
				$('.masonry-grid').masonry({
					columnWidth: function(columnWidth) {
						return $('.masonry-grid').width()/2;
					}(),
					itemSelector: '.masonry-grid-item',
					isAnimated: true
				});
			});
		};

		var tempSearchText = '';
		var searchTextTimeout;
		var lastSearch;
		$scope.$watch('searchStuff', function (val) {
			if (searchTextTimeout) {
				$timeout.cancel(searchTextTimeout);
			}
			else {
				console.log('Search for everything');
			}
			tempSearchText = val;
			searchTextTimeout = $timeout(function() {
				if(tempSearchText) {
					$scope.filterText = tempSearchText;
					if(tempSearchText !== lastSearch) {
						lastSearch = tempSearchText;
					}
				}
				else if(tempSearchText !== undefined) {
					console.log('Search for everything');
				}
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
						"iconUrl": "/img/circle.png",
						"icon": {
							"iconUrl": "/img/circle.png",
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
		else {
			$scope.listItems.forEach(function(e) {
				$scope.markers.push(new google.maps.Marker({
					position: {
						lat: e.lat,
						lng : e.lng
					},
					icon: '/img/circle.png',
					map: $scope.map
				}));
				var contentString = [
					'<div style="width: 180px; height: 300px;">',
					'   <div style="font-size: 16px">'+e.title+'</div>',
					'   <div style="background-image: url(//cdn.stuffmapper.com'+e.image_url+');position:absolute;background-position:50% 50%;width:200px;height:270px;top:25px"></div>',
					'</div>'
				].join('\n');
				$scope.infowindows.push(new google.maps.InfoWindow({
					content: contentString
				}));
				var infowindow = $scope.infowindows[$scope.infowindows.length - 1];
				$scope.markers[$scope.markers.length - 1].addListener('click', function(event) {
					$scope.infowindows.forEach(function(e) {
						e.close();
					});
					infowindow.open($scope.map, this);
				});
			});
		}
	});
	$scope.$on("$destroy", function() {
		$('#tab-content-container').css({'pointer-events':''});
		if($scope.mapbox) {
			$scope.map.removeLayer('markers');
		} else {
			$scope.infowindows.forEach(function(e) {
				e.close();
			});
			$scope.markers.forEach(function(e) {
				e.setMap(null);
			});
		}
	});
}
