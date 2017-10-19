(function() {

	angular.module('fui').directive('dialogue', dialogueDirective);

	function dialogueDirective() {
		return {
			restrict: 'E',
			transclude: 'element',
			controller: DialogueController
		};
	}

	function DialogueController($compile, $element, $attrs, $transclude, $animate) {
		var $layer, $dialogue, transcludeScope;

		this.$onInit = init;
		this.$open = open;
		this.$close = close;
		this.$onDestroy = destroy;

		function init() {
			$element.appendTo(document.body);
			$attrs.$observe('open', function(isOpen) {
				if (isOpen !== undefined && isOpen !== false) {
					open();
				} else {
					close();
				}
			});
		}

		function open() {
			if (!$layer) {
				if (!$element.is(':last-child')) {
					$element.appendTo(document.body)
				}
				$transclude(function(clone, scope) {
					$dialogue = clone;
					$layer = $compile('<layer ng-animate-children/>')(scope);
					$animate.enter($layer, null, $element);
					$animate.enter($dialogue, $layer);
					transcludeScope = scope;
				});
			}
		}

		function close() {
			if ($layer) {
				$animate.leave($layer);
				$animate.leave($dialogue);
				$layer = null;
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

	DialogueController.$inject = ['$compile', '$element', '$attrs', '$transclude', '$animate'];

})();