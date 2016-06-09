function GetStuffController($scope, $http, $timeout, $userData, $stuffTabs) {
	$stuffTabs.init($scope, '#tab-container .stuff-tabs .get-stuff-tab a');
	$scope.listItems = [];
	$http.get(config.api.host + 'api/' + config.api.version + '/stuff/').success(function(data) {
		$scope.listItems = data.res;
		$scope.markers = [];
		if($scope.listItems) {
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
				else console.log('Search for everything');
				tempSearchText = val;
				searchTextTimeout = $timeout(function() {
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
						map: $scope.map,
						data: e
					}));
					$scope.markers[$scope.markers.length - 1].addListener('click', function(event) {
						$scope.openInfoWindow(this.data);
					});
				});
			}
		}
	});
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
		if(document.width > 768) $('#tab-content-container').css({'pointer-events':''});
		else {
			if(mapIsOpen) $('#tab-content-container').css({'pointer-events':''});
			else $('#tab-content-container').css({'pointer-events':'none'});
		}
	};
	$(window).on('resize', $scope.watchSize);
	$scope.watchSize();

	$scope.infoWindowTemplate = [
		'<div id="info-window-{{id}}" class="info-windows">',
		'	<div class="info-window-header">',
		'		<span class="info-window-image" style="background-image: {{image}};"></span>',
		'		<span class="info-window-header-text">',
		'			<div class="info-window-header-title">{{title}}</div>',
		'			<div class="info-window-header-description">{{description}}</div>',
		'		</span>',
		'	</div>',
		'		<div class="info-window-dibs-button">Dibs!</div>',
		'	<span class="info-window-text">',
		'		<div class="info-window-title">{{title}}</div>',
		'		<div class="info-window-description">{{description}}</div>',
		'	</span>',
		'	<div class="info-window-footer">',
		'		<span class="info-window-category">{{category}}</span>',
		'		<span class="info-window-attended">{{attended}}</span>',
		'		</span>',
		'	</div>',
		'</div>'
	].join('\n');
	$scope.openInfoWindow = function(e) {
		e.category = 'test-category';
		var template = $scope.infoWindowTemplate
		.slice(0)
		.replace('{{id}}',e.id)
		.replace('{{image}}',e.image_url)
		.replace('{{title}}',e.title)
		.replace('{{title}}',e.title)
		.replace('{{description}}',e.description)
		.replace('{{description}}',e.description)
		.replace('{{category}}',e.category)
		.replace('{{attended}}',e.attended);
		console.log(template);
	};
	$scope.$on('$destroy', function() {
		$(window).off('resize', $scope.watchSize);
		$('#tab-content-container').css({'pointer-events':''});
		if($scope.mapbox) {
			$scope.map.removeLayer('markers');
		} else {
			$scope.markers.forEach(function(e) {
				e.setMap(null);
			});
		}
	});
}
