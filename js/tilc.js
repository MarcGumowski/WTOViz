///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Tariffs Imports Line Chart
//
// Marc Gumowski
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// The data are loaded in the main .Rmd file under the var name data.
// This script has to be loaded in the main file.
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////
// Graph parameters ///////////////////////////
///////////////////////////////////////////////

var margin = { top: 10, left: 50, right: 50, bottom: 90 };
var rescale = 0.9;
var width = 960 * rescale - margin.left - margin.right;
var height = 640 * rescale - margin.top - margin.bottom;

var formatNumber = d3.format(".1f"),
    format = function(d) { return formatNumber(d); },
    bisectDate = d3.bisector(function(d) { return d.year; }).left;

var div = d3.select('#tilc').append('div')
    .attr('class', 'tooltip')
    .attr('id', 'tooltip')
    .style('opacity', 0);

var svg = d3.select("#tilc").append("svg")
    .attr('id', 'tilcSvg')
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right);

var g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    
var back = svg.append("rect")
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .attr("height", height)
    .attr("width", width)
    .attr("class", "background")
    .style("fill", "transparent")
    .style('opacity', 0);     

///////////////////////////////////////////////
// Gradient ///////////////////////////////////
///////////////////////////////////////////////  

var defs = svg.append("defs");

// Imports
var importsGradient = defs.append("linearGradient")
   .attr("id", "importsGradient")
   .attr("x1", "0%")
   .attr("x2", "0%")
   .attr("y1", "0%")
   .attr("y2", "100%");

importsGradient.selectAll("stop") 
    .data([                             
        {offset: "0%", color: "#893105"}, 
        {offset: "15%", color: "#9D4114"},  
        {offset: "30%", color: "#B05224"}, 
        {offset: "45%", color: "#C16536"}, 
        {offset: "60%", color: "#D0794A"}, 
        {offset: "75%", color: "#DD8E60"}, 
        {offset: "90%", color: "#E7A479"},      
        {offset: "100%", color: "#EEBA95"}    
      ])                  
    .enter().append("stop")
    .attr("offset", function(d) { return d.offset; })   
    .attr("stop-color", function(d) { return d.color; });

// Tariffs
var tariffsGradient = defs.append("linearGradient")
   .attr("id", "tariffsGradient")
   .attr("x1", "0%")
   .attr("x2", "0%")
   .attr("y1", "0%")
   .attr("y2", "100%");

tariffsGradient.selectAll("stop") 
    .data([                             
        {offset: "0%", color: "#081d58"}, 
        {offset: "15%", color: "#253494"},  
        {offset: "30%", color: "#225ea8"}, 
        {offset: "45%", color: "#1d91c0"}, 
        {offset: "60%", color: "#41b6c4"}, 
        {offset: "75%", color: "#7fcdbb"}, 
        {offset: "90%", color: "#c7e9b4"},      
        {offset: "100%", color: "#edf8b1"}    
      ])                  
    .enter().append("stop")
    .attr("offset", function(d) { return d.offset; })   
    .attr("stop-color", function(d) { return d.color; });
    
// Or simple color
color = ["#D0794A", "#1d91c0"];
    
///////////////////////////////////////////////
// Data ///////////////////////////////////////
///////////////////////////////////////////////   

// parse the date / time
var parseTime = d3.timeParse("%Y");

dataTilc.forEach(function(d) {
    d.year = parseTime(d.year);
    d.importsindex = +d.importsindex;
    d.tariffsindex = +d.tariffsindex;
});

///////////////////////////////////////////////
// Scales /////////////////////////////////////
///////////////////////////////////////////////

var x = d3.scaleTime()
    .domain(d3.extent(dataTilc, function(d) { return d.year; }))
    .rangeRound([0, width]);
    
var y = d3.scaleLinear()
    //.domain([0, d3.max(dataTilc, function(d) { return Math.max(d.importsindex, d.tariffsindex); })])
    .domain([0, 350])
    .range([height, 0]);  

///////////////////////////////////////////////
// Axes ///////////////////////////////////////
///////////////////////////////////////////////

// Set up axes
var xAxis = d3.axisBottom(x)
  .ticks(d3.timeYear)
  .tickFormat(d3.timeFormat("%Y"))
  .tickSize(0)
  .tickPadding(0.5);
  
var yAxis = d3.axisRight(y)
  .tickSize(width)
  .tickFormat(function(d){return d});  

// Draw axes
g.append('g')
  .attr('class', 'axisX')
  .attr('transform', 'translate(' + 0 + ',' + height + ')')
  .call(customXAxis)
  .style('opacity', 0); 
  
g.append('g')
  .attr('class', 'axisY')
  .call(customYAxis)
  .selectAll('text')
  .style('text-anchor', 'middle');
  
// Starting 
g.selectAll('.axisX').transition("starting").duration(1000)
    .style('opacity', 1);  

// Custom functions
function customXAxis(g) {
  g.call(xAxis);
  g.select(".domain").remove();
  g.selectAll(".tick text") 
    .attr("id", function(d) { return "year" + d.year; })     
    .attr("dy", "1.17em")
    .style('text-anchor', 'middle')
    .style('font', '14px sans-serif')
    .style('font-family', 'calibri')
    .style("fill", "#666666");
} 

function customYAxis(g) {
  var s = g.selection ? g.selection() : g;
  g.call(yAxis);
  s.select(".domain").remove();
  s.selectAll(".tick line").attr("stroke", "#666666");  
  s.selectAll(".tick line").filter(Number).attr("stroke-dasharray", "2,2")
    .attr("stroke-width", 0.5);
  s.selectAll(".tick text").attr("x", -20).attr("dy", 4).style("fill", "#666666");
  if (s !== g) g.selectAll(".tick text").attrTween("x", null).attrTween("dy", null);
}

///////////////////////////////////////////////
// Lines //////////////////////////////////////
///////////////////////////////////////////////

// Define lines imports and tariffs
var importsLine = d3.line()
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.importsindex); });
    
var tariffsLine = d3.line()
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.tariffsindex); });
    
// Draw lines    
var importsPath = g.append("path")
        .datum(dataTilc)
        .attr("class", "line")
        .attr("id", "line")
        .attr("fill", "none")
        //.attr("stroke", "url(#importsGradient)")
        .attr("stroke", color[0])        
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 4)
        .attr("d", importsLine);
        
var tariffsPath = g.append("path")
        .datum(dataTilc)
        .attr("class", "line")
        .attr("id", "line")
        .attr("fill", "none")
        //.attr("stroke", "url(#tariffsGradient)")
        .attr("stroke", color[1])          
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 4)
        .attr("d", tariffsLine);
        
// Starting
var totalLength = importsPath.node().getTotalLength();

importsPath  
  .attr("stroke-dasharray", totalLength + " " + totalLength)
  .attr("stroke-dashoffset", totalLength)
  .transition("start")
    .duration(4000)
    .attr("stroke-dashoffset", 0);
  
tariffsPath
  .attr("stroke-dasharray", totalLength + " " + totalLength)
  .attr("stroke-dashoffset", totalLength)
  .transition("start")
    .duration(4000)
    .attr("stroke-dashoffset", 0);
    
    
// On click transition
back
  .on("click", cycled);
   
var swap = 0; 
function cycled() {
  switch(swap) {
    case 0:
      removeLine();
      swap = 1;
    break;  
    default:
      drawLine();
      swap = 0;
  }
}
   
function removeLine(){
    d3.selectAll('#line').transition("onClick")
      .duration(2000)
      .attr("stroke-dashoffset", totalLength);
}

function drawLine(){
    d3.selectAll('#line').transition("onClick")
      .duration(4000)
      .attr("stroke-dashoffset", 0);
}  
///////////////////////////////////////////////
// Legend /////////////////////////////////////
///////////////////////////////////////////////

var legendRectText = ["Merchandise trade index", "Average MFN tariff index"];
  
var legend = svg.append('g')
    .attr('class', 'legend')
    .selectAll('g')
    .data(color)
    .enter().append('g')
    .attr('transform', function(d, i) { return 'translate(' + i * 220 + ', 0)'; });

legend.append('rect')
    .attr('y', height + margin.top + margin.bottom / 2)
    .attr('x', (width + margin.left + margin.right) / 2 - 207)
    .attr('width', 60)
    .attr('height', 10)
    .style('fill', function(d, i) { return color[i]; });
  
legend.append('text')
    .data(legendRectText)
    .attr('y', height + margin.top + margin.bottom / 2)
    .attr('x', (width + margin.left + margin.right) / 2 - 145)
    .attr('dy', '.66em')
    .style('text-anchor', 'start')
    .style('fill', '#666666')
    .style('font', '14px sans-serif')
    .style('font-family', 'calibri')
    .text(function(d) { return d; });
    
legend.on("click", function(d) { console.log(d); });

///////////////////////////////////////////////
// Tooltip ////////////////////////////////////
///////////////////////////////////////////////

// Define Line and Circle
var backLine = g.append('line'),
    backCircleImports = g.append('circle'),
    backCircleTariffs = g.append('circle');

// Tooltip appears on background
back
  .on('mousemove', drawTooltip)
  .on('mouseout', removeTooltip);

// Function  
function removeTooltip() {
  div.transition().duration(500).style('opacity', 0);
  backLine.attr('opacity', 0);
  backCircleImports.attr('opacity', 0);
  backCircleTariffs.attr('opacity', 0);
}

function drawTooltip() {
  
  var x0 = x.invert(d3.mouse(this)[0]),
      i = bisectDate(dataTilc, x0, 1),
      d0 = dataTilc[i - 1],
      d1 = dataTilc[i],
      d = x0 - d0.year > d1.year - x0 ? d1 : d0;
      
  div.transition()
    .duration(0)      
    .style('opacity', 1);
  div.html('<b><font size = "3">' + d.year.getFullYear() + '</font></b>' + 
           '<br/>' +
           'The ' + '<b><font color="' + color[0] +'">' + 'Merchandise trade index' + '</font></b>' +
           ' is equal to <b>' + format(d.importsindex) + '</b>% of the 1996 global trade in goods.' + '</br>' +
           ' This represents US$<b>' + format(d.imports) + '</b> trillion.' +
           '<br/>' +
           'The ' + '<b><font color="' + color[1] +'">' + 'Average MFN tariff index' + '</font></b>' +
           ' indicates a value of <b>' + format(d.tariffsindex) + '</b>% relative to 1996.' + '</br>' +
           'For ' + d.year.getFullYear() + ', this represents an average MFN tariff of <b>' + format(d.tariffs) + '</b>%.')
        .style('left', (d3.event.pageX + 25)+ 'px')    
        .style('top', (d3.event.pageY - 35) + 'px');

  backLine
    .attr('opacity', 1)
    .attr('stroke', '#666666')
    .attr('stroke-width', 2)
    .attr("stroke-dasharray", "2,2")
    .attr('x1', x(d.year))
    .attr('x2', x(d.year))
    .attr('y1', 0)
    .attr('y2', height);
    
  backCircleImports
    .attr('opacity', 1)
    .attr('r', 9)
    .attr('cx', x(d.year))
    .attr('cy', y(d.importsindex))
    .style('fill', 'none')
    .style('stroke', color[0])
    .style('stroke-width', 2);
    
  backCircleTariffs
    .attr('opacity', 1)
    .attr('r', 9)
    .attr('cx', x(d.year))
    .attr('cy', y(d.tariffsindex))
    .style('fill', 'none')
    .style('stroke', color[1])
    .style('stroke-width', 2);    
}  
      
///////////////////////////////////////////////
// Transition /////////////////////////////////
///////////////////////////////////////////////      



      