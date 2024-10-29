// Set up the data definition in this file, then view the /generate_data page in your browser

let forcedNextPoint = null;

//////////////////// DATA DEFINITION ///////////////////////
let data = {
    trainingOnlyData: [ // Only used for trainingA
        infoPage('unique_id'),
        infoPage('start_instructions'),

        infoPage('training_a_instructions'),

        generateSequentialChartsSession({
            states: [
                { state: 1, occurrences: 2 },
                { state: 2, occurrences: 2 },
                { state: 3, occurrences: 2 },
                { state: 4, occurrences: 2 }
            ],
            repeat: 1
        }),
        generateSequentialChartsSession({
            states: [
                { state: 1, occurrences: 2 },
                { state: 2, occurrences: 2 },
                { state: 3, occurrences: 2 },
                { state: 4, occurrences: 2 }
            ],
            dynamicIntervals: 8,
            repeat: 1
        }),

        generateSequentialChartsSession({
            states: [
                { state: 1, occurrences: 8 },
                { state: 2, occurrences: 8 },
                { state: 3, occurrences: 8 },
                { state: 4, occurrences: 8 }
            ],
            repeat: 1
        }),
        generateSequentialChartsSession({
            states: [
                { state: 1, occurrences: 8 },
                { state: 2, occurrences: 8 },
                { state: 3, occurrences: 8 },
                { state: 4, occurrences: 8 }
            ],
            dynamicIntervals: 8,
            repeat: 1
        })

    ],
    sharedData: [ // Data to be shuffled and reused for trainingB, performanceA, and performanceB
        infoPage('training_b_instructions', 'trainingB'),
        infoPage('performance_a_instructions', 'performanceA'),
        infoPage('performance_b_instructions', 'performanceB'),

        [
            generateStaticUniqueChartSession({ numberOfCharts: 8, uniqueState: 1 }),
            generateStaticUniqueChartSession({ numberOfCharts: 8, uniqueState: 2 }),
            generateStaticUniqueChartSession({ numberOfCharts: 8, uniqueState: 3 }),
            generateStaticUniqueChartSession({ numberOfCharts: 8, uniqueState: 4 })
        ],
        [
            generateDynamicUniqueChartSession({ numberOfCharts: 8, uniqueState: 1 }),
            generateDynamicUniqueChartSession({ numberOfCharts: 8, uniqueState: 2 }),
            generateDynamicUniqueChartSession({ numberOfCharts: 8, uniqueState: 3 }),
            generateDynamicUniqueChartSession({ numberOfCharts: 8, uniqueState: 4 })
        ],
        [
            generateStaticUniqueChartSession({ numberOfCharts: 32, uniqueState: 1 }),
            generateStaticUniqueChartSession({ numberOfCharts: 32, uniqueState: 2 }),
            generateStaticUniqueChartSession({ numberOfCharts: 32, uniqueState: 3 }),
            generateStaticUniqueChartSession({ numberOfCharts: 32, uniqueState: 4 })
        ],
        [
            generateDynamicUniqueChartSession({ numberOfCharts: 32, uniqueState: 1 }),
            generateDynamicUniqueChartSession({ numberOfCharts: 32, uniqueState: 2 }),
            generateDynamicUniqueChartSession({ numberOfCharts: 32, uniqueState: 3 }),
            generateDynamicUniqueChartSession({ numberOfCharts: 32, uniqueState: 4 })
        ],
        [
            generateStaticUniqueChartSession({ numberOfCharts: 72, uniqueState: 1 }),
            generateStaticUniqueChartSession({ numberOfCharts: 72, uniqueState: 2 }),
            generateStaticUniqueChartSession({ numberOfCharts: 72, uniqueState: 3 }),
            generateStaticUniqueChartSession({ numberOfCharts: 72, uniqueState: 4 })
        ],
        [
            generateDynamicUniqueChartSession({ numberOfCharts: 72, uniqueState: 1 }),
            generateDynamicUniqueChartSession({ numberOfCharts: 72, uniqueState: 2 }),
            generateDynamicUniqueChartSession({ numberOfCharts: 72, uniqueState: 3 }),
            generateDynamicUniqueChartSession({ numberOfCharts: 72, uniqueState: 4 })
        ],

        infoPage('end', 'performanceB')
    ]
};
////////////////////////////////////////////////////////////

let outputData;
let sessionIndex = 0;

// Returns an *inclusive* random integer between 'min' and 'max'
function random(min, max) {
    if (max < min) { return random(max, min); }
    return Math.floor( Math.random() * (max - min + 1) + min );
}

function randomItemFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomDuration() {
    return random(7000, 30000);
}

function shuffleArray(a) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function mergeArrays(array1, array2) {
    return array1.concat(array2);
}

function saveFileDialog(data, filename, type) {
    let file = new Blob([data], { type: type });
    let anchorTag = document.createElement('a');
    let url = URL.createObjectURL(file);

    anchorTag.href = url;
    anchorTag.download = filename;

    document.body.appendChild(anchorTag);

    anchorTag.click();

    setTimeout(function() {
        document.body.removeChild(anchorTag);
        window.URL.revokeObjectURL(url);
    }, 0);
}

function infoPage(fileName, showOnlyInPhase) {
    let session = {
        sessionIndex: null,
        testPhase: null,
        sessionType: 'infoPage',
        pageFile: 'info/' + fileName + '.html'
    };

    if (showOnlyInPhase !== undefined) {
        session.showOnlyInPhase = showOnlyInPhase;
    }

    return session;
}

function getbY(aX, aY, bX) {
    return (aY/aX) * bX;
}

function getbX(aX, aY, bY) {
    return bY / (aY/aX);
}

function pointToRandomQMBHTester(x, y, state) {
    let qs = [],
        ms = [],
        bs = [],
        hs = [];

    for (let i = 0; i < 1000; i++) {
        let point = pointToRandomQMBH(x, y, state);
        qs.push(point.q);
        ms.push(point.m);
        bs.push(point.b);
        hs.push(point.h);
    }
    console.log('VAR', 'MIN', 'MAX');
    console.log('---', '---', '---');
    console.log(' Q ', Math.min(...qs), Math.max(...qs));
    console.log(' M ', Math.min(...ms), Math.max(...ms));
    console.log(' B ', Math.min(...bs), Math.max(...bs));
    console.log(' H ', Math.min(...hs), Math.max(...hs));
}

// Just for testing
function pointToRandomQMBHTesterAuto() {
    pointToRandomQMBHTester(-100, 50, 1);
    pointToRandomQMBHTester(-50,  50, 1);
    pointToRandomQMBHTester(-100, 1,  1);
    pointToRandomQMBHTester(-50,  1,  1);

    pointToRandomQMBHTester(50,  50, 2);
    pointToRandomQMBHTester(100, 50, 2);
    pointToRandomQMBHTester(50,  1,  2);
    pointToRandomQMBHTester(100, 1,  2);

    pointToRandomQMBHTester(-100, -1,  3);
    pointToRandomQMBHTester(-50,  -1,  3);
    pointToRandomQMBHTester(-100, -50, 3);
    pointToRandomQMBHTester(-50,  -50, 3);

    pointToRandomQMBHTester(50,  -1,  4);
    pointToRandomQMBHTester(100, -1,  4);
    pointToRandomQMBHTester(50,  -50, 4);
    pointToRandomQMBHTester(100, -50, 4);
}

function pointToRandomQMBH(x, y, state) {
    let q, m, b, h;

    switch (state) {
        case 1:
            if (y > 24) // 25 to 50
                // For upper limit, imagine M bar at its max length.
                // The upper limit is the longest that the Q bar could potentially be,
                // before the M bar could not reach back far enough (even at its max value) to reach the point.
                // Min: Min value of Q. Max: Max value of M - the point value.
                q = random(24, 77 - y);
            else // 0 to 24
                // For lower limit, imagine M bar at its minimum length.
                // The lower limit is the shortest that the Q bar could potentially be,
                // where the M bar would not overshoot the point while at its minimum.
                // Min: Min value of M - the point. Max: Max value of Q.
                q = random(51 - y, 50);

            m = q + y;

            if (x > -74) // -73 to -50
                // For the upper limit, imagine B at its maximum length.
                // The upper limit is the longest the H bar could potentially be,
                // before the B bar could not reach back to the point (even at its max value).
                // Min: Min value for H. Max: Max value of B - the point.
                h = random(74, 26 - x);
            else // -100 to -74
                // For the lower limit, imagine B at its minimum length.
                // The lower limit is the shortest the H bar could potentially be,
                // where the B bar would not overshoot the point while at its minimum.
                // Min: Min value of B - the point. Max: Max value of H.
                h = random(0 - x, 100);

            b = h + x;
            break;
        case 2:
            if (y > 24) // 25 to 50
                // For upper limit, imagine M bar at its max length.
                // The upper limit is the longest that the Q bar could potentially be,
                // before the M bar could not reach back far enough (even at its max value) to reach the point.
                // Min: Min value of Q. Max: Max value of M - the point value.
                q = random(24, 77 - y);
            else // 0 to 24
                // For lower limit, imagine M bar at its minimum length.
                // The lower limit is the shortest that the Q bar could potentially be,
                // where the M bar would not overshoot the point while at its minimum.
                // Min: Min value of M - the point. Max: Max value of Q.
                q = random(51 - y, 50);

            m = q + y;

            if (x < 74) // 50 to 73
                // For lower limit, imagine B bar at its minimum length.
                // The lower limit is the shortest that the H bar could potentially be,
                // where the B bar would not overshoot the point while at its minimum.
                // Min: Min value of B - the point. Max: Max value of H.
                h = random(74 - x, 26);
            else // 74 to 100
                // For the upper limit, imagine M bar at its maximum length.
                // The upper limit is the longest that the H bar could potentially be,
                // before the B bar could not reach back to the point (even at its max value).
                // Min: Min value of H. Max: Max value of B - the point.
                h = random(0, 100 - x);

            b = h + x;
            break;
        case 3:
            if (y < -24) // -50 to -25
                // For lower limit, imagine M bar at its minimum length.
                // The lower limit is the shortest that the Q bar could potentially be,
                // where the M bar would not overshoot the point while at its minimum.
                // E.g. If point Y was -40, the min value of Q would be 65, because M Min is 25.
                // Min: Min value of M - the point. Max: Max value of Q.
                q = random(24 - y, 77);
            else // -24 to 0
                // For upper limit, imagine M bar at its maximum length.
                // The upper limit is the longest that the Q bar could potentially be,
                // before the M bar could not reach back to the point (even at its max value).
                // Min: Min value of Q. Max: Max value of M + the point value.
                q = random(51, 50 - y);

            m = q + y;

            if (x > -74) // -76 to -50
                // For the upper limit, imagine B at its maximum length.
                // The upper limit is the longest the H bar could potentially be,
                // before the B bar could not reach back to the point (even at its max value).
                // Min: Min value for H. Max: Max value of B - the point.
                h = random(74, 26 - x);
            else // -100 to -75
                // For the lower limit, imagine B at its minimum length.
                // The lower limit is the shortest the H bar could potentially be,
                // where the B bar would not overshoot the point while at its minimum.
                // Min: Min value of B - the point. Max: Max value of H.
                h = random(0 - x, 100);

            b = h + x;
            break;
        case 4:
            if (y < -24) // -50 to -25
                // For lower limit, imagine M bar at its minimum length.
                // The lower limit is the shortest that the Q bar could potentially be,
                // where the M bar would not overshoot the point while at its minimum.
                // E.g. If point Y was -40, the min value of Q would be 65, because M Min is 25.
                // Min: Min value of M - the point. Max: Max value of Q.
                q = random(24 - y, 77);
            else // -24 to 0
                // For upper limit, imagine M bar at its maximum length.
                // The upper limit is the longest that the Q bar could potentially be,
                // before the M bar could not reach back to the point (even at its max value).
                // Min: Min value of Q. Max: Max value of M + the point value.
                q = random(51, 50 - y);

            m = q + y;

            if (x < 74) // 50 to 73
                // For lower limit, imagine B bar at its minimum length.
                // The lower limit is the shortest that the H bar could potentially be,
                // where the B bar would not overshoot the point while at its minimum.
                // Min: Min value of B - the point. Max: Max value of H.
                h = random(74 - x, 26);
            else // 74 to 100
                // For the upper limit, imagine M bar at its maximum length.
                // The upper limit is the longest that the H bar could potentially be,
                // before the B bar could not reach back to the point (even at its max value).
                // Min: Min value of H. Max: Max value of B - the point.
                h = random(0, 100 - x);

            b = h + x;
            break;
    }

    return {
        state: state,
        q: q,
        m: m,
        b: b,
        h: h
    }
}

function generateChart({state = random(1,4), excludedState, nextState}) {
    let thisPoint;
    if (forcedNextPoint !== null) {
        thisPoint = forcedNextPoint;
        forcedNextPoint = null;
        return thisPoint;
    }

    switch(state) {
        case 1: // First bar shorter than the second and the third bar shorter than the fourth
            if (thisPoint === undefined) { // Has not been forced
                thisPoint = {
                    state: state,
                    q: random(24, 50),
                    m: random(51, 77),
                    b: random(0, 26),
                    h: random(74, 100)
                };
            }

            if (nextState === 4) { // Possibility of accidental unsafe state entry
                let aX = thisPoint.b - thisPoint.h;
                let aY = thisPoint.m - thisPoint.q;
                let bX, bY;

                if (excludedState === 2) {
                    let bXMax = Math.round( getbX(aX, aY, -50) );
                    if (bXMax > 100) { bXMax = 100; }
                    bX = random(50, bXMax);

                    let bYMax = Math.round( getbY(aX, aY, bX) );
                    bY = random(-50, bYMax);
                }
                else if (excludedState === 3) {
                    bX = random(50, 100);

                    let bYMin = Math.round( getbY(aX, aY, bX) );
                    if (bYMin < -50) { bYMin = -50; }
                    bY = random(bYMin, -1);
                }
                forcedNextPoint = pointToRandomQMBH(bX, bY, nextState);
            }

            return thisPoint;
        case 2: // First bar shorter than the second and the third bar longer than the fourth
            if (thisPoint === undefined) {
                thisPoint = {
                    state: state,
                    q: random(24, 50),
                    m: random(51, 77),
                    b: random(74, 100),
                    h: random(0, 26)
                };
            }

            if (nextState === 3) { // Possibility of accidental unsafe state entry
                let aX = thisPoint.b - thisPoint.h;
                let aY = thisPoint.m - thisPoint.q;
                let bX, bY;

                if (excludedState === 1) {
                    let bXMin = Math.round( getbX(aX, aY, -50) );
                    if (bXMin < -100) { bXMin = -100; }
                    bX = random(bXMin, -50);

                    let bYMax = Math.round( getbY(aX, aY, bX) );
                    bY = random(-50, bYMax);
                }
                else if (excludedState === 4) {
                    bX = random(-100, -50);

                    let bYMin = Math.round( getbY(aX, aY, bX) );
                    if (bYMin < -50) { bYMin = -50; }
                    bY = random(bYMin, -1);
                }
                forcedNextPoint = pointToRandomQMBH(bX, bY, nextState);
            }

            return thisPoint;
        case 3: // First bar longer than the second and the third bar shorter than the fourth
            if (thisPoint === undefined) {
                thisPoint = {
                    state: state,
                    q: random(51, 77),
                    m: random(24, 50),
                    b: random(0, 26),
                    h: random(74, 100)
                };
            }

            if (nextState === 2) { // Possibility of accidental unsafe state entry
                let aX = thisPoint.b - thisPoint.h;
                let aY = thisPoint.m - thisPoint.q;
                let bX, bY;

                if (excludedState === 1) {
                    bX = random(50, 100);

                    let bYMax = Math.round( getbY(aX, aY, bX) );
                    if (bYMax > 50) { bYMax = 50; }
                    bY = random(1, bYMax);
                }
                else if (excludedState === 4) {
                    let bXMax = Math.round( getbX(aX, aY, 50) );
                    if (bXMax > 100) { bXMax = 100; }
                    bX = random(50, bXMax);

                    let bYMin = Math.round( getbY(aX, aY, bX) );
                    bY = random(bYMin, 50);
                }
                forcedNextPoint = pointToRandomQMBH(bX, bY, nextState);
            }

            return thisPoint;
        case 4: // First bar longer than the second and the third bar longer than the fourth
            if (thisPoint === undefined) {
                thisPoint = {
                    state: state,
                    q: random(51, 77),
                    m: random(24, 50),
                    b: random(74, 100),
                    h: random(0, 26)
                };
            }

            if (nextState === 1) { // Possibility of accidental unsafe state entry
                let aX = thisPoint.b - thisPoint.h;
                let aY = thisPoint.m - thisPoint.q;
                let bX, bY;

                if (excludedState === 2) {
                    bX = random(-100, -50);

                    let bYMax = Math.round( getbY(aX, aY, bX) );
                    if (bYMax > 50) { bYMax = 50; }
                    bY = random(1, bYMax);
                }
                else if (excludedState === 3) {
                    let bXMin = Math.round( getbX(aX, aY, 50) );
                    if (bXMin < -100) { bXMin = -100; }
                    bX = random(bXMin, -50);

                    let bYMin = Math.round( getbY(aX, aY, bX) );
                    bY = random(bYMin, 50);
                }
                forcedNextPoint = pointToRandomQMBH(bX, bY, nextState);
            }

            return thisPoint;
    }
}

function generateChartsArray(states, dynamicIntervals) {
    let charts = [];

    states.forEach(function(stateDefinition) {
        for (let i = 0; i < stateDefinition.occurrences; i++) {
            if (dynamicIntervals !== undefined) {
                charts.push( generateChartsArray([{ state: stateDefinition.state, occurrences: dynamicIntervals }]) );
            }
            else {
                charts.push( generateChart({state: stateDefinition.state}) );
            }
        }
    });

    shuffleArray(charts);

    return charts;
}

function _generateSingleChartSession({state, dynamicIntervals}) {
    let states = [{ state: state, occurrences: 1 }];

    let session = {
        sessionIndex: null,
        testPhase: null,
        sessionType: 'identifySingleChart',
        isDynamic:   dynamicIntervals !== undefined,
        sessionData: generateChartsArray(states, dynamicIntervals)
    };

    if (dynamicIntervals !== undefined) {
        session.intervals = dynamicIntervals;
    }

    return session;
}

function generateSingleChartSession({state, dynamicIntervals, repeat}) {
    if (repeat === undefined) {
        return _generateSingleChartSession({ state: state, dynamicIntervals: dynamicIntervals });
    }
    else{
        let returnArray = [];
        for (let i = 0; i < repeat; i++) {
            returnArray.push(_generateSingleChartSession({ state: state, dynamicIntervals: dynamicIntervals }));
        }
        return returnArray;
    }
}

function _generateSequentialChartsSession({states, dynamicIntervals}) {
    let session = {
        sessionIndex: null,
        testPhase: null,
        sessionType: 'identifySequentialCharts',
        isDynamic:   dynamicIntervals !== undefined,
        sessionData: generateChartsArray(states, dynamicIntervals)
    };

    if (dynamicIntervals !== undefined) {
        session.intervals = dynamicIntervals;
    }

    return session;
}

function generateSequentialChartsSession({states, dynamicIntervals, repeat}) {
    if (repeat === undefined) {
        return _generateSequentialChartsSession({ states: states, dynamicIntervals: dynamicIntervals });
    }
    else {
        let returnArray = [];
        for (let i = 0; i < repeat; i++) {
            returnArray.push(_generateSequentialChartsSession({ states: states, dynamicIntervals: dynamicIntervals }));
        }
        return returnArray;
    }
}

function _generateUniqueChartSession({uniqueState, otherStates, dynamicIntervals, transitionAfter}) {
    let otherStatesArray = generateChartsArray(otherStates, dynamicIntervals);
    let sessionData;
    let uniqueChartIndex;
    let uniqueChartState;

    if (Number.isInteger(uniqueState)) {
        let uniqueChartArray = generateChartsArray([{ state: uniqueState, occurrences: 1 }], dynamicIntervals);
        uniqueChartState = uniqueState;
        sessionData = shuffleArray( mergeArrays(uniqueChartArray, otherStatesArray) );
        sessionData.forEach(function (session, index) {
            if (session.state === uniqueState) {
                uniqueChartIndex = index;
            }
        });
    }
    else { // Is object
        let uniqueChartObject = {
            startState: generateChartsArray([{ state: uniqueState.startState, occurrences: 1 }], dynamicIntervals)[0],
            endState:   generateChartsArray([{ state: uniqueState.endState,   occurrences: 1 }], dynamicIntervals)[0]
        };
        otherStatesArray.push(uniqueChartObject);
        sessionData = shuffleArray(otherStatesArray);
        uniqueChartIndex = sessionData.indexOf(uniqueChartObject);
        uniqueChartState = uniqueState.endState;
    }

    let session = {
        sessionIndex: null,
        testPhase: null,
        sessionType: 'identifyUniqueChart',
        isDynamic: dynamicIntervals !== undefined,
        transitionAfter: transitionAfter,
        uniqueChartState: uniqueChartState,
        uniqueChartIndex: uniqueChartIndex,
        sessionData: sessionData
    };

    if (dynamicIntervals !== undefined) {
        session.intervals = dynamicIntervals;
    }

    return session;
}

function generateUniqueChartSession({uniqueState, otherStates, dynamicIntervals, transitionAfter, repeat}) {
    if (repeat === undefined) {
        return _generateUniqueChartSession({ uniqueState: uniqueState, otherStates: otherStates, dynamicIntervals: dynamicIntervals, transitionAfter: transitionAfter, repeat: repeat });
    }
    else {
        let returnArray = [];
        for (let i = 0; i < repeat; i++) {
            returnArray.push(_generateUniqueChartSession({ uniqueState: uniqueState, otherStates: otherStates, dynamicIntervals: dynamicIntervals, transitionAfter: transitionAfter, repeat: repeat }));
        }
        return returnArray;
    }
}

////// V2 //////

// Generate a normal dynamic chart which will NOT transition to an unique state
function generateRandomStaticChart({excludedState, onlyState} = {}) {
    let allowedStates = [];

    if (excludedState !== undefined) {
        allowedStates = [1, 2, 3, 4].filter(x => x !== excludedState);
    }

    if (onlyState !== undefined) {
        allowedStates = [onlyState];
    }

    return generateChart({state: randomItemFromArray(allowedStates)});
}

function generateStaticUniqueChartSession({numberOfCharts, uniqueState}) {
    let charts = [];

    // Generate 2 charts for each non-unique state, so uniqueState is the only singular state occurrence
    [1, 2, 3, 4].filter(x => x !== uniqueState).forEach(function (state) {
        charts.push(generateRandomStaticChart({onlyState: state}));
        charts.push(generateRandomStaticChart({onlyState: state}));
    });

    // Generate all other non-unique charts
    for (let i = 0; i < numberOfCharts - 7; i++) { // Loop for each remaining required chart (excluding 2+2+2+1)
        charts.push(generateRandomStaticChart({excludedState: uniqueState}));
    }

    // Generate the unique chart
    let uniqueChart = generateRandomStaticChart({onlyState: uniqueState});
    charts.push(uniqueChart);

    let sessionData = shuffleArray(charts);
    let uniqueChartIndex = sessionData.indexOf(uniqueChart);

    return {
        sessionIndex: null,
        testPhase: null,
        sessionType: 'identifyUniqueChart',
        isDynamic: false,
        uniqueChartState: uniqueState,
        uniqueChartIndex: uniqueChartIndex,
        sessionData: sessionData
    };
}

/// V2 Dynamic

// Generate a dynamic chart which WILL transition to an unique state
function generateUniqueDynamicChart(uniqueState) {
    let startStatesArray = generateStatesArray({excludedState: uniqueState});
    let endStatesArray = generateStatesArray({onlyState: uniqueState});

    return {
        // startStates: generateRandomDynamicChart({excludedState: uniqueState}),
        startStates: generateDynamicChart({states: startStatesArray, excludedState: uniqueState}),
        endStates:   generateDynamicChart({states: endStatesArray})
    }
}

// Generate a normal dynamic chart which will NOT transition to an unique state
function generateRandomDynamicChart({excludedState, onlyState} = {}) {
    let allowedStates = [];
    let chartIntervals = [];

    if (excludedState !== undefined) {
        allowedStates = [1, 2, 3, 4].filter(x => x !== excludedState);
    }
    else if (onlyState !== undefined) {
        allowedStates = [onlyState];
    }

    for (let i = 0; i < random(2, 8); i++) {
        chartIntervals.push( generateChart({state: randomItemFromArray(allowedStates)}) );
    }

    return chartIntervals;
}

function generateDynamicChart({states, excludedState}) {
    let chartIntervals = [];

    states.forEach(function(state, index) {
        let nextState = states[index+1];
        if (nextState === undefined) { nextState = states[0]; }
        chartIntervals.push( generateChart({state: state, excludedState: excludedState, nextState: nextState}) );
    });

    return chartIntervals;
}

function generateStatesArray({excludedState, onlyState}) {
    let allowedStates;

    if (excludedState !== undefined) {
        allowedStates = [1, 2, 3, 4].filter(x => x !== excludedState);
    }
    else if (onlyState !== undefined) {
        allowedStates = [onlyState];
    }

    let states = [];

    for (let i = 0; i < random(2, 8); i++) {
        states.push(randomItemFromArray(allowedStates));
    }

    if (excludedState !== undefined) {
        let lastState = states[states.length - 1];
        if (lastState === 1) {
            states.unshift( shuffleArray([2, 3].filter(x => x !== excludedState))[0] );
        }
        if (lastState === 2) {
            states.unshift( shuffleArray([1, 4].filter(x => x !== excludedState))[0] );
        }
        if (lastState === 3) {
            states.unshift( shuffleArray([1, 4].filter(x => x !== excludedState))[0] );
        }
        if (lastState === 4) {
            states.unshift( shuffleArray([2, 3].filter(x => x !== excludedState))[0] );
        }
    }

    return states;
}

function generateDynamicUniqueChartSession({numberOfCharts, uniqueState}) {
    let charts = [];

    // Generate all non-unique charts
    for (let i = 0; i < numberOfCharts - 1; i++) { // Loop for each required chart, except one
        let states = generateStatesArray({excludedState: uniqueState});
        charts.push( generateDynamicChart({states: states, excludedState: uniqueState}) );
    }

    // Generate the unique chart
    let uniqueChart = generateUniqueDynamicChart(uniqueState);
    charts.push(uniqueChart);

    let sessionData = shuffleArray(charts);
    let uniqueChartIndex = sessionData.indexOf(uniqueChart);

    return {
        sessionIndex: null,
        testPhase: null,
        sessionType: 'identifyUniqueChart',
        isDynamic: true,
        transitionAfterIntervals: random(2, 9),
        uniqueChartState: uniqueState,
        uniqueChartIndex: uniqueChartIndex,
        sessionData: sessionData
    };
}

////// END V2 //////

function shuffleSessionDataForSession(session) {
    if (session.sessionType === 'identifyUniqueChart') {
        let uniqueChart = session.sessionData[session.uniqueChartIndex];
        shuffleArray(session.sessionData);
        session.uniqueChartIndex = session.sessionData.indexOf(uniqueChart)
    }
    else {
        shuffleArray(session.sessionData);
    }
}

function shuffleDataGroups(data) {
    data.forEach(function(possibleDataGroup) {
        if (Array.isArray(possibleDataGroup)) {
            possibleDataGroup.forEach(function(sessionInDataGroup) {
                shuffleSessionDataForSession(sessionInDataGroup);
            });
            shuffleArray(possibleDataGroup);
        }
        else {
            if (possibleDataGroup.sessionType !== 'infoPage') {
                shuffleSessionDataForSession(possibleDataGroup);
            }
        }
    });
    return data;
}

function prepareTestPhase(testPhaseData, phase) {
    let returnArray = [];

    testPhaseData.forEach(function(session) {
        if (Array.isArray(session)) { // It's a 'Session Group', with multiple, re-arrangeable sessions inside
            session.forEach(function(sessionInDataGroup) {
                returnArray.push( setAdditionalSessionProperties(sessionInDataGroup, phase) );
            });
        }
        else if (session.sessionType === 'infoPage' &&
                 session.showOnlyInPhase !== undefined &&
                 session.showOnlyInPhase !== phase) {
            // Do nothing
        }
        else {
            returnArray.push( setAdditionalSessionProperties(session, phase) );
        }
    });

    return returnArray;
}

function setAdditionalSessionProperties(session, phase) {
    session.sessionIndex = sessionIndex;
    sessionIndex++;
    session.testPhase = phase;
    return session;
}

function cloneJSONObject(object) {
    return JSON.parse(JSON.stringify(object));
}

function generateData(toLocation) {
    sessionIndex = 0;
    outputData = {};

    let trainingAData = data.trainingOnlyData;
    let trainingBData = data.sharedData;

    let performanceAData = shuffleDataGroups( cloneJSONObject(data.sharedData) );
    let performanceBData = shuffleDataGroups( cloneJSONObject(data.sharedData) );

    outputData.trainingA = prepareTestPhase(trainingAData, 'trainingA');
    outputData.trainingB = prepareTestPhase(trainingBData, 'trainingB');
    outputData.performanceA = prepareTestPhase(performanceAData, 'performanceA');
    outputData.performanceB = prepareTestPhase(performanceBData, 'performanceB');

    let output;

    if ($('#minify').is(':checked')) {
        output = JSON.stringify(outputData); // Minified version (Approx. 4x smaller filesize)
    }
    else {
        output = JSON.stringify(outputData, null, 2); // Pretty-printed version
    }

    if (toLocation === 'console') {
        console.log(output);
    }
    else { // Assume toLocation === 'file'
        saveFileDialog(output, 'data.json', 'json');
    }
}
