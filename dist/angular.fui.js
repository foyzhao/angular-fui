angular.module("fui", []);

(function() {
    angular.module("fui").filter("trust", trustFilter);
    function trustFilter($sce) {
        return function(source) {
            return $sce.trustAsHtml(source);
        };
    }
    trustFilter.$inject = [ "$sce" ];
})();

(function() {
    angular.module("fui").directive("checkbox", checkboxDirective);
    function checkboxDirective() {
        return {
            restrict: "E",
            require: "?ngModel",
            link: {
                pre: preLink
            }
        };
    }
    function preLink(scope, element, attrs, ctrl) {
        var modelValue, nodeValue;
        if (ctrl) {
            if (attrs.value === undefined) {
                ctrl.$formatters.push(boolValueFormatter);
            } else {
                ctrl.$formatters.push(arrayValueFormatter);
                ctrl.$parsers.push(arrayValueParser);
                if (attrs.value) {
                    nodeValue = scope.$eval(attrs.value);
                } else {
                    nodeValue = element.text();
                }
            }
            ctrl.$render = render;
        }
        element.on("click", listener);
        function boolValueFormatter(value) {
            return !!value;
        }
        function arrayValueFormatter(value) {
            modelValue = value;
            return angular.isArray(modelValue) && modelValue.indexOf(nodeValue) >= 0;
        }
        function arrayValueParser(value) {
            if (value) {
                if (angular.isArray(modelValue)) {
                    modelValue.push(nodeValue);
                } else {
                    modelValue = [ nodeValue ];
                }
            } else if (angular.isArray(modelValue)) {
                var index = modelValue.indexOf(nodeValue);
                if (index >= 0) {
                    modelValue.splice(index, 1);
                }
            }
            return modelValue;
        }
        function render() {
            attrs.$set("checked", ctrl.$viewValue);
        }
        function listener() {
            if (attrs.disabled === undefined || attrs.disabled === false) {
                if (ctrl) {
                    ctrl.$setViewValue(!ctrl.$viewValue);
                    ctrl.$render();
                } else {
                    attrs.$set("checked", attrs.checked === undefined || attrs.checked === false);
                }
            }
        }
    }
})();

(function() {
    angular.module("fui").directive("dialog", dialogDirective);
    function dialogDirective() {
        var dialogTemplate = '<div class="dialog" ng-style="$$dialog.style">' + '<header ng-if="$$dialog.title">{{$$dialog.title}}</header>' + "<div " + 'class="content" ' + 'ng-class="$$dialog.contentType" ' + 'ng-if="$$dialog.contentTemplateUrl" ' + 'ng-include="$$dialog.contentTemplateUrl"></div>' + "<div " + 'class="content" ' + 'ng-class="$$dialog.contentType" ' + 'ng-if="!$$dialog.contentTemplateUrl && $$dialog.contentTemplate" ' + 'ng-bind-html="$$dialog.contentTemplate | trust"></div>' + "<div " + 'class="content" ' + 'ng-class="$$dialog.contentType" ' + 'ng-if="!$$dialog.contentTemplateUrl && !$$dialog.contentTemplate" ' + 'ng-bind="$$dialog.content"></div>' + '<footer ng-if="$$dialog.actions">' + "<button " + 'ng-repeat="action in $$dialog.actions" ' + 'ng-click="$$invoke(action.action)"' + 'ng-class="action.type"' + 'ng-style="action.style">{{action.name}}</button>' + "</footer>" + "</div>";
        return {
            restrict: "A",
            priority: 999,
            require: "layer",
            template: dialogTemplate,
            controller: DialogController
        };
    }
    function DialogController($scope, $attrs, $injector) {
        $scope.$watch($attrs.dialog, function(dialog) {
            $scope.$$dialog = dialog;
        });
        $scope.$$invoke = function(action) {
            if (angular.isFunction(action)) {
                $injector.invoke(action, $scope.$layer);
            } else {
                $scope.$layer.$close();
            }
        };
    }
    DialogController.$inject = [ "$scope", "$attrs", "$injector" ];
})();

(function() {
    angular.module("fui").directive("layer", layerDirective);
    function layerDirective() {
        return {
            restrict: "E",
            priority: 1e3,
            transclude: "element",
            controller: LayerController
        };
    }
    function LayerController($scope, $element, $attrs, $parse, $transclude, $animate) {
        var layerElement, layerScope, ctrl = this;
        ctrl.$open = open;
        ctrl.$close = close;
        ctrl.$onInit = onInit;
        ctrl.$onDestroy = onDestroy;
        if ($attrs.name) {
            var fn = $parse($attrs.name);
            if (fn.assign) {
                fn.assign($scope, ctrl);
            }
        }
        function onInit() {
            $scope.$eval($attrs.onInit, {
                $layer: ctrl
            });
        }
        function onOpen() {
            $scope.$eval($attrs.onOpen);
        }
        function onClose() {
            $scope.$eval($attrs.onClose);
        }
        function onDestroy() {
            $element.remove();
            close();
        }
        function open() {
            if (!layerElement) {
                if (!$element.is(":last-child")) {
                    $element.appendTo($element.parent());
                }
                $transclude(function(clone, scope) {
                    layerElement = clone.addClass("open");
                    $animate.enter(layerElement, $element.parent(), $element);
                    layerScope = scope;
                    layerScope.$layer = ctrl;
                });
                onOpen();
            }
        }
        function close() {
            if (layerElement) {
                $animate.leave(layerElement);
                layerElement = null;
                layerScope.$destroy();
                layerScope = null;
                onClose();
            }
        }
    }
    LayerController.$inject = [ "$scope", "$element", "$attrs", "$parse", "$transclude", "$animate" ];
})();

(function() {
    angular.module("fui").provider("paginationConfig", paginationConfigProvider).directive("pagination", paginationDirective);
    function paginationConfigProvider() {
        var options = {
            spreadLength: 2,
            ellipsis: "…",
            endLength: 1,
            prevPage: "<",
            nextPage: ">",
            firstPage: "|<",
            lastPage: ">|",
            indexZero: true,
            disableCurrent: false,
            adjustSpreadLength: true
        };
        this.$get = function() {
            return options;
        };
        this.$set = function(opt) {
            angular.extend(options, opt);
        };
    }
    function paginationDirective() {
        var template = '<span class="page-wrapper">' + "<button " + 'ng-repeat="item in $ctrl.$$items" ' + 'ng-class="item.type" ' + 'ng-disabled="item.disabled" ' + 'ng-click="$ctrl.$onPick(item)">{{item.text}}</button>' + "</span>";
        return {
            restrict: "E",
            scope: {
                options: "<",
                current: "<",
                total: "<",
                onPick: "&"
            },
            template: template,
            controller: PaginationController,
            controllerAs: "$ctrl",
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
                    this.onPick({
                        $page: item.page
                    });
                } else {
                    this.onPick({
                        $page: item.page + 1
                    });
                }
            }
        };
        this.$validate = function() {
            this.$$items = [];
            if (this.current === undefined || this.current === null || this.total === undefined || this.total === null) {
                return;
            }
            if (!angular.isNumber(this.current) || this.options.indexZero && this.current < 0 || !this.options.indexZero && this.current < 1) {
                throw Error("[pagination] Invalid current page: '" + this.current + "'");
            }
            if (!angular.isNumber(this.total) || this.total < 0) {
                throw Error("[pagination] Invalid total pages: '" + this.total + "'");
            }
            if (this.options.indexZero && this.current >= this.total || !this.options.indexZero && this.current > this.total) {
                throw Error("[pagination] Invalid current page '" + this.current + "' with total pages '" + this.total + "'");
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
            for (var i = 1; target - i >= 0 && (i <= this.options.spreadLength || this.options.adjustSpreadLength && this.total - target + i - 1 - (this.options.ellipsis ? 1 : 0) - this.options.endLength <= this.options.spreadLength * 2); i++) {
                this.$$items.unshift(this.$$createPage(target - i, {
                    spread: true
                }));
            }
            for (var j = 1; target + j < this.total && (j <= this.options.spreadLength || this.options.adjustSpreadLength && target + j - (this.options.ellipsis ? 1 : 0) - this.options.endLength <= this.options.spreadLength * 2); j++) {
                this.$$items.push(this.$$createPage(target + j, {
                    spread: true
                }));
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
                    this.$$items.unshift(this.$$createPage(i, {
                        end: true
                    }));
                }
                var rightEndPage = this.$$items[this.$$items.length - 1].page;
                for (var j = Math.max(rightEndPage + 1, this.total - this.options.endLength); j < this.total; j++) {
                    this.$$items.push(this.$$createPage(j, {
                        end: true
                    }));
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
            };
        };
    }
    PaginationController.$inject = [ "paginationConfig" ];
})();

(function() {
    angular.module("fui").directive("radio", radioDirective);
    function radioDirective() {
        return {
            restrict: "E",
            require: "?ngModel",
            link: {
                pre: preLink
            }
        };
    }
    function preLink(scope, element, attrs, ctrl) {
        var nodeValue;
        if (ctrl) {
            if (attrs.value !== undefined) {
                if (attrs.value) {
                    nodeValue = scope.$eval(attrs.value);
                } else {
                    nodeValue = element.text();
                }
            }
            ctrl.$formatters.push(valueFormatter);
            ctrl.$parsers.push(valueParser);
            ctrl.$render = render;
        }
        element.on("click", listener);
        function valueFormatter(value) {
            return value === nodeValue;
        }
        function valueParser(value) {
            return value ? nodeValue : null;
        }
        function render() {
            attrs.$set("checked", ctrl.$viewValue);
        }
        function listener() {
            if (attrs.disabled === undefined || attrs.disabled === false) {
                if (ctrl) {
                    if (!ctrl.$viewValue || attrs.required === undefined || attrs.required === false) {
                        ctrl.$setViewValue(!ctrl.$viewValue);
                        ctrl.$render();
                    }
                } else {
                    if (attrs.checked === undefined || attrs.checked === false || attrs.required === undefined || attrs.required === false) {
                        attrs.$set("checked", attrs.checked === undefined || attrs.checked === false);
                    }
                }
            }
        }
    }
})();

(function() {
    angular.module("fui").service("dialog", dialogService);
    function dialogService($rootScope, $compile, $q) {
        var layerTemplate = "" + "<layer " + 'id="layer-{{$id}}"' + 'dialog="$$dialog" ' + 'on-init="$layer.$open()" ' + 'on-close="$destroy()"></layer>';
        this.open = function(options) {
            var childScope = $rootScope.$new();
            childScope.$$dialog = options;
            angular.extend(childScope);
            $compile($(layerTemplate).appendTo(document.body))(childScope);
        };
        this.alert = function(options) {
            var deferred = $q.defer();
            options = angular.extend({
                title: "温馨提示",
                contentType: "message",
                actionName: "确定"
            }, angular.isObject(options) ? options : {
                content: options
            });
            options.actions = [ {
                name: options.actionName,
                type: "primary",
                action: function() {
                    this.$close();
                    deferred.resolve();
                }
            } ];
            this.open(options);
            return deferred.promise;
        };
        this.confirm = function(options) {
            var deferred = $q.defer();
            options = angular.extend({
                title: "温馨提示",
                contentType: "message",
                positiveActionName: "确定",
                negativeActionName: "取消"
            }, angular.isObject(options) ? options : {
                content: options
            });
            options.actions = [ {
                name: options.positiveActionName,
                type: "primary",
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
            } ];
            this.open(options);
            return deferred.promise;
        };
    }
    dialogService.$inject = [ "$rootScope", "$compile", "$q" ];
})();