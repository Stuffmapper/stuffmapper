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
					requestAnimationFrame(function() {
						requestAnimationFrame(function(){
							callback && callback();
							bgCloseCallback && bgCloseCallback();
							bgCloseCallback = null;
						});
					});
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


/*
* Date Format 1.2.3
* (c) 2007-2009 Steven Levithan <stevenlevithan.com>
* MIT license
*
* Includes enhancements by Scott Trenda <scott.trenda.net>
* and Kris Kowal <cixar.com/~kris.kowal/>
*
* Accepts a date, a mask, or a date and a mask.
* Returns a formatted version of the given date.
* The date defaults to the current date/time.
* The mask defaults to dateFormat.masks.default.
*/

var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
	timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
	timezoneClip = /[^-+\dA-Z]/g,
	pad = function (val, len) {
		val = String(val);
		len = len || 2;
		while (val.length < len) val = "0" + val;
		return val;
	};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
		d = date[_ + "Date"](),
		D = date[_ + "Day"](),
		m = date[_ + "Month"](),
		y = date[_ + "FullYear"](),
		H = date[_ + "Hours"](),
		M = date[_ + "Minutes"](),
		s = date[_ + "Seconds"](),
		L = date[_ + "Milliseconds"](),
		o = utc ? 0 : date.getTimezoneOffset(),
		flags = {
			d:    d,
			dd:   pad(d),
			ddd:  dF.i18n.dayNames[D],
			dddd: dF.i18n.dayNames[D + 7],
			m:    m + 1,
			mm:   pad(m + 1),
			mmm:  dF.i18n.monthNames[m],
			mmmm: dF.i18n.monthNames[m + 12],
			yy:   String(y).slice(2),
			yyyy: y,
			h:    H % 12 || 12,
			hh:   pad(H % 12 || 12),
			H:    H,
			HH:   pad(H),
			M:    M,
			MM:   pad(M),
			s:    s,
			ss:   pad(s),
			l:    pad(L, 3),
			L:    pad(L > 99 ? Math.round(L / 10) : L),
			t:    H < 12 ? "a"  : "p",
			tt:   H < 12 ? "am" : "pm",
			T:    H < 12 ? "A"  : "P",
			TT:   H < 12 ? "AM" : "PM",
			Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
			o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
			S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
		};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

// Fake localStorage implementation.
// Mimics localStorage, including events.
// It will work just like localStorage, except for the persistant storage part.
// https://gist.github.com/engelfrost/fd707819658f72b42f55
var fakeLocalStorage = function() {
	var fakeLocalStorage = {};
	var storage;

	// If Storage exists we modify it to write to our fakeLocalStorage object instead.
	// If Storage does not exist we create an empty object.
	if (window.Storage && window.localStorage) {
		storage = window.Storage.prototype;
	} else {
		// We don't bother implementing a fake Storage object
		window.localStorage = {};
		storage = window.localStorage;
	}

	// For older IE
	if (!window.location.origin) {
		window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
	}

	var dispatchStorageEvent = function(key, newValue) {
		var oldValue = (key == null) ? null : storage.getItem(key); // `==` to match both null and undefined
		var url = location.href.substr(location.origin.length);
		var storageEvent = document.createEvent('StorageEvent'); // For IE, http://stackoverflow.com/a/25514935/1214183

		storageEvent.initStorageEvent('storage', false, false, key, oldValue, newValue, url, null);
		window.dispatchEvent(storageEvent);
	};

	storage.key = function(i) {
		var key = Object.keys(fakeLocalStorage)[i];
		return typeof key === 'string' ? key : null;
	};

	storage.getItem = function(key) {
		return typeof fakeLocalStorage[key] === 'string' ? fakeLocalStorage[key] : null;
	};

	storage.setItem = function(key, value) {
		dispatchStorageEvent(key, value);
		fakeLocalStorage[key] = String(value);
	};

	storage.removeItem = function(key) {
		dispatchStorageEvent(key, null);
		delete fakeLocalStorage[key];
	};

	storage.clear = function() {
		dispatchStorageEvent(null, null);
		fakeLocalStorage = {};
	};
};

// Example of how to use it
if (typeof window.localStorage === 'object') {
	// Safari will throw a fit if we try to use localStorage.setItem in private browsing mode.
	try {
		localStorage.setItem('localStorageTest', 1);
		localStorage.removeItem('localStorageTest');
	} catch (e) {
		fakeLocalStorage();
	}
} else {
	// Use fake localStorage for any browser that does not support it.
	fakeLocalStorage();
}
