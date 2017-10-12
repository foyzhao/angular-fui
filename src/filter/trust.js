(function() {

	angular.module('fui').filter('trust', trustFilter);

	function trustFilter($sce) {
		return function(source) {
			return $sce.trustAsHtml(source);
		};
	}

	trustFilter.$inject = ['$sce'];

})();





