(function() {

	angular.module('fui').directive('radio', radioDirective);

	function radioDirective() {
		return {
			restrict: 'E',
			require: '?^ngModel',
			link: {
				pre: preLink
			}
		};
	}

	function preLink(scope, element, attrs, ctrl) {

		var nodeValue;

		if (ctrl) {
			if (attrs.value !== undefined) {
				nodeValue = scope.$eval(attrs.value);
			} else {
				nodeValue = element.text();
			}
			scope.$watch(function() {
				return ctrl.$viewValue;
			}, function(value) {
				attrs.$set('checked', value === nodeValue);
			})
		}

		element.on('click', clickListener);

		function clickListener(e) {
			if (attrs.disabled === undefined || attrs.disabled === false) {
				if (ctrl) {
					if (attrs.checked) {
						if (attrs.required === undefined || attrs.required === false) {
							ctrl.$setViewValue(undefined, e);
						}
					} else {
						ctrl.$setViewValue(nodeValue, e);
					}
				} else {
					if (attrs.checked === undefined || attrs.checked === false || attrs.required === undefined || attrs.required === false) {
						attrs.$set('checked', attrs.checked === undefined || attrs.checked === false);
					}
				}
			}
		}
	}

})();