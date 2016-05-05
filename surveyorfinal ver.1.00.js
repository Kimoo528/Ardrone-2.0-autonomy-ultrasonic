'use strict';
var arDrone    = require('ar-drone');
var readline   = require('readline');
var statistics = require('math-statistics');
var usonic     = require('../lib/usonic.js');

//----------------------------------------------------------------------------------------------------------------------
var disR, disL, disB, disF;
var flyState;
var currentState;
var nextState;
var speed = 0.05;
var time = 1000;
var client = arDrone.createClient();
//var left,right,forwards, backwards,route;

//------------------------------------------------- Take off-----------------------------------------------------------
var initialization = function () {
    client.takeoff();
    console.log('step1: takeoff ');
    currentState = 'initial';
    console.log('  step2: initialize currentState');
    client.after(5000, function() {
        this.stop();
    });
};
//---------------------**********---------- Drive ultrasonic sensor -----------****************-------------------------
var print = function (distancesR, distancesB, distancesL, distancesF) {
    var distanceR = statistics.median(distancesR);
    var distanceB = statistics.median(distancesB);
    var distanceL = statistics.median(distancesL);
    var distanceF = statistics.median(distancesF);

    disR = distanceR ;
    disL = distanceL ;
    disF = distanceF ;
    disB = distanceB ;

    process.stdout.clearLine();
    process.stdout.cursorTo(1);
    //  process.stdout.write('Right: ' + distanceR.toFixed(1) + ' cm' + ' Back: '+distanceB.toFixed(1) + ' cm' + ' Left: ' + distanceL.toFixed(1) + ' cm' + ' Front: '+distanceF.toFixed(1) + ' cm\n');

};

var initSensor = function (config) {
    var sensorR = usonic.createSensor(24, 23, 750);
    var sensorB = usonic.createSensor(27, 22, 750);
    var sensorL = usonic.createSensor(26, 19, 750);
    var sensorF = usonic.createSensor(21, 20, 750);

    console.log('Pin Config:" Right: E24,T23; Back: E27,T22; Left: E26,T19; Front: E21,T20" ' );

    var distancesR;
    var distancesB;
    var distancesL;
    var distancesF;

    (function measure() {
        var checkCfgrate = (!distancesR || distancesR.length === config.rate)&&(!distancesL || distancesL.length === config.rate)&&(!distancesF || distancesF.length === config.rate)&&(!distancesB || distancesB.length === config.rate);
        if (checkCfgrate) {
            var checkDistance = distancesR&&distancesL&&distancesF&&distancesB;
            if (checkDistance) {
                print(distancesR, distancesB, distancesL, distancesF);  // value assignment
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
//------------------------------- Drive ultrasonic sensor --------------------------------------------------------------

//-----------------------------**************---- STATE MACHINE ----**************--------------------------------------
//------------------------------ Movement Functions --------------------------------------------------------------------

var flyLeft = function (){
    client.left(speed);
    client.after(time, function() {
        client.stop();
    });
    console.log('\n * flyLeft * \n');
};

var flyRight = function (){
    client.right(speed);
    client.after(time, function() {
        client.stop();
    });
    console.log('\n * flyRight * \n');
};

var flyForwards = function () {
    client.front(speed);
    client.after(time, function() {
        client.stop();
    });
    console.log('\n * flyForwards * \n')
};

var flyBackwards = function (){
    client.back(speed);
    client.after(time, function() {
        client.stop();
    });
    console.log('flyBackwards');
};

var hover = function (){
    client.stop();
    console.log('hover');
};

var quitFly = function () {
    client.stop();
    console.log('quit fly')
};

//--------------------------------------- State Trans   ----------------------------------------------------------------
function stateTrans() {
    console.log('    step 3: setting state by Transition table ');
    // console.log('\n disL = '+disL + '\n disF = '+ disF + '\n');

    if(currentState == 'initial'){
        console.log('\n * in initial state *' );
        if(disL>=70){
            flyLeft();
            nextState = 'initial';
        }
        else{
            nextState = 'forwards';
        }
    }

    if(currentState == 'forwards'){
        console.log('* in forwards state * ');
        if((disL <= 50) && (disF >= 70)){
            flyRight();
            nextState = 'forwards';
        }
        else if ((disL >= 90) && (disF >= 70)){
            flyLeft();
            nextState = 'forwards';
        }
        else if ((disL > 50) && (disL < 90 ) && (disF >= 70)){
            flyForwards();
            nextState = 'forwards'
        }
        else {
            nextState = 'right'
        }
    }

    if(currentState == 'right'){
        console.log('* in right state * ');
        if((disF <= 50) && (disR >= 70)){
            flyBackwards();
            nextState = 'right';
        }
        else if ((disF >= 90) && (disR >= 70)){
            flyForwards();
            nextState = 'right';
        }
        else if ((disF > 50) && (disF < 90 ) && (disR >= 70)){
            flyRight();
            nextState = 'right'
        }
        else {
            nextState = 'backwards'
        }
    }

    if(currentState == 'backwards'){
        console.log('* in backwards state * ');
        if((disR <= 50) && (disB >= 70)){
            flyLeft();
            nextState = 'backwards';
        }
        else if ((disR >= 90) && (disB >= 70)){
            flyRight();
            nextState = 'backwards';
        }
        else if ((disR > 50) && (disR < 90 ) && (disB >= 70)){
            flyBackwards();
            nextState = 'backwards'
        }
        else {
            nextState = 'left'
        }
    }

    if(currentState == 'left'){
        console.log('* in left state * ');
        if((disB <= 50) && (disL >= 70)){
            flyForwards();
            nextState = 'left';
        }
        else if ((disB >= 90) && (disL >= 70)){
            flyBackwards();
            nextState = 'left';
        }
        else if ((disB > 50) && (disB < 90 ) && (disL >= 70)){
            flyLeft();
            nextState = 'left'
        }
        else {
            nextState = 'quitfly'
        }
    }

    if(currentState == 'quitfly'){
        quitFly();
    }

}

//--------------------------------------- State Setting up -------------------------------------------------------------
function latchState() {
    console.log('      step 4: latch the next state');
    //var checkDistances = Math.min(disR,disB,disF,disL);
    currentState = nextState;

}

//----------------------------------------------Main Functions ---------------------------------------------------------
//--------------------------------------------Run Sensors --------------------------------------------------------------
usonic.init(function (error) {
    if (error) {
        console.log(error);
    }
    else {
        initSensor({

            delay: 2000,
            rate: 5
        });
    }
});

//------------------------------------------ Taking off ----------------------------------------------------------------
initialization();
//-------------------------------------------- Call statemachine -------------------------------------------------------
setTimeout(function () {
    (function repeat() {
        setTimeout(function () {
            stateTrans();
            setTimeout(function () {
                latchState();
            }, 5000);
            repeat();
        }, 10000);
    }());
},5000);