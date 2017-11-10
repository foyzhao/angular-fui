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

		var nodeValue;

		if (attrs.value !== undefined) {
			nodeValue = scope.$eval(attrs.value);
		} else {
			nodeValue = element.text();
		}

		scope.$watchCollection(function() {
			return ngModel.$viewValue;
		}, function(value) {
			attrs.$set('checked', value && angular.isArray(value) && value.indexOf(nodeValue) >= 0);
		});

		element.on('click', clickListener);

		function clickListener(e) {
			if (attrs.disabled === undefined || attrs.disabled === false) {
				if (ngModel) {
					var value = [];
					if (ngModel.$viewValue && angular.isArray(ngModel.$viewValue)) {
						value = value.concat(ngModel.$viewValue);
					}
					if (attrs.checked) {
						var index = value.indexOf(nodeValue);
						if (index >= 0) {
							value.splice(index, 1);
						}
					} else {
						value.push(nodeValue);
					}
					ngModel.$setViewValue(value, e);
				} else {
					attrs.$set('checked', attrs.checked === undefined || attrs.checked === false);
				}
			}
		}
	}

})();