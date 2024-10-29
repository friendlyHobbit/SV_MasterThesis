/*****
 DATA
*****/
let dataForDb = {}; // JSON payload of all trackable data which will be sent to the server for saving.
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
    sessionStorage.sessionIndex = 0;
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

    console.log('Recording answer:', dataForDb);

    $.ajax({
        type: 'post',
        url: '/answers',
        data: dataForDb,
        beforeSend: function(xhr) {
            xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))
        },
        success: function () {
            incrementSessionIndex();
            sessionComplete = true;
            showContinuePrompt();
        }
    });
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
        case 'q': return d3.rgb(0,0,255);		// blue 65%
        case 'm': return d3.rgb(255,255,0);		// yellow 65%
        case 'b': return d3.rgb(0,255,0);		// green 65%
        case 'h': return d3.rgb(255,0,0);		// red 65%
    }
}

//Sita - color interpolation (unsaturated to saturated)
function interpolColor(variable, maxSize){
	if (variable === 0){
		//min saturation
	}
	else if (variable === maxSize){
		//max saturation
	}
}


/**********
 RENDERING
**********/
function setSessionInstructions() {
    let $si = $('.session-instructions');

    if (sessionObject.sessionType === 'identifySingleChart') {
        $si.text("Press the number corresponding to the chart's state");
    }
    else if (sessionObject.sessionType === 'identifySequentialCharts') {
        $si.text("Press the number corresponding to each chart's state");
        outlineChart(answerIndex);
    }
    else if (sessionObject.sessionType === 'identifyUniqueChart') {
        if (sessionObject.testPhase === 'trainingB' || sessionObject.testPhase === 'performanceA') {
            let uniqueState = sessionObject.uniqueChartState;

            if (sessionObject.isDynamic)
                $si.html(`Press the space bar when a chart has entered <b>state ${uniqueState}</b>`);
            else
                $si.html(`Press the space bar when you find the chart in <b>state ${uniqueState}</b>`);
        }
        else if (sessionObject.testPhase === 'performanceB') {
            if (sessionObject.isDynamic)
                $si.text('Press the space bar when a chart has entered a unique state');
            else
                $si.text('Press the space bar when you find the chart in a unique state');
        }
    }
}

function drawCharts(isUniqueChartTransition) {
    if (sessionObject.sessionType === 'infoPage') {
        $('.main').load(sessionObject.pageFile, function() {
            $('.main').find('script').each(function() {
                eval($(this).text());
            });
        });
        return;
    }

    if (sessionObject.isDynamic) {
        if (drawChartsInterval === undefined) {
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
                        dataForDb.transitionStarted = false;
                        sessionData.push(chart.startStates[dynamicChartsInterval % chart.startStates.length])
                    }
                    else {
                        dataForDb.transitionStarted = true;
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
    $('.overlay').hide()
}

/******************
 ANSWER MANAGEMENT
******************/
function processAnswer(userAnswer) {
    if (sessionObject.sessionType === 'identifySingleChart') {
        dataForDb.triggerTime = Date.now();
        dataForDb.participantAnswerState = userAnswer;
        markAnswer(answerIndex, userAnswer, sessionData[0].state);
    }
    else if (sessionObject.sessionType === 'identifySequentialCharts') {
        let answerObject = {
            chartIndex: answerIndex,
            chartState: sessionData[answerIndex].state,
            participantAnswerState: userAnswer,
            participantAnswerTime: Date.now()
        };

        dataForDb.sequentialChartAnswers.push(answerObject);

        markAnswer(answerIndex, userAnswer, sessionData[answerIndex].state);

        answerIndex++;
        outlineChart(answerIndex);
    }
    else if (sessionObject.sessionType === 'identifyUniqueChart') {
        dataForDb.uniqueChartState = sessionObject.uniqueChartState;
        dataForDb.uniqueChartIndex = sessionObject.uniqueChartIndex;
        dataForDb.participantAnswerIndex = userAnswer;
        dataForDb.participantAnswerState = sessionData[userAnswer].state;
        dataForDb.clickTime = Date.now();

        markAnswer(userAnswer, userAnswer, sessionObject.uniqueChartIndex, true);
        hideChartOverlays();
    }

    if (answerIndex === sessionObject.sessionData.length || sessionObject.sessionType === 'identifyUniqueChart') {
        endSession();
    }
}

function markAnswer(i, userAnswer, correctAnswer, identifyUniqueChartPhase) {
    let isCorrect = parseInt(userAnswer) === parseInt(correctAnswer);

    let feedback = svg.append("g").attrs({
        transform: "translate("
        + (feedbackTranslateX + Math.floor(i) % tiling * (side + outerMargin)) + ", "
        + (feedbackTranslateY + Math.floor(i / tiling) * (side + outerMargin)) + ")"
    });

    let text = feedback.append("text").attrs({
        y: side - 18,
        x: 0,
        height: 20,
        width: side,
        'text-anchor': 'middle'
    });

    let tspan1 = text.append('tspan'); // Includes YES or NO

    if (sessionObject.testPhase === 'performanceA' || sessionObject.testPhase === 'performanceB') {
        tspan1.text('Answer recorded').attr('fill', 'white');
    }
    else if (isCorrect) {
        if (identifyUniqueChartPhase) {
            // Don't need to show userAnswer here, which is just the index of the chart they chose
            tspan1.text("Correct").attr("fill", 'green');
        }
        else { // identifySequentialCharts
            tspan1.text("YES: " + userAnswer).attr("fill", 'green');
        }
    }
    else { // Incorrect
        if (identifyUniqueChartPhase) {
            tspan1.text("Incorrect").attr("fill", 'red');

            // Show the actual correct answer
            feedback = svg.append("g").attrs({
                transform: "translate("
                + (feedbackTranslateX + Math.floor(correctAnswer) % tiling * (side + outerMargin)) + ", "
                + (feedbackTranslateY + Math.floor(correctAnswer / tiling) * (side + outerMargin)) + ")"
            });

            feedback.append('text').text('State ' + sessionObject.uniqueChartState).attrs({
                y: side-20,
                x: 0,
                height: 20,
                width: side,
                fill: 'white',
                'text-anchor': 'middle'
            });

            outlineChart(correctAnswer, true);
        }
        else { // identifySequentialCharts
            tspan1.text("NO. ").attr("fill", 'red');

            let tspan2 = text.append('tspan');
            tspan2.text('Answer: ' + correctAnswer).attrs({
                fill: 'white'
            })
        }
    }
}

function outlineChart(chartIndex, markingAsCorrect) {
    let $allOutlines = $('.outline');
    $allOutlines.hide();

    let $outline = $allOutlines.eq(chartIndex);

    if (markingAsCorrect === true) {
        // Leave enough space for the word 'Correct' under chart
        let oldHeight = parseInt($outline.attr('height'));
        $outline.attr('height', oldHeight + 18);
    }

    $outline.show();
}

/***********
 NAVIGATION
***********/
function showContinuePrompt() {
    $('.continue-prompt').show();
}

// No longer used
function startReloadCountdown() {
    let $bar = $('.continue-progress-bar');
    let percent = 0;
    let duration = 7000;
    let counter = setInterval(moveProgressBar, duration/100);

    $bar.css('transition', 'width ' + duration/100/1000 + 's linear');

    function moveProgressBar() {
        if (percent === 100) {
            clearInterval(counter);
            document.location.reload();
        }
        else {
            $bar.css('width', percent + '%');
            percent++;
        }
    }
}

/***************
 EVENT HANDLERS
***************/
$(document).on('click', '.info-page-continue-button', function() {
    console.log('Recording answer (infoPage):', dataForDb);

    // Quick-fix for the Copy and Continue page
    dataForDb.participantId = sessionStorage.participantId;

    $.ajax({
        type: 'post',
        url: '/answers',
        data: dataForDb,
        beforeSend: function(xhr) {
            xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))
        },
        success: function () {
            incrementSessionIndex();
            document.location.reload();
        }
    });
});

$(document).on('click', '.overlay', function(event) {
    let chartIndex = $(event.target).parent().data('chart-index');
    processAnswer(chartIndex);
});

window.onkeydown = function(e) {
    if (keyCurrentlyDown) return;
    keyCurrentlyDown = true;

    let key = e.keyCode ? e.keyCode : e.which;
    let keyLiteral = String.fromCharCode(key);
    let st = sessionObject.sessionType;

    if (sessionComplete) {
        if (key === 13) {
            document.location.reload();
        }
        e.preventDefault();
        return false; // Prevent space bar from scrolling page
    }
    else if (st === 'identifySingleChart' && ['1', '2', '3', '4'].includes(keyLiteral)) {
        processAnswer(keyLiteral);
    }
    else if (st === 'identifySequentialCharts' && ['1', '2', '3', '4'].includes(keyLiteral)) {
        processAnswer(keyLiteral);
    }
    else if (st === 'identifyUniqueChart' && keyLiteral === ' ') {
        dataForDb.triggerTime = Date.now();

        if (drawChartsInterval !== undefined) {
            drawChartsInterval.stop();
        }

        clearTimeout(uniqueChartTransitionTimeout);

        if (sessionObject.isDynamic
            && dynamicChartsInterval < sessionObject.transitionAfterIntervals
            && sessionObject.testPhase === 'trainingB')
        {
            endSession();
            $('.session-instructions').html(
                `<span style="color: red;">Chart had not yet entered state ` + sessionObject.uniqueChartState + `</span>`
            );
        }
        else {
            showChartOverlays();
        }

        e.preventDefault();
        return false; // Prevent space bar from scrolling page
    }
    else if (keyLiteral === ' ') {
        e.preventDefault();
        return false;
    }
};

window.onkeyup = function(e) {
    keyCurrentlyDown = false;
};

// Emergency debug bar toggle
document.onkeyup = function(e) {
    let key = e.keyCode ? e.keyCode : e.which;
    let keyLiteral = String.fromCharCode(key);
    if (e.ctrlKey && keyLiteral === 'D') {
        $('.debug-bar').toggle();
    }
};

/*********
 DATA API
*********/
// For converting data to integers for D3
function type(d) {
    d.value = +d.value;
    return d;
}

function prepareDataForDbObject() {
    dataForDb = Object.assign(dataForDb, {
        participantId: sessionStorage.participantId,
        computerUuid: localStorage.computerUuid,
        chartType: chartType,
        dataSource: dataSource, // Recorded in case we work with more than one source
        sessionIndex: sessionStorage.sessionIndex,
        testPhase: sessionObject.testPhase,
        sessionType: sessionObject.sessionType,
        transitionAfter: sessionObject.transitionAfterIntervals,
        sessionStartTime: Date.now(),
        sequentialChartAnswers: []
    });
    if (sessionObject.sessionType !== 'infoPage') {
        dataForDb = Object.assign(dataForDb, {
            numberOfCharts: sessionData.length,
            isDynamic: sessionObject.isDynamic,
        });
    }
}

$(document).ready(function() {
    d3.json(dataSource, /*type,*/ function(error, d) {
        if (error) throw error;
        data = d;
        sessionObject = getSessionObject();
        drawCharts();
        // drawCharts(); // D3 V4 (temporary fix for static charts)
        if (!sessionObject) return;
        showDebugInfo();
        setSessionInstructions();
        prepareDataForDbObject();
    });
});

/*********************************
 FOR CHART TYPE-SPECIFIC JS FILES
*********************************/
function convertDataObjectToKeyValuePairs(dataObject) {
    return ['q', 'm', 'b', 'h'].map(function(key) {
        return { key: key, value: dataObject[key], dataObject: dataObject }
    });
}

/******
 DEBUG
******/
function showDebugInfo() {
    let $debugBar = $('.debug-bar');

    if (document.location.search.split('?')[1] !== 'debug') {
        $debugBar.hide();
    }
    else {
        $debugBar.show();
    }

    $debugBar.append(
        `<select class="chart-type-selector">
            <option value="/barchart">Bar chart</option>
            <option value="/boxchart">Box chart</option>
			<option value="/improvedboxchart">Improved box chart</option>
            <option value="/eidchart">EID chart</option>
        </select>`
    );

    $('.chart-type-selector').val(document.location.pathname);

    $(document).on('change', '.chart-type-selector', function() {
        document.location.pathname = $(this).val();
    });

    $debugBar.append('<select class="session-selector"></select>');

    let $sessionSelector = $('.session-selector');

    let $trainingAOptgroup = $('<optgroup label="Training A (sequential charts, feedback given)"></optgroup>').appendTo($sessionSelector);
    data.trainingA.forEach(function(session) {
        appendSessionToOptgroup('trainingA', session, $trainingAOptgroup);
    });

    let $trainingBOptgroup = $('<optgroup label="Training B (told unique state, feedback given)"></optgroup>').appendTo($sessionSelector);
    data.trainingB.forEach(function(session) {
        appendSessionToOptgroup('trainingB', session, $trainingBOptgroup);
    });

    let $performanceAOptgroup = $('<optgroup label="Performance A (told old state, no feedback given)"></optgroup>').appendTo($sessionSelector);
    data.performanceA.forEach(function(session) {
        appendSessionToOptgroup('performanceA', session, $performanceAOptgroup);
    });

    let $performanceBOptgroup = $('<optgroup label="Performance B (not told unique state, no feedback given)"></optgroup>').appendTo($sessionSelector);
    data.performanceB.forEach(function(session) {
        appendSessionToOptgroup('performanceB', session, $performanceBOptgroup);
    });

    $sessionSelector.val(sessionStorage.sessionIndex);

    $(document).on('change', '.session-selector', function() {
        sessionStorage.sessionIndex = $(this).val();
        document.location.reload();
    });

    function appendSessionToOptgroup(testPhase, session, $optGroup) {
        if (session.sessionType === 'infoPage') {
            let pf = session.pageFile;
            let fileName = pf.substring(pf.lastIndexOf('/')+1, pf.lastIndexOf('.'));
            $optGroup.append(
                `<option value='${session.sessionIndex}'>
                    ${session.sessionIndex}: ${testPhase} - infoPage (${fileName})
                </option>`);
        }
        else {
            $optGroup.append(
                `<option value='${session.sessionIndex}'>
                    ${session.sessionIndex}: ${testPhase} - ${session.sessionType} (${session.isDynamic ? 'dynamic' : 'static'}, ${session.sessionData.length} charts)
                </option>`);
        }
    }
}
