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
	// $scope.tagnames = [
  //                   {'tagname':'desk'},
  //                   {'tagname':'couch'},
	//                   {'tagname':'table'},
	// 	                {'tagname':'books'},
	// 		              {'tagname':'toys'},
	// 									{'tagname':'baby'},
  //                   {'tagname':'phone'},
	//                   {'tagname':'shoes'},
	// 	                {'tagname':'art'},
	// 		              {'tagname':'sports'},
	// 									{'tagname':'education'},
  //                   {'tagname':'auto'},
	//                   {'tagname':'beauty'},
	// 	                {'tagname':'misc'},
	// 		              {'tagname':'electronics'}
  //                   ];
	// $scope.addTag = function(){
	// 	$scope.tagnames.push({ 'tagname':$scope.tagname});
	// 	$scope.tagname='';
	// };

	$scope.getAll = function() {
	$http.get('/api/watchlist')
		.then(function(res) {
			$scope.watchlist = res.data;
		}, function(err) {
			console.log(err.data);
		});
	};

	$scope.create = function(tag_name) {
		$http.post('/api/watchlist', tag_name)
			.then(function(res) {
				$scope.tag_names.push(res.data);
				$scope.newTag_Name = null;
			}, function(err) {
				console.log(err.data);
			});
	};

	$scope.remove = function(tagname) {
		$scope.watchlist_items.splice($scope.watchlist_items.indexOf(watchlist_item), 1);
		$http.delete('/api/watchlist/' + watchlist_item._id)
			.then(function(res) {
				console.log('watchlist item deleted');
			}, function(err) {
				console.log(err.data);
				$scope.errors.push('could not delete watchlist_item: ' + tagname.name);
				$scope.getAll();
			});
	};
}
