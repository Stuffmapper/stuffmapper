stuffMapp.controller('watchlistController', ['$scope', '$location', 'authenticated', WatchListController]);
function WatchListController() {
	var $scope = arguments[0];
	var $location = arguments[1];
	var authenticated = arguments[2];
	if(!authenticated.res.loggedIn) {
		$location.path('stuff/get');
		return;
	}
	// $scope.tagnames = [];
	// $scope.errors = [];
	// $scope.newTagname = null;
	$scope.tagnames = [
		{'tagname':'desk'},
		{'tagname':'couch'},
		{'tagname':'table'},
		{'tagname':'books'},
		{'tagname':'toys'},
		{'tagname':'baby'},
		{'tagname':'phone'},
		{'tagname':'shoes'},
		{'tagname':'art'},
		{'tagname':'sports'},
		{'tagname':'education'},
		{'tagname':'auto'},
		{'tagname':'beauty'},
		{'tagname':'misc'},
		{'tagname':'electronics'}
	];
	$scope.addTag = function(){
		$scope.tagnames.push({ 'tagname':$scope.tagname});
		$scope.tagname='';
	};
}

// $scope.getAll = function() {
// $http.get('/api/tagname')
// 	.then(function(res) {
// 		$scope.tagnames = res.data;
// 	}, function(err) {
// 		console.log(err.data);
// 	});
// };
//
// $scope.create = function(tagname) {
// 	$http.post('/api/tagnames', tagname)
// 		.then(function(res) {
// 			$scope.tagnames.push(res.data);
// 			$scope.newTagName = null;
// 		}, function(err) {
// 			console.log(err.data);
// 		});
// };
//
// $scope.update = function(tagname) {
// 	tagname.editing = false;
// 	$http.put('/api/tagname/' + tagname._id, tagname)
// 		.then(function(res) {
// 			console.log('this tagname has a been modified');
// 		}, function(err) {
// 			$scope.errors.push('could not get tagname: ' + tagname.name);
// 			console.log(err.data);
// 		});
// };
//
// $scope.remove = function(tagname) {
// 	$scope.tagnames.splice($scope.tagnames.indexOf(tagname), 1);
// 	$http.delete('/api/tagname/' + tagname._id)
// 		.then(function(res) {
// 			console.log('tagname deleted');
// 		}, function(err) {
// 			console.log(err.data);
// 			$scope.errors.push('could not delete tagname: ' + tagname.name);
// 			$scope.getAll();
// 		});
// };
