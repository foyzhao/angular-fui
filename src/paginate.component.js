angular.module('fui', [])
	.value('fuiOption', {})
	.directive('fPaginate', function($parse, fuiOption) {
		var defaultOption = angular.extend({
			zeroStart: true,
			range: 5,
			constant: true,
			ellipsis: true,
			endsPage: true,
			prevPage: null,
			nextPage: null,
			firstPage: null,
			lastPage: null,
			disableCurrentPage: false
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
			restrict: 'A',
			template: tmpl,
			scope: {
				option: '=fPaginate',
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
						throw Error('fui.paginate: page and totalPage should be integer');
					}
					if (option.page < 0 || option.page >= option.totalPage) {
						throw Error('fui.paginate: invalid value of page or totalPage');
					}
					if (!angular.isNumber(option.range)) {
						throw Error('fui.paginate: range should be integer');
					}
					process(option.page);
				}

				function process(focusPage) {
					scope.items = [];

					if (option.range >= 0) {
						for (var i = 1; focusPage - i >= 0 && (i <= option.range || (option.constant && option.totalPage - focusPage + i - 1 - (option.ellipsis ? 1 : 0) - (option.endsPage ? 1 : 0) <= option.range * 2)); i++) {
							scope.items.unshift(createItem(focusPage - i));
						}

						scope.items.push(createItem(focusPage));

						for (var j = 1; focusPage + j < option.totalPage && (j <= option.range || (option.constant && focusPage + j - (option.ellipsis ? 1 : 0) - (option.endsPage ? 1 : 0) <= option.range * 2)); j++) {
							scope.items.push(createItem(focusPage + j));
						}

						if (option.ellipsis) {
							var beginPage = scope.items[0].page;
							if (beginPage > 0) {
								if (beginPage == 1 || beginPage == 2 && option.endsPage) {
									scope.items.unshift(createItem(beginPage - 1));
								} else {
									scope.items.unshift({
										page: Math.floor(beginPage / 2),
										text: angular.isString(option.ellipsis) ? option.ellipsis : '…',
										type: {
											'ellipsis': true,
											'previous-page': Math.floor(beginPage / 2) < option.page
										}
									});
								}
							}
							var endPage = scope.items[scope.items.length - 1].page;
							if (endPage < option.totalPage - 1) {
								if (endPage == option.totalPage - 2 || endPage == option.totalPage - 3 && option.endsPage) {
									scope.items.push(createItem(endPage + 1));
								} else {
									scope.items.push({
										page: Math.round((endPage + option.totalPage - 1) / 2),
										text: angular.isString(option.ellipsis) ? option.ellipsis : '…',
										type: {
											'ellipsis': true,
											'previous-page': Math.round((endPage + option.totalPage - 1) / 2) < option.page
										}
									});
								}
							}
						}

						if (option.endsPage) {
							if (scope.items[0].page > 0) {
								scope.items.unshift(createItem(0));
							}
							if (scope.items[scope.items.length - 1].page < option.totalPage - 1) {
								scope.items.push(createItem(option.totalPage - 1));
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
						disabled: option.disableCurrentPage && page == option.page,
						type: {
							'current-page': page == option.page,
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