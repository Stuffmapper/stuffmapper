stuffMapp.controller('loginSetupOneController', ['$scope', '$http', '$state', '$userData', LoginSetupOneController]);
function LoginSetupOneController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	var $state = arguments[2];
	var $userData = arguments[3];
	$('#content').addClass('fre');

	$scope.$on('$destroy', function() {
		$('#content').removeClass('fre');
	});
}
