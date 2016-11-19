(function(window) {
	'use strict';
	window.$u = function(){
		var $u = {};
		$u.modal = function() {
			var bgCloseCallback;
			document.addEventListener('DOMContentLoaded', function() {
				document.getElementById('modal-bg').addEventListener('click', function(){
					if(bgCloseCallback) {
						requestAnimationFrame(function() {
							requestAnimationFrame(bgCloseCallback);
						});
					}
					document.getElementById('modal-bg').className += ' modal-bg-hidden';
					var modals = document.getElementsByClassName('modal-window');
					for(var i = 0; i < modals.length; i++) {
						document.getElementById(modals[i].id).className += ' modal-window-hidden';
					}
				}, false);
			});
			return {
				open : function(id, callback) {
					bgCloseCallback = callback || undefined;
					$('#modal-bg').removeClass('modal-bg-hidden');
					$('#'+id).removeClass('modal-window-hidden');
				},
				close : function(id, callback) {
					$('#modal-bg').addClass('modal-bg-hidden');
					$('#'+id).addClass('modal-window-hidden');
					if(callback) {
						requestAnimationFrame(function() {
							requestAnimationFrame(callback);
						});
					}
				}
			};
		}();
		$u.step = function() {
			var stepObjects = {};
			function verifyStep(stepName, callback) {
				if(stepName && stepObjects[stepName]) return callback();
				else console.log('ERROR: Step "' +stepName+ '" does not exist');
			}
			return {
				init : function(stepObject){
					stepObjects[stepObject.name] = {
						currentStep: 1,
						length: $('#'+stepObject.name).children('.step-page').length,
						reset: stepObject.reset,
						animation: stepObject.animation || 'animation1',
						duration: stepObject.duration || 250
					};
				},
				next : function(stepContainer) {
					verifyStep(stepContainer, function() {
						if(stepObjects[stepContainer].length < stepObjects[stepContainer].currentStep+1) return console.log('ERROR: Step out of bounds for "'+stepContainer+'"');
						stepObjects[stepContainer].currentStep+=1;
						var foundStep = false;
						var foundNextStep = false;
						$('#'+stepContainer+' .step-page').each(function(i, e) {
							if(foundStep && !foundNextStep) {
								foundNextStep = true;
								$(e).removeClass('unactive').removeClass('hidden').addClass('active');
							}
							if(!foundStep && $(e).hasClass('active')) {
								foundStep = true;
								$(e).addClass('unactive').addClass('hidden').removeClass('active');
							}
						});
					});
				},
				prev : function(stepContainer) {
					verifyStep(stepContainer, function() {
						if(0 >= stepObjects[stepContainer].currentStep - 1) return console.log('ERROR: Step out of bounds for "'+stepContainer+'"');
						stepObjects[stepContainer].currentStep-=1;
						var foundStep = false;
						var foundPrevStep = false;
						$($('#'+stepContainer+' .step-page').get().reverse()).each(function(i, e) {
							if(foundStep && !foundPrevStep) {
								foundPrevStep = true;
								$(e).removeClass('unactive').removeClass('hidden').addClass('active');
							}
							if(!foundStep && $(e).hasClass('active')) {
								foundStep = true;
								$(e).removeClass('unactive').addClass('hidden').removeClass('active');
							}
						});
					});
				},
				goToStep : function(stepContainer, step) {
					verifyStep(stepContainer, function() {
						if(!step) return console.log('ERROR:  No step number provided in goToStep for "'+stepContainer+'"');
						if(step <= 0 || step > stepObjects[stepContainer].length) return console.log('ERROR:  Step out of bounds in goToStep for "'+stepContainer+'"');
						if(step === stepObjects[stepContainer].currentStep) return console.log('WARNING:  goToStep did nothing.  Already at step ' + step);
						var loopObject;
						var objectToMove;
						var stepFound = false;
						var next = true;
						if(step > stepObjects[stepContainer].currentStep) {
							loopObject = $('#'+stepContainer+' .step-page');
							objectsToMove = step - stepObjects[stepContainer].currentStep;
							next = true;
						}
						else if(step < stepObjects[stepContainer].currentStep) {
							loopObject = $($('#'+stepContainer+' .step-page').get().reverse());
							objectsToMove = stepObjects[stepContainer].currentStep - step;
							next = false;
						}
						stepObjects[stepContainer].currentStep = step;
						loopObject.each(function(i,e) {
							if(stepFound && objectsToMove === 1) {
								objectsToMove--;
								$(e).addClass('active').removeClass('hidden').removeClass('unactive');
							}
							if(stepFound && objectsToMove !== 0) {
								objectsToMove--;
								$(e).removeClass('active').addClass('hidden');
								if(next) $(e).addClass('unactive');
								else $(e).removeClass('unactive');
							}
							if(!stepFound && $(e).hasClass('active')) {
								stepFound = true;
								$(e).addClass('hidden').removeClass('active');
								if(next) $(e).addClass('unactive');
								else $(e).removeClass('unactive');
							}
						});
					});
				},
				currentStep : function(stepContainer) {
					return verifyStep(stepContainer, function() {
						return stepObjects[stepContainer].currentStep;
					});
				},
				reset : function(stepContainer) {
					verifyStep(stepContainer, function() {
						$('#'+stepContainer+' .step-page').each(function(i, e) {
							if(i === 0) $(e).addClass('active').removeClass('hidden').removeClass('unactive');
							else $(e).removeClass('active').addClass('hidden').addClass('unactive');
						});
						stepObjects[stepContainer].reset && stepObjects[stepContainer].reset(); // jshint ignore:line
					});
				},
				destroy : function(stepContainer) {
					verifyStep(stepContainer, function() {
						$('#'+stepContainer+' .step-page').each(function(i, e) {
							if(i === 0) $(e).addClass('active').removeClass('hidden').removeClass('unactive');
							else $(e).removeClass('active').addClass('hidden').addClass('unactive');
						});
						stepObjects[stepContainer].reset && stepObjects[stepContainer].reset(); // jshint ignore:line
						delete stepObjects[stepContainer];
					});
				}
			};
		}();
		$u.api = function() {
			function returnStuff(type, url, obj, cb) {
				if(typeof obj === 'function') {
					cb = obj;
					obj = {};
				}
				else if(typeof obj === 'undefined') {
					obj = {};
					cb = function(){};
				}
				$[type](url, obj, function(data) {
					if(!data.res && !data.err) return cb(data);
					if(data.err) return cb(data.err);
					cb(null, data.res);
				});
			}
			return {
				getStuff : function(cb) {returnStuff('get', '/api/v1/stuff', cb);},
				getStuffById : function(id, cb) {returnStuff('get', '/api/v1/stuff/id/'+id, cb);},
				getMyStuff : function(cb) {returnStuff('get', '/api/v1/stuff/my', cb);},
				getMyStuffById : function(id, cb) {returnStuff('get', '/api/v1/stuff/my/id/'+id, cb);},
				//getStuffByLocation : function(id, cb) {returnStuff('get', '/api/v1/', cb);},
				addStuff : function(fd, cb) {returnStuff('post', '/api/v1/stuff', fd, cb);},
				editStuffById : function(id, fd, cb) {returnStuff('post', '/api/v1/stuff/'+id, fd, cb);},
				deleteStuffById : function(id, cb) {returnStuff('delete', '/api/v1/id/'+id, cb);},
				getCategories : function(cb) {returnStuff('get', '/api/v1/categories', cb);},
				getAccountStatus : function(cb) {returnStuff('post', '/api/v1/account/status', cb);},
				addAccount : function(data, cb) {returnStuff('post', '/api/v1/account/register', data, cb);},
				getPasswordResetToken : function(email, cb) {returnStuff('post', '/api/v1/account/password/token', {email:email}, cb);},
				verifyPasswordResetToken : function(token, cb) {returnStuff('post', '/api/v1/account/password/verify', {passwordResetToken:token}, cb);},
				resetPassword : function(token, password, cb) {returnStuff('post', '/api/v1/account/password/reset', {passwordResetToken:token,password:password}, cb);},
				verifyEmail : function(token, cb) {returnStuff('post', '/api/v1/account/confirmation', {email_token:token}, cb);},
				login : function(data, cb) {returnStuff('post', '/api/v1/account/login', data, cb);},
				logout : function(cb) {returnStuff('post', '/api/v1/account/logout', cb);},
				getAccount : function(id, cb) {returnStuff('get', '/api/v1/account/info', cb);},
				editAccount : function(data, cb) {returnStuff('put', '/api/v1/account/info', data, cb);},
				// archiveAccount : function(cb) {returnStuff('delete', '/api/v1/account/info', cb);},
				dibsStuffById : function(id, cb) {returnStuff('post', '/api/v1/dibs/'+id, cb);},
				undibsStuffById : function(id, cb) {returnStuff('post', '/api/v1/undib/'+id, cb);},
				cancelDibsById : function(id, cb) {returnStuff('delete', '/api/v1/dibs/reject/'+id, cb);},
				// to be continued...
			};
		}();
		return $u;
	}();
}(window));
