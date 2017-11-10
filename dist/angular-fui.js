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
            require: "?^ngModel",
            link: {
                pre: preLink
            }
        };
    }
    function preLink(scope, element, attrs, ngModel) {
        if (!ngModel || ngModel.$$element === element) {
            boolModelLink(scope, element, attrs, ngModel);
        } else {
            arrayModelLink(scope, element, attrs, ngModel);
        }
    }
    function boolModelLink(scope, element, attrs, ngModel) {
        if (ngModel) {
            scope.$watch(function() {
                return ngModel.$viewValue;
            }, function(value) {
                attrs.$set("checked", !!value);
            });
        }
        element.on("click", clickListener);
        function clickListener(e) {
            if (attrs.disabled === undefined || attrs.disabled === false) {
                if (ngModel) {
                    ngModel.$setViewValue(!ngModel.$viewValue, e);
                } else {
                    attrs.$set("checked", attrs.checked === undefined || attrs.checked === false);
                }
            }
        }
    }
    function arrayModelLink(scope, element, attrs, ngModel) {
        var value;
        if (attrs.value !== undefined) {
            value = scope.$eval(attrs.value);
        } else {
            value = element.text();
        }
        scope.$watchCollection(function() {
            return ngModel.$viewValue;
        }, function(value) {
            attrs.$set("checked", value && angular.isArray(value) && value.indexOf(value) >= 0);
        });
        element.on("click", clickListener);
        function clickListener(e) {
            if (attrs.disabled === undefined || attrs.disabled === false) {
                if (ngModel) {
                    var values = [];
                    if (ngModel.$viewValue && angular.isArray(ngModel.$viewValue)) {
                        values = values.concat(ngModel.$viewValue);
                    }
                    if (attrs.checked) {
                        var index = values.indexOf(value);
                        if (index >= 0) {
                            values.splice(index, 1);
                        }
                    } else {
                        values.push(value);
                    }
                    ngModel.$setViewValue(values, e);
                } else {
                    attrs.$set("checked", attrs.checked === undefined || attrs.checked === false);
                }
            }
        }
    }
})();

(function() {
    angular.module("fui").directive("dialogue", dialogueDirective);
    function dialogueDirective() {
        return {
            restrict: "E",
            transclude: "element",
            controller: DialogueController
        };
    }
    function DialogueController($element, $attrs, $transclude, $animate) {
        var $dialogue, transcludeScope;
        this.$onInit = init;
        this.$open = open;
        this.$close = close;
        this.$onDestroy = destroy;
        function init() {
            $attrs.$observe("open", function(isOpen) {
                if (isOpen !== undefined && isOpen !== false) {
                    open();
                } else {
                    close();
                }
            });
        }
        function open() {
            if (!$dialogue) {
                $element.appendTo(document.body);
                $transclude(function(clone, scope) {
                    var $wrapper = $("<dialogue-wrapper/>").insertAfter($element);
                    $element.prevAll("dialogue-wrapper").removeClass("dimmer");
                    $animate.addClass($wrapper, "dimmer");
                    $dialogue = clone;
                    $animate.enter($dialogue, $wrapper);
                    transcludeScope = scope;
                });
            }
        }
        function close() {
            if ($dialogue) {
                var $wrapper = $dialogue.parent();
                if ($wrapper.hasClass("dimmer")) {
                    $element.prev().addClass("dimmer");
                    $animate.removeClass($wrapper, "dimmer");
                }
                $animate.leave($dialogue).then(function() {
                    $wrapper.remove();
                    $wrapper = null;
                });
                $dialogue = null;
                transcludeScope.$destroy();
                transcludeScope = null;
            }
        }
        function destroy() {
            close();
            $element.remove();
        }
    }
    DialogueController.$inject = [ "$element", "$attrs", "$transclude", "$animate" ];
})();

(function() {
    angular.module("fui").provider("paginationConfig", paginationConfigProvider).directive("pagination", paginationDirective);
    function paginationConfigProvider() {
        var options = {
            indexZero: true,
            showPages: true,
            disableCurrent: false,
            currentSpreadLength: 2,
            adjustCurrentSpreadLength: false,
            ellipsis: "…",
            endLength: 1,
            showActions: false,
            prevPage: "<",
            nextPage: ">",
            firstPage: "|<",
            lastPage: ">|",
            hideDisabledActions: false
        };
        this.$get = function() {
            return options;
        };
        this.$set = function(opt) {
            angular.extend(options, opt);
        };
    }
    function paginationDirective($animate) {
        var template = "<span ng-transclude></span>" + "<pagebar>" + "<button " + 'ng-repeat="item in $ctrl.$items" ' + 'ng-class="item.type" ' + 'ng-disabled="item.disabled" ' + 'ng-click="$ctrl.$pick(item)">{{item.text}}</button>' + "</pagebar>";
        return {
            restrict: "E",
            scope: {
                options: "<",
                current: "<",
                total: "<",
                onPick: "&"
            },
            template: template,
            transclude: true,
            compile: function(element) {
                $animate.enabled(element, false);
            },
            controller: PaginationController,
            controllerAs: "$ctrl",
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
                this.onPick({
                    $page: item.page
                });
            } else {
                this.onPick({
                    $page: item.page + 1
                });
            }
        }
        function validate() {
            if (!options || current === undefined || current === null || total === undefined || total === null || total === 0) {
                return;
            }
            if (!angular.isNumber(current) || options.indexZero && current < 0 || !options.indexZero && current < 1) {
                throw Error("[pagination] Invalid current page: '" + current + "'");
            }
            if (!angular.isNumber(total) || total < 0) {
                throw Error("[pagination] Invalid total pages: '" + total + "'");
            }
            if (options.indexZero && current >= total || !options.indexZero && current > total) {
                throw Error("[pagination] Invalid current page '" + current + "' with total pages '" + total + "'");
            }
            if (total === 1) {
                return;
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
                    items.unshift(createPage(target - i, {
                        spread: true
                    }));
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
                    for (;target - i >= 0 && extraLength > 0; i++, extraLength--) {
                        items.unshift(createPage(target - i, {
                            spread: true,
                            adjust: true
                        }));
                    }
                }
                for (var j = 1; target + j < total && j <= options.currentSpreadLength; j++) {
                    items.push(createPage(target + j, {
                        spread: true
                    }));
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
                    for (;target + j < total && extraLength > 0; j++, extraLength--) {
                        items.push(createPage(target + j, {
                            spread: true,
                            adjust: true
                        }));
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
                    items.unshift(createPage(i, {
                        end: true
                    }));
                }
                var rightEndPage = items[items.length - 1].page;
                for (var j = Math.max(rightEndPage + 1, total - options.endLength); j < total; j++) {
                    items.push(createPage(j, {
                        end: true
                    }));
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
            };
        }
    }
    paginationDirective.$inject = [ "$animate" ];
    PaginationController.$inject = [ "paginationConfig" ];
})();

(function() {
    angular.module("fui").directive("radio", radioDirective);
    function radioDirective() {
        return {
            restrict: "E",
            require: "?^ngModel",
            link: {
                pre: preLink
            }
        };
    }
    function preLink(scope, element, attrs, ngModel) {
        var value;
        if (ngModel) {
            if (attrs.value !== undefined) {
                value = scope.$eval(attrs.value);
            } else {
                value = element.text();
            }
            scope.$watch(function() {
                return ngModel.$viewValue;
            }, function(newValue) {
                attrs.$set("checked", newValue === value);
            });
        }
        element.on("click", clickListener);
        function clickListener(e) {
            if (attrs.disabled === undefined || attrs.disabled === false) {
                if (ngModel) {
                    if (attrs.checked) {
                        if (attrs.required === undefined || attrs.required === false) {
                            ngModel.$setViewValue(undefined, e);
                        }
                    } else {
                        ngModel.$setViewValue(value, e);
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
    angular.module("fui").service("dialogue", DialogueService);
    function DialogueService($rootScope, $compile, $q) {
        var dialogueTemplate = "<dialogue open>" + '<header ng-if="$$dialog.title">{{$$dialog.title}}</header>' + "<div " + 'class="content" ' + 'ng-class="$$dialog.contentType" ' + 'ng-if="$$dialog.contentTemplateUrl" ' + 'ng-include="$$dialog.contentTemplateUrl"></div>' + "<div " + 'class="content" ' + 'ng-class="$$dialog.contentType" ' + 'ng-if="!$$dialog.contentTemplateUrl && $$dialog.contentTemplate" ' + 'ng-bind-html="$$dialog.contentTemplate | trust"></div>' + "<div " + 'class="content" ' + 'ng-class="$$dialog.contentType" ' + 'ng-if="!$$dialog.contentTemplateUrl && !$$dialog.contentTemplate" ' + 'ng-bind="$$dialog.content"></div>' + '<footer ng-if="$$dialog.actions">' + "<button " + 'ng-repeat="action in $$dialog.actions" ' + 'ng-click="action.action()"' + 'ng-class="action.type"' + 'ng-style="action.style">{{action.name}}</button>' + "</footer>" + "</dialogue>";
        this.open = function(options) {
            var childScope = $rootScope.$new();
            childScope.$$dialog = options;
            $compile(dialogueTemplate)(childScope);
            return function() {
                childScope.$destroy();
            };
        };
        this.alert = function(options) {
            var deferred = $q.defer();
            var destroy;
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
                    destroy();
                    deferred.resolve();
                }
            } ];
            destroy = this.open(options);
            return deferred.promise;
        };
        this.confirm = function(options) {
            var deferred = $q.defer();
            var destroy;
            options = angular.extend({
                title: "操作确认",
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
                    destroy();
                    deferred.resolve();
                }
            }, {
                name: options.negativeActionName,
                action: function() {
                    destroy();
                    deferred.reject();
                }
            } ];
            destroy = this.open(options);
            return deferred.promise;
        };
    }
    DialogueService.$inject = [ "$rootScope", "$compile", "$q" ];
})();

(function() {
    angular.module("fui").factory("prompt", promptFactory);
    function promptFactory($timeout, $q, $animate) {
        var $prompt = $("<prompt/>");
        var queuePromise = $q.resolve();
        var count = 0;
        var lastMsg;
        function prompt(msg) {
            if (msg === undefined || msg === null || typeof msg === "object" || msg === "") {
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
                    $prompt.addClass("spin").appendTo(document.body);
                }
                count++;
                queuePromise = queuePromise.then(function() {
                    $animate.addClass($prompt, "spin").then(function() {
                        $prompt.css({
                            left: "auto",
                            right: "auto",
                            width: "auto"
                        }).text(msg).css({
                            left: 0,
                            right: 0,
                            width: $prompt.width()
                        });
                    }).then(function() {
                        $animate.removeClass($prompt, "spin");
                    });
                    $timeout(function() {
                        defer.resolve(msg);
                        count--;
                        if (count === 0) {
                            $animate.addClass($prompt, "spin").then(function() {
                                $prompt.remove();
                            });
                            lastMsg = null;
                        }
                    }, 1e3 + msg.toString().length * 100);
                    return defer.promise;
                });
            }
            return defer.promise;
        }
        return prompt;
    }
    promptFactory.$inject = [ "$timeout", "$q", "$animate" ];
})();