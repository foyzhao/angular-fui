(function() {

	angular.module('fui').service('dialogue', DialogueService);

	function DialogueService($rootScope, $compile, $q) {

		// @formatter:off
		var dialogueTemplate =
			'<dialogue ng-style="$$dialog.style" open>' +
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
						'ng-click="action.action()"' +
						'ng-class="action.type"' +
						'ng-style="action.style">{{action.name}}</button>' +
				'</footer>' +
			'</dialogue>';
		// @formatter:on

		this.open = function(options) {
			var childScope = $rootScope.$new();
			childScope.$$dialog = options;
			$compile(dialogueTemplate)(childScope);
			return function() {
				childScope.$destroy();
			};
		};

		this.alert = function(options) {
			var deferred = $q.defer();
			var destroy;
			options = angular.extend(
				{
					title: '温馨提示',
					contentType: 'message',
					actionName: '确定'
				},
				angular.isObject(options) ? options : {content: options}
			);
			options.actions = [{
				name: options.actionName,
				type: 'primary',
				action: function() {
					destroy();
					deferred.resolve();
				}
			}];
			destroy = this.open(options);
			return deferred.promise;
		};

		this.confirm = function(options) {
			var deferred = $q.defer();
			var destroy;
			options = angular.extend(
				{
					title: '操作确认',
					contentType: 'message',
					positiveActionName: '确定',
					negativeActionName: '取消'
				},
				angular.isObject(options) ? options : {content: options}
			);
			options.actions = [{
				name: options.positiveActionName,
				type: 'primary',
				action: function() {
					destroy();
					deferred.resolve();
				}
			}, {
				name: options.negativeActionName,
				action: function() {
					destroy();
					deferred.reject();
				}
			}];
			destroy = this.open(options);
			return deferred.promise;
		};

	}

	DialogueService.$inject = ['$rootScope', '$compile', '$q'];

})();