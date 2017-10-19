(function() {

	angular.module('fui').service('dialogue', DialogueService);

	function DialogueService($rootScope, $compile, $q) {

		var layerTemplate = '' +
			'<layer ' +
			'id="layer-{{$id}}"' +
			'dialog="$$dialog" ' +
			'on-init="$layer.$open()" ' +
			'on-close="$destroy()"></layer>';

		this.open = function(options) {
			var childScope = $rootScope.$new();
			childScope.$$dialog = options;
			angular.extend(childScope);
			$compile($(layerTemplate).appendTo(document.body))(childScope);
		};

		this.alert = function(options) {
			var deferred = $q.defer();
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
					this.$close();
					deferred.resolve();
				}
			}];
			this.open(options);
			return deferred.promise;
		};

		this.confirm = function(options) {
			var deferred = $q.defer();
			options = angular.extend(
				{
					title: '温馨提示',
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
					this.$close();
					deferred.resolve();
				}
			}, {
				name: options.negativeActionName,
				action: function() {
					this.$close();
					deferred.reject();
				}
			}];
			this.open(options);
			return deferred.promise;
		};

	}

	DialogueService.$inject = ['$rootScope', '$compile', '$q'];

})();