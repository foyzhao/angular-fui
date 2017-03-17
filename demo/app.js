angular.module('demo', ['fui']).value('fuiOption', {
	paginate: {
		// global settings at here
		zeroStart: false, // page start at 1 index
		range: 5, // page numbers surrounding current page
		constant: true,
		ellipsis: true, // boolean | string
		endsPage: true, // boolean
		prevPage: null, // boolean | string
		nextPage: null, // boolean | string
		firstPage: null, // boolean | string
		lastPage: null, // boolean | string
		disableCurrentPage: false // disabled current page
	}
}).controller('DemoController', function($scope) {
	$scope.pick = function(page) {
		alert('page ' + page + ' is picked');
	};
	$scope.pageOption = {
		zeroStart: false,
		page: 1,
		totalPage: 20,
		range: 1,
		constant: true,
		ellipsis: true,
		endsPage: true,
		prevPage: null,
		nextPage: null,
		firstPage: null,
		lastPage: null
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
		constant: false
	}, {
		range: -1,
		prevPage: true,
		nextPage: true,
		firstPage: true,
		lastPage: true
	}, {
		range: -1,
		prevPage: true,
		nextPage: true,
		ellipsis: false,
		endsPage: false
	}, {
		range: 0,
		prevPage: true,
		nextPage: true,
		ellipsis: false,
		endsPage: false
	}, {
		range: 1,
		firstPage: true,
		lastPage: true,
		ellipsis: false,
		endsPage: false
	}, {
		range: 2,
		firstPage: true,
		lastPage: true,
		ellipsis: false,
		endsPage: false
	}, {
		range: 1,
		endsPage: false,
		prevPage: true,
		nextPage: true,
		firstPage: true,
		lastPage: true
	}];
});
