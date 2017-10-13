(function() {

	angular.module('fui').directive('dialog', dialogDirective);

	function dialogDirective() {

		// @formatter:off
		var dialogTemplate =
			'<div class="dialog" ng-style="$$dialog.style">' +
				'<header ng-if="$$dialog.title">{{$$dialog.title}}</header>' +
				'<div ' +
					'class="content" ' +
					'ng-class="$$dialog.contentType" ' +
					'ng-if="$$dialog.contentTemplateUrl" ' +
					'ng-include="$$dialog.contentTemplateUrl"></div>' +
				'<div ' +
					'class="content" ' +
					'ng-class="$$dialog.contentType" ' +
					'ng-if="!$$dialog.contentTemplateUrl && $$dialog.contentTemplate" ' +
					'ng-bind-html="$$dialog.contentTemplate | trust"></div>' +
				'<div ' +
					'class="content" ' +
					'ng-class="$$dialog.contentType" ' +
					'ng-if="!$$dialog.contentTemplateUrl && !$$dialog.contentTemplate" ' +
					'ng-bind="$$dialog.content"></div>' +
				'<footer ng-if="$$dialog.actions">' +
					'<button ' +
						'ng-repeat="action in $$dialog.actions" ' +
						'ng-click="$$invoke(action.action)"' +
						'ng-class="action.type"' +
						'ng-style="action.style">{{action.name}}</button>' +
				'</footer>' +
			'</div>';
		// @formatter:on

		return {
			restrict: 'A',
			priority: 999,
			require: 'layer',
			template: dialogTemplate,
			controller: DialogController
		};
	}

	function DialogController($scope, $attrs, $injector) {

		$scope.$watch($attrs.dialog, function(dialog) {
			$scope.$$dialog = dialog;
		});

		$scope.$$invoke = function(action) {
			if (angular.isFunction(action)) {
				$injector.invoke(action, $scope.$layer);
			} else {
				$scope.$layer.$close();
			}
		}

	}

	DialogController.$inject = ['$scope', '$attrs', '$injector'];

})();