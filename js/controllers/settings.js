function SettingsController($scope, $http) {
	$('#mystuff a').addClass('selected');
	$scope.$on("$destroy", function() {
		$('#mystuff a').removeClass('selected');
	});
	$scope.userInfo = {};
	var testing = true;
	if(testing) {
		$scope.userData = {
			uname : 'username',
			fname : 'firstname',
			lname : 'lastname',
			email : 'email',
			phone : 'phonenumber',
			googleConnected : false,
			facebookConnected : true
		};
	}
	$http.get('/api/v1/user').success(function(data){
		if(data.err) {
			console.log(data.err);
			return;
		}
		$scope.userData = data.res;
	});
}
