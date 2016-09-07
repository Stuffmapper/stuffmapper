(function(window, document) {
	var counterFlipperCSS = [
		'.counterContainer {',
		'	overflow: hidden;',
		'	-webkit-perspective: 120px;',
		'	-moz-perspective: 120px;',
		'	-ms-perspective: 120px;',
		'	-o-perspective: 120px;',
		'	perspective: 120px;',
		'	height:100%;',
		'	float:left;',
		'	position:relative;',
		'}',
		'.counter-flipper-sections {',
		'	position: relative;',
		'	left: 0px;',
		'	width: 100%;',
		'	height: 50%;',
		'	float: left;',
		'	overflow: hidden;',
		'}',
		'.counter-flipper-top {',
		'	top: 0px;',
		'}',
		'.counter-flipper-bottom {',
		'	bottom: 0px;',
		'}',
		'.counterElements {',
		'	position: absolute;',
		'	left: 50%;',
		'	text-align: center;',
		'	color: white;',
		'	display: block;',
		'	width: 80%;',
		'	height: 100%;',
		'	margin: 0 auto;',
		'	-webkit-transform: translateX(-50%) rotateX(0deg);',
		'	-moz-transform: translateX(-50%) rotateX(0deg);',
		'	-ms-transform: translateX(-50%) rotateX(0deg);',
		'	-o-transform: translateX(-50%) rotateX(0deg);',
		'	transform: translateX(-50%) rotateX(0deg);',
		'	-webkit-transition: all 125ms linear;',
		'	-moz-transition: all 125ms linear;',
		'	-ms-transition: all 125ms linear;',
		'	-o-transition: all 125ms linear;',
		'	transition: all 125ms linear;',
		'}',
		'.topElement {',
		'	-webkit-transform-origin: bottom;',
		'	-moz-transform-origin: bottom;',
		'	-ms-transform-origin: bottom;',
		'	-o-transform-origin: bottom;',
		'	transform-origin: bottom;',
		'	border-top-left-radius: 2px;',
		'	border-top-right-radius: 2px;',
		'}',
		'.bottomElement {',
		'	line-height: 0px;',
		'	-webkit-transform-origin: top;',
		'	-moz-transform-origin: top;',
		'	-ms-transform-origin: top;',
		'	-o-transform-origin: top;',
		'	transform-origin: top;',
		'	border-bottom-left-radius: 2px;',
		'	border-bottom-right-radius: 2px;',
		'}',
		'.topElementEnter {',
		'	-webkit-transform: translateX(-50%) rotateX(-91deg);',
		'	-moz-transform: translateX(-50%) rotateX(-91deg);',
		'	-ms-transform: translateX(-50%) rotateX(-91deg);',
		'	-o-transform: translateX(-50%) rotateX(-91deg);',
		'	transform: translateX(-50%) rotateX(-91deg);',
		'}',
		'.bottomElementEnter {',
		'	-webkit-transform: translateX(-50%) rotateX(91deg);',
		'	-moz-transform: translateX(-50%) rotateX(91deg);',
		'	-ms-transform: translateX(-50%) rotateX(91deg);',
		'	-o-transform: translateX(-50%) rotateX(91deg);',
		'	transform: translateX(-50%) rotateX(91deg);',
		'}'
	].join('\n');
	var counterFlipperStyle = document.createElement('style');
	counterFlipperStyle.type = 'text/css';
	if (counterFlipperStyle.styleSheet) {
		counterFlipperStyle.styleSheet.cssText = counterFlipperCSS;
	}
	else {
		counterFlipperStyle.appendChild(document.createTextNode(counterFlipperCSS));
	}
	var head = document.head || document.getElementsByTagName('head')[0];
	head.appendChild(counterFlipperStyle);
}(window, document));
var CounterFlipper = (function() {
	function CounterFlipper(id, startVal, counterLength) {
		var self = this;
		if(!(this instanceof CounterFlipper)){
			return new CounterFlipper(id, startVal, counterLength);
		}
		else {
			self.ready = false;
			self.updateQueue = [];
			if(document.readyState === "complete") {
				self.id = id;
				self.ele = document.getElementById(id);
				self.counterLength = counterLength;
				self.startVal = startVal;
				self.height = self.ele.offsetHeight || self.ele.clientHeight;
				create(self);
			}
			else {
				window.addEventListener("load", function(event) {
					self.id = id;
					self.ele = document.getElementById(id);
					self.counterLength = counterLength;
					self.startVal = startVal;
					self.height = self.ele.offsetHeight || self.ele.clientHeight;
					create(self);
					if(self.updateQueue.length) {
						setTimeout(function() {
							setCounter(self.updateQueue[0], false);
						}, 1000);
					}
				});
			}
			return {
				setCounter : function(n) { setCounter(self, n,true); },
				clear : function() { self.updateQueue=[];setCounter(self, 0,true); }
			};
		}
	}
	function create(self) {
		self.ele.innerHTML = [
			'<div class="counter-flipper-sections counter-flipper-top"></div>',
			'<div class="counter-flipper-sections counter-flipper-bottom"></div>'
		].join('\n');
		self.topSection = document.querySelectorAll("#" + self.id + " .counter-flipper-top")[0];
		self.bottomSection = document.querySelectorAll("#" + self.id + " .counter-flipper-bottom")[0];
		var topHTML = [];
		var bottomHTML = [];
		for(var i = 0; i < self.counterLength; i++) {
			topHTML.push([
				'<div id="'+self.id+'top'+i+'" class="counterContainer" style="width:'+100/self.counterLength+'%;">',
				'   <div class="topElement topElementEnter counterElements" style="line-height:'+self.height+'px;">0</div>',
				'</div>'
			].join('\n'));
			bottomHTML.push([
				'<div id="'+self.id+'bottom'+i+'" class="counterContainer" style="width:'+100/self.counterLength+'%;">',
				'   <div class="bottomElement bottomElementEnter counterElements">0</div>',
				'</div>'
			].join('\n'));
		}
		self.topSection.innerHTML = topHTML.join('\n');
		self.bottomSection.innerHTML = bottomHTML.join('\n');
		setTimeout(function() {
			var topElements = document.querySelectorAll('#'+self.id+' .topElement');
			var bottomElements = document.querySelectorAll('#'+self.id+' .bottomElement');
			Object.keys(topElements).forEach(function(e) {
				if(topElements[e].classList) {
					topElements[e].classList.remove('topElementEnter');
					bottomElements[e].classList.remove('bottomElementEnter');
				}
			});
			self.ready = true;
			if(self.updateQueue.length) setCounter(self, self.updateQueue[0],false);
		}, 1000);
	}
	function strToNode(s) {
		var div = document.createElement('div');
		div.innerHTML = s;
		return div.childNodes[0];
	}
	function setCounter(self, n, add) {
		if(add) self.updateQueue.push(n);
		if(!self.ready) return;
		else {
			self.ready = false;
			var str = n.toString();
			var strLen = str.length;
			if(strLen > self.counterLength)
			return {err : 'number is too large.'};
			else {
				var i;
				for(i = strLen; i <= self.counterLength; i++){
					str = '0' + str;
				}
				var bottomSections = [];
				var topSections = [];
				for(i = 0; i < self.counterLength; i++) {
					if(document.querySelector('#'+self.id+'top'+i+' '+'.topElement').innerHTML !== str.charAt(i+1)) {
						topSections.push(document.querySelector('#'+self.id+'top'+i+' '+'.topElement'));
						bottomSections.push(document.querySelector('#'+self.id+'bottom'+i+' '+'.bottomElement'));
						var topElement = document.getElementById(self.id+'top'+i);
						var bottomElement = document.getElementById(self.id+'bottom'+i);
						topElement.insertBefore(strToNode('<div class="topElement counterElements" style="line-height:'+self.height+'px;">'+str.charAt(i+1)+'</div>'), topSections[topSections.length - 1]);
						var bottomNode = strToNode('<div class="bottomElementEnter bottomElement counterElements">'+str.charAt(i+1)+'</div>');
						bottomElement.appendChild(bottomNode);
						topSections[topSections.length - 1].classList.add('topElementEnter');
						/* jshint ignore:start */
						setTimeout(function(){
							requestAnimationFrame(function() {
								var ele = document.querySelector('#'+self.id+' .bottomElement.bottomElementEnter');
								if(ele) {
									ele.classList.remove('bottomElementEnter');
								}
							});
						}, 50);
						/* jshint ignore:end */
					}
				}
				setTimeout(function() {
					requestAnimationFrame(function() {
						topSections.forEach(function(e) {
							e.remove();
						});
					});
				}, 250);
				setTimeout(function() {
					requestAnimationFrame(function() {
						bottomSections.forEach(function(e) {
							e.remove();
						});
						self.updateQueue.shift();
						self.ready = true;
						if(self.updateQueue.length) setCounter(self, self.updateQueue[0],false);
					});
				}, 500);
				return str;
			}
		}
	}
	return CounterFlipper;
})(this);
