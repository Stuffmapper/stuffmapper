var stuffControllerArgs = [];
stuffControllerArgs.push('$scope');
stuffControllerArgs.push('$userData');
if(config.ionic) stuffControllerArgs.push('authenticator');
stuffControllerArgs.push(StuffController);
stuffMapp.controller('stuffController', stuffControllerArgs);
function StuffController() {
	var $scope = arguments[0];
	var $userData = arguments[1];
	var authenticated = (typeof arguments[2] !== 'function' && typeof arguments[3] !== 'undefined')?arguments[2]:undefined;
	if(typeof authenticated !== 'undefined') {
		// check login
	}
	$scope.mapbox = false;
	if($scope.mapbox) {
		if (mapboxgl.supported()) {
			mapboxgl.accessToken = 'pk.eyJ1Ijoic3R1ZmZtYXBwZXIiLCJhIjoiY2lvZ2NybTBxMDFqenl2bTJrMWFvY3d2aSJ9.IY-ULtTMhRWqw8WbJQ0k5Q';
			$scope.map = new mapboxgl.Map({
				container: 'map-view',
				style: 'mapbox://styles/mapbox/basic-v8', //stylesheet location
				center: [-122.335167, 47.608013],
				zoom: 13
			});
		}
		else {
			L.mapbox.accessToken = 'pk.eyJ1Ijoic3R1ZmZtYXBwZXIiLCJhIjoiY2lvZ2NybTBxMDFqenl2bTJrMWFvY3d2aSJ9.IY-ULtTMhRWqw8WbJQ0k5Q';
			$scope.map = L.mapbox.map('map-view', 'mapbox.basic')
			.setView([47.608013, -122.335167], 13);
		}
	} else {
		// styles: https://snazzymaps.com/explore?sort=popular
		var style = [
			[],
			[{"featureType":"water","elementType":"geometry","stylers":[{"color":"#333739"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#2ecc71"}]},{"featureType":"poi","stylers":[{"color":"#2ecc71"},{"lightness":-7}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#2ecc71"},{"lightness":-28}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#2ecc71"},{"visibility":"on"},{"lightness":-15}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#2ecc71"},{"lightness":-18}]},{"elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#2ecc71"},{"lightness":-34}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#333739"},{"weight":0.8}]},{"featureType":"poi.park","stylers":[{"color":"#2ecc71"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#333739"},{"weight":0.3},{"lightness":10}]}],
			[{"featureType":"water","elementType":"geometry","stylers":[{"color":"#48c0eb"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#8bc34a"}]},{"featureType":"poi","stylers":[{"color":"#8bc34a"},{"lightness":-7}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#8bc34a"},{"lightness":-28}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#8bc34a"},{"visibility":"on"},{"lightness":-15}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#8bc34a"},{"lightness":-18}]},{"elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#8bc34a"},{"lightness":-34}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#48c0eb"},{"weight":0.8}]},{"featureType":"poi.park","stylers":[{"color":"#8bc34a"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#48c0eb"},{"weight":0.3},{"lightness":10}]}]
		];
		var styledMap = new google.maps.StyledMapType(style[0], {name: "Styled Map"});
		var mapOptions = {
			zoom: 13,
			center: {
				lat: 47.608013,
				lng: -122.335167
			},
			minZoom: 12,
			maxZoom: 17,
			zoomControl: !config.ionic.isIonic,
			mapTypeControl: false,
			scaleControl: false,
			streetViewControl: false,
			rotateControl: false,
			fullscreenControl: false,
			mapTypeControlOptions: {
				mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
			}
		};
		$scope.map = new google.maps.Map($('#map-view')[0], mapOptions);
		$scope.map.mapTypes.set('map_style', styledMap);
		$scope.map.setMapTypeId('map_style');
	}
	$userData.setUserId(1);
}
