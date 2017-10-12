(function() {

	angular.module('fui').directive('layer', layerDirective);

	function layerDirective() {
		return {
			restrict: 'E',
			priority: 1000,
			transclude: 'element',
			controller: LayerController
		};
	}

	function LayerController($scope, $element, $attrs, $parse, $transclude, $animate) {

		var layerElement, layerScope, ctrl = this;

		ctrl.$open = open;
		ctrl.$close = close;
		ctrl.$onInit = onInit;
		ctrl.$onDestroy = onDestroy;

		if ($attrs.name) {
			var fn = $parse($attrs.name);
			if (fn.assign) {
				fn.assign($scope, ctrl);
			}
		}

		function onInit() {
			$scope.$eval($attrs.onInit, {$layer: ctrl});
		}

		function onOpen() {
			$scope.$eval($attrs.onOpen);
		}

		function onClose() {
			$scope.$eval($attrs.onClose);
		}

		function onDestroy() {
			$element.remove();
			close();
		}

		function open() {
			if (!layerElement) {
				if (!$element.is(':last-child')) {
					$element.appendTo($element.parent());
				}
				$transclude(function(clone, scope) {
					layerElement = clone.addClass('open');
					$animate.enter(layerElement, $element.parent(), $element);
					layerScope = scope;
					layerScope.$layer = ctrl;
				});
				onOpen();
			}
		}

		function close() {
			if (layerElement) {
				$animate.leave(layerElement);
				layerElement = null;
				layerScope.$destroy();
				layerScope = null;
				onClose();
			}
		}
	}

	LayerController.$inject = ['$scope', '$element', '$attrs', '$parse', '$transclude', '$animate'];

})();