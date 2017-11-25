(function() {

	angular.module('fui').directive('checkbox', checkboxDirective);

	function checkboxDirective() {
		return {
			restrict: 'E',
			require: '?^ngModel',
			link: {
				pre: preLink
			}
		};
	}

	function preLink(scope, element, attrs, ngModel) {
		if (!ngModel || ngModel.$$element === element) {
			boolModelLink(scope, element, attrs, ngModel);
		} else {
			arrayModelLink(scope, element, attrs, ngModel);
		}
	}

	function boolModelLink(scope, element, attrs, ngModel) {
		if (ngModel) {
			scope.$watch(function() {
				return ngModel.$viewValue;
			}, function(value) {
				attrs.$set('checked', !!value);
			});
		}

		element.on('click', clickListener);

		function clickListener(e) {
			if (attrs.disabled === undefined || attrs.disabled === false) {
				if (ngModel) {
					ngModel.$setViewValue(!ngModel.$viewValue, e);
				} else {
					attrs.$set('checked', attrs.checked === undefined || attrs.checked === false);
				}
			}
		}
	}

	function arrayModelLink(scope, element, attrs, ngModel) {

		var value;

		if (attrs.ngValue !== undefined) {
			attrs.$observe('value', function(newValue) {
				value = newValue;
				render();
			});
		} else if (attrs.value !== undefined) {
			value = attrs.value;
		} else {
			value = element.text();
		}

		scope.$watchCollection(function() {
			return ngModel.$viewValue;
		}, render);

		function render() {
			var modelValue = ngModel.$viewValue;
			attrs.$set('checked', modelValue && angular.isArray(modelValue) && modelValue.indexOf(value) >= 0);
		}

		element.on('click', clickListener);

		function clickListener(e) {
			if (attrs.disabled === undefined || attrs.disabled === false) {
				if (ngModel) {
					var values = [];
					if (ngModel.$viewValue && angular.isArray(ngModel.$viewValue)) {
						values = values.concat(ngModel.$viewValue);
					}
					if (attrs.checked) {
						var index = values.indexOf(value);
						if (index >= 0) {
							values.splice(index, 1);
						}
					} else {
						values.push(value);
					}
					ngModel.$setViewValue(values, e);
				} else {
					attrs.$set('checked', attrs.checked === undefined || attrs.checked === false);
				}
			}
		}
	}

})();