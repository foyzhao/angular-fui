(function() {

	angular.module('fui').factory('prompt', promptFactory);

	function promptFactory($timeout, $q, $animate) {

		var $prompt = $('<prompt/>');
		var queuePromise = $q.resolve();
		var count = 0;
		var lastMsg;

		function prompt(msg) {
			if (msg === undefined || msg === null || typeof msg === 'object' || msg === '') {
				return $q.resolve(msg);
			}
			var defer = $q.defer();
			if (msg === lastMsg) {
				queuePromise.then(function() {
					defer.resolve(msg);
				});
			} else {
				lastMsg = msg;
				if (count === 0) {
					$prompt.addClass('spin').appendTo(document.body);
				}
				count++;
				queuePromise = queuePromise.then(function() {
					$animate.addClass($prompt, 'spin').then(function() {
						$prompt.css({left: 'auto', right: 'auto', width: 'auto'})
							.text(msg)
							.css({left: 0, right: 0, width: $prompt.width()});
					}).then(function() {
						$animate.removeClass($prompt, 'spin');
					});
					$timeout(function() {
						defer.resolve(msg);
						count--;
						if (count === 0) {
							$animate.addClass($prompt, 'spin').then(function() {
								$prompt.remove();
							});
							lastMsg = null;
						}
					}, 1000 + msg.toString().length * 100);
					return defer.promise;
				});
			}
			return defer.promise;
		}

		return prompt;
	}

	promptFactory.$inject = ['$timeout', '$q', '$animate'];

})();