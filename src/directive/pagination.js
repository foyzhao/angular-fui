(function() {

	angular.module('fui')
		.provider('paginationConfig', paginationConfigProvider)
		.directive('pagination', paginationDirective);

	function paginationConfigProvider() {
		var options = {
			indexZero: true,
			showPages: true,
			disableCurrent: false,
			currentSpreadLength: 2,
			adjustCurrentSpreadLength: false,
			ellipsis: '…',
			endLength: 1,
			showActions: false,
			prevPage: '<',
			nextPage: '>',
			firstPage: '|<',
			lastPage: '>|',
			hideDisabledActions: false
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
			'<span ng-transclude></span>' +
			'<pagebar>' +
				'<button ' +
					'ng-repeat="item in $ctrl.$items" ' +
					'ng-class="item.type" ' +
					'ng-disabled="item.disabled" ' +
					'ng-click="$ctrl.$pick(item)">{{item.text}}</button>' +
			'</pagebar>';
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
			transclude: true,
			controller: PaginationController,
			controllerAs: '$ctrl',
			bindToController: true
		};
	}

	function PaginationController(paginationConfig) {

		var options, current, total, items = [];

		this.$items = items;
		this.$onInit = onInit;
		this.$onChanges = onChanges;
		this.$pick = pick;

		function onInit() {
			options = angular.extend({}, paginationConfig, this.options);
			validate();
		}

		function onChanges() {
			items.length = 0;
			current = this.current;
			total = this.total;
			validate();
		}

		function pick(item) {
			if (item.type.ellipsis) {
				render(item.page);
			} else if (options.indexZero) {
				this.onPick({$page: item.page});
			} else {
				this.onPick({$page: item.page + 1});
			}
		}

		function validate() {
			if (!options || current === undefined || current === null || total === undefined || total === null || total === 0) {
				return;
			}
			if (!angular.isNumber(current) || options.indexZero && current < 0 || !options.indexZero && current < 1) {
				throw Error('[pagination] Invalid current page: \'' + current + '\'');
			}
			if (!angular.isNumber(total) || total < 0) {
				throw Error('[pagination] Invalid total pages: \'' + total + '\'');
			}
			if (options.indexZero && current >= total || !options.indexZero && current > total) {
				throw Error('[pagination] Invalid current page \'' + current + '\' with total pages \'' + total + '\'');
			}
			if (!options.indexZero) {
				current--;
			}
			render(current);
		}

		function render(target) {
			items.length = 0;
			if (options.showPages) {
				items.push(createPage(target));
				renderSpreadPages();
				renderEllipsis();
				renderEndPages();
			}
			if (options.showActions) {
				renderActions();
			}
		}

		function renderSpreadPages() {
			if (options.currentSpreadLength > 0) {
				var target = items[0].page, extraLength, remain;
				for (var i = 1; target - i >= 0 && i <= options.currentSpreadLength; i++) {
					items.unshift(createPage(target - i, {spread: true}));
				}
				if (options.adjustCurrentSpreadLength) {
					extraLength = 0;
					remain = total - 1 - target - options.currentSpreadLength;
					if (options.endLength >= remain) {
						extraLength = options.endLength - remain;
						if (options.ellipsis) {
							extraLength++;
						}
					}
					if (options.showActions && options.hideDisabledActions) {
						if (current === total - 1 && current === target) {
							if (options.nextPage) {
								extraLength++;
							}
							if (options.lastPage) {
								extraLength++;
							}
						}
						if (current === 0 && current !== target) {
							if (options.prevPage) {
								extraLength++;
							}
							if (options.firstPage) {
								extraLength++;
							}
						}
					}
					for (; target - i >= 0 && extraLength > 0; i++, extraLength--) {
						items.unshift(createPage(target - i, {spread: true, adjust: true}));
					}
				}
				for (var j = 1; target + j < total && j <= options.currentSpreadLength; j++) {
					items.push(createPage(target + j, {spread: true}));
				}
				if (options.adjustCurrentSpreadLength) {
					extraLength = 0;
					remain = target - options.currentSpreadLength;
					if (options.endLength >= remain) {
						extraLength = options.endLength - remain;
						if (options.ellipsis) {
							extraLength++;
						}
					}
					if (options.showActions && options.hideDisabledActions) {
						if (current === 0 && current === target) {
							if (options.prevPage) {
								extraLength++;
							}
							if (options.firstPage) {
								extraLength++;
							}
						}
						if (current === total - 1 && current !== target) {
							if (options.nextPage) {
								extraLength++;
							}
							if (options.lastPage) {
								extraLength++;
							}
						}
					}
					for (; target + j < total && extraLength > 0; j++, extraLength--) {
						items.push(createPage(target + j, {spread: true, adjust: true}));
					}
				}
			}
		}

		function renderEllipsis() {
			if (options.ellipsis) {
				var leftEndPage = items[0].page;
				if (leftEndPage - options.endLength === 1) {
					items.unshift(createPage(leftEndPage - 1));
				} else if (leftEndPage - options.endLength > 1) {
					var leftEllipsisPage = Math.round((leftEndPage - options.endLength + 1) / 2) + options.endLength - 1;
					items.unshift(createEllipsis(leftEllipsisPage));
				}
				var rightEndPage = items[items.length - 1].page;
				if (total - rightEndPage - options.endLength === 2) {
					items.push(createPage(rightEndPage + 1));
				} else if (total - rightEndPage - options.endLength > 2) {
					var rightEllipsisPage = Math.floor((rightEndPage + total - options.endLength + 2) / 2) - 1;
					items.push(createEllipsis(rightEllipsisPage));
				}
			}
		}

		function renderEndPages() {
			if (options.endLength > 0) {
				var leftEndPage = items[0].page;
				for (var i = Math.min(leftEndPage - 1, options.endLength - 1); i >= 0; i--) {
					items.unshift(createPage(i, {end: true}));
				}
				var rightEndPage = items[items.length - 1].page;
				for (var j = Math.max(rightEndPage + 1, total - options.endLength); j < total; j++) {
					items.push(createPage(j, {end: true}));
				}
			}
		}

		function renderActions() {
			if (options.prevPage && (!options.hideDisabledActions || current > 0)) {
				items.unshift({
					page: current - 1,
					text: options.prevPage,
					disabled: current === 0,
					type: {
						action: true,
						prev: true
					}
				});
			}
			if (options.nextPage && (!options.hideDisabledActions || current < total - 1)) {
				items.push({
					page: current + 1,
					text: options.nextPage,
					disabled: current === total - 1,
					type: {
						action: true,
						next: true
					}
				});
			}
			if (options.firstPage && (!options.hideDisabledActions || current > 0)) {
				items.unshift({
					page: 0,
					text: options.firstPage,
					disabled: current === 0,
					type: {
						action: true,
						first: true
					}
				});
			}
			if (options.lastPage && (!options.hideDisabledActions || current < total - 1)) {
				items.push({
					page: total - 1,
					text: options.lastPage,
					disabled: current === total - 1,
					type: {
						action: true,
						last: true
					}
				});
			}
		}

		function createPage(page, type) {
			return {
				page: page,
				text: page + 1,
				disabled: options.disableCurrent && page === current,
				type: angular.extend({
					page: true,
					current: page === current,
					previous: page < current
				}, type)
			};
		}

		function createEllipsis(page) {
			return {
				page: page,
				text: options.ellipsis,
				type: {
					ellipsis: true,
					previous: page < current
				}
			}
		}

	}

	PaginationController.$inject = ['paginationConfig'];

})();