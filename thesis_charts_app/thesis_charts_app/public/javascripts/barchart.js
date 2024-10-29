chartType = 'bar';

// Visualisation setup
side = 200;
outerMargin = 8;
feedbackTranslateX = side * 0.5;
feedbackTranslateY = 20;
feedbackFontSize = '0.7em';

margin = { top: 10, right: 20, bottom: 30, left: 30 };
width = side - margin.left - margin.right;
height = side - margin.top - margin.bottom;
initialOffset = { left: 40, top: 20 };

// Create new ordinal scale for the X axis. Param 1: Total width available. Param 2: Padding.
let x = d3.scale.ordinal().rangeRoundBands([0, width], 0.5); // D3 V3
// let x = d3.scaleBand().rangeRound([0, width]).padding(0.5); // D3 V4

// Create new linear scale for the Y axis. Height first, because origin is in *top* left corner.
let y = d3.scale.linear().range([height, 0]); // D3 V3
// let y = d3.scaleLinear().range([height, 0]); // D3 V4

// Set domain of the X scale to the 4 variables
x.domain(['q', 'm', 'b', 'h']);

// Set domain of the Y scale between 0 and 100
y.domain([0, 100]);

// Create a label for the Y axis.
let yAxis = d3.svg.axis().scale(y).orient('left').ticks(4); //  D3 V3
// let yAxis = d3.axisLeft(y).ticks(4); // D3 V4

function _draw(isUniqueChartTransition) {
    let intervalDuration = dynamicChartsIntervalDuration;

    let boxes = svg.selectAll('.box').data(sessionData);

    let charts = boxes.enter().append('g').attrs({
        class: 'box',
        'data-chart-index': function(d, i) { return i; },
        transform: function (d, i) {
            return 'translate(' +
                (initialOffset.left + Math.floor(i) % tiling * (side + outerMargin)) + ', ' +
                (initialOffset.top + Math.floor(i / (tiling)) * (side + outerMargin)) + ')';
        }
    });

    let bars = boxes.selectAll('rect.bar').data(convertDataObjectToKeyValuePairs);

    let transitioningAttributes = {
        y:      function(d) { return y( d.value )},
        height: function(d) { return height - y( d.value ) }
    };

    bars.enter().append('rect').attrs({
        fill:  function(d) { return color(d.key); },
        //class: 'bar',
        x:     function(d) { return x(d.key) },
        width: x.rangeBand(), // D3 V3
        // width: x.bandwidth(), // D3 V4
    }).attrs(transitioningAttributes);

    bars.transition().attrs(transitioningAttributes).ease('easeLinear').duration(intervalDuration) // D3 V3
    // bars.transition().attrs(transitioningAttributes).ease(d3.easeLinear).duration(intervalDuration); // D3 V4

    charts.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    charts.append('rect').attrs({
        class: 'outline',
        width: 174,
        height: 179,
        x: -28,
        y: -10
    });

    charts.append('rect').attrs({
        class: 'overlay',
        width: 160,
        height: 166,
        x: -21,
        y: -3
    });

    if (!transitioningSelectionsSet) {
        transitioningSelections.push(bars);
        transitioningSelectionsSet = true;
    }
}
