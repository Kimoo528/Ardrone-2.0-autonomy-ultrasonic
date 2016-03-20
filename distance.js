'use strict';

var readline   = require('readline');
var statistics = require('math-statistics');
var usonic     = require('../lib/usonic.js');


var print = function (distancesR, distancesB, distancesL, distancesF) {
    var distanceR = statistics.median(distancesR);
    var distanceB = statistics.median(distancesB);
    var distanceL = statistics.median(distancesL);
    var distanceF = statistics.median(distancesF);

    process.stdout.clearLine();
    process.stdout.cursorTo(1);

 /*if (distanceR || distanceB || distanceL || distanceF < 0) {
	if (distanceR<0) {process.stdout.write('Right sensor Error: Measurement timeout.\n');}
 } else {  */

        process.stdout.write('Right: ' + distanceR.toFixed(1) + ' cm' + ' Back: '+distanceB.toFixed(1) + ' cm' + ' Left: ' + distanceL.toFixed(1) + ' cm' + ' Front: '+distanceF.toFixed(1) + ' cm');
    //}
};


var initSensor = function (config) {
    	var sensorR = usonic.createSensor(config.echoPin, config.triggerPin, config.timeout);
	var sensorB = usonic.createSensor(21, 20, 750);
	var sensorL = usonic.createSensor(26, 19, 750);
	var sensorF = usonic.createSensor(6, 5, 750);
	// var sensorT = usonic.createSensor(config.echoPin, config.triggerPin, config.timeout); // reserve for the sensor on top
     console.log('Pin Config:" Right: E24,T23; Back: E21,T20; Left: E26,T19; Front: E6,T5" ' )
   // console.log('Config: ' + JSON.stringify(config));

    var distancesR;
    var distancesB;
    var distancesL;
    var distancesF;
// var distancesT;



    (function measure() {
        if (!distancesR || distancesR.length === config.rate) {
            if (distancesR) {
                print(distancesR, distancesB, distancesL, distancesF);
            }

            distancesR = [];
            distancesB = [];
            distancesL = [];
            distancesF = [];
        }

        setTimeout(function () {
            distancesR.push(sensorR());
	    distancesB.push(sensorB());
	    distancesL.push(sensorL());
	    distancesF.push(sensorF());
	
            measure();
        }, config.delay);
    }());
};


                    usonic.init(function (error) {
                        if (error) {
                            console.log(error);
                        } else {

                            initSensor({
                                echoPin: 24, 
                                triggerPin: 23,      
                                timeout: 750,
                                delay: 60,
                                rate: 5
                            });
              }
                    });
       



