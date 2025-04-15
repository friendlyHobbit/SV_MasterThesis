chartType = 'eid';

// Visualisation setup
innerMargin = 0;
side = 134;
outerMargin = 75;
feedbackTranslateX = side * 0.75;
feedbackTranslateY = 90;
feedbackFontSize = '0.7em';

margin = { top: 10, right: 20, bottom: 30, left: 30 };
width  = side - margin.left - margin.right;
height = side - margin.top - margin.bottom;
initialOffset = { left: 10, top: 20 };

// Create new linear scale
let xScale = d3.scale.linear().range([0, side/2 - 3 * innerMargin]);

// Set domain of scale
xScale.domain([0, 100]);

// Create new linear scale for the Y axis.
let yScale = d3.scale.linear().range([0, side/2 - 3 * innerMargin]);
yScale.domain([100, 0]);

// Create a label for the X axis.
let xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(4);

// Create a label for the Y axis.
let yAxis = d3.svg.axis().scale(yScale).orient("right").ticks(4);

function endall(transition, callback) {
    if (typeof callback !== "function") throw new Error("Wrong callback in endall");
    if (transition.size() === 0) { callback() }
    var n = 0;
    transition
        .each(function() { ++n; })
        .each("end", function() { if (!--n) callback.apply(this, arguments); });
}

let boxes;

function _draw(isUniqueChartTransition) {
    let intervalDuration = dynamicChartsIntervalDuration;

    // Create a selection (.box) for every session in sessionData array
    boxes = svg.selectAll('.box').data(sessionData);

    let charts = boxes.enter().append("g")
        .attr({
            class: 'box',
            'data-chart-index': function(d, i) { return i; },
            transform: function(d,i) { return "translate(" +
                (initialOffset.left + Math.floor(i) % tiling * (side + outerMargin)) + ", " +
                (initialOffset.top + Math.floor(i / (tiling)) * (side + outerMargin)) + ")";
            }
        });

    let xAxes = boxes.selectAll('.x.axis').data(function(d) { return [d]; });

    // Append a label for the X axis
    xAxes.enter().append("g").attr({
        class: "x axis",
        transform: function(d,i) {
            return "translate(" +
                (Math.floor(i) % tiling * (side + outerMargin) + side / 2 - xScale(d.h)) + ", " +
                (side + Math.floor(i / (tiling)) * (side + outerMargin) + xScale(30)) + ")"
            }
    }).call(xAxis);

    // Append a label for the X axis
    xAxes.interrupt().transition().ease('easeLinear').duration(intervalDuration).attr({
        transform: function(d,i) {
            return "translate(" +
                (Math.floor(i) % tiling * (side + outerMargin) + side / 2 - xScale(d.h)) + ", " +
                (side + Math.floor(i / (tiling)) * (side + outerMargin) + xScale(30)) + ")"
        }
    });

    let yAxes = boxes.selectAll('.y.axis').data(function(d) { return [d]; });

    // Append a label for the Y axis
    yAxes.enter().append("g").attr({
        class: "y axis",
        transform: function(d, i) { return "translate(" +
            (Math.floor(i) % tiling * (side + outerMargin) + side + xScale(30)) + ", " +
            (1 + Math.floor(i / (tiling)) * (side + outerMargin) + side / 2 - xScale(100 - d.q)) + ")"
        }
    }).call(yAxis);

    yAxes.interrupt().transition().ease('easeLinear').duration(intervalDuration).attr({
        transform: function(d, i) { return "translate(" +
            (Math.floor(i) % tiling * (side + outerMargin) + side + xScale(30)) + ", " +
            (1 + Math.floor(i / (tiling)) * (side + outerMargin) + side / 2 - xScale(100 - d.q)) + ")"
        }
    });

    let dashedRects = boxes.selectAll('.dashed-rect').data(function(d) { return [d]; });

    // Append the rectangle which is bottom-left of the circle
    dashedRects.enter().append("rect").attr({
        class: 'dashed-rect',
        x: function(d, i) { return Math.floor(i) % tiling * (side + outerMargin) + side / 2 + xScale(d.b - d.h) },
        y: function(d, i) { return 1 + Math.floor(i / (tiling)) * (side + outerMargin) + side / 2 - xScale(d.m - d.q) },
        width: function(d, i) { return side / 2 - xScale(d.b - d.h) },
        height: function(d, i) { return side / 2 + xScale(d.m - d.q) },
        fill: "none",
        stroke: "#777",
        'stroke-width': 1,
        'stroke-dasharray': "2,2",
        'stroke-opacity': 1
    });

    dashedRects.interrupt().transition().ease('easeLinear').duration(intervalDuration).attr({
        x: function(d, i) { return Math.floor(i) % tiling * (side + outerMargin) + side / 2 + xScale(d.b - d.h) },
        y: function(d, i) { return 1 + Math.floor(i / (tiling)) * (side + outerMargin) + side / 2 - xScale(d.m - d.q) },
        width: function(d, i) { return side / 2 - xScale(d.b - d.h) },
        height: function(d, i) { return side / 2 + xScale(d.m - d.q) }
    });

    let circles = boxes.selectAll('.circle').data(function(d) { return [d]; });

    // Append the circle
    circles.enter().append("circle").attr({
        class: 'circle',
        cx: function(d, i) { return side / 2 + xScale(d.b - d.h) },
        cy: function(d, i) { return side / 2 - xScale(d.m - d.q) },
        transform: function(d, i) { return "translate(" + Math.floor(i) % tiling * (side + outerMargin) + ", " + Math.floor(i / (tiling)) * (side + outerMargin) + ")" },
        r: 4,
        fill: "#fff"
    });

    circles.interrupt().transition().ease('easeLinear').duration(intervalDuration).attr({
        cx: function(d, i) { return side / 2 + xScale(d.b - d.h) },
        cy: function(d, i) { return side / 2 - xScale(d.m - d.q) },
        transform: function(d, i) { return "translate(" + Math.floor(i) % tiling * (side + outerMargin) + ", " + Math.floor(i / (tiling)) * (side + outerMargin) + ")" },
    });

    let bars = boxes.selectAll('.bar').data(convertDataObjectToKeyValuePairs);

    // Explanation of parameters that are available in function callbacks below:
    // d:  Object about a single bar. Example: { key: "q", value: 45 }
    // i1: Index of this bar within the set of 4 bars for a particular chart. Between 0 and 3. Unused.
    // i2: Index of the chart which this bar is a part of. Between 0 and <total number of charts>. Unused.

    // Explanation of variable mappings to bars:
    // M: Left bar on the Y axis
    // Q: Right bar on the Y axis
    // B: Top bar on the X axis
    // H: Bottom bar on the X axis

    let transitioningAttributes = {
        x: function(d, i1, i2) {
            switch (d.key) {
                case 'q': return side + xScale(15);
                case 'm': return side;
                case 'b': return side/2 - xScale(d.dataObject.h);
                case 'h': return side/2 - xScale(d.value);
            }
        },
        width: function(d) {
            switch (d.key) {
                case 'q': return xScale(10);
                case 'm': return xScale(10);
                case 'b': return xScale(d.value);
                case 'h': return xScale(d.value);
            }
        },
        y: function(d, i1, i2) {
            switch (d.key) {
                case 'q': return side/2;
                case 'm': return side/2 - xScale(d.value - d.dataObject.q);
                case 'b': return side;
                case 'h': return side + xScale(15);
            }
        },
        height: function(d) {
            switch (d.key) {
                case 'q': return xScale(d.value);
                case 'm': return xScale(d.value);
                case 'b': return xScale(10);
                case 'h': return xScale(10);
            }
        }
    };

    bars.enter().append("rect").attr({
        class:  "bar",
        fill:   function(d) { return color(d.key); }
    }).attr(transitioningAttributes);

    bars.interrupt()
        .transition()
        .ease('easeLinear')
        .duration(intervalDuration)
        .call(endall, function() { /*console.log('Done');*/ } )
        .attr(transitioningAttributes);

    svg.selectAll('.x.axis .tick:nth-child(6) text').attr('x', 2);

    // Append rectangle which gives entire chart its outline
    charts.append("rect").attr({
        fill: "none",
        x: 0,
        width: side,
        y: 0,
        height: side,
        stroke: "#888"
    });

    // Append rectangle which gives upper-left quadrant its outline
    charts.append("rect").attr({
        fill: "none",
        x: 0,
        width: side / 2,
        y: 0,
        height: side / 2,
        stroke: "#888"
    });

    // Append rectangle which gives bottom-right quadrant its outline
    charts.append("rect").attr({
        fill: "none",
        x: side / 2,
        width: side / 2,
        y: side / 2,
        height: side / 2,
        stroke: "#888"
    });

    charts.append('rect').attr({
        class: 'outline',
        width: 201,
        height: 193,
        x: -7,
        y: -7
    });

    charts.append('rect').attr({
        class: 'overlay',
        width: 198,
        height: 191,
        x: -1,
        y: -1
    });

    if (!transitioningSelectionsSet) {
        transitioningSelections.push(xAxes, yAxes, dashedRects, circles, bars);
        transitioningSelectionsSet = true;
    }
}
