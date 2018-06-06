define(['../DataSources/CallbackProperty','../Core/EasingFunction','../Core/defaultValue',], function(CallbackProperty, EasingFunction, defaultValue) {
    'use strict';

    function EntityHighlight(props, scope) {
        EntityHighlight.prototype.scope = scope;
        this._animateType = defaultValue(props.scale, 'enlarge');
        this._primitiveType = defaultValue(props.scale, 'billboard');
        this._scalePercent = defaultValue(props.scalePercent, 0.5);
        this._minScale = defaultValue(props.minScale, 1);
        this._interval = defaultValue(props.interval, true);
        this._timeoutInterval = defaultValue(props.timeoutInterval, 16);
        this._speed = defaultValue(props.speed, 1000);
        this._duration = defaultValue(props.duration, 2000);
        this._indicationOnly = defaultValue(props.indicationOnly, false);
        this._easingFunction = defaultValue(props.easingFunction, 'ELASTIC_OUT');
        this._stopIncrease = false;
        this._scaleSum = 0;
    }

    EntityHighlight.prototype.setLongAnimate = function() {
        var scalePerStep = this.calculateEnlargeStepLongAnimation();
        var increase;
        var minScale = this._minScale;
        var scaleSum = this._scaleSum;
        var scale;
        EntityHighlight.prototype.scope.billboard.scale = new CallbackProperty(function() {
            scaleSum = scaleSum ? scaleSum + scalePerStep : minScale;
        if (scaleSum >= 1) {
            increase = false;
            scalePerStep = -scalePerStep;
            scaleSum += scalePerStep;
        }
        if (scaleSum <= 0){
            increase = true;
            scalePerStep = scalePerStep * -1;
            scaleSum += scalePerStep;
        }

        scale = this.increase ? EasingFunction.BACK_OUT(scaleSum) : EasingFunction.BACK_IN(scaleSum);
        scale += minScale;
        return scale;
    }, false)
    }


    EntityHighlight.prototype.setShorAnimate = function() {
        var scalePerStep = this.calculateEnlargeStepShortAnimation();
        var scaleSum;
        var easingFunction = this._easingFunction;
        if (!this._stopIncrease) {
            EntityHighlight.prototype.scope.billboard.scale = new CallbackProperty( function() {

                scaleSum =
                    scaleSum ?
                    scaleSum + scalePerStep : scalePerStep;
            if (
                scaleSum >= 1) {
                return 1;
            }
            return EasingFunction[easingFunction](
                scaleSum);
            },false)
        }
    }

    EntityHighlight.prototype.calculateEnlargeStepLongAnimation = function() {
        var durationInSeconds = 3000;
        var numberOfSteps = (durationInSeconds / 2) / 16;
        var currentScale = 1;
        var scalePercent = 1 + 0.5;
        var scaleDelta = scalePercent * currentScale - currentScale;
        var scalePerStep = scaleDelta / numberOfSteps;
        return scalePerStep;
    };
    EntityHighlight.prototype.calculateEnlargeStepShortAnimation = function() {
        var durationInSeconds = this._speed;
        var numberOfSteps = (durationInSeconds / 2) / this._timeoutInterval;
        var currentScale = this._minScale;
        var scalePercent = 1 + this._scalePercent;
        var scaleDelta = scalePercent * currentScale - currentScale;
        var scalePerStep = scaleDelta / numberOfSteps;
        return scalePerStep;
    }
    EntityHighlight.prototype.setAnimate = function() {
        switch (this._animateType) {
            case 'enlarge':
                this.setLongAnimate();
                break;
            case 'indication':
                this.setShortAnimate();
                break;
            default:
                this.setLongAnimate();
                break;
        }
    }
    return EntityHighlight;
});
