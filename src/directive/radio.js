(function() {

	angular.module('fui').directive('radio', radioDirective);

	function radioDirective() {
		return {
			restrict: 'E',
			require: '?ngModel',
			link: {
				pre: preLink
			}
		};
	}

	function preLink(scope, element, attrs, ctrl) {

		var nodeValue;

		if (ctrl) {

			if (attrs.value !== undefined) {
				if (attrs.value) {
					nodeValue = scope.$eval(attrs.value);
				} else {
					nodeValue = element.text();
				}
			}

			ctrl.$formatters.push(valueFormatter);
			ctrl.$parsers.push(valueParser);
			ctrl.$render = render;

		}

		element.on('click', listener);

		function valueFormatter(value) {
			return value === nodeValue;
		}

		function valueParser(value) {
			return value ? nodeValue : null;
		}

		function render() {
			attrs.$set('checked', ctrl.$viewValue);
		}

		function listener() {
			if (attrs.disabled === undefined || attrs.disabled === false) {
				if (ctrl) {
					if (!ctrl.$viewValue || attrs.required === undefined || attrs.required === false) {
						ctrl.$setViewValue(!ctrl.$viewValue);
						ctrl.$render();
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