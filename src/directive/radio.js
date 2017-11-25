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

	function preLink(scope, element, attrs, ngModel) {

		var value;

		if (ngModel) {
			if (attrs.ngValue !== undefined) {
				attrs.$observe('value', function(newValue) {
					value = newValue;
					attrs.$set('checked', ngModel.$viewValue === newValue);
				});
			} else if (attrs.value !== undefined) {
				value = attrs.value;
			} else {
				value = element.text();
			}
			scope.$watch(function() {
				return ngModel.$viewValue;
			}, function(newValue) {
				attrs.$set('checked', newValue === value);
			});
		}

		element.on('click', clickListener);

		function clickListener(e) {
			if (attrs.disabled === undefined || attrs.disabled === false) {
				if (ngModel) {
					if (attrs.checked) {
						if (ngModel.$$attr.required === true) {
							return;
						}
						ngModel.$setViewValue(undefined, e);
					} else {
						ngModel.$setViewValue(value, e);
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