var element_directives = {
	smInputGroupButton : {
		scope:{
			placeholder: "@",
			width: "@",
			faicon: "@",
			submit: "&"
		},
		init: function() {
			(function ($) {
				var originalVal = $.fn.val;
				$.fn.val = function(value) {
					if (arguments.length >= 1) {
						if(this[0].className.indexOf('sm-text-input-group') > -1) {
							return $(this[0]).children('.sm-text-input-container').children('input, textarea').val(value);
						}
					}
					else {
						if(this[0].className.indexOf('sm-text-input-group') > -1) {
							return $(this[0]).children('.sm-text-input-container').children('input, textarea').val();
						}
					}
					return originalVal.apply(this, arguments);
				};
			})(jQuery);
			(function($){
				var originalFocus = $.fn.focus;
				$.fn.focus = function(callback){
					if(typeof callback != 'undefined'){
						if(this[0].className.indexOf('sm-text-input-group') > -1) {
							return $(this[0]).children('.sm-text-input-container').children('input').focus(callback);
						}
					}
					originalFocus.apply( this, arguments );
				};
			})(jQuery);
		},
		link: function(scope, element, attrs) {
			scope.faicon = scope.faicon || 'arrow-right';
			var smInputGroupInput = $(element).children('.sm-text-input-container').children('input');
			var smInputGroupButton = $(element).children('.sm-text-input-button');
			var onFocus = function(e) {
				if(!smInputGroupButton.hasClass('sm-text-input-button-active')) {
					smInputGroupButton.addClass('sm-text-input-button-active');
					$(element).addClass('sm-text-input-group-active');
				}
			};
			var onBlur = function(e) {
				if(smInputGroupInput.val()) {
					if(!smInputGroupButton.hasClass('sm-text-input-button-active')) {
						smInputGroupButton.addClass('sm-text-input-button-active');
						$(element).addClass('sm-text-input-group-active');
					}
				}
				else {
					smInputGroupButton.removeClass('sm-text-input-button-active');
					$(element).removeClass('sm-text-input-group-active');
				}
			};
			var onClick = function(e) {
				smInputGroupInput.blur();
				//if(smInputGroupInput.val()) {
					scope.submit();
				//}
			};
			var onKeydown = function(e) {
				if(e.which === 27) smInputGroupInput.blur();
				else if(e.which === 13) onClick();
			};
			smInputGroupInput.on('focus',onFocus);
			smInputGroupInput.on('blur',onBlur);
			smInputGroupButton.on('click',onClick);
			smInputGroupInput.on('keydown',onKeydown);
			element.on('$destroy', function() {
				smInputGroupInput.off('focus',onFocus);
				smInputGroupInput.off('blur',onBlur);
				smInputGroupButton.off('click',onClick);
				smInputGroupInput.off('keydown',onKeydown);
			});
		},
		template: [
			'<div style="width:{{width}};" class="sm-text-input-group sm-text-input-group-m">',
			'    <div class="sm-text-input-container">',
			'        <input placeholder="{{placeholder}}" class="sm-text-input">',
			'    </div>',
			'    <div class="sm-text-input-button">',
			'        <div class="sm-text-input-button-border"></div>',
			'        <i class="sm-text-input-button-icon fa fa-{{faicon}}"></i>',
			'    </div>',
			'</div>',
		].join('\n')
	},
	smTextareaGroupButton : {
		scope:{
			placeholder: "@",
			width: "@",
			faicon: "@",
			submit: "&"
		},
		link: function(scope, element, attrs) {
			scope.faicon = scope.faicon || 'arrow-right';
			var smInputGroupInput = $(element).children('.sm-text-input-container').children('textarea');
			var smInputGroupButton = $(element).children('.sm-text-input-button');
			var onFocus = function(e) {
				if(!smInputGroupButton.hasClass('sm-text-input-button-active')) {
					smInputGroupButton.addClass('sm-text-input-button-active');
					$(element).addClass('sm-text-input-group-active');
				}
			};
			var onBlur = function(e) {
				if(smInputGroupInput.val()) {
					if(!smInputGroupButton.hasClass('sm-text-input-button-active')) {
						smInputGroupButton.addClass('sm-text-input-button-active');
						$(element).addClass('sm-text-input-group-active');
					}
				}
				else {
					smInputGroupButton.removeClass('sm-text-input-button-active');
					$(element).removeClass('sm-text-input-group-active');
				}
			};
			var onClick = function(e) {
				//smInputGroupInput.blur();
				if(smInputGroupInput.val()) {
					scope.submit();
				}
			};
			var onKeydown = function(e) {
				if(e.which === 27) smInputGroupInput.blur();
				else if(e.which === 13) onClick();
			};
			smInputGroupInput.on('focus',onFocus);
			smInputGroupInput.on('blur',onBlur);
			smInputGroupButton.on('click',onClick);
			smInputGroupInput.on('keydown',onKeydown);
			element.on('$destroy', function() {
				smInputGroupInput.off('focus',onFocus);
				smInputGroupInput.off('blur',onBlur);
				smInputGroupButton.off('click',onClick);
				smInputGroupInput.off('keydown',onKeydown);
			});
		},
		template: [
			'<div style="width:{{width}};" class="sm-text-input-group sm-text-input-group-m">',
			'    <div class="sm-text-input-container">',
			'        <textarea rows="1" placeholder="{{placeholder}}" class="sm-text-input"></textarea>',
			'    </div>',
			'    <div class="sm-text-input-button">',
			'        <div class="sm-text-input-button-border"></div>',
			'        <i class="sm-text-input-button-icon fa fa-{{faicon}}"></i>',
			'    </div>',
			'</div>',
		].join('\n')
	},
	smSelect : {
		scope:{
			'selectModel':"=ngModel",
			'options':"=",
			'fullWidth':"@",
			'placeholder':'@',
		},
		require: 'ngModel',
		link: function(scope, element, attrs) {
			// $(element).children(select).change(function(e) {
			// });
			element.on('$destroy', function() {
			});
		},
		template: [
			'<div class="sm-select fa fa-chevron-down {{fullWidth===\'true\'?\'sm-select-full-width\':\'\'}}">',
			'    <select ng-model="selectModel" ng-options="v.value as v.name for v in options track by v.value">',
			'        <option value="" selected="selected">{{placeholder}}</option>',
			'    </select>',
			'</div>',
		].join('\n')
	},
	smCheckbox :{
		scope:{
			'checkboxModel':"=ngModel",
			'name':"@",
			'fullWidth':"@"
		},
		require: 'ngModel',
		link: function(scope, element, attrs) {
			element.on('$destroy', function() {
			});
		},
		template: [
			'<div class="sm-checkbox {{fullWidth===\'true\'?\'sm-checkbox-full-width\':\'\'}}">',
			'    <input id="{{name}}" type="checkbox" name="{{name}}" ng-model="checkboxModel" />',
			'    <label for="{{name}}" ng-transclude></label>',
			'</div>',
		].join('\n')
	}
};


Object.keys(element_directives).forEach(function(e) {
	if(element_directives[e].init) element_directives[e].init();
	stuffMapp.directive(e, function() {
		element_directives[e].restrict = "E";
		element_directives[e].replace = true;
		element_directives[e].transclude = true;
		return element_directives[e];
	});
});
