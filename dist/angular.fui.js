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
    var dialogTemplate = "" + '<div class="dialog" ng-style="$$dialog.style">' + '<header ng-if="$$dialog.title">{{$$dialog.title}}</header>' + "<div " + 'class="content" ' + 'ng-class="$$dialog.contentType" ' + 'ng-if="$$dialog.contentTemplateUrl" ' + 'ng-include="$$dialog.contentTemplateUrl"></div>' + "<div " + 'class="content" ' + 'ng-class="$$dialog.contentType" ' + 'ng-if="!$$dialog.contentTemplateUrl && $$dialog.contentTemplate" ' + 'ng-bind-html="$$dialog.contentTemplate | trust"></div>' + "<div " + 'class="content" ' + 'ng-class="$$dialog.contentType" ' + 'ng-if="!$$dialog.contentTemplateUrl && !$$dialog.contentTemplate" ' + 'ng-bind="$$dialog.content"></div>' + '<footer ng-if="$$dialog.actions">' + "<button " + 'ng-repeat="action in $$dialog.actions" ' + 'ng-click="$$invoke(action.action)"' + 'ng-class="action.type"' + 'ng-style="action.style">{{action.name}}</button>' + "</footer>" + "</div>";
    function dialogDirective() {
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
    angular.module("fui").value("fuiOption", {}).directive("pagination", function($parse, fuiOption) {
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
        var tmpl = '<span class="page-wrapper">' + "<button " + 'ng-repeat="item in items" ' + 'ng-class="item.type" ' + 'ng-disabled="item.disabled" ' + 'ng-click="pick(item)">{{item.text}}' + "</button>" + "</span>";
        return {
            restrict: "E",
            template: tmpl,
            scope: {
                option: "=",
                page: "=",
                totalPage: "=",
                onPick: "@"
            },
            transclude: true,
            link: function(scope, element, attr, controller, transcludeFn) {
                element.addClass("f-paginate");
                transcludeFn(function(clone) {
                    element.append(clone.filter("span:last"));
                    element.prepend(clone.filter("span:first"));
                });
                var option;
                scope.$watchCollection(function() {
                    var option = angular.extend({}, defaultOption, scope.option);
                    if ("page" in attr.$attr) {
                        option.page = scope.page;
                    }
                    if ("totalPage" in attr.$attr) {
                        option.totalPage = scope.totalPage;
                    }
                    if ("onPick" in attr.$attr) {
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
                    scope.items = [];
                    if (option.range >= 0) {
                        scope.items.push(createItem(targetPage));
                        for (var i = 1; targetPage - i >= 0 && (i <= option.range || option.adjustLength && option.totalPage - targetPage + i - 1 - (option.ellipsis ? 1 : 0) - option.ends <= option.range * 2); i++) {
                            scope.items.unshift(createItem(targetPage - i));
                        }
                        for (var j = 1; targetPage + j < option.totalPage && (j <= option.range || option.adjustLength && targetPage + j - (option.ellipsis ? 1 : 0) - option.ends <= option.range * 2); j++) {
                            scope.items.push(createItem(targetPage + j));
                        }
                        if (option.ellipsis) {
                            var firstPage = scope.items[0].page;
                            if (firstPage - option.ends == 1) {
                                scope.items.unshift(createItem(firstPage - 1));
                            } else if (firstPage - option.ends > 1) {
                                var beginEllipsisPage = Math.round((firstPage - option.ends + 1) / 2) + option.ends - 1;
                                scope.items.unshift({
                                    page: beginEllipsisPage,
                                    text: angular.isString(option.ellipsis) ? option.ellipsis : "…",
                                    type: {
                                        ellipsis: true,
                                        "previous-page": beginEllipsisPage < option.page
                                    }
                                });
                            }
                            var lastPage = scope.items[scope.items.length - 1].page;
                            if (option.totalPage - lastPage - option.ends == 2) {
                                scope.items.push(createItem(lastPage + 1));
                            } else if (option.totalPage - lastPage - option.ends > 2) {
                                var endEllipsisPage = Math.floor((lastPage + option.totalPage - option.ends + 2) / 2) - 1;
                                scope.items.push({
                                    page: endEllipsisPage,
                                    text: angular.isString(option.ellipsis) ? option.ellipsis : "…",
                                    type: {
                                        ellipsis: true,
                                        "previous-page": endEllipsisPage < option.page
                                    }
                                });
                            }
                        }
                        if (option.ends > 0) {
                            for (var x = Math.min(scope.items[0].page - 1, option.ends - 1); x >= 0; x--) {
                                scope.items.unshift(createItem(x));
                            }
                            for (var y = Math.max(scope.items[scope.items.length - 1].page + 1, option.totalPage - option.ends); y < option.totalPage; y++) {
                                scope.items.push(createItem(y));
                            }
                        }
                    }
                    if (option.prevPage) {
                        scope.items.unshift({
                            page: option.page - 1,
                            text: angular.isString(option.prevPage) ? option.prevPage : "<",
                            disabled: 0 == option.page,
                            type: {
                                "extra prev-page": true,
                                "previous-page": true
                            }
                        });
                    }
                    if (option.nextPage) {
                        scope.items.push({
                            page: option.page + 1,
                            text: angular.isString(option.nextPage) ? option.nextPage : ">",
                            disabled: option.totalPage - 1 == option.page,
                            type: {
                                "extra first-page": true,
                                "previous-page": option.totalPage - 1 == option.page
                            }
                        });
                    }
                    if (option.firstPage) {
                        scope.items.unshift({
                            page: 0,
                            text: angular.isString(option.firstPage) ? option.firstPage : "|<",
                            disabled: 0 == option.page,
                            type: {
                                "extra first-page": true,
                                "previous-page": true
                            }
                        });
                    }
                    if (option.lastPage) {
                        scope.items.push({
                            page: option.totalPage - 1,
                            text: angular.isString(option.lastPage) ? option.lastPage : ">|",
                            disabled: option.totalPage - 1 == option.page,
                            type: {
                                "extra last-page": true,
                                "previous-page": option.totalPage - 1 == option.page
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
                            primary: page == option.page,
                            "previous-page": page < option.page
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
                            $parse(option.onPick)(scope.$parent, {
                                $page: page
                            });
                        }
                    }
                };
            }
        };
    });
});

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