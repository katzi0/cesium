define(['../DataSources/CallbackProperty'], function(CallbackProperty) {
    'use strict';

    function BillboardHighlight(props, scope) {
        console.log('hhh21312sadfsadcasdcasdf3asdsadasasdasddasd123');
        BillboardHighlight.prototype.scope = scope;
        // BillboardHighlight.prototype.scale = this.scope.pickPrimitive._scale;
        // BillboardHighlight.prototype.setAnimate();
    }

    BillboardHighlight.prototype._testFunc = function() {
        console.log('inside test func');
        this.scope.pickPrimitive._scale = 10;
    }

    BillboardHighlight.prototype.setAnimate = function() {
        var scalePerStep = this.calculateEnlargeStep();
        var scaleSum;// = 1;
        BillboardHighlight.prototype.scope.scale = 1;
        var test123 = new CallbackProperty(function(a,b) {
            scaleSum = scaleSum ? scaleSum + scalePerStep : scalePerStep;
            if (scaleSum >= 1) {
                return 1;
            }
            console.log("a"+a);
            return scaleSum;
        }, true);
        //
        // var interval = window.setInterval(function() {
        //     scaleSum += scalePerStep;
        //     BillboardHighlight.prototype.scope.scale = scaleSum;
        // }, 16);
        //
        // window.setTimeout(function() {
        //     clearInterval(interval);
        // }, 5000);
    }

    BillboardHighlight.prototype.calculateEnlargeStep = function() {
        var durationInSeconds = 3000;
        var numberOfSteps = (durationInSeconds / 2) / 16;
        var currentScale = 1;
        var scalePercent = 1 + 0.5;
        var scaleDelta = scalePercent * currentScale - currentScale;
        var scalePerStep = scaleDelta / numberOfSteps;
        return scalePerStep;
    };

    return BillboardHighlight;
});
