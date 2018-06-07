define([
    '../DataSources/CallbackProperty',
    '../Core/EasingFunction',
    '../Core/defaultValue',
    '../Core/defined'
], function(CallbackProperty, EasingFunction, defaultValue, defined) {
    'use strict';

    function EntityHighlight(props, scope) {
        EntityHighlight.prototype.scope = scope;
        this._pickedPrimitve = {};
        this._animations = [];
        this._options = {};
    }

    var AnimateType = {
        shrinkGrow : 'shrink/grow',
        IndicationEnlarge : 'IndicationEnlarge'
    };

    EntityHighlight.prototype.setOptions = function(scope) {
        var options = scope._options;
        options.animateType = defaultValue(options.animateType, 'shrink/grow');
        options.primitiveType = defaultValue(
            options.primitiveType,
            'billboard'
        );
        options.scalePercent = defaultValue(options.scalePercent, 0.9);
        options.minScale = defaultValue(options.minScale, 1);
        options.interval = defaultValue(options.interval, true);
        options.timeoutInterval = defaultValue(options.timeoutInterval, 16);
        options.speed = defaultValue(options.speed, 1000);
        options.duration = defaultValue(options.duration, 2000);
        options.indicationOnly = defaultValue(options.indicationOnly, false);
        options.easingFunction = defaultValue(
            options.easingFunction,
            'ELASTIC_OUT'
        );
        options.stopIncrease = false;
        options.scaleSum = 0;
        options.scale = defaultValue(options.scale, this.minScale);
        options.increase;
    };

    EntityHighlight.prototype.setDefinedPrimitivesInEntity = function(
        selectedEntity
    ) {
        if (defined(selectedEntity.billboard)) {
            this._pickedPrimitve.billboard = selectedEntity.billboard;
        }
    };

    EntityHighlight.prototype.setup = function(
        animationArr,
        newOptions,
        entity
    ) {
        EntityHighlight.prototype.setOptions(this);
        EntityHighlight.prototype.scope = entity;
        var options = this._options;

        newOptions.forEach(function(option) {
            options = Object.assign({}, options, option);
        });

        this._options = options;
        var selectedEntity = entity;
        var helperArr = [];
        if (animationArr) {
            animationArr.forEach(function(animation) {
                switch (animation) {
                    case AnimateType.shrinkGrow:
                        helperArr.push(
                            new EntityHighlight.prototype.enlarge(
                                selectedEntity,
                                options
                            )
                        );
                        break;
                    case AnimateType.IndicationEnlarge:
                        helperArr.push(
                            new EntityHighlight.prototype.indicationEnlarge(
                                selectedEntity,
                                options
                            )
                        );
                        break;
                    default:
                        helperArr.push(
                            EntityHighlight.prototype.enlarge(
                                selectedEntity,
                                options
                            )
                        );
                }
            });
            this._animations = helperArr;
            this.setDefinedPrimitivesInEntity(selectedEntity);
        }
    };

    EntityHighlight.prototype.stop = function() {
        var options = this._options;
        if (this._animations) {
            this._animations.forEach(function(animation) {
                animation.stopCallback(options);
            });
        }
    };

    EntityHighlight.prototype.start = function() {
        this._animations.forEach(function(animation) {
            animation.setAnimate();
        });
        if (!this._options.interval || this._options.indicationOnly) {
            var entity = this;
            window.setTimeout(function() {
                entity.stop();
            }, this._options.duration);
        }
    };

    EntityHighlight.prototype.enlarge = function(selectedEntity, options) {
        var increase;

        var minScale = options.minScale;
        var scale;

        this.calculateEnlargeStep = function() {
            var durationInSeconds = this._options.speed;
            var numberOfSteps = durationInSeconds / 2 / 16;
            var currentScale = this._options.minScale;
            var scalePercent = 1 + 0.5;
            var scaleDelta = scalePercent * currentScale - currentScale;
            var scalePerStep = scaleDelta / numberOfSteps;
            return scalePerStep;
        };
        this.setAnimate = function() {
            var scaleSum;
            var scalePerStep = this.calculateEnlargeStep();
            EntityHighlight.prototype.scope.billboard.scale = new CallbackProperty(
                function() {
                    scaleSum = scaleSum ? scaleSum + scalePerStep : minScale;
                    if (scaleSum >= 1) {
                        increase = false;
                        scalePerStep = -scalePerStep;
                        scaleSum += scalePerStep;
                    }
                    if (scaleSum <= 0) {
                        increase = true;
                        scalePerStep = scalePerStep * -1;
                        scaleSum += scalePerStep;
                    }

                    scale = increase
                            ? EasingFunction.BACK_OUT(scaleSum)
                            : EasingFunction.BACK_IN(scaleSum);
                    scale += minScale;
                    return scale;
                },
                false
            );
        };
        this.stopCallback = function(options) {
            var scalePercent = options.scalePercent + 1;
            var scaleMax = options.minScale * scalePercent;
            var scalePerStep = this.calculateEnlargeStep();
            var interval = setInterval(function() {
                if (scaleMax <= scale && increase) {
                    increase = !increase;
                }
                if (options.minScale >= scale && !increase) {
                    clearInterval(interval);
                }

                scale += increase ? scalePerStep : -scalePerStep;
                EntityHighlight.prototype.scope.billboard.scale = scale;
            }, options.timeoutInterval);
        };
    };

    EntityHighlight.prototype.indicationEnlarge = function(
        selectedEntity,
        options
    ) {
        var speed = options.speed;
        var timeoutInterval = options.timeoutInterval;
        var minScale = options.minScale;
        var easingFunction = options.easingFunction;
        var stopIncrease = options.stopIncrease;

        this.calculateEnlargeStep = function() {
            var durationInSeconds = speed;
            var numberOfSteps = durationInSeconds / 2 / timeoutInterval;
            var currentScale = minScale;
            var scalePercent = 1 + options.scalePercent;
            var scaleDelta = scalePercent * currentScale - currentScale;
            var scalePerStep = scaleDelta / numberOfSteps;
            return scalePerStep;
        };

        this.setAnimate = function() {
            var scaleSum;
            var scalePerStep = this.calculateEnlargeStep();
            if (!stopIncrease) {
                EntityHighlight.prototype.scope.billboard.scale = new CallbackProperty(
                    function() {
                        scaleSum = scaleSum
                                   ? scaleSum + scalePerStep
                                   : scalePerStep;
                        if (scaleSum >= 1) {
                            return 1;
                        }
                        console.log(EasingFunction[easingFunction](scaleSum));
                        return EasingFunction[easingFunction](scaleSum);
                    },
                    false
                );
            }
        };

        this.stopCallback = function() {
            EntityHighlight.prototype.scope.billboard.scale = 1;
        };
    };

    return EntityHighlight;
});
