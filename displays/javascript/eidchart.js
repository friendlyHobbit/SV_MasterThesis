// Your data object
const d = {
  state: 1,
  q: 46,
  m: 66,
  b: 25,
  h: 86
};

// convert to an array
//const sessionData = Object.values(d); 
const sessionData = [d]; 

// Visualisation setup
innerMargin = 0;
side = 134;
outerMargin = 75;
feedbackTranslateX = side * 0.75;
feedbackTranslateY = 90;
feedbackFontSize = '0.7em';
tiling = 1;

margin = { top: 10, right: 20, bottom: 30, left: 30 };
width  = side - margin.left - margin.right;
height = side - margin.top - margin.bottom;
initialOffset = { left: 10, top: 20 };

// Create new linear scale
let xScale = d3.scaleLinear().range([0, side/2 - 3 * innerMargin]);
// Set domain of scale
xScale.domain([0, 100]);
// Create new linear scale for the Y axis.
let yScale = d3.scaleLinear().range([0, side/2 - 3 * innerMargin]);
yScale.domain([100, 0]);
// Create a label for the X axis.
let xAxis = d3.axisBottom().scale(xScale).ticks(4);
// Create a label for the Y axis.
let yAxis = d3.axisRight().scale(yScale).ticks(4);


// set up svg, Append svg element to the body and store reference as 'svg'
svg = d3.select('.main').append('svg')
    .attr("class", 'chart ' + document.location.pathname.split('/')[1])
    .attr("viewBox", "0 0 2600 1260")
    .attr("preserveAspectRatio", "xMinYMin meet");


function convertDataObjectToKeyValuePairs(dataObject) {
    return ['q', 'm', 'b', 'h'].map(function(key) {
        return { key: key, value: dataObject[key], dataObject: dataObject }
    });
}

// Create a selection (.box) for every session in sessionData array
let boxes = svg.selectAll('.box').data(sessionData);

let charts = boxes.enter().append("g")
    .attr("class", "box") // Defines the .box class
    .attr("data-chart-index", function(d, i) { return i; })
    .attr("transform", function(d, i) {
        return "translate(" +
            (initialOffset.left + Math.floor(i) % 1 * (side + outerMargin)) + ", " +
            (initialOffset.top + Math.floor(i / (1)) * (side + outerMargin)) + ")";
    });


let xAxes = boxes.selectAll('.x.axis').data(function(d) { return [d]; });

// Append a label for the X axis
xAxes.enter().append("g")
    .attr("class", "x axis")
    .attr("translate", function(d,i) {
        return "translate(" +        
        (Math.floor(i) % tiling * (side + outerMargin) + side / 2 - xScale(d.h)) + ", " +
        (side + Math.floor(i / (tiling)) * (side + outerMargin) + xScale(30)) + ")"
    }).call(xAxis);


let yAxes = boxes.selectAll('.y.axis').data(function(d) { return [d]; });

// Append a label for the Y axis
yAxes.enter().append("g")
    .attr("class", "y axis")
    .attr("transform", function(d, i) { return "translate(" +
        (Math.floor(i) % tiling * (side + outerMargin) + side + xScale(30)) + ", " +
        (1 + Math.floor(i / (tiling)) * (side + outerMargin) + side / 2 - xScale(100 - d.q)) + ")"
    }).call(yAxis);


let dashedRects = boxes.selectAll('.dashed-rect').data(function(d) { return [d]; });

// Append the rectangle which is bottom-left of the circle
dashedRects.enter().append("rect")
    .attr("class", 'dashed-rect')
    .attr("x", function(d, i) { return Math.floor(i) % tiling * (side + outerMargin) + side / 2 + xScale(d.b - d.h) })
    .attr("y", function(d, i) { return 1 + Math.floor(i / (tiling)) * (side + outerMargin) + side / 2 - xScale(d.m - d.q) })
    .attr("width", function(d, i) { return side / 2 - xScale(d.b - d.h) })
    .attr("height", function(d, i) { return side / 2 + xScale(d.m - d.q) })
    .attr("fill", "none")
    .attr("stroke", "#777")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "2,2")
    .attr("stroke-opacity", 1);


let circles = boxes.selectAll('.circle').data(function(d) { return [d]; });

// Append the circle
circles.enter().append("circle")
    .attr("class", 'circle')
    .attr("cx", function(d, i) { return side / 2 + xScale(d.b - d.h) })
    .attr("cy", function(d, i) { return side / 2 - xScale(d.m - d.q) })
    .attr("transform", function(d, i) { return "translate(" + Math.floor(i) % tiling * (side + outerMargin) + ", " + Math.floor(i / (tiling)) * (side + outerMargin) + ")" })
    .attr("r", 4)
    .attr("fill", "#fff");


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

bars.enter().append("rect")
    .attr("class", 'bar')
    .attr("fill", function(d) { return color(d.key); });

svg.selectAll('.x.axis .tick:nth-child(6) text').attr('x', 2);

// Append rectangle which gives entire chart its outline
charts.append("rect")
    .attr("fill", "none")
    .attr("x", 0)
    .attr("width", side)
    .attr("y", 0)
    .attr("height", side)
    .attr("stroke", "#888");

// Append rectangle which gives upper-left quadrant its outline
charts.append("rect")
    .attr("fill", "none")
    .attr("x", 0)
    .attr("width", side / 2)
    .attr("y", 0)
    .attr("height", side / 2)
    .attr("stroke", "#888");

// Append rectangle which gives bottom-right quadrant its outline
charts.append("rect")
    .attr("fill", "none")
    .attr("x", side / 2)
    .attr("width", side / 2)
    .attr("y", side / 2)    
    .attr("height", side / 2)
    .attr("stroke", "#888");

charts.append('rect')
    .attr("class", "outline")
    .attr("width", 201)
    .attr("height", 193)
    .attr("x", -7)
    .attr("y", -7);


charts.append('rect')
    .attr("class", "overlay")
    .attr("width", 198)
    .attr("height", 191)
    .attr("x", -1)
    .attr("y", -1);



