
stuffMapp.controller('watchlistController', ['$scope', '$http', '$location', 'authenticated', WatchListController]);
function WatchListController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	var $location = arguments[2];
	var authenticated = arguments[3];
	if(!authenticated.res.loggedIn) {
		$location.path('stuff/get');
		return;
	}

	$scope.getAll = function() {
		$http.get('/api/v1/watchlist')
		.then(function(res) {
			$scope.watchlist = res.data.res;
			console.log('get',$scope.watchlist);
		}, function(err) {
			console.log('geterr',err.data);
		});
	};

	$scope.create = function() {
		var keys = $('#watchlist-input').val().split(',');
		$http.post('/api/v1/watchlist', {keys:keys},{
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			},
			transformRequest: function(data){
				return $.param(data);
			}
		}).success(function(data) {
			if (!data.err) {
				var newWatchlist_item = [];
				keys.forEach(
					function(e) {
						newWatchlist_item.push({tag_name:e});
					}
				);
				$scope.watchlist.push(newWatchlist_item);
				console.log($scope.watchlist);
			}
		});
	};

	$scope.remove = function(tagname) {
		$scope.watchlist_items.splice($scope.watchlist_items.indexOf(watchlist_item), 1);
		$http.delete('/api/v1/watchlist/' + watchlist_item._id)
		.then(function(res) {
			console.log('watchlist item deleted');
		}, function(err) {
			console.log(err.data);
			$scope.errors.push('could not delete watchlist_item: ' + tagname.name);
			$scope.getAll();
		});
	};
	$scope.clearField = function() {
		$('#watchlist-input').val('');
	};
	$scope.selections = function() {
		$('.select-values').select2({
			placeholder: 'select a tagname'
			// ajax: {
			// 	url: '/watchlist'
			// }
		});
	};
}
