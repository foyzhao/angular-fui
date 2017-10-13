(function() {

	// angular.module('fui')
	// 	.value('fuiOption', {})
	// 	.directive('paginate', function($parse, fuiOption) {
	// 		var defaultOption = angular.extend({
	// 			zeroStart: true,
	// 			range: 5,
	// 			ends: 1,
	// 			ellipsis: true,
	// 			prevPage: null,
	// 			nextPage: null,
	// 			firstPage: null,
	// 			lastPage: null,
	// 			adjustLength: true,
	// 			currentPageEnable: true
	// 		}, fuiOption.paginate);
	// 		// @formatter:off
	// 	var tmpl =
	// 		'<span class="page-wrapper">' +
	// 			'<button ' +
	// 				'ng-repeat="item in items" ' +
	// 				'ng-class="item.type" ' +
	// 				'ng-disabled="item.disabled" ' +
	// 				'ng-click="pick(item)">{{item.text}}' +
	// 			'</button>' +
	// 		'</span>';
	// 	// @formatter:on
	//
	// 		return {
	// 			restrict: 'E',
	// 			template: tmpl,
	// 			scope: {
	// 				option: '=',
	// 				page: '=',
	// 				totalPage: '=',
	// 				onPick: '@'
	// 			},
	// 			transclude: true,
	// 			link: function(scope, element, attr, controller, transcludeFn) {
	//
	// 				transcludeFn(function(clone) {
	// 					element.append(clone.filter('span:last'));
	// 					element.prepend(clone.filter('span:first'));
	// 				});
	//
	// 				var option;
	//
	// 				scope.$watchCollection(function() {
	// 					var option = angular.extend({}, defaultOption, scope.option);
	// 					if ('page' in attr.$attr) {
	// 						option.page = scope.page;
	// 					}
	// 					if ('totalPage' in attr.$attr) {
	// 						option.totalPage = scope.totalPage;
	// 					}
	// 					if ('onPick' in attr.$attr) {
	// 						option.onPick = scope.onPick;
	// 					}
	// 					if (!option.zeroStart) {
	// 						option.page--;
	// 					}
	// 					return option;
	// 				}, function(newOption) {
	// 					option = newOption;
	// 					scope.items = [];
	// 					verify();
	// 				});
	//
	// 				function verify() {
	// 					if (!angular.isNumber(option.page) || !angular.isNumber(option.totalPage)) {
	// 						throw Error('f-paginate: "page" and "totalPage" should be integer');
	// 					}
	// 					if (option.page < 0 || option.page >= option.totalPage) {
	// 						throw Error('f-paginate: invalid value of "page" or "totalPage"');
	// 					}
	// 					if (!angular.isNumber(option.range)) {
	// 						throw Error('f-paginate: "range" should be integer');
	// 					}
	// 					if (!angular.isNumber(option.ends) || option.ends < 0) {
	// 						throw Error('f-paginate: "ends" should be positive integer or 0');
	// 					}
	// 					process(option.page);
	// 				}
	//
	// 				function process(targetPage) {
	//
	// 					// clear pages
	// 					scope.items = [];
	//
	// 					if (option.range >= 0) {
	//
	// 						// target page
	// 						scope.items.push(createItem(targetPage));
	//
	// 						// pages before target page
	// 						for (var i = 1; targetPage - i >= 0 && (i <= option.range || (option.adjustLength && option.totalPage - targetPage + i - 1 - (option.ellipsis ? 1 : 0) - option.ends <= option.range * 2)); i++) {
	// 							scope.items.unshift(createItem(targetPage - i));
	// 						}
	//
	// 						// pages after target page
	// 						for (var j = 1; targetPage + j < option.totalPage && (j <= option.range || (option.adjustLength && targetPage + j - (option.ellipsis ? 1 : 0) - option.ends <= option.range * 2)); j++) {
	// 							scope.items.push(createItem(targetPage + j));
	// 						}
	//
	// 						if (option.ellipsis) {
	// 							// left ellipsis
	// 							var firstPage = scope.items[0].page;
	// 							if (firstPage - option.ends == 1) {
	// 								scope.items.unshift(createItem(firstPage - 1));
	// 							} else if (firstPage - option.ends > 1) {
	// 								var beginEllipsisPage = Math.round((firstPage - option.ends + 1) / 2) + option.ends - 1;
	// 								scope.items.unshift({
	// 									page: beginEllipsisPage,
	// 									text: angular.isString(option.ellipsis) ? option.ellipsis : '…',
	// 									type: {
	// 										'ellipsis': true,
	// 										'previous-page': beginEllipsisPage < option.page
	// 									}
	// 								});
	// 							}
	// 							// right ellipsis
	// 							var lastPage = scope.items[scope.items.length - 1].page;
	// 							if (option.totalPage - lastPage - option.ends == 2) {
	// 								scope.items.push(createItem(lastPage + 1));
	// 							} else if (option.totalPage - lastPage - option.ends > 2) {
	// 								var endEllipsisPage = Math.floor((lastPage + option.totalPage - option.ends + 2) / 2) - 1;
	// 								scope.items.push({
	// 									page: endEllipsisPage,
	// 									text: angular.isString(option.ellipsis) ? option.ellipsis : '…',
	// 									type: {
	// 										'ellipsis': true,
	// 										'previous-page': endEllipsisPage < option.page
	// 									}
	// 								});
	// 							}
	// 						}
	//
	// 						if (option.ends > 0) {
	// 							// left end pages
	// 							for (var x = Math.min(scope.items[0].page - 1, option.ends - 1); x >= 0; x--) {
	// 								scope.items.unshift(createItem(x));
	// 							}
	// 							// right end pages
	// 							for (var y = Math.max(scope.items[scope.items.length - 1].page + 1, option.totalPage - option.ends); y < option.totalPage; y++) {
	// 								scope.items.push(createItem(y));
	// 							}
	// 						}
	// 					}
	//
	// 					if (option.prevPage) {
	// 						scope.items.unshift({
	// 							page: option.page - 1,
	// 							text: angular.isString(option.prevPage) ? option.prevPage : '<',
	// 							disabled: 0 == option.page,
	// 							type: {
	// 								'extra prev-page': true,
	// 								'previous-page': true
	// 							}
	// 						});
	// 					}
	//
	// 					if (option.nextPage) {
	// 						scope.items.push({
	// 							page: option.page + 1,
	// 							text: angular.isString(option.nextPage) ? option.nextPage : '>',
	// 							disabled: option.totalPage - 1 == option.page,
	// 							type: {
	// 								'extra first-page': true,
	// 								'previous-page': option.totalPage - 1 == option.page
	// 							}
	// 						});
	// 					}
	//
	// 					if (option.firstPage) {
	// 						scope.items.unshift({
	// 							page: 0,
	// 							text: angular.isString(option.firstPage) ? option.firstPage : '|<',
	// 							disabled: 0 == option.page,
	// 							type: {
	// 								'extra first-page': true,
	// 								'previous-page': true
	// 							}
	// 						});
	// 					}
	//
	// 					if (option.lastPage) {
	// 						scope.items.push({
	// 							page: option.totalPage - 1,
	// 							text: angular.isString(option.lastPage) ? option.lastPage : '>|',
	// 							disabled: option.totalPage - 1 == option.page,
	// 							type: {
	// 								'extra last-page': true,
	// 								'previous-page': option.totalPage - 1 == option.page
	// 							}
	// 						});
	// 					}
	// 				}
	//
	// 				function createItem(page) {
	// 					return {
	// 						page: page,
	// 						text: page + 1,
	// 						disabled: !option.currentPageEnable && page == option.page,
	// 						type: {
	// 							'primary': page == option.page,
	// 							'previous-page': page < option.page
	// 						}
	// 					};
	// 				}
	//
	// 				scope.pick = function(item) {
	// 					if (item.type.ellipsis) {
	// 						process(item.page);
	// 					} else if (option.onPick) {
	// 						var page = option.zeroStart ? item.page : item.page + 1;
	// 						if (angular.isFunction(option.onPick)) {
	// 							option.onPick(page);
	// 						} else {
	// 							$parse(option.onPick)(scope.$parent, {$page: page});
	// 						}
	// 					}
	// 				};
	//
	// 			}
	// 		};
	// 	});
	//
	// function postLink(scope, element, attrs, ctrl, transclude) {
	//
	//
	// }
	//

	angular.module('fui')
		.provider('paginationConfig', paginationConfigProvider)
		.directive('pagination', paginationDirective);

	function paginationConfigProvider() {
		var options = {
			spreadLength: 2,
			ellipsis: '…',
			endLength: 1,
			prevPage: '<',
			nextPage: '>',
			firstPage: '|<',
			lastPage: '>|',
			indexZero: true,
			disableCurrent: false,
			adjustSpreadLength: true
		};
		this.$get = function() {
			return options;
		};
		this.$set = function(opt) {
			angular.extend(options, opt);
		}
	}

	function paginationDirective() {

		// @formatter:off
		var template =
			'<span class="page-wrapper">' +
				'<button ' +
					'ng-repeat="item in $ctrl.$$items" ' +
					'ng-class="item.type" ' +
					'ng-disabled="item.disabled" ' +
					'ng-click="$ctrl.$onPick(item)">{{item.text}}</button>' +
			'</span>';
		// @formatter:on

		return {
			restrict: 'E',
			scope: {
				options: '<',
				current: '<',
				total: '<',
				onPick: '&'
			},
			template: template,
			controller: PaginationController,
			controllerAs: '$ctrl',
			bindToController: true
		};
	}


	function PaginationController(paginationConfig) {

		this.$onInit = function() {
			this.options = angular.extend({}, paginationConfig, this.options);
			this.$onChanges = this.$validate;
			this.$validate();
		};

		this.$onPick = function(item) {
			if (item.type.ellipsis) {
				this.$render(item.page);
			} else {
				if (this.options.zeroStart) {
					this.onPick({$page: item.page});
				} else {
					this.onPick({$page: item.page + 1});
				}
			}
		};

		this.$validate = function() {
			this.$$items = [];
			if (this.current === undefined || this.current === null || this.total === undefined || this.total === null) {
				return;
			}
			if (!angular.isNumber(this.current) || this.options.indexZero && this.current < 0 || !this.options.indexZero && this.current < 1) {
				throw Error('[pagination] Invalid current page: \'' + this.current + '\'');
			}
			if (!angular.isNumber(this.total) || this.total < 0) {
				throw Error('[pagination] Invalid total pages: \'' + this.total + '\'');
			}
			if (this.options.indexZero && this.current >= this.total || !this.options.indexZero && this.current > this.total) {
				throw Error('[pagination] Invalid current page \'' + this.current + '\' with total pages \'' + this.total + '\'');
			}
			if (!this.options.zeroStart) {
				this.current--;
			}
			this.$render(this.current);
		};

		this.$render = function(target) {
			this.$$items = [];
			if (this.options.spreadLength >= 0) {
				this.$$items.push(this.$$createPage(target));
				this.$$renderSpreadPages();
				this.$$renderEllipsis();
				this.$$renderEndPages();
			}
			this.$$renderActions();
		};

		this.$$renderSpreadPages = function() {
			var target = this.$$items[0].page;
			for (var i = 1; target - i >= 0 && (i <= this.options.spreadLength || (this.options.adjustSpreadLength && this.total - target + i - 1 - (this.options.ellipsis ? 1 : 0) - this.options.endLength <= this.options.spreadLength * 2)); i++) {
				this.$$items.unshift(this.$$createPage(target - i, {spread: true}));
			}
			for (var j = 1; target + j < this.total && (j <= this.options.spreadLength || (this.options.adjustSpreadLength && target + j - (this.options.ellipsis ? 1 : 0) - this.options.endLength <= this.options.spreadLength * 2)); j++) {
				this.$$items.push(this.$$createPage(target + j, {spread: true}));
			}
		};

		this.$$renderEllipsis = function() {
			if (this.options.ellipsis) {
				var leftEndPage = this.$$items[0].page;
				if (leftEndPage - this.options.endLength === 1) {
					this.$$items.unshift(this.$$createPage(leftEndPage - 1));
				} else if (leftEndPage - this.options.endLength > 1) {
					var leftEllipsisPage = Math.round((leftEndPage - this.options.endLength + 1) / 2) + this.options.endLength - 1;
					this.$$items.unshift(this.$$createEllipsis(leftEllipsisPage));
				}
				var rightEndPage = this.$$items[this.$$items.length - 1].page;
				if (this.total - rightEndPage - this.options.endLength === 2) {
					this.$$items.push(this.$$createPage(rightEndPage + 1));
				} else if (this.total - rightEndPage - this.options.endLength > 2) {
					var rightEllipsisPage = Math.floor((rightEndPage + this.total - this.options.endLength + 2) / 2) - 1;
					this.$$items.push(this.$$createEllipsis(rightEllipsisPage));
				}
			}
		};

		this.$$renderEndPages = function() {
			if (this.options.endLength > 0) {
				var leftEndPage = this.$$items[0].page;
				for (var i = Math.min(leftEndPage - 1, this.options.endLength - 1); i >= 0; i--) {
					this.$$items.unshift(this.$$createPage(i, {end: true}));
				}
				var rightEndPage = this.$$items[this.$$items.length - 1].page;
				for (var j = Math.max(rightEndPage + 1, this.total - this.options.endLength); j < this.total; j++) {
					this.$$items.push(this.$$createPage(j, {end: true}));
				}
			}
		};

		this.$$renderActions = function() {
			if (this.options.prevPage) {
				this.$$items.unshift({
					page: this.current - 1,
					text: this.options.prevPage,
					disabled: 0 === this.current,
					type: {
						action: true,
						prev: true
					}
				});
			}
			if (this.options.nextPage) {
				this.$$items.push({
					page: this.current + 1,
					text: this.options.nextPage,
					disabled: this.total - 1 === this.current,
					type: {
						action: true,
						next: true
					}
				});
			}
			if (this.options.firstPage) {
				this.$$items.unshift({
					page: 0,
					text: this.options.firstPage,
					disabled: 0 === this.current,
					type: {
						action: true,
						first: true
					}
				});
			}
			if (this.options.lastPage) {
				this.$$items.push({
					page: this.total - 1,
					text: this.options.lastPage,
					disabled: this.total - 1 === this.current,
					type: {
						action: true,
						last: true
					}
				});
			}
		};

		this.$$createPage = function(page, type) {
			return {
				page: page,
				text: page + 1,
				disabled: this.options.disableCurrent && page === this.current,
				type: angular.extend({
					page: true,
					current: page === this.current,
					previous: page < this.current
				}, type)
			};
		};

		this.$$createEllipsis = function(page) {
			return {
				page: page,
				text: this.options.ellipsis,
				type: {
					ellipsis: true,
					previous: page < this.current
				}
			}
		};
	}

	PaginationController.$inject = ['paginationConfig'];

})();