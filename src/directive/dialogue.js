(function() {

	angular.module('fui').directive('dialogue', dialogueDirective);

	function dialogueDirective() {
		return {
			restrict: 'E',
			transclude: 'element',
			controller: DialogueController
		};
	}

	function DialogueController($element, $attrs, $transclude, $animate) {
		var $dialogue, transcludeScope;

		this.$onInit = init;
		this.$open = open;
		this.$close = close;
		this.$onDestroy = destroy;

		function init() {
			$attrs.$observe('open', function(isOpen) {
				if (isOpen !== undefined && isOpen !== false) {
					open();
				} else {
					close();
				}
			});
		}

		function open() {
			if (!$dialogue) {
				$element.appendTo(document.body);
				$transclude(function(clone, scope) {
					var $wrapper = $('<dialogue-wrapper/>').insertAfter($element);
					$element.prevAll('dialogue-wrapper').removeClass('dimmer');
					$animate.addClass($wrapper, 'dimmer');
					$dialogue = clone;
					$animate.enter($dialogue, $wrapper);
					transcludeScope = scope;
				});
			}
		}

		function close() {
			if ($dialogue) {
				var $wrapper = $dialogue.parent();
				if ($wrapper.hasClass('dimmer')) {
					$element.prev().addClass('dimmer');
					$animate.removeClass($wrapper, 'dimmer');
				}
				$animate.leave($dialogue).then(function() {
					$wrapper.remove();
					$wrapper = null;
				});
				$dialogue = null;
				transcludeScope.$destroy();
				transcludeScope = null;
			}
		}

		function destroy() {
			close();
			$element.remove();
		}
	}

	DialogueController.$inject = ['$element', '$attrs', '$transclude', '$animate'];

})();