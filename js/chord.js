///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Chord Diagram
//
// Marc Gumowski
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// The data are loaded in the main .Rmd file under the var name dataChord.
// The names are loaded in the main .Rmd file under the var name dataChordName.
// This script has to be loaded in the main file.

var margin = { top: 50, left: 50, right: 50, bottom: 50 };
var rescale = 1.3;
var width = 480 * rescale - margin.left - margin.right;
var height = 480 * rescale - margin.top - margin.bottom;
var outerRadius = Math.min(width, height) * 0.5 - 40,
    innerRadius = outerRadius - 30;

var formatNumberChord = d3.format(".1f"),
    formatChord = function(d) { return "$" + formatNumberChord(d) + "bn"; };

var divChord = d3.select('#chord').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

var svgChord = d3.select("#chord").append("svg")
    .attr('id', 'chordSvg')
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right);
    
var chord = d3.chord()
    .padAngle(0.05)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending);

var arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

var ribbon = d3.ribbon()
    .radius(innerRadius);

var color = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(d3.range(dataChordName.length))
    // colorbrewer pastel1
    //.range(["#b3e2cd", "#fdcdac", "#cbd5e8", "#f4cae4", "#e6f5c9", "#fff2ae", "#f1e2cc"]);
    // colorbrewer pastel2
    //.range(["#8dd3c7", "#b3de69", "#bebada", "#80b1d3", "#fdb462", "#fb8072", "#ffffb3"]);
    // sunny
    //.range(["#40A4D8", "#33BEB7", "#B2C224", "#FECC2F", "#FBA127", "#F66320", "#DB3937"]);
    // pastel
    //.range(["#5BBDF2", "#53F1EB", "#EEFC69", "#FFD758", "#FFB858", "#FF8C58", "#FF5858"]);
    // dark
    //.range(["#c4baa1", "#8fb5aa", "#33332f", "#cfa07e", "#c9beb9", "#9c7989","#85889e"]);
    // Custom
    .range(["#9467bd", "#e377c2", "#17becf", "#8c564b", "#bcbd22", "#d62728"]);
    
var gChord = svgChord.append("g")
    .attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")")
    .datum(chord(dataChord));

var group = gChord.append("g")
    .attr("class", "groups")
    .selectAll("g")
    .data(function(chords) { return chords.groups; })
    .enter().append("g");

// Region Path
group.append("path")
    .attr("class", "chordPath")
    .style("fill", function(d) { return color(d.index); })
    .style("stroke", function(d) { return d3.rgb(color(d.index)).darker(); })
    .attr("d", arc)
    //.each(switchTextAngle) // Label along the path
    .on("click", function(d) { 
      console.log(d);
    })
    .on("mouseover", mouseoverChordPath)
    .on("mousemove", mouseoverChordPath)
    .on('mouseout', function(d) {
      divChord.transition()        
        .duration(500)
        .style('opacity', 0);
      d3.selectAll(".chordRibbon")
        .transition()
          .duration(0)
        .style("opacity", 0.6);  
    });

group.append("text")
    .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
    .attr("dy", ".35em")
    .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
    .attr("transform", function(d) {
      return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
      + "translate(" + (outerRadius + 10) + ")"
      + (d.angle > Math.PI ? "rotate(180)" : "");
    })
    .attr("x", function(d) { return d.angle > Math.PI ? -20 : 20; })
    .attr("class", "label")
    .style("font-family", "calibri")
    .style("font", "12px sans-serif")
    .style("fill", "#666666")
    .style("font-weight", "bold")
    .text(function(d,i) { return dataChordName[i].shortName; });   
    
var groupTick = group.selectAll(".chordGroup-tick")
  .data(function(d) { return groupTicks(d, 100); })
  .enter().append("g")
    .attr("class", "chordGroup-tick")
    .attr("transform", function(d) { return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + outerRadius + ",0)"; });

groupTick.append("line")
    .attr("x2", 6)
    .style("stroke", "#000");

groupTick
  .filter(function(d) { return d.value % 500 === 0; })
  .append("text")
    .attr("x", 8)
    .attr("dy", ".35em")
    .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180) translate(-16)" : null; })
    .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
    .style("font-family", "calibri")
    .style("font", "6px sans-serif")
    .style("fill", "#666666") 
    .text(function(d) { return d.value; });

// Ribbons
gChord.append("g")
    .attr("class", "chordRibbons")
  .selectAll("path")
  .data(function(chords) { return chords; })
  .enter().append("path")
    .attr("class", "chordRibbon")
    .attr("d", ribbon)
    .style("fill", function(d) { return color(d.source.index); })
    //.style("stroke", function(d) { return d3.rgb(color(d.source.index)).darker(); })
    .style("opacity", 0)
    .on("mouseover", mouseoverChordRibbon)
    .on("mousemove", mouseoverChordRibbon)
    .on('mouseout', function(d) {
      divChord.transition()        
        .duration(500)
        .style('opacity', 0);
        
      d3.selectAll(".chordRibbon")
        .transition()
        .duration(0)
      .style('opacity', 0.6);
    })
    .on("click", function(d) { 
      console.log(d);
    })
    .transition()
      .duration(1500)
      .style("opacity", 0.6);


// Functions

// Returns an array of tick angles and values for a given group and step.
function groupTicks(d, step) {
  var k = (d.endAngle - d.startAngle) / d.value;
  return d3.range(0, d.value, step).map(function(value) {
    return {value: value, angle: value * k + d.startAngle};
  });
}

function mouseoverChordRibbon(d, i) {
  
  divChord.transition()        
    .duration(0)      
    .style('opacity', 1);
    divChord.html('<b><font size = "3">' + dataChordName[d.source.index].name + 
    " imported from " + dataChordName[d.target.index].name + '</font></b>' + '<br/>' + '<font size = "1">' + 
    formatChord(d.source.value) + '</font>' +
    '<br/> <br/>' +
    '<b><font size = "3">' + dataChordName[d.target.index].name + 
    " imported from " + dataChordName[d.source.index].name + '</font></b>' + '<br/>' + '<font size = "1">' + 
    formatChord(d.target.value) + '</font>')
    .style("left", 800 + "px")
    .style("top", 200 + "px");

  d3.selectAll(".chordRibbon")
  .transition()
    .duration(50)
  .style("opacity", 0.1);
  
  d3.select(this)
    .transition()
      .duration(0)
    .style('opacity', 0.6); 
}
  
function mouseoverChordPath(d) {
  
  divChord.transition()        
    .duration(0)      
    .style('opacity', 1);
  divChord.html('<b><font size = "3">' + "Total imports of " + dataChordName[d.index].name + 
    '</font></b>' + '<br/>' + formatChord(d.value))
    .style("left", 800 + "px")
    .style("top", 200 + "px");
      
  d3.selectAll(".chordRibbon")
    .filter(function(p) {
      return ( 
        (p.source.index !== d.index) &&
        (p.target.index !== d.index)
        );
    })
    .transition()
      .duration(50)
    .style("opacity", 0.1);
}
