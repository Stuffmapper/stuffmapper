var stuffControllerArgs = [];
stuffControllerArgs.push('$scope');
stuffControllerArgs.push('$userData');
stuffControllerArgs.push('$http');
stuffControllerArgs.push('$log');
if(config.ionic) stuffControllerArgs.push('authenticator');
stuffControllerArgs.push(StuffController);
stuffMapp.controller('stuffController', stuffControllerArgs);
function StuffController() {
	var $scope = arguments[0];
	var $userData = arguments[1];
	var $http = arguments[2];
	var $log = arguments[3];
	var authenticated = (typeof arguments[4] !== 'function' && typeof arguments[4] !== 'undefined')?arguments[3]:undefined;

	if(typeof authenticated !== 'undefined') {
		// check login
	}
	// styles: https://snazzymaps.com/explore?sort=popular
	var style = [
		[],
		[{"featureType":"water","elementType":"geometry","stylers":[{"color":"#333739"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#2ecc71"}]},{"featureType":"poi","stylers":[{"color":"#2ecc71"},{"lightness":-7}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#2ecc71"},{"lightness":-28}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#2ecc71"},{"visibility":"on"},{"lightness":-15}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#2ecc71"},{"lightness":-18}]},{"elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#2ecc71"},{"lightness":-34}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#333739"},{"weight":0.8}]},{"featureType":"poi.park","stylers":[{"color":"#2ecc71"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#333739"},{"weight":0.3},{"lightness":10}]}],
		[{"featureType":"water","elementType":"geometry","stylers":[{"color":"#48c0eb"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#8bc34a"}]},{"featureType":"poi","stylers":[{"color":"#8bc34a"},{"lightness":-7}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#8bc34a"},{"lightness":-28}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#8bc34a"},{"visibility":"on"},{"lightness":-15}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#8bc34a"},{"lightness":-18}]},{"elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#8bc34a"},{"lightness":-34}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#48c0eb"},{"weight":0.8}]},{"featureType":"poi.park","stylers":[{"color":"#8bc34a"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#48c0eb"},{"weight":0.3},{"lightness":10}]}]
	];
	var styledMap = new google.maps.StyledMapType(style[0], {name: "Styled Map"});
	var zoomLevel;
	var mapOptions = {
		zoom: 12,
		center: {
			lat: 47.608013,
			lng: -122.335167
		},
		minZoom: 10,
		maxZoom: 17,
		zoomControl: false,
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
	$http.get('https://freegeoip.net/json/').success(function(data) {
		$scope.map.setCenter({
			lat: data.latitude,
			lng: data.longitude
		});
	});
	setTimeout(function(){
		var zoomLevel = 10;
		$('#sm-map-zoom-out').click(function() {
			if(zoomLevel-1 >= 10) $scope.map.setZoom(--zoomLevel);
		});
		$('#sm-map-zoom-in').click(function() {
			if(zoomLevel+1 <= 17) $scope.map.setZoom(++zoomLevel);
		});
	},1200);
}
