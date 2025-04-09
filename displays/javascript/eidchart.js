// Your data object
const d = {
  state: 1,
  q: 46,
  m: 66,
  b: 25,
  h: 86
};


const svg = d3.select("#chart");

const width = 250;
const height = 250;
const padding = 30;

const chartW = width - padding * 2;
const chartH = height - padding * 2;

const xScale = d3.scaleLinear().domain([0, 100]).range([0, chartW]);
const yScale = d3.scaleLinear().domain([0, 100]).range([chartH, 0]);



// Append an SVG group element for the chart
const chartGroup = svg
  .append("g")
  .attr("transform", `translate(${padding}, ${padding})`);

// Convert the data object into an array of key-value pairs
const data = Object.entries(d).filter(([key]) => key !== "state");


// ---------- Add dot and dashed lines ---------- //

chartGroup.append("circle")
  .attr("cx", xScale(d.q))
  .attr("cy", yScale(d.m))
  .attr("r", 5)
  .attr("fill", "white")





// ---------- Set up graph ---------- //

// Add horizontal and vertical lines to divide the chart into 4 quadrants
chartGroup.append("line")
.attr("x1", 0)
.attr("y1", chartH / 2)
.attr("x2", chartW)
.attr("y2", chartH / 2)
.attr("stroke", "white")
.attr("stroke-width", 1);

chartGroup.append("line")
.attr("x1", chartW / 2)
.attr("y1", 0)
.attr("x2", chartW / 2)
.attr("y2", chartH)
.attr("stroke", "white")
.attr("stroke-width", 1);

// Add axes
const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale);
const xAxisTop = d3.axisTop(xScale);
const yAxisRight = d3.axisRight(yScale);

// bottom axis
chartGroup.append("g")
.attr("transform", `translate(0, ${chartH})`)
.call(xAxis);

// bottom axis
chartGroup.append("g")
.call(yAxis);

//right axis
chartGroup.append("g")
.attr("transform", `translate(${chartW}, 0)`)
.call(yAxisRight);

//top axis
chartGroup.append("g")
.attr("transform", `translate(0, 0)`) 
.call(xAxisTop);

