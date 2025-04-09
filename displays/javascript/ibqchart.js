chartType = 'ibq';

// Visualisation setup
innerMargin = 0;
side = 175;
outerMargin = 35;
feedbackTranslateX = side * 0.65;
feedbackTranslateY = 58;
feedbackFontSize = '0.7em';

margin = { top: 10, right: 20, bottom: 30, left: 30 };
width = side - margin.left - margin.right;
height = side - margin.top - margin.bottom;
initialOffset = { left: outerMargin/2, top: 20 };

// Create new linear scale
let xScale = d3.scale.linear().range([0, side/2 - innerMargin]); // D3 V3
// let xScale = d3.scaleLinear().range([0, side/2 - innerMargin]); // D3 V4

// Set domain of scale
xScale.domain([0, 100]);

let quadrantsSetUp = false;
let boxes;

function _draw(isUniqueChartTransition) {
    let intervalDuration = dynamicChartsIntervalDuration;

    // Create a selection (.box) for every session in sessionData array
    boxes = svg.selectAll('.box').data(sessionData);

    let charts = boxes.enter().append("g").attrs({
        class: 'box',
        'data-chart-index': function(d, i) { return i; },
        transform: function(d,i) { return "translate(" +
            (initialOffset.left + Math.floor(i) % 1 * (side + outerMargin)) + ", " +
            (initialOffset.top + Math.floor(i / (1)) * (side + outerMargin)) + ")";
        }
    });

    if (!quadrantsSetUp) {
        // Outer background 4 quadrants ("L" shapes)
        boxes.append("rect").attrs({
            fill: "#444",
            x: 0,
            width: side,
            y: 0,
            height: side
        });

        // Upper-left quadrant
        boxes.append("rect").attrs({
            fill: "none", x: -1,
            width: side / 2 + 1,
            y: -1,
            height: side / 2 + 1,
            'stroke-width': 2,
            stroke: "#000"
        });

        // Bottom-right quadrant
        boxes.append("rect").attrs({
            fill: "none",
            x: side / 2,
            width: side / 2 + 1,
            y: side / 2,
            height: side / 2 + 1,
            'stroke-width': 2,
            stroke: "#000"
        });

        // Inner black background square
        boxes.append("rect").attrs({
            fill: "#000",
            x: side / 4,
            width: side / 2,
            y: side / 4,
            height: side / 2
        });

        quadrantsSetUp = true;
    }
    
        let topRightOverlays = boxes.selectAll('.top-right-overlay').data(function(d) { return [d]; });
        //Sita - interpolate between min saturation and max saturation
        //let colorInterpolator = d3.interpolateRgb(minSaturation, maxSaturation);
        //let steps = 7;
        //let colorArray = d3.range(0, (1 + 1 / steps), 1 / (steps - 1)).map(function(d) { return colorInterpolator(d)});
        
    topRightOverlays.enter().append("rect").attrs({
        class: "top-right-overlay",
        fill: function(d) {return d.state === 2 ? color('q') : "#999"; }, //Sita
                //fill: "#FFF",
        //'fill-opacity': 0.6,
        x: side/2 + innerMargin,
        width: function(d, i) { return xScale(d.b);},
        y: function(d, i) { return side/2 - innerMargin - xScale(d.m);},
        height: function(d, i) { return xScale(d.m);}
    });

    topRightOverlays.transition().ease('easeLinear').duration(intervalDuration).attrs({ // D3 V3
    // topRightOverlays.transition().ease(d3.easeLinear).duration(intervalDuration).attrs({ // D3 V4
        x: side/2 + innerMargin,
        fill: function(d) {return d.state === 2 ? color('q') : "#999"; },
        width: function(d, i) { return xScale(d.b);},
        y: function(d, i) { return side/2 - innerMargin - xScale(d.m);},
        height: function(d, i) { return xScale(d.m);}
    });


    // Bottom-right light grey negative space (below green bar, right of blue bar)
    let bottomRightOverlays = boxes.selectAll('.bottom-right-overlay').data(function(d, i) { return [d]; });

    bottomRightOverlays.enter().append("rect").attrs({
        class: "bottom-right-overlay",
        fill: function(d) {return d.state === 4 ? color('m') : "#999"; },       //Sita
                //fill: "#FFF",
        //'fill-opacity': 0.6,
        x: side / 2 + innerMargin,
        width: function (d) { return xScale(d.b); },
        y: side / 2 + innerMargin,
        height: function (d) { return xScale(d.q); }
    });

    bottomRightOverlays.transition().ease('easeLinear').duration(intervalDuration).attrs({ // D3 V3
    // bottomRightOverlays.transition().ease(d3.easeLinear).duration(intervalDuration).attrs({ // D3 V4
        x: side / 2 + innerMargin,
        fill: function(d) {return d.state === 4 ? color('m') : "#999"; },
        width: function (d) { return xScale(d.b); },
        y: side / 2 + innerMargin,
        height: function (d) { return xScale(d.q); }
    });


    // Bottom-left light grey negative space (left of blue bar, below red bar)
    let bottomLeftOverlays = boxes.selectAll('.bottom-left-overlay').data(function(d, i) { return [d]; });
        
    bottomLeftOverlays.enter().append("rect").attrs({
        class: "bottom-left-overlay",
        fill: function(d) {return d.state === 3 ? color('b') : "#999"; },       //Sita
                //fill: "#FFF",
        //'fill-opacity': 0.6,
        x: function (d) { return side / 2 - innerMargin - xScale(d.h); },
        width: function (d) { return xScale(d.h); },
        y: side / 2 + innerMargin,
        height: function (d) { return xScale(d.q); }
    });

    bottomLeftOverlays.transition().ease('easeLinear').duration(intervalDuration).attrs({ // D3 V3
    // bottomLeftOverlays.transition().ease(d3.easeLinear).duration(intervalDuration).attrs({ // D3 V4
        x: function (d) { return side / 2 - innerMargin - xScale(d.h); },
        fill: function(d) {return d.state === 3 ? color('b') : "#999"; },
        width: function (d) { return xScale(d.h); },
        y: side / 2 + innerMargin,
        height: function (d) { return xScale(d.q); }
    });


    // Top-left light grey negative space (above red bar, left of orange bar)
    let topLeftOverlays = boxes.selectAll('.top-left-overlay').data(function(d, i) { return [d]; });

    topLeftOverlays.enter().append("rect").attrs({
        class: "top-left-overlay",
        fill: function(d) {return d.state === 1 ? color('h') : "#999"; },       //Sita
                //fill: "#FFF",
                //fill: function(d) { return color(d.key); }
        //'fill-opacity': 0.6,
        x: function (d) { return side / 2 - innerMargin - xScale(d.h); },
        width: function (d) { return xScale(d.h); },
        y: function (d) { return side / 2 - innerMargin - xScale(d.m); },
        height: function (d) { return xScale(d.m); }
    });

    topLeftOverlays.transition().ease('easeLinear').duration(intervalDuration).attrs({ // D3 V3
    // topLeftOverlays.transition().ease(d3.easeLinear).duration(intervalDuration).attrs({ // D3 V4
        fill: function(d) {return d.state === 1 ? color('h') : "#999"; },
        x: function (d) { return side / 2 - innerMargin - xScale(d.h); },
        width: function (d) { return xScale(d.h); },
        y: function (d) { return side / 2 - innerMargin - xScale(d.m); },
        height: function (d) { return xScale(d.m); }
    });

    let bars = boxes.selectAll('.bar').data(convertDataObjectToKeyValuePairs);

    let transitioningAttributes = {
        x: function(d, i1, i2) {
            switch (d.key) {
                case 'q': return side / 2 - innerMargin - xScale(10);
                case 'm': return side / 2 + innerMargin;
                case 'b': return side / 2 + innerMargin;
                case 'h': return side / 2 - innerMargin - xScale(d.dataObject.h);
            }
        },
        width: function(d, i1, i2) {
            switch (d.key) {
                case 'q': return xScale(10);
                case 'm': return xScale(10);
                case 'b': return xScale(d.dataObject.b);
                case 'h': return xScale(d.dataObject.h);
            }
        },
        y: function (d, i1, i2) {
            switch (d.key) {
                case 'q': return side / 2 + innerMargin;
                case 'm': return side / 2 - innerMargin - xScale(d.dataObject.m);
                case 'b': return side / 2 + innerMargin;
                case 'h': return side / 2 - innerMargin - xScale(10);
            }
        },
        height: function (d, i1, i2) {
            switch (d.key) {
                case 'q': return xScale(d.dataObject.q);
                case 'm': return xScale(d.dataObject.m);
                case 'b': return xScale(10);
                case 'h': return xScale(10);
            }
        }
    };

    bars.enter().append('rect').attrs({
        class: "bar",           //overwrites the function below, makes the bars white (derived from application.css)
        //fill: function(d) { return color(d.key); }
    }).attrs(transitioningAttributes);

    bars.transition().ease('easeLinear').duration(intervalDuration).attrs(transitioningAttributes); // D3 V3
    // bars.transition().ease(d3.easeLinear).duration(intervalDuration).attrs(transitioningAttributes); // D3 V4

    charts.append('rect').attrs({
        class: 'outline',
        width: 189,
        height: 189,
        x: -7,
        y: -7
    });

    charts.append('rect').attrs({
        class: 'overlay',
        width: 175,
        height: 175,
        x: 0,
        y: 0
    });

    if (!transitioningSelectionsSet) {
        transitioningSelections.push(topRightOverlays, bottomRightOverlays, bottomLeftOverlays, topLeftOverlays, bars);
        transitioningSelectionsSet = true;
    }
}
