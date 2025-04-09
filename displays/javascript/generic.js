/*****
 DATA
*****/
let dataSource; // Relative path to the JSON data source.
let data; // Data asynchronously retrieved from the dataSource.
let sessionObject; // Data for this particular session (page) extracted from data, corresponding to the current sessionIndex.
let sessionData; /* Contains data for all the charts that will be shown on screen at an exact point in time.
I.e. For dynamic charts, this will contain every chart's state definition for the currently
active time interval, *not* the state definition for every time interval. */

/******************
 SEQUENTIAL CHARTS
******************/
let answerIndex = 0; // Index of the chart which the user is currently identifying the state of.
let keyCurrentlyDown = false; /* Used to ensure that each key press is counted only once.
Otherwise, the user may accidentally hold down a key for too long and that key would
be counted as an answer for more than one sequential chart. */

/***************
 DYNAMIC CHARTS
***************/
let dynamicChartsInterval = 0; // Interval of dynamic charts that are currently being drawn.
let dynamicChartsIntervalDuration = 5000; // How long it takes to transition to the next interval.
let drawChartsInterval; // Holds interval timer which repeatedly triggers the next dynamic interval.
let transitioningSelectionsSet = false;
let transitioningSelections = [];

/***********
 UNIQUE CHARTS
***********/
let uniqueChartTransitionTimeout; // Holds timeout countdown timer for transitioning into unique state.
let uniqueChartTransitioned = false; // Whether the unique chart has transitioned state yet.

/****************
 VISUAL SETTINGS
****************/
let svg;
let side; // Length of each side of each chart.
let outerMargin; // Outer margin of each chart.
let tiling; // Number of charts per row.
let feedbackTranslateX; // Horizontal offset of feedback text for each chart.
let feedbackTranslateY; // Vertical offset of feedback text for each chart.
let feedbackFontSize;

let margin = { top: 10, right: 20, bottom: 30, left: 30 };
let width  = side - margin.left - margin.right;
let height = side - margin.top - margin.bottom;
let initialOffset = { left: 45, top: 20 };
feedbackTranslateX = side * 0.6;

/************
 DATA SOURCE
*************/
if (sessionStorage.dataSource !== undefined) {
    // Provides a way to override the hard-coded dataSource below. Therefore you can switch the dataSource
    // in production via the browser console, without editing and redeploying this file.
    dataSource = sessionStorage.dataSource;
}
else {
    // No override in place, use hard-coded dataSource.
    dataSource = 'data/data-real.json';
}

/**************
 COMPUTER UUID
**************/
// Generates a unique ID (UUID V4) used to identify this computer across page reloads and even sessionStorage resets
// https://stackoverflow.com/a/2117523
function generateUuidV4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}

if (localStorage.computerUuid === undefined) {
    localStorage.computerUuid = generateUuidV4();
}

/*******************
 SESSION MANAGEMENT
*******************/
let sessionComplete = false;

if (sessionStorage.sessionIndex === undefined) {
    sessionStorage.sessionIndex = 10;
}

function getSessionObject() {
    let sessionIndex = parseInt(sessionStorage.sessionIndex);
    for (let i = 0; i < data.trainingA.length; i++) {
        if (data.trainingA[i].sessionIndex === sessionIndex) { return data.trainingA[i]; }
    }
    for (let i = 0; i < data.trainingB.length; i++) {
        if (data.trainingB[i].sessionIndex === sessionIndex) { return data.trainingB[i]; }
    }
    for (let i = 0; i < data.performanceA.length; i++) {
        if (data.performanceA[i].sessionIndex === sessionIndex) { return data.performanceA[i]; }
    }
    for (let i = 0; i < data.performanceB.length; i++) {
        if (data.performanceB[i].sessionIndex === sessionIndex) { return data.performanceB[i]; }
    }
}

function incrementSessionIndex() {
    sessionStorage.sessionIndex = parseInt(sessionStorage.sessionIndex) + 1;
}

function endSession() {
    $('.session-instructions').text('');

    if (drawChartsInterval !== undefined) {
        clearInterval(drawChartsInterval);

        // Stop any unfinished transitions mid-transition. Don't let them proceed even a pixel further.
        transitioningSelections.forEach(function(selection) {
            selection.transition().duration(0);
        });
    }
}

/*******
 COLORS
********/
// let colors = d3.scale.category10(); // Get the predefined D3 'category10' colors // D3 V3
// let colors = d3.scaleOrdinal(d3.schemeCategory10); // D3 V4

// colors.domain(d3.range(3)); // Limit those colors to 4 items (0, 1, 2, 3)

// Function to return color based on integer
function color(variable) {
    switch (variable) {
        case 'q': return d3.rgb(0,177,0);		// green
        case 'm': return d3.rgb(255,78,255);	// magenta
        case 'b': return d3.rgb(0,152,255);		// blue
        case 'h': return d3.rgb(255,1,0);		// red 
    }
}

//Sita - color interpolation (unsaturated to saturated)
/*
function interpolColor(variable, maxSize){
	if (variable === 0){
		//min saturation
	}
	else if (variable === maxSize){
		//max saturation
	}
}
*/


/**********
 RENDERING
**********/
let userReady = false;  	//Sita



function drawCharts(isUniqueChartTransition) {
    if (sessionObject.sessionType === 'infoPage') {
        $('.main').load(sessionObject.pageFile, function() {
            $('.main').find('script').each(function() {
                eval($(this).text());
            });
        });
        return;
    }

    if (sessionObject.isDynamic) {	//sita
        if (drawChartsInterval === undefined ) {		
            startDynamicCharts();
            return;
        }
        else {
            sessionData = [];
            sessionObject.sessionData.forEach(function(chart) {
                if (Array.isArray(chart)) { // This is a normal dynamic chart
                    sessionData.push( chart[dynamicChartsInterval % chart.length] );
                }
                else { // Object - This is the chart which will change to the unique state
                    if (dynamicChartsInterval < sessionObject.transitionAfterIntervals) {
                        sessionData.push(chart.startStates[dynamicChartsInterval % chart.startStates.length])
                    }
                    else {
                        sessionData.push(chart.endStates[dynamicChartsInterval % chart.endStates.length])
                    }
                }
            });
        }
    }
    else {
        sessionData = [];
        sessionObject.sessionData.forEach(function(chart) {
            sessionData.push(chart);
        });
    }

    if (tiling === undefined) {
        switch (sessionData.length) {
            case 8:
                tiling = 4;
                break;
            case 32:
                tiling = 8;
                break;
            default: // case 72
                tiling = 12;
        }
    }

    if (svg === undefined) {
        setUpSvg();
        $('body').addClass('charts-' + sessionData.length);
    }

    _draw(isUniqueChartTransition);

    dynamicChartsInterval++;
}

function setUpSvg() {
    // Append svg element to the body and store reference as 'svg'
    svg = d3.select('.main').append('svg');

    svg.attrs({
        class: 'chart ' + document.location.pathname.split('/')[1],
        viewBox: '0 0 2600 1260',
        perserveAspectRatio: 'xMinYMin meet'
    });
}

/***************
 DYNAMIC CHARTS
****************/
function startDynamicCharts() {
    drawChartsInterval = d3.interval(drawCharts, dynamicChartsIntervalDuration);
    drawCharts(); // Draw first chart instantly (index 0).
    drawCharts(); // Start first transition (to index 1 chart) immediately, instead of waiting for first call from interval function.
}

function uniqueChartTransition() {
    uniqueChartTransitioned = true;
    drawCharts(true);
}

/***************
 CHART OVERLAYS
****************/
function showChartOverlays() {
    $('.overlay').show();
	$('.session-instructions').text('Click on the box of the chart you identified');
}

function hideChartOverlays() {
    $('.overlay').hide();
}



/***************
 EVENT HANDLERS
***************/

window.onkeyup = function(e) {
    keyCurrentlyDown = false;
};

/*********
 DATA API
*********/
// For converting data to integers for D3
function type(d) {
    d.value = +d.value;
    return d;
}

/*********************************
 FOR CHART TYPE-SPECIFIC JS FILES
*********************************/
function convertDataObjectToKeyValuePairs(dataObject) {
    return ['q', 'm', 'b', 'h'].map(function(key) {
        return { key: key, value: dataObject[key], dataObject: dataObject }
    });
}
