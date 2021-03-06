(function() {
    'use strict';

    /**
     * usage: <textarea ng-model="content" redactor></textarea>
     *
     *    additional options:
     *      redactor: hash (pass in a redactor options hash)
     *
     */
    var redactorOptions = {};
    angular.module('angular-redactor-iw', [])
        .constant('redactorOptions', redactorOptions)
        .directive('redactor', ['$timeout', '$rootScope', function($timeout, $rootScope) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, element, attrs, ngModel) {

                  // Expose scope var with loaded state of Redactor
                    scope.redactorLoaded = false;

                    var updateModel = function() {
                        $rootScope.safeApply(function(){
                          ngModel.$setViewValue($_element.redactor('code.get'));
                        }); 
                    },
                    options = {
                        keyupCallback: updateModel,
                        keydownCallback: updateModel,
                        execCommandCallback: updateModel,
                        autosaveCallback: updateModel,
                        focusCallback: updateModel,
                        blurCallback: updateModel,
                        replaceDivs: false
                    },
                    additionalOptions = attrs.redactor ?
                        scope.$eval(attrs.redactor) : {},
                    editor,
                    $_element = angular.element(element);

                    angular.extend(options, redactorOptions, additionalOptions);

                    // prevent collision with the constant values on ChangeCallback
                    var changeCallback = additionalOptions.changeCallback || redactorOptions.changeCallback;
                    if (changeCallback) {
                        options.changeCallback = function(value) {
                            updateModel.call(this, value);
                            changeCallback.call(this, value);
                        }
                    }

                    // put in timeout to avoid $digest collision.  call render() to
                    // set the initial value.
                    $timeout(function() {
                        editor = $_element.redactor(options);
                        ngModel.$render();
                        element.on('remove',function(){
                            element.off('remove');
                            element.redactor('core.destroy');
                        });
                    });

                    ngModel.$render = function() {
                        if(angular.isDefined(editor)) {
                            $timeout(function() {
                                $_element.redactor('code.set', ngModel.$viewValue || '');
                                $_element.redactor('placeholder.toggle');
                                scope.redactorLoaded = true;
                            });
                        }
                    };
                }
            };
        }]);
})();

