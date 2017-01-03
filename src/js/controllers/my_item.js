stuffMapp.controller('myItemsController', ['$scope', '$http', 'authenticator', '$stateParams', '$userData', '$state', '$timeout', MyItemsController]);
function MyItemsController() {
	var $scope = arguments[0];
	var $http = arguments[1];
	var authenticator = arguments[2];
	var $stateParams = arguments[3];
	var $userData = arguments[4];
	var $state = arguments[5];
	var $timeout = arguments[6];
	var data = {};
	$http.post(config.api.host + '/api/v' + config.api.version + '/account/status?nocache='+new Date().getTime()).success(function(result){
		if(!result.res.user) {
			$state.go('stuff.get', {'#':'signin'});
			$scope.openModal('modal');
		} else {
			var user = result.res.user;
			$http.get(config.api.host + '/api/v' + config.api.version + '/stuff/my/id/' + $stateParams.id).success(function(result) {
				if(!data.err) {
					var imageSet = false;
					data = result;
					$scope.listItem = data.res;
					$scope.googleMapStaticUrl = [
						'https://maps.googleapis.com/maps/api/staticmap?',
						'zoom=13&size=600x300&maptype=roadmap&',
						'markers=color:red%7C{lat},{lng}&',
						'key=AIzaSyC9wZTqNMPxl86PtJuR4Dq3TzS_hByOs3U'
					].join('');
					$scope.imgScale = 1;
					var aspectRatio = (($('#my-item-single-container-'+$stateParams.id).width()/$('#my-item-single-container-'+$stateParams.id).height())>(($('#get-item-single-'+$stateParams.id+' .get-item-single-image-container').width()/$('#get-item-single-'+$stateParams.id+' .get-item-single-image-container').height())));
					$scope.imgScale = ($('#post-item-' + $stateParams.id + ' img').height())/($('#masonry-container').height()*0.4);
					$scope.container = $('<div id="get-item-single-'+$stateParams.id+'" class="my-item-single-container animate-250"></div>');
					$scope.imageContainer = $('<div class="get-item-single-image-container animate-250"></div>');
					$scope.detailsContainer = $('<div class="get-item-single-details-container sm-hidden animate-250"></div>');
					$scope.editContainerHeader = $([
						'<div class="animate-250" style="width: 100%;height: auto;background-color: #fff;display: inline-block;position: absolute;top: 0px;z-index: 2;opacity: 0.0001;">',
						'	<i id="back-to-my-item" class="get-stuff-back-button fa fa-arrow-left animate-250"></i>',
						'	<div class="sm-text-m" style="display:inline-block;position:relative;margin-left:15px;">Edit '+data.res.title+'</div>',
						'</div>'
					].join('\n'));
					$scope.editContainerHeader.css({'pointer-events':'none'});
					$scope.editContainer = $([
						'<div class="edit-item-single-details-container sm-hidden animate-250" style="top:40px;position:absolute;">',
						'	<div class="edit-item-single-image-container">',
						'		<div style="width: 100%; display: block; height: auto; position: relative;">',
						'			<div style="width: 50%;display: inline-block;">',
						'				<img src="https://cdn.stuffmapper.com'+$scope.listItem.image_url+'" id="edit-item-image" style="height:auto;width:100%;position:relative;display:inline-block;background-image:url();"></img>',
						'			</div>',
						'			<input id="edit-image-button" type="button" value="change image" class="sm-button sm-button-default" style="width:calc(50% - 44px);display: inline-block;vertical-align: top;top: 27px;" />',
						'		</div>',
						'		<div style="width: 100%; display: block; height: 120px; position: relative;">',
						'			<div id="edit-item-location-image" style="background-position: 50% 50%;background-size:cover;height:100%;width:50%;position:relative;display:inline-block;background-image:url('+$scope.googleMapStaticUrl.replace('{lat}', $scope.listItem.lat).replace('{lng}', $scope.listItem.lng)+');"></div>',
						'			<input id="edit-location-button" type="button" value="edit location" class="sm-button sm-button-default" style="width:calc(50% - 44px);display: inline-block;vertical-align: top;top: 50%;transform: translateY(calc(-50% - 15px));" />',
						'		</div>',
						'</div>',
						'	<div class="sm-text-m sm-full-width">Title</div>',
						'	<input id="edit-item-title" value="'+$scope.listItem.title.trim()+'" class="sm-text-input-full-width sm-text-input" type="text">',
						'	<div class="sm-text-m sm-full-width">Description</div>',
						'	<textarea id="edit-item-description" class="sm-text-input-full-width sm-text-input">'+$scope.listItem.description+'</textarea>',
						'	<div class="sm-text-m sm-full-width" style="margin-bottom: 0px;">Category</div>',
						'		<div class="sm-select fa fa-chevron-down sm-select-full-width ng-not-empty" id="give-category-selector" placeholder="Choose a category..." full-width="true" ng-model="category" options="categories">',
						'			<select id="edit-item-category" class="ng-pristine ng-valid ng-not-empty ng-touched">',
						'				<option value="" selected="selected" class="ng-binding">'+$scope.listItem.category.trim()+'</option>',
						'				<option label="Arts &amp; Crafts" value="1">Arts &amp; Crafts</option>',
						'				<option label="Books, Games, Media" value="2">Books, Games, Media</option>',
						'				<option label="Building &amp; Garden Materials" value="3">Building &amp; Garden Materials</option>',
						'				<option label="Clothing &amp; Accessories" value="4">Clothing &amp; Accessories</option>',
						'				<option label="Electronics" value="5">Electronics</option>',
						'				<option label="Furniture &amp; Household" value="6">Furniture &amp; Household</option>',
						'				<option label="General" value="7">General</option>',
						'				<option label="Kids &amp; Babies" value="8">Kids &amp; Babies</option>',
						'				<option label="Recreation" value="9">Recreation</option>',
						'			</select>',
						'		</div>',
						'	<div class="sm-button-group" style="width: 100%;display:block;position:relative;">',
						'		<div class="sm-button-group-2 sm-button-group-left" style="width:calc(50% - 20px);display:inline-block;float:left;margin-left:10px;">',
						'			<input id="my-item-edit-cancel" class="sm-button sm-button-ghost sm-button-negative sm-text-m animate-250" type="button" value="Cancel" style="margin:20px 10px;width:calc(100% - 10px);" />',
						'		</div>',
						'		<div class="sm-button-group-2 sm-button-group-right" style="width:calc(50% - 20px);display:inline-block;float:left;margin:0px 10px;">',
						'			<input id="my-item-edit-save" class="sm-button sm-button-default sm-text-m" type="button" value="Save" style="margin:20px 10px;width:calc(100% - 10px);float:left;" />',
						'		</div>',
						'		<div id="my-item-delete'+$stateParams.id+'" style="cursor: pointer; text-decoration: underline; color:#ED5565; text-align: center;">Delete item</div>',
						'	</div>',
						'</div>',
						'<div id="edit-item-image-container" class="edit-item-image-container animate-250" style="position: absolute;top: 0px;z-index: 5;width: 100%;height: 100%;pointer-events:none;">',
						'	<div id="give-image-verify-container" class="animate-250">',
						'	  <div id="give-image-verify" class="animate-250">',
						'	    <canvas id="give-image-canvas-uploader" style="opacity:0.0001;pointer-events:none;position:absolute;z-index:2;width:100%;height:100%;"></canvas>',
						'	    <canvas id="give-image-canvas" style="position:absolute;z-index:2;width:100%;height:100%;"></canvas>',
						'	    <div style="z-index:3;width: 100%;display:block;position:absolute;bottom:0px;" class="sm-button-group">',
						'	      <div style="width:calc(50% - 20px);display:inline-block;float:left;margin-left:10px;" class="sm-button-group-2 sm-button-group-left">',
						'	        <button id="edit-reject-photo" style="margin:20px 10px;width:calc(100% - 10px);font-size:32px;line-height:25px;" class="give-reject-parent sm-button sm-text-m sm-button-ghost sm-button-ghost-solid sm-button-negative fa fa-times-circle give-reject1 animate-250"></button>',
						'	      </div>',
						'	      <div style="width:calc(50% - 20px);display:inline-block;float:left;margin:0px 10px;" class="sm-button-group-2 sm-button-group-right">',
						'	        <button id="edit-accept-photo" style="margin:20px 10px;width:calc(100% - 10px);float: left;font-size:32px;line-height:25px;" class="fa fa-check-circle sm-button sm-button-positive sm-text-m give-accept1 animate-250"></button>',
						'	      </div>',
						'	    </div>',
						'	  </div>',
						'	</div>',
						'	<input id="give-image-select" type="file" accept=".jpg,.jpeg,.png" name="file" class="give-image-select" style="height: 0px;width: 0px;position: absolute;" />',
						'</div>',
						'<div id="give-location-container" class="animate-250" style="top:0px;z-index:9;width:100%;height:100%;position:absolute;opacity: 0.0001;transform: translate3d(0px, 10%, 0);pointer-events: none;">',
						'	<i class="fa fa-location-arrow give-location-icon" style="font-size: 160px !important;"></i>',
						'	<div class="empty-results-bottom sm-full-width">Move the map around to set the pick-up location.</div>',
						'	<div style="z-index:3;width: 100%;display:block;position:absolute;bottom:0px;" class="sm-button-group">',
						'		<div style="width:calc(50% - 20px);display:inline-block;float:left;margin-left:10px;" class="sm-button-group-2 sm-button-group-left">',
						'			<button id="edit-reject-location" style="margin:20px 10px;width:calc(100% - 10px);font-size:32px;line-height:25px;" class="give-reject-parent sm-button sm-text-m sm-button-ghost sm-button-ghost-solid sm-button-negative fa fa-times-circle give-reject1 animate-250"></button>',
						'		</div>',
						'		<div style="width:calc(50% - 20px);display:inline-block;float:left;margin:0px 10px;" class="sm-button-group-2 sm-button-group-right">',
						'			<button id="edit-accept-location" style="margin:20px 10px;width:calc(100% - 10px);float: left;font-size:32px;line-height:25px;" class="fa fa-check-circle sm-button sm-button-positive sm-text-m give-accept1 animate-250"></button>',
						'		</div>',
						'	</div>',
						'</div>'
					].join('\n'));
					$scope.containerBackground = $('<div class="get-item-single-background animate-250 sm-hidden"></div>');
					$scope.imageContainer.css({
						'transform' : 'translate3d(' + ($('#post-item-' + $stateParams.id).offset().left - $('#masonry-container').offset().left)+'px, '+($('#post-item-' + $stateParams.id).offset().top - $('#masonry-container').offset().top-32) + 'px, ' + '0)'
					});
					$scope.detailsContainer.html([
						'<p style="white-space: pre-wrap;" class="sm-text-m sm-full-width">'+data.res.description+'</p>',
						($scope.listItem.attended && $scope.listItem.dibbed)?'<button id="get-single-item-conversation-button'+$stateParams.id+'" class="sm-button sm-text-l sm-button-default sm-button-full-width">Go to Conversation</button>':'',
						($scope.listItem.type === 'dibber')?'<button id="my-item-undibs-big'+$stateParams.id+'" class=" sm-button sm-text-l sm-button-ghost sm-button-ghost-solid sm-button-negative sm-button-full-width animate-250">unDibs</button>':'',
						((!$scope.listItem.attended)?'<div class="sm-text-s sm-full-width" style="margin-bottom:0px;text-align:center;">Click the map below to find your stuff!</div>':''),
						((!$scope.listItem.attended)?'<a href="https://maps.google.com/maps?q='+$scope.listItem.lat+','+$scope.listItem.lng+'" target="_blank"><img style="width: 100%;" src="'+$scope.googleMapStaticUrl.replace('{lat}', $scope.listItem.lat).replace('{lng}', $scope.listItem.lng)+'" /></a>':'<img style="width: 100%; padding-top: 10px;" src="'+$scope.googleMapStaticUrl.replace('{lat}', $scope.listItem.lat).replace('{lng}', $scope.listItem.lng)+'" />')
					].join('\n'));
					$scope.singleItem = $('#post-item-' + $stateParams.id + ' img')
					.clone()
					.attr('id', 'my-item-single-container-' + $stateParams.id)
					.addClass('animate-250')
					.css({
						'position': 'absolute',
						'top':'0px',
						'left':'0px',
						'transform': 'scale3d('+$scope.imgScale+', '+$scope.imgScale+', 1) translate3d(0px, 0px, 0)',
						'z-index': '2',
						'transform-origin': '0 0',
						'width': (($(this).width()/$(this).height())>(($('#get-item-single-'+$stateParams.id+' .get-item-single-image-container animate-250').width()/$('#get-item-single-'+$stateParams.id+' .get-item-single-image-container animate-250').height()))?'100%':'auto'),
						'height': (($(this).width()/$(this).height())<=(($('#get-item-single-'+$stateParams.id+' .get-item-single-image-container animate-250').width()/$('#get-item-single-'+$stateParams.id+' .get-item-single-image-container animate-250').height()))?'auto':'100%')
					});
					$scope.titleHeader = $([
						'<div class="animate-250" style="transform:translate3d(0px,-100%,0);width:100%;height:auto;background-color:#fff;display:inline-block;position:relative;">',
						'	<i id="back-to-my-stuff" class="get-stuff-back-button fa fa-arrow-left animate-250"></i>',
						'	<div id="my-item-header-text" class="sm-text-m" style="display:inline-block;position:relative;margin-left:15px;">'+data.res.title+'</div>',
						(!$scope.listItem.dibbed?'	<i id="my-item-edit-button" class="fa fa-pencil-square-o">':'	<i id="my-item-menu" class="fa fa-cog">'),
						'</div>'
					].join('\n'));
					$scope.titleHeader.appendTo($scope.container);
					$scope.dropdownMenu = $([
						'<div id="dropdown-menu" class="popups popups-top-right animate-250 hidden-popup">',
						($scope.listItem.attended && $scope.listItem.dibbed)?'<li id="get-single-item-conversation-popup'+$stateParams.id+'">Go to conversation</li>':'',
						($scope.listItem.type==='lister' || ($scope.listItem.type==='dibber' && !$scope.listItem.attended))?'<li id="my-item-complete'+$stateParams.id+'">Mark as picked up</li>':'',
						($scope.listItem.type==='lister' && $scope.listItem.dibbed)?'	<li id="my-item-reject'+$scope.listItem.id+'">Reject Dibs</li>':'',
						($scope.listItem.type==='dibber' && $scope.listItem.dibbed)?'	<li id="my-item-undibs'+$scope.listItem.id+'">unDibs</li>':'',
						($scope.listItem.type==='lister' && !$scope.listItem.dibbed)?'	<li id="get-single-item-edit-dibs-button'+$stateParams.id+'">Edit item</li>':'',
						'</div>'
					].join('\n'));
					$scope.dropdownMenu.appendTo($scope.container);
					$scope.containerBackground.appendTo($scope.container);
					$scope.singleItem.appendTo($scope.imageContainer);
					$scope.imageContainer.appendTo($scope.container);
					$scope.detailsContainer.appendTo($scope.container);
					$scope.editContainer.appendTo($scope.container);
					$scope.editContainerHeader.appendTo($scope.container);
					$scope.container.appendTo('#my-stuff-container');
					requestAnimationFrame(function() {
						requestAnimationFrame(function() {
							$scope.titleHeader.css({transform:'translate3d(0px, 0%, 0)'});
							$('#post-item-'+$stateParams.id+' img').css({'opacity':0.0001});
							$scope.containerBackground.removeClass('sm-hidden');
							$scope.detailsContainer.removeClass('sm-hidden');
							$scope.imageContainer.css({
								'transform' : 'translate3d(0px, 0px, 0)'
							});
							$scope.singleItem.css({
								'z-index': '3',
								'transform': 'scale3d(1, 1, 1) translate3d('+($('#masonry-container').width()/2-$scope.singleItem.width()/2)+'px, 0px, 0)'
							});
							$('#get-item-single-'+$stateParams.id + ' .get-stuff-item-info').addClass('get-single-item-info').append([
								'<h3 class="sm-text-m sm-full-width sm-hidden animate-250">',
								'	'+$scope.listItem.description,
								'</h3>'
							].join('\n'));
							var $el = ($('#get-item-single'+$stateParams.id).append('<button class="get-single-item-dibs-button sm-hidden animate-250">Dibs!</button>'));
							requestAnimationFrame(function() {
								$('.get-single-item-description, .get-single-item-dibs-button').removeClass('sm-hidden');
								$('#get-stuff-back-button-container').removeClass('sm-hidden');
								$('#get-stuff-item-title').text($scope.listItem.title.trim());
								setTimeout(function() {
									$('.get-stuff-back-button').removeClass('sm-hidden');
								},100);
								setTimeout(function() {
									$('#get-stuff-item-title').removeClass('sm-hidden');
								},300);
								checkScroll();
							});
						});
					});
					var initStep2 = function() {
						if($scope.giveMarker) $scope.giveMarker.setMap(null);
						requestAnimationFrame(function() {
							$('#center-marker').css({'display':'block'});
							requestAnimationFrame(function() {
								$('#center-marker').addClass('dropped');
							});
						});
						$(window).on('resize', watchSize);
						watchSize();
					};
					var setMarker = function() {
						$('#center-marker').addClass('dropped');
						var mapCenter = $scope.map.getCenter();
						$scope.lat = mapCenter.lat();
						$scope.lng = mapCenter.lng();
						$('#edit-item-location-image').css({
							'background-image':'url('+$scope.googleMapStaticUrl.replace('{lat}', $scope.lat).replace('{lng}', $scope.lng)+')'
						});
						// var mapZoom = $scope.map.getZoom();
						// var mapSize = (mapZoom*mapZoom*2)/(20/mapZoom);
						// var mapAnchor = mapSize/2;
						// $scope.giveMarker = new google.maps.Marker({
						// 	position: {
						// 		lat: $scope.lat,
						// 		lng : $scope.lng
						// 	},
						// 	icon: {
						// 		url: 'img/Marker-all.png',
						// 		scaledSize: new google.maps.Size(mapSize, mapSize),
						// 		anchor: new google.maps.Point(mapAnchor, mapAnchor)
						// 	},
						// 	map: $scope.map
						// });
						$('#center-marker').removeClass('dropped');
						$timeout(function() {
							requestAnimationFrame(function() {
								$('#center-marker').css({'display':'none'});
							});
						}, 250);
						$u.toast('Location updated');
					};
					var updateItem = function() {
						var values = {
							title:$('#edit-item-title').val(),
							description:$('#edit-item-description').val() || ' ',
							lat:$scope.lat || $scope.listItem.lat,
							lng:$scope.lng || $scope.listItem.lng,
							category:($('#edit-item-category').val()==="General"?7:$('#edit-item-category').val())
						};
						var fd = new FormData();
						fd.append('title', values.title);
						fd.append('description', values.description);
						fd.append('lat', values.lat);
						fd.append('lng', values.lng);
						if(imageSet) fd.append('test', $('#give-image-canvas-uploader')[0].toDataURL());
						fd.append('category', values.category);
						$http.post(config.api.host + '/api/v' + config.api.version + '/stuff/' + $scope.listItem.id, fd, {
							transformRequest: angular.identity,
							headers: {'Content-Type': undefined}
						}).success(function(data) {
							if(!data.err) {
								$scope.listItem.title = values.title;
								$scope.listItem.description = values.description;
								$scope.listItem.lat = values.lat;
								$scope.listItem.lng = values.lng;
								$scope.listItem.category = values.category;
							}
							$u.toast('Changes have been saved.');
							$('#my-item-header-text').text(values.title);
							$('#my-item-header-text').text(values.title);
							$('#post-item-'+$stateParams.id+' .get-stuff-item-info div').text(values.title);
							if(imageSet) {
								$('#my-item-single-container-'+$stateParams.id).attr('src', $('#give-image-canvas-uploader')[0].toDataURL());
								$('#post-item-'+$stateParams.id+' img').attr('src', $('#give-image-canvas-uploader')[0].toDataURL());
							}
							exitEdit();
						});
					};
					var cancelUpdate = function() {
						exitEdit();
					};
					var getLocation = function() {
						$('#give-location-container').css({
							'opacity':1,
							'transform':'translate3d(0px,0%,0)',
							'pointer-events':'all'
						});
						initStep2();
					};
					var acceptLocation = function() {
						$('#tab-content-container').css({'pointer-events':''});
						$('#give-location-container').css({
							'opacity':0.0001,
							'transform':'translate3d(0px,10%,0)',
							'pointer-events':'none'
						});
						setMarker();
					};
					var rejectLocation = function() {
						$('#tab-content-container').css({'pointer-events':''});
						$('#give-location-container').css({
							'opacity':0.0001,
							'transform':'translate3d(0px,10%,0)',
							'pointer-events':'none'
						});
						$('#center-marker').removeClass('dropped');
						$timeout(function() {
							requestAnimationFrame(function() {
								$('#center-marker').css({'display':'none'});
							});
						}, 250);
					};
					$scope.getPhoto = function(){
						$('#give-image-select').click();
					};
					$scope.acceptPhoto = function() {
						imageSet = true;
						$('#edit-item-image').css('background-image', 'url('+$('#give-image-canvas-uploader')[0].toDataURL()+')');
						$('#edit-item-image-container').css({
							'pointer-events':'none'
						});
						$('#give-photo-button').removeClass('sm-hidden');
						$('#give-image-verify-container').removeClass('visible');
						$timeout(function() {
							requestAnimationFrame(function() {
								$('#give-image-verify').css({'background-image': ''});
								$('#give-image-verify-container').css({'display':'none'});
							});
						},260);
					};
					$('#get-single-item-edit-dibs-button'+$stateParams.id+', #my-item-edit-button').on('click', edit);
					$('#get-single-item-conversation-button'+$scope.listItem.id + ', #get-single-item-conversation-popup'+$scope.listItem.id).on('click', goToConversation);
					$('#back-to-my-stuff').on('click', backToMyStuff);
					$('#my-item-menu').on('click', openMenu);
					$('#edit-image-button').on('click', $scope.getPhoto);
					$('#edit-location-button').on('click', getLocation);
					$('#back-to-my-item').on('click', exitEdit);
					$('#my-item-edit-save').on('click', updateItem);
					$('#my-item-edit-cancel').on('click', cancelUpdate);


					$('#my-item-undibs-big'+$stateParams.id).on('click', openUndibsModal);
					$('#my-item-undibs'+$stateParams.id).on('click', openUndibsModal);
					$('#my-item-reject'+$stateParams.id).on('click', openRejectModal);
					$('#my-item-delete'+$stateParams.id).on('click', openDeleteModal);
					$('#my-item-complete'+$stateParams.id).on('click', openCompleteModal);




					//$('#get-single-item-conversation-button'+$stateParams.id)
					$('#give-image-select').change(function(event) {
						if (this.files && this.files[0]) {
							$('#edit-item-image-container').css({
								'pointer-events':'all'
							});
							var loadingImage = loadImage(this.files[0], function(img) {
								requestAnimationFrame(function() {
									$('#give-image-verify-container').css({'display':'block'});
									requestAnimationFrame(function() {
										var canvas1 = $('#give-image-canvas')[0];
										var canvas2 = $('#give-image-canvas-uploader')[0];
										canvas1.width = $('#give-image-canvas').width();
										canvas1.height = $('#give-image-canvas').height();
										canvas2.width = img.width;
										canvas2.height = img.height;
										var ctx1 = canvas1.getContext('2d');
										var ctx2 = canvas2.getContext('2d');
										var w = canvas1.width/img.width;
										ctx1.drawImage(img, (canvas1.width/2)-(img.width*w)/2, (canvas1.height/2)-(img.height*w)/2, img.width*w, img.height*w);
										ctx2.drawImage(img,0,0,img.width,img.height);
										$('#give-image-verify-container').addClass('visible');
										$('#give-photo-button').addClass('sm-hidden');
									});
								});
							},
							{maxWidth: 450,orientation:true});
						}
					});
					$scope.rejectPhoto = function() {
						$('#edit-item-image-container').css({
							'pointer-events':'none'
						});
						$('#give-photo-button').removeClass('sm-hidden');
						$('#give-image-verify-container').removeClass('visible');
						$timeout(function() {
							requestAnimationFrame(function() {
								$('#give-image-verify').css({'background-image': ''});
								$('#give-image-verify-container').css({'display':'none'});
							});
							var input = $('#give-image-select')[0];
							try{
								input.value = '';
								if(input.value) {
									input.type = 'text';
									input.type = 'file';
								}
							}catch(e){}
						},260);
					};
					$('#give-photo-button').on('click', $scope.getPhoto);
					$('#edit-accept-photo').on('click', $scope.acceptPhoto);
					$('#edit-reject-photo').on('click', $scope.rejectPhoto);
					$('#edit-accept-location').on('click', acceptLocation);
					$('#edit-reject-location').on('click', rejectLocation);
					$('#back-to-my-stuff').on('click', exitEdit);
				}
			});
			var checkScroll = function() {
				var div = $scope.detailsContainer[0];
				var hasVerticalScrollbar = div.scrollHeight > div.clientHeight;
			};
			var goToConversation = function() {
				$state.go('stuff.my.items.item.conversation');
			};
			var archive = function() {
				$http.delete(config.api.host + '/api/v' + config.api.version + '/stuff/id/' + $scope.listItem.id, {}, {
					headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},transformRequest: function(data) {return $.param(data);}
				}).success(function(data) {
					if(!data.err) {
						$('#post-item-'+$scope.listItem.id).parent().parent().remove();
						requestAnimationFrame(function(){
							$('.masonry-grid').isotope({
								columnWidth: $('.masonry-grid').width()/2,
								itemSelector: '.masonry-grid-item',
								getSortData: {
									number: '.number parseInt'
								},
								sortBy: 'number',
								isAnimated: true
							});
							setTimeout(function() {
								$state.go('stuff.my.items');
							}, 250);
						});
					}
				});
			};
			var reject = function() {
				$http.delete(config.api.host + '/api/v' + config.api.version + '/dibs/reject/' + $scope.listItem.id, {}, {
					headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},transformRequest: function(data) {return $.param(data);}
				}).success(function(data) {
					if(!data.err) {
						$('#post-item-'+$scope.listItem.id).parent().parent().remove();
						requestAnimationFrame(function(){
							$('.masonry-grid').isotope({
								columnWidth: $('.masonry-grid').width()/2,
								itemSelector: '.masonry-grid-item',
								getSortData: {
									number: '.number parseInt'
								},
								sortBy: 'number',
								isAnimated: true
							});
							setTimeout(function() {
								$state.go('stuff.my.items');
								$u.toast('You\'ve rejected this Dibs. Your item will be re-mapped shortly.');
							}, 250);
						});
					}
				});
			};
			var backToMyStuff = function() {
				$state.go('stuff.my.items');
			};
			var edit = function() {
				$('option:first-child').text($scope.listItem.category);
				$('option').attr('selected', 'selected');
				$('option:first-child').attr('selected', 'selected');
				$('.edit-item-single-details-container').removeClass('sm-hidden');
				$scope.editContainerHeader.css({
					'opacity':1,
					'pointer-events':'all'
				});
			};
			var exitEdit = function() {
				$('#tab-content-container').css({'pointer-events':'all'});
				$('.edit-item-single-details-container').addClass('sm-hidden');
				$scope.editContainerHeader.css({
					'opacity':0.0001,
					'pointer-events':'none'
				});
			};
			var openMenu = function() {
				$('#dropdown-menu').removeClass('hidden-popup');
				requestAnimationFrame(function() {
					$('body').one('click', function() {
						$('#dropdown-menu').addClass('hidden-popup');
					});
				});
			};
			var undibs = function() {
				$http.post(config.api.host + '/api/v' + config.api.version + '/undib/' + $scope.listItem.id, {}, {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					},
					transformRequest: function(data) {
						return $.param(data);
					}
				}).success(function(data) {
					if(!data.err) {
						$('#post-item-'+$scope.listItem.id).parent().parent().remove();
						requestAnimationFrame(function(){
							$('.masonry-grid').isotope({
								columnWidth: $('.masonry-grid').width()/2,
								itemSelector: '.masonry-grid-item',
								getSortData: {
									number: '.number parseInt'
								},
								sortBy: 'number',
								isAnimated: true
							});
							setTimeout(function() {
								$state.go('stuff.my.items');
							}, 250);
						});
					}
				});
			};
			function openUndibsModal() {
				var undibsBodyTemplate = 'Are you sure you want to unDibs <i>{{title}}</i>?  This cannot be undone.';
				$('#undibs-confirm-modal-body').html(undibsBodyTemplate.replace('{{title}}', data.res.title));
				$('#my-item-undibs-cancel').on('click', undibsCancel);
				$('#my-item-undibs-confirm').on('click', undibsConfirm);
				$u.modal.open('undibs-confirm-modal', function() {
					$('#my-item-undibs-cancel').off('click', undibsCancel);
					$('#my-item-undibs-confirm').off('click', undibsConfirm);
				});
			}
			function undibsCancel() {
				$u.modal.close('undibs-confirm-modal');
			}
			function undibsConfirm() {
				$u.modal.close('undibs-confirm-modal');
				$u.api.undibsStuffById(data.res.id, function() {
					$state.go('stuff.my.items');
					$('#post-item-'+data.res.id).parent().parent().remove();
					$u.toast('You have successfully unDibs\'d <i>'+data.res.title+'</i>');
					requestAnimationFrame(function(){$(window).resize();});
				});
			}
			function openRejectModal() {
				var rejectBodyTemplate = 'Are you sure you want to reject <i>{{uname}}</i>\'s Dibs for your item <i>{{title}}</i>? This cannot be undone.'; //dibber uname
				$('#reject-confirm-modal-body').html(rejectBodyTemplate.replace('{{title}}', data.res.title).replace('{{uname}}', data.res.users[data.res.dibber_id]));
				$('#my-item-reject-cancel').on('click', rejectCancel);
				$('#my-item-reject-confirm').on('click', rejectConfirm);
				$u.modal.open('reject-confirm-modal', function() {
					$('#my-item-reject-cancel').off('click', rejectCancel);
					$('#my-item-reject-confirm').off('click', rejectConfirm);
				});
			}
			function rejectCancel() {
				$u.modal.close('reject-confirm-modal');
			}
			function rejectConfirm() {
				$u.modal.close('reject-confirm-modal');
				$u.api.rejectStuffById(data.res.id, function() {
					$state.go('stuff.my.items');
					$u.toast('You have rejected <i>'+data.res.user[data.res.dibber_id]+'</i>\'s Dibs for <i>'+data.res.title+'</i>');
				});
			}
			function openDeleteModal() {
				var deleteBodyTemplate = 'Are you sure you want to delete your item <i>{{title}}</i>? This cannot be undone.';
				$('#delete-confirm-modal-body').html(deleteBodyTemplate.replace('{{title}}', data.res.title));
				$('#my-item-delete-cancel').on('click', deleteCancel);
				$('#my-item-delete-confirm').on('click', deleteConfirm);
				$u.modal.open('delete-confirm-modal', function() {
					$('#my-item-delete-cancel').off('click', deleteCancel);
					$('#my-item-delete-confirm').off('click', deleteConfirm);
				});
			}
			function deleteCancel() {
				$u.modal.close('delete-confirm-modal');
			}
			function deleteConfirm() {
				$u.modal.close('delete-confirm-modal');
				$u.api.deleteStuffById(data.res.id, function() {
					$state.go('stuff.my.items');
					$('#post-item-'+data.res.id).parent().parent().remove();
					$u.toast('Your listing has been removed.');
					requestAnimationFrame(function(){$(window).resize();});
				});
			}
			function openCompleteModal() {
				var completeBodyTemplate = data.res.type==='lister'?'Have you given <i>{{dibber}}</i> your item <i>{{title}}</i>?':'Have you received <i>{{title}}</i> from <i>{{lister}}</i>?';
				$('#complete-confirm-modal-body').html(completeBodyTemplate.replace('{{title}}', data.res.title).replace('{{dibber}}', data.res.users[data.res.dibber_id]).replace('{{lister}}', data.res.users[data.res.user_id]));
				$('#my-item-complete-cancel').on('click', completeCancel);
				$('#my-item-complete-confirm').on('click', completeConfirm);
				$u.modal.open('complete-confirm-modal', function() {
					$('#my-item-complete-cancel').off('click', completeCancel);
					$('#my-item-complete-confirm').off('click', completeConfirm);
				});
			}
			function completeCancel() {
				$u.modal.close('complete-confirm-modal');
			}
			function completeConfirm() {
				$u.modal.close('complete-confirm-modal');
				$u.api.completeStuffById(data.res.id, function() {
					$state.go('stuff.my.items');
					$('#post-item-'+data.res.id).parent().parent().remove();
					$u.toast('Dibs for <i>'+data.res.title+'</i> has been completed!');
					requestAnimationFrame(function(){$(window).resize();});
				});
			}

			$scope.$on('$destroy', function() {
				$('#my-item-undibs-big'+$stateParams.id).off('click', openUndibsModal);
				$('#my-item-undibs'+$stateParams.id).off('click', openUndibsModal);
				$('#my-item-reject'+$stateParams.id).off('click', openRejectModal);
				$('#my-item-delete'+$stateParams.id).off('click', openDeleteModal);
				$('#my-item-complete'+$stateParams.id).off('click', openCompleteModal);
				$('#tab-content-container').css({'pointer-events':'all'});
				$('#get-single-item-conversation-button'+$scope.listItem.id).off('click', goToConversation);
				$('#get-stuff-back-button-container').addClass('sm-hidden');
				$('.get-stuff-back-button').addClass('sm-hidden');
				$('#get-stuff-item-title').addClass('sm-hidden');
				//$('#get-single-item-dibs-button'+$stateParams.id).off('click', dibs);
				if($('#post-item-' + $stateParams.id).length) {
					$scope.imageContainer.css({
						'transform' : 'translate3d(' + ($('#post-item-' + $stateParams.id).offset().left - $('#masonry-container').offset().left)+'px, '+($('#post-item-' + $stateParams.id).offset().top - $('#masonry-container').offset().top-36) + 'px, ' + '0)'
					});
				} else {
					$scope.imageContainer.css({
						'transform' : 'translate3d(0px, -100%, 0)'
					});
				}
				$scope.titleHeader.css({transform:'translate3d(0px, -100%, 0)'});
				$scope.containerBackground.addClass('sm-hidden');
				$scope.detailsContainer.addClass('sm-hidden');
				$scope.singleItem.css({
					'transform':'scale3d('+$scope.imgScale+', '+$scope.imgScale+', 1) translate3d(0px, 0px, 0)',
					'z-index': '2'
				});
				$('.get-single-item-description, .get-single-item-dibs-button').addClass('sm-hidden');
				$scope.editContainer.css({opacity:0.0001});
				setTimeout(function() {
					$('#post-item-'+$stateParams.id + ' img').css({'opacity': ''});
					requestAnimationFrame(function() {
						requestAnimationFrame(function() {
							$scope.container.remove();
						});
					});
				}, 250);
			});
		}
	});
}
/* jshint ignore:start */
function getWordsBetweenCurlies(str) {
	var results = [], re = /{{([^}]+)}}/g, text;
	while(text = re.exec(str)) results.push(text[1]);
	return results;
}
/* jshint ignore:end */
function watchSize() {
	if(window.width > 436) $('#tab-content-container').css({'pointer-events':''});
	else $('#tab-content-container').css({'pointer-events':'none'});
}
