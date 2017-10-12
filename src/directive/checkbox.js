(function() {

	angular.module('fui').directive('checkbox', checkboxDirective);

	function checkboxDirective() {
		return {
			restrict: 'E',
			require: '?ngModel',
			link: {
				pre: preLink
			}
		};
	}

	function preLink(scope, element, attrs, ctrl) {

		var modelValue, nodeValue;

		if (ctrl) {

			if (attrs.value === undefined) {
				ctrl.$formatters.push(boolValueFormatter);
			} else {
				ctrl.$formatters.push(arrayValueFormatter);
				ctrl.$parsers.push(arrayValueParser);
				if (attrs.value) {
					nodeValue = scope.$eval(attrs.value);
				} else {
					nodeValue = element.text();
				}
			}

			ctrl.$render = render;
		}

		element.on('click', listener);

		function boolValueFormatter(value) {
			return !!value;
		}

		function arrayValueFormatter(value) {
			modelValue = value;
			return angular.isArray(modelValue) && modelValue.indexOf(nodeValue) >= 0;
		}

		function arrayValueParser(value) {
			if (value) {
				if (angular.isArray(modelValue)) {
					modelValue.push(nodeValue);
				} else {
					modelValue = [nodeValue];
				}
			} else if (angular.isArray(modelValue)) {
				var index = modelValue.indexOf(nodeValue);
				if (index >= 0) {
					modelValue.splice(index, 1);
				}
			}
			return modelValue;
		}

		function render() {
			attrs.$set('checked', ctrl.$viewValue);
		}

		function listener() {
			if (attrs.disabled === undefined || attrs.disabled === false) {
				if (ctrl) {
					ctrl.$setViewValue(!ctrl.$viewValue);
					ctrl.$render();
				} else {
					attrs.$set('checked', attrs.checked === undefined || attrs.checked === false);
				}
			}
		}
	}

})();