(function() {

	angular.module('fui')
		.value('fuiOption', {})
		.directive('pagination', function($parse, fuiOption) {
			var defaultOption = angular.extend({
				zeroStart: true,
				range: 5,
				ends: 1,
				ellipsis: true,
				prevPage: null,
				nextPage: null,
				firstPage: null,
				lastPage: null,
				adjustLength: true,
				currentPageEnable: true
			}, fuiOption.paginate);
			// @formatter:off
		var tmpl =
			'<span class="page-wrapper">' +
				'<button ' +
					'ng-repeat="item in items" ' +
					'ng-class="item.type" ' +
					'ng-disabled="item.disabled" ' +
					'ng-click="pick(item)">{{item.text}}' +
				'</button>' +
			'</span>';
		// @formatter:on

			return {
				restrict: 'E',
				template: tmpl,
				scope: {
					option: '=',
					page: '=',
					totalPage: '=',
					onPick: '@'
				},
				transclude: true,
				link: function(scope, element, attr, controller, transcludeFn) {

					element.addClass('f-paginate');

					transcludeFn(function(clone) {
						element.append(clone.filter('span:last'));
						element.prepend(clone.filter('span:first'));
					});

					var option;

					scope.$watchCollection(function() {
						var option = angular.extend({}, defaultOption, scope.option);
						if ('page' in attr.$attr) {
							option.page = scope.page;
						}
						if ('totalPage' in attr.$attr) {
							option.totalPage = scope.totalPage;
						}
						if ('onPick' in attr.$attr) {
							option.onPick = scope.onPick;
						}
						if (!option.zeroStart) {
							option.page--;
						}
						return option;
					}, function(newOption) {
						option = newOption;
						scope.items = [];
						verify();
					});

					function verify() {
						if (!angular.isNumber(option.page) || !angular.isNumber(option.totalPage)) {
							throw Error('f-paginate: "page" and "totalPage" should be integer');
						}
						if (option.page < 0 || option.page >= option.totalPage) {
							throw Error('f-paginate: invalid value of "page" or "totalPage"');
						}
						if (!angular.isNumber(option.range)) {
							throw Error('f-paginate: "range" should be integer');
						}
						if (!angular.isNumber(option.ends) || option.ends < 0) {
							throw Error('f-paginate: "ends" should be positive integer or 0');
						}
						process(option.page);
					}

					function process(targetPage) {

						// clear pages
						scope.items = [];

						if (option.range >= 0) {

							// target page
							scope.items.push(createItem(targetPage));

							// pages before target page
							for (var i = 1; targetPage - i >= 0 && (i <= option.range || (option.adjustLength && option.totalPage - targetPage + i - 1 - (option.ellipsis ? 1 : 0) - option.ends <= option.range * 2)); i++) {
								scope.items.unshift(createItem(targetPage - i));
							}

							// pages after target page
							for (var j = 1; targetPage + j < option.totalPage && (j <= option.range || (option.adjustLength && targetPage + j - (option.ellipsis ? 1 : 0) - option.ends <= option.range * 2)); j++) {
								scope.items.push(createItem(targetPage + j));
							}

							if (option.ellipsis) {
								// left ellipsis
								var firstPage = scope.items[0].page;
								if (firstPage - option.ends == 1) {
									scope.items.unshift(createItem(firstPage - 1));
								} else if (firstPage - option.ends > 1) {
									var beginEllipsisPage = Math.round((firstPage - option.ends + 1) / 2) + option.ends - 1;
									scope.items.unshift({
										page: beginEllipsisPage,
										text: angular.isString(option.ellipsis) ? option.ellipsis : '…',
										type: {
											'ellipsis': true,
											'previous-page': beginEllipsisPage < option.page
										}
									});
								}
								// right ellipsis
								var lastPage = scope.items[scope.items.length - 1].page;
								if (option.totalPage - lastPage - option.ends == 2) {
									scope.items.push(createItem(lastPage + 1));
								} else if (option.totalPage - lastPage - option.ends > 2) {
									var endEllipsisPage = Math.floor((lastPage + option.totalPage - option.ends + 2) / 2) - 1;
									scope.items.push({
										page: endEllipsisPage,
										text: angular.isString(option.ellipsis) ? option.ellipsis : '…',
										type: {
											'ellipsis': true,
											'previous-page': endEllipsisPage < option.page
										}
									});
								}
							}

							if (option.ends > 0) {
								// left end pages
								for (var x = Math.min(scope.items[0].page - 1, option.ends - 1); x >= 0; x--) {
									scope.items.unshift(createItem(x));
								}
								// right end pages
								for (var y = Math.max(scope.items[scope.items.length - 1].page + 1, option.totalPage - option.ends); y < option.totalPage; y++) {
									scope.items.push(createItem(y));
								}
							}
						}

						if (option.prevPage) {
							scope.items.unshift({
								page: option.page - 1,
								text: angular.isString(option.prevPage) ? option.prevPage : '<',
								disabled: 0 == option.page,
								type: {
									'extra prev-page': true,
									'previous-page': true
								}
							});
						}

						if (option.nextPage) {
							scope.items.push({
								page: option.page + 1,
								text: angular.isString(option.nextPage) ? option.nextPage : '>',
								disabled: option.totalPage - 1 == option.page,
								type: {
									'extra first-page': true,
									'previous-page': option.totalPage - 1 == option.page
								}
							});
						}

						if (option.firstPage) {
							scope.items.unshift({
								page: 0,
								text: angular.isString(option.firstPage) ? option.firstPage : '|<',
								disabled: 0 == option.page,
								type: {
									'extra first-page': true,
									'previous-page': true
								}
							});
						}

						if (option.lastPage) {
							scope.items.push({
								page: option.totalPage - 1,
								text: angular.isString(option.lastPage) ? option.lastPage : '>|',
								disabled: option.totalPage - 1 == option.page,
								type: {
									'extra last-page': true,
									'previous-page': option.totalPage - 1 == option.page
								}
							});
						}
					}

					function createItem(page) {
						return {
							page: page,
							text: page + 1,
							disabled: !option.currentPageEnable && page == option.page,
							type: {
								'primary': page == option.page,
								'previous-page': page < option.page
							}
						};
					}

					scope.pick = function(item) {
						if (item.type.ellipsis) {
							process(item.page);
						} else if (option.onPick) {
							var page = option.zeroStart ? item.page : item.page + 1;
							if (angular.isFunction(option.onPick)) {
								option.onPick(page);
							} else {
								$parse(option.onPick)(scope.$parent, {$page: page});
							}
						}
					};

				}
			};
		});

})();