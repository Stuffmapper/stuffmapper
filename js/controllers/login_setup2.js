stuffMapp.controller('loginSetupTwoController', ['$scope', '$http', '$state', '$userData', LoginSetupTwoController]);
function LoginSetupTwoController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	var $state = arguments[2];
	var $userData = arguments[3];

	$('#content').addClass('fre');


	var adjectives = ['friendly','amicable','emotional','strategic','informational','formative','formal','sweet','spicy','sour','bitter','determined','committed','wide','narrow','deep','profound','amusing','sunny','cloudy','windy','breezy','organic','incomparable','healthy','understanding','reasonable','rational','lazy','energetic','exceptional','sleepy','relaxing','delicious','fragrant','fun','marvelous','enchanted','magical','hot','cold','rough','smooth','wet','dry','super','polite','cheerful','exuberant','spectacular','intelligent','witty','soaked','beautiful','handsome','oldschool','metallic','enlightened','lucky','historic','grand','polished','speedy','realistic','inspirational','dusty','happy','fuzzy','crunchy'];
	var nouns = ['toaster','couch','sofa','chair','shirt','microwave','fridge','iron','pants','jacket','skis','snowboard','spoon','plate','bowl','television','monitor','wood','bricks','silverware','desk','bicycle','book','broom','mop','dustpan','painting','videogame','fan','baseball','basketball','soccerball','football','tile','pillow','blanket','towel','belt','shoes','socks','hat','rug','doormat','tires','metal','rocks','oven','washer','dryer','sunglasses','textbooks','fishbowl'];
	var number = Math.floor(Math.random() * 9999) + 1;

	function capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	$scope.uname = capitalizeFirstLetter(adjectives[Math.floor(Math.random() * adjectives.length)]) + capitalizeFirstLetter(nouns[Math.floor(Math.random() * nouns.length)]) + number;
	$scope.hideKeyboard = function(e) {
		document.activeElement.blur();
		$('input').blur();
	};
	var isPasswordVisible = false;
	$scope.togglePassword = function() {
		if(!isPasswordVisible) {
			$('#login-setup-show-password').removeClass('fa-eye').addClass('fa-eye-slash');
			$('#login-setup-input-password').attr('type', 'text');
		} else {
			$('#login-setup-show-password').addClass('fa-eye').removeClass('fa-eye-slash');
			$('#login-setup-input-password').attr('type', 'password');
		}
		isPasswordVisible = !isPasswordVisible;
	};
	$scope.register = function() {
		$http.post(config.api.host + '/api/v' + config.api.version + '/account/register', {
			uname: $scope.uname,
			email: $('#login-setup-input-email').val(),
			password: $('#login-setup-input-password').val()
		}, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			},
			transformRequest: function(data) {
				return $.param(data);
			}
		}).success(function(data) {
			if(!data.err) {
				$userData.setLoggedIn(true);
				$userData.setUserId(data.res.user.id);
				$userData.setBraintreeToken(data.res.user.braintree_token);
				$state.go('stuff.get');
			}
		});
	};
	$scope.setup2Back = function() {
		history.back();
	};
	$scope.$on('$destroy', function() {
		$('input').off('keydown', $scope.hideKeyboard);
		$('#content').removeClass('fre');
	});
}
