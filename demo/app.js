angular.module('demo', ['fui']).value('fuiOption', {
	paginate: {
		// global settings at here
		zeroStart: false, // boolean
		range: 5, // integer
		ends: 1, // integer
		ellipsis: true, // boolean | string
		prevPage: null, // boolean | string
		nextPage: null, // boolean | string
		firstPage: null, // boolean | string
		lastPage: null, // boolean | string
		adjustLength: true, // boolean
		currentPageEnable: true // boolean
	}
}).controller('DemoController', function($scope) {
	$scope.pick = function(page) {
		alert('page ' + page + ' is picked');
	};
	// local settings at here
	$scope.pageOption = {
		zeroStart: false,
		page: 1,
		totalPage: 24,
		range: 2,
		ends: 2,
		ellipsis: true,
		prevPage: null,
		nextPage: null,
		firstPage: null,
		lastPage: null,
		adjustLength: true,
		currentPageEnable: true
	};
	$scope.list = function(page) {
		// do ajax and then update the current page
		$scope.pageOption.page = page;
	};
	/* 示例 */
	$scope.instancePage = 1;
	$scope.instanceTotalPage = 20;
	$scope.instances = [{
		// default
	}, {
		adjustLength: false
	}, {
		range: -1,
		prevPage: true,
		nextPage: true,
		firstPage: true,
		lastPage: true
	}, {
		range: -1,
		ends: 0,
		prevPage: true,
		nextPage: true,
		ellipsis: false
	}, {
		range: 0,
		ends: 0,
		prevPage: true,
		nextPage: true,
		ellipsis: false
	}, {
		range: 1,
		ends: 0,
		firstPage: true,
		lastPage: true,
		ellipsis: false
	}, {
		range: 2,
		ends: 0,
		firstPage: true,
		lastPage: true,
		ellipsis: false
	}, {
		range: 1,
		ends: 0,
		prevPage: true,
		nextPage: true,
		firstPage: true,
		lastPage: true
	}];
});
