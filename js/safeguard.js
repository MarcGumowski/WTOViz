///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Safeguard Bar Chart
//
// Marc Gumowski
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// The data are loaded in the main .Rmd file under the var name dataSSG.
// This script has to be loaded in the main file.
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var margin = { top: 50, left: 50, right: 75, bottom: 50, middle: 18};
var rescale = 0.9;
var width = 960 * rescale - margin.left - margin.right;
var height = 640 * rescale - margin.top - margin.bottom;

var formatNumber = d3.format(".1f"),
    format = function(d) { return formatNumber(d); };

var div = d3.select('#safeguard').append('div')
    .attr('class', 'tooltip')
    .attr('id', 'tooltip')
    .style('opacity', 0);

var svg = d3.select("#safeguard").append("svg")
    .attr('id', 'safeguardSvg')
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right);

var back = svg.append("rect")
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right)
    .attr("class", "background")
    .style("fill", "transparent")
    .style('opacity', 0); 
    
var g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var seriesHeight = (height/2) - margin.middle; 
var yAxisTopPos = seriesHeight,
    yAxisBottomPos = (height/2) + margin.middle;

///////////////////////////////////////////////
// Data ///////////////////////////////////////
///////////////////////////////////////////////

var xz = dataSSG.map(function(d) { return d.code; }),
    xMax = 50;

///////////////////////////////////////////////
// Scales /////////////////////////////////////
///////////////////////////////////////////////

var x = d3.scaleBand()
    .domain(xz)
    .rangeRound([0, width])
    .padding(0.04);
    
var yTop = d3.scaleLinear()
    .domain([0, xMax])
    .range([seriesHeight, 0]);    

var yBottom = d3.scaleLinear()
    .domain([xMax, 0])
    .range([seriesHeight, 0]);      

///////////////////////////////////////////////
// Axes ///////////////////////////////////////
///////////////////////////////////////////////

// Set up axes
var xAxisTop = d3.axisBottom(x)
  .tickSize(0)
  .tickPadding(margin.middle);
  
var xAxisBottom = d3.axisBottom(x)
  .tickSize(0)
  .tickFormat('');
  
var yAxisTop = d3.axisRight(yTop)
  .tickSize(width)
  .tickFormat(function(d){return d+ "%"});  

var yAxisBottom = d3.axisRight(yBottom)
  .tickSize(width)
  .tickFormat(function(d){return d+ "%"});
  
// Draw axes
g.append('g')
  .attr('class', 'axisXTop')
  .attr('transform', 'translate(' + 0 + ',' + yAxisTopPos + ')')
  .call(customXAxisTop)
  .style('opacity', 0); 
  
g.append('g')
  .attr('class', 'axisXBottom')
  .attr('transform', 'translate(' + 0 + ',' + yAxisBottomPos + ')')
  .call(customXAxisBottom);
  
g.append('g')
  .attr('class', 'axisYTop')
  .call(customYAxisTop)
  .selectAll('text')
  .style('text-anchor', 'middle');  
  
g.append('g')
  .attr('class', 'axisYBottom')
  .attr('transform', 'translate(' + 0 + ',' + (yAxisBottomPos - 1) + ')') // 1px up, line is 1 px stroke
  .call(customYAxisBottom)
  .selectAll('text')
  .style('text-anchor', 'middle');  
  
// Add label titles  
g.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - (height / 4))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .style("fill", "#666666")
  .style('font', '14px sans-serif')
  .style('font-family', 'calibri')
  .text("Tariff Rate Quotas");
  
g.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - (height * 3 / 4))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .style("fill", "#666666")
  .style('font', '14px sans-serif')
  .style('font-family', 'calibri')
  .text("Special Safeguards");  

// Custom functions
function customXAxisTop(g) {
  g.call(xAxisTop);
  g.select(".domain").remove();
  g.selectAll(".tick text")
    .attr("id", function(d, i) { return "bar" + dataSSG[i].code; })     
    .attr("transform", "rotate(-90)")
    .attr("dx", "-1.35em")
    .attr("dy", "-1.17em")
    .style('text-anchor', 'middle')
    .style('font', '14px sans-serif')
    .style('font-family', 'calibri')
    .style("fill", "#666666");
}  

function customXAxisBottom(g) {
  g.call(xAxisBottom);
  g.select(".domain").remove();
} 

function customYAxisTop(g) {
  var s = g.selection ? g.selection() : g;
  g.call(yAxisTop);
  s.select(".domain").remove();
  s.selectAll(".tick line").attr("stroke", "#666666");  
  s.selectAll(".tick line").filter(Number).attr("stroke-dasharray", "2,2")
    .attr("stroke-width", 0.5);
  s.selectAll(".tick text").attr("x", 0).attr("dy", -4).style("fill", "#666666");
  if (s !== g) g.selectAll(".tick text").attrTween("x", null).attrTween("dy", null);
}

function customYAxisBottom(g) {
  var s = g.selection ? g.selection() : g;
  g.call(yAxisBottom);
  s.select(".domain").remove();
  s.selectAll(".tick line").attr("stroke", "#666666");
  s.selectAll(".tick line").filter(Number).attr("stroke-dasharray", "2,2")
    .attr("stroke-width", 0.5);
  s.selectAll(".tick text").attr("x", 0).attr("dy", 12).style("fill", "#666666");
  if (s !== g) g.selectAll(".tick text").attrTween("x", null).attrTween("dy", null);
}

///////////////////////////////////////////////
// Bars ///////////////////////////////////////
///////////////////////////////////////////////

// Set up colors
var colorTop = "#415F76",
    colorBottom = "#AE5C66";
    
// Draw bars
var barTop = g.append('g')
    .selectAll(".barTop")
    .data(dataSSG)
    .enter().append("rect")
      .attr('class', 'bar top')
      .attr("id", function(d) { return "bar" + d.code; })      
      .attr("fill", colorTop)
      .attr('x', function(d) { return x(d.code); })
      .attr('width', x.bandwidth())      
      .attr('y', yAxisTopPos)      
      .attr('height', 0)
      .on('click', function(d) {
         console.log(d);
      })
      .on('mouseover', function(d) {
        d3.selectAll("#" + this.getAttribute('id'))
          .attr("opacity", 0.3);
        div.transition()        
          .duration(0)      
          .style('opacity', 1);
        div.html('<b><font size = "3">' + d.name + '</font></b>' + '<br/>' + 
          '<b><span style="color:' + colorTop + '">'  + 'Tariff Rate Quotas' + '</span></b>' + ': ' + format(d.trq) + '%' +'<br/>' + 
          '<b><span style="color:' + colorBottom + '">'  + 'Special Safeguards' + '</span></b>' + ': ' + format(d.ssg) + '%')
          .style('left', 843 + 'px')    
          .style('top', 162 + 'px'); 
      })
      .on('mousemove', function(d) {
        div.html('<b><font size = "3">' + d.name + '</font></b>' + '<br/>' + 
          '<b><span style="color:' + colorTop + '">'  + 'Tariff Rate Quotas' + '</span></b>' + ': ' + format(d.trq) + '%' +'<br/>' + 
          '<b><span style="color:' + colorBottom + '">'  + 'Special Safeguards' + '</span></b>' + ': ' + format(d.ssg) + '%')
          .style('left', 843 + 'px')    
          .style('top', 162 + 'px'); 
      })
      .on('mouseout', function(d) { 
        d3.selectAll("#" + this.getAttribute('id')).transition()
          .duration(250)
          .attr("opacity", 1);
        div.transition()        
          .duration(500)
          .style('opacity', 0);
      });
      
barTop.transition().duration(500)
    .attr('y', function(d) { return yTop(d.trq); })      
    .attr('height', function(d) { return yAxisTopPos - yTop(d.trq); });     
    
var barBottom = g.append('g')
    .selectAll(".barBottom")
    .data(dataSSG)
    .enter().append("rect")
      .attr('class', 'bar bottom')
      .attr("id", function(d) { return "bar" + d.code; })      
      .attr("fill", colorBottom)
      .attr('x', function(d) { return x(d.code); })
      .attr('width', x.bandwidth())      
      .attr('y', yAxisBottomPos)      
      .attr('height', 0)
      .on('click', function(d) {
         console.log(d);
      })
      .on('mouseover', function(d) {
        d3.selectAll("#" + this.getAttribute('id'))
          .attr("opacity", 0.3);
        div.transition()        
          .duration(0)      
          .style('opacity', 1);
        div.html('<b><font size = "3">' + d.name + '</font></b>' + '<br/>' + 
          '<b><span style="color:' + colorTop + '">'  + 'Tariff Rate Quotas' + '</span></b>' + ': ' + format(d.trq) + '%' +'<br/>' + 
          '<b><span style="color:' + colorBottom + '">'  + 'Special Safeguards' + '</span></b>' + ': ' + format(d.ssg) + '%')
          .style('left', 843 + 'px')    
          .style('top', 162 + 'px');  
      })
      .on('mousemove', function(d) {
        div.html('<b><font size = "3">' + d.name + '</font></b>' + '<br/>' + 
          '<b><span style="color:' + colorTop + '">'  + 'Tariff Rate Quotas' + '</span></b>' + ': ' + format(d.trq) + '%' +'<br/>' + 
          '<b><span style="color:' + colorBottom + '">'  + 'Special Safeguards' + '</span></b>' + ': ' + format(d.ssg) + '%')
          .style('left', 843 + 'px')    
          .style('top', 162 + 'px'); 
      })
      .on('mouseout', function(d) { 
        d3.selectAll("#" + this.getAttribute('id')).transition()
          .duration(250)
          .attr("opacity", 1);
        div.transition()        
          .duration(500)
          .style('opacity', 0);
      });

// Starting 
g.selectAll('.axisXTop').transition("starting").duration(500)
    .style('opacity', 1);

barBottom.transition("starting").duration(500)
    .attr('y', function(d) { return yAxisBottomPos; })      
    .attr('height', function(d) { return yBottom(d.ssg); });     
    
///////////////////////////////////////////////
// Transitions ////////////////////////////////
///////////////////////////////////////////////

// Sort bars on click
back.on("click", cycled); 

var swap = 0;
function cycled() {
  switch(swap) {
    case 0:
      orderTRQ();
      swap = 1;
    break;
    case 1:
      orderSSG();
      swap = 2;
    break;
    default:
      orderName();
      swap = 0;
  }
}

function orderTRQ() {
  
  dataSSG.sort(function(a,b) {
    return d3.ascending(b.trq, a.trq)||d3.ascending(a.name, b.name);
  });
  
  x.domain(dataSSG.map(function(d) { return d.code; }));
  
  g.selectAll(".bar")
     .transition("ordering")
      .duration(1000)
      .delay(function (d, i) {
				return i * 5;
		  })
     .attr("x", function(d) {
       return x(d.code);
      });
      
  g.selectAll(".axisXTop")
    .transition("ordering")
    .duration(500)
    .style("opacity", 0)
    .transition("ordering")
    .duration(0)
    .call(customXAxisTop)
    .transition("ordering")
    .duration(500)
    .style("opacity", 1);
 
}

function orderSSG() {
  dataSSG.sort(function(a,b) {
    return d3.ascending(b.ssg, a.ssg)||d3.ascending(a.name, b.name);
  });
  
  x.domain(dataSSG.map(function(d) { return d.code; }));
  
  g.selectAll(".bar")
     .transition("ordering")
      .duration(1000)
      .delay(function (d, i) {
				return i * 5;
		  })
     .attr("x", function(d) {
       return x(d.code);
      });
      
  g.selectAll(".axisXTop")
    .transition("ordering")
    .duration(500)
    .style("opacity", 0)
    .transition("ordering")
    .duration(0)
    .call(customXAxisTop)
    .transition("ordering")
    .duration(500)
    .style("opacity", 1);
}

function orderName() {
    dataSSG.sort(function(a,b) {
    return d3.ascending(a.name, b.name);
  });
  
  x.domain(dataSSG.map(function(d) { return d.code; }));
  
  g.selectAll(".bar")
     .transition("ordering")
      .duration(1000)
      .delay(function (d, i) {
				return i * 5;
		  })
     .attr("x", function(d) {
       return x(d.code);
      });
  
  g.selectAll(".axisXTop")
    .transition("ordering")
    .duration(500)
    .style("opacity", 0)
    .transition("ordering")
    .duration(0)
    .call(customXAxisTop)
    .transition("ordering")
    .duration(500)
    .style("opacity", 1);
}





    
      