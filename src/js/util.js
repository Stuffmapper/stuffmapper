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
							requestAnimationFrame(function(){
								callback();
								bgCloseCallback();
							});
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
								$(e).removeClass('sm-unactive').removeClass('sm-hidden').addClass('sm-active');
							}
							if(!foundStep && $(e).hasClass('sm-active')) {
								foundStep = true;
								$(e).addClass('sm-unactive').addClass('sm-hidden').removeClass('sm-active');
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
								$(e).removeClass('sm-unactive').removeClass('sm-hidden').addClass('sm-active');
							}
							if(!foundStep && $(e).hasClass('sm-active')) {
								foundStep = true;
								$(e).removeClass('sm-unactive').addClass('sm-hidden').removeClass('sm-active');
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
								$(e).addClass('sm-active').removeClass('sm-hidden').removeClass('unactive');
							}
							if(stepFound && objectsToMove !== 0) {
								objectsToMove--;
								$(e).removeClass('sm-active').addClass('sm-hidden');
								if(next) $(e).addClass('sm-unactive');
								else $(e).removeClass('sm-unactive');
							}
							if(!stepFound && $(e).hasClass('sm-active')) {
								stepFound = true;
								$(e).addClass('sm-hidden').removeClass('sm-active');
								if(next) $(e).addClass('sm-unactive');
								else $(e).removeClass('sm-unactive');
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
							if(i === 0) $(e).addClass('sm-active').removeClass('sm-hidden').removeClass('sm-unactive');
							else $(e).removeClass('sm-active').addClass('sm-hidden').addClass('sm-unactive');
						});
						stepObjects[stepContainer].reset && stepObjects[stepContainer].reset(); // jshint ignore:line
					});
				},
				destroy : function(stepContainer) {
					verifyStep(stepContainer, function() {
						$('#'+stepContainer+' .step-page').each(function(i, e) {
							if(i === 0) $(e).addClass('sm-active').removeClass('sm-hidden').removeClass('sm-unactive');
							else $(e).removeClass('sm-active').addClass('sm-hidden').addClass('sm-unactive');
						});
						stepObjects[stepContainer].reset && stepObjects[stepContainer].reset(); // jshint ignore:line
						delete stepObjects[stepContainer];
					});
				}
			};
		}();
		$u.toast = function() {
			var toastQueue = [];
			var toastTimeout;
			var defaultToastTimeout = 5000;
			var toasting = false;
			function displayToast(toast) {
				var toastElement = document.createElement('div');
				toastElement.className = 'animate-250 sm-toast sm-hidden';
				toastElement.innerHTML = toast.msg;
				$('body').append(toastElement);
				setTimeout(function() {
					requestAnimationFrame(function() {
						toastElement.className = 'animate-250 sm-toast';
						setTimeout(function() {
							toastElement.className = 'animate-250 sm-toast sm-hidden';
							setTimeout($(toastElement).remove, 300);
							if(toastQueue.length) displayToast(toastQueue.shift());
							else toasting = false;
						}, toast.to || defaultToastTimeout);
					});
				}, 50);
			}
			return function(msg, to) {
				toastQueue.push({
					msg: msg,
					to: to || defaultToastTimeout
				});
				if(!toasting) {
					toasting = true;
					displayToast(toastQueue.shift());
				}
			};
		}();
		$u.api = function() {
			var apiVer = '/api/v1';
			function returnStuff(type, url, obj, cb) {
				if(typeof obj === 'function') {
					cb = obj;
					obj = {};
				}
				else if(typeof obj === 'undefined') {
					obj = {};
					cb = function(){};
				}
				$.ajax({
					url: url,
					data: obj,
					type: type,
					success: function(data) {
						if(!data.res && !data.err) return cb(data);
						if(data.err) return cb(data.err);
						cb(null, data.res);
					}
				});
			}
			return {
				getStuff : function(cb) {returnStuff('get', apiVer+'/stuff', cb);},
				getStuffById : function(id, cb) {returnStuff('get', apiVer+'/stuff/id/'+id, cb);},
				getMyStuff : function(cb) {returnStuff('get', apiVer+'/stuff/my', cb);},
				getMyStuffById : function(id, cb) {returnStuff('get', apiVer+'/stuff/my/id/'+id, cb);},
				//getStuffByLocation : function(id, cb) {returnStuff('get', apiVer+'/', cb);},
				addStuff : function(fd, cb) {returnStuff('post', apiVer+'/stuff', fd, cb);},
				editStuffById : function(id, fd, cb) {returnStuff('post', apiVer+'/stuff/'+id, fd, cb);},
				deleteStuffById : function(id, cb) {returnStuff('delete', apiVer+'/stuff/id/'+id, cb);},
				getCategories : function(cb) {returnStuff('get', apiVer+'/categories', cb);},
				getAccountStatus : function(cb) {returnStuff('post', apiVer+'/account/status', cb);},
				addAccount : function(data, cb) {returnStuff('post', apiVer+'/account/register', data, cb);},
				getPasswordResetToken : function(email, cb) {returnStuff('post', apiVer+'/account/password/token', {email:email}, cb);},
				verifyPasswordResetToken : function(token, cb) {returnStuff('post', apiVer+'/account/password/verify', {passwordResetToken:token}, cb);},
				resetPassword : function(token, password, cb) {returnStuff('post', apiVer+'/account/password/reset', {passwordResetToken:token,password:password}, cb);},
				verifyEmail : function(token, cb) {returnStuff('post', apiVer+'/account/confirmation', {email_token:token}, cb);},
				login : function(data, cb) {returnStuff('post', apiVer+'/account/login', data, cb);},
				logout : function(cb) {returnStuff('post', apiVer+'/account/logout', cb);},
				getAccount : function(id, cb) {returnStuff('get', apiVer+'/account/info', cb);},
				editAccount : function(data, cb) {returnStuff('put', apiVer+'/account/info', data, cb);},
				// archiveAccount : function(cb) {returnStuff('delete', apiVer+'/account/info', cb);},
				dibsStuffById : function(id, cb) {returnStuff('post', apiVer+'/dibs/'+id, cb);},
				undibsStuffById : function(id, cb) {returnStuff('post', apiVer+'/undib/'+id, cb);},
				rejectStuffById : function(id, cb) {returnStuff('delete', apiVer+'/dibs/reject/'+id, cb);},
				completeStuffById : function(id, cb) {returnStuff('post', apiVer+'/dibs/complete/'+id, cb);}
			};
		}();
		return $u;
	}();
}(window));
