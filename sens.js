'use strict';

var readline   = require('readline');
var statistics = require('math-statistics');
var usonic     = require('../lib/usonic.js');


//-----------------------// show information on screen.//-----------------------

var print = function (distances) {
    var distance = statistics.median(distances);

    process.stdout.clearLine();
    process.stdout.cursorTo(0);

    if (distance < 0) {
        process.stdout.write('Error: Measurement timeout.\n');
    } else {
        process.stdout.write('Distance: ' + distance.toFixed(2) + ' cm');
    }
};


//--------------------// show config info and measure the distance//-------------------------------
var initSensor = function (config) {
    var sensor = usonic.createSensor(config.echoPin, config.triggerPin, config.timeout);

    console.log('Config: ' + JSON.stringify(config));

    var distances;


    (function measure() {
        if (!distances || distances.length === config.rate) {
            if (distances) {
                print(distances);
            }

            distances = [];
        }

        setTimeout(function () {
            distances.push(sensor());

            measure();
        }, config.delay);
    }());
};

   

//----------------------------get the pin value for seting up GPIOs of RPI-----------------------------

                    usonic.init(function (error) {
                        if (error) {
                            console.log(error);
                        } else {

   		         var echoPin1=24;   
            	 var triggerPin1=23;

                            initSensor({
			    
                                echoPin: echoPin1, // you can set the content,which is after the colon, with number or variable. 
                                triggerPin: triggerPin1, 
                                timeout: 750,
                                delay: 60,
                                rate: 5
                            });
                        }
                    });
       



