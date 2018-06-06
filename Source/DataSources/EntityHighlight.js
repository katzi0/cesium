define(['../DataSources/CallbackProperty', '../Core/EasingFunction', '../Core/defaultValue'], function(CallbackProperty, EasingFunction, defaultValue) {
    'use strict';

    function EntityHighlight(props, scope) {
        EntityHighlight.prototype.scope = scope;

        this._animateType = defaultValue(props.animateType, 'enlarge');
        this._primitiveType = defaultValue(props._primitiveType, 'billboard');
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
        this._scale = defaultValue(props.scale, this._minScale);
        this._increase;
    }

    EntityHighlight.prototype.options = [
        { animateType : this._animateType },
        { primitiveType : this._primitiveType },
        { scalePercent : this._scalePercent },
        { minScale: this._minScale },
        { interval: this._interval },
        { timeoutInterval: this._timeoutInterval },
        { speed: this._speed },
        { duration: this._duration },
        { indicationOnly: this._indicationOnly },
        { easingFunction: this._easingFunction },
        { stopIncrease: this._stopIncrease },
        { scaleSum: this._scaleSum },
        { scale: this._scale },
        { increase: this._increase }
    ];

    EntityHighlight.prototype.setLongAnimate = function() {
        var scalePerStep = this.calculateEnlargeStepLongAnimation();
        var increase = this._increase;
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
            if (scaleSum <= 0) {
                increase = true;
                scalePerStep = scalePerStep * -1;
                scaleSum += scalePerStep;
            }

            scale = increase ? EasingFunction.BACK_OUT(scaleSum) : EasingFunction.BACK_IN(scaleSum);
            scale += minScale;
            return scale;
        }, false);

        this._increase = increase;
    };

    EntityHighlight.prototype.setShortAnimate = function() {
        var scalePerStep = this.calculateEnlargeStepShortAnimation();
        var scaleSum;
        var easingFunction = this._easingFunction;
        if (!this._stopIncrease) {
            EntityHighlight.prototype.scope.billboard.scale = new CallbackProperty(function() {

                scaleSum =
                    scaleSum ?
                    scaleSum + scalePerStep : scalePerStep;
                if (
                    scaleSum >= 1) {
                    return 1;
                }
                return EasingFunction[easingFunction](
                    scaleSum);
            }, false);
        }
    };

    EntityHighlight.prototype.longAnimationStop = function() {
        var scalePercent = this._scalePercent + 1;
        var scaleMax = this._minScale * scalePercent;
        var scalePerStep = this.calculateEnlargeStepLongAnimation();
        var interval = setInterval(function() {
            if (scaleMax <= this._scale && this._increase) {
                this._increase = !this._increase;
            }
            if (this._minScale >= this.scale && !this._increase) {
                clearInterval(interval);
            }

            this.scale += this.increase ? scalePerStep : -scalePerStep;
            EntityHighlight.prototype.scope.billboard.scale = this._scale;
        }, this._timeoutInterval);
    };

    EntityHighlight.prototype.shortAnimationStop = function() {
        EntityHighlight.prototype.scope.billboard.scale = 1;
    };

    //stopped here...
    EntityHighlight.setup();

    EntityHighlight.prototype.stop = function() {
        switch (this._animateType) {
            case 'enlarge':
                this.longAnimationStop();
                break;
            case 'indication':
                this.shortAnimationStop();
                break;
            default:
                this.longAnimationStop();
                break;
        }
    };

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
    };

    EntityHighlight.prototype.start = function() {
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
        if (!this._interval || this._indicationOnly) {
            this._stop();
        }
    };

    return EntityHighlight;
});
