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



    process.stdout.write('Right: ' + distanceR.toFixed(1) + ' cm' + ' Back: '+distanceB.toFixed(1) + ' cm' + ' Left: ' + distanceL.toFixed(1) + ' cm' + ' Front: '+distanceF.toFixed(1) + ' cm');
 
};

//module.exports = initSensor;
var initSensor = function (config) { 
    	var sensorR = usonic.createSensor(24, 23, 750);
	var sensorB = usonic.createSensor(27, 22, 750);
	var sensorL = usonic.createSensor(26, 19, 750);
	var sensorF = usonic.createSensor(21, 20, 750);
    
     console.log('Pin Config:" Right: E24,T23; Back: E27,T22; Left: E26,T19; Front: E21,T20" ' )


    var distancesR;
    var distancesB;
    var distancesL;
    var distancesF;


    (function measure() {
     var checkCfgrate = (!distancesR || distancesR.length === config.rate)&&(!distancesL || distancesL.length === config.rate)&&(!distancesF || distancesF.length === config.rate)&&(!distancesB || distancesB.length === config.rate);
     //  console.log(checkCfgrate);
        if (checkCfgrate) {   
            var checkDistance = distancesR&&distancesL&&distancesF&&distancesB;  
      //    console.log('cd='+checkDistance);           
            if (checkDistance) {
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
                        } 
			else {
                            initSensor({
 
                                delay: 60,
                                rate: 5 
                            });
                        }
}); 
       
// exports.initSensor =initSensor


