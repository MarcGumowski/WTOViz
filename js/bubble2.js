///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Bubble Interactive Chart
//
// Marc Gumowski
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// .range([4,80]) -> forces (0.08), alpha(0.3)
//
// The data are loaded in the main .Rmd file under the var name data.
// This script has to be loaded in the main file.


// Initial Data
var data = dataBubble2.World;

// Global max and min value
var globaldata = data.map(function(d){ d.value = +d.Imports_Product; return d; }),
    globalMaxValue = d3.max(globaldata, function(d) { return d.value; }),
    globalMinValue = d3.min(globaldata, function(d) { return d.value; });

window.onload = drawBubble2(data);

// Bubble Chart
function drawBubble2(data) {
  
  //convert numerical values from strings to numbers, rename variables
  data = data.map(function(d){ d.value = +d.Imports_Product; return d; });
  data = data.map(function(d){ d.tariff = +d.Avg_Product_Tariffs; return d});
  data = data.map(function(d){ d.id = d.Product; return d});
  data = data.map(function(d){ d.name = d.Product_Description; return d});
  data = data.map(function(d){ d.type = d.Product_Type; return d});
  //Get the max and min import value
  var maxValue = d3.max(data, function(d) { return d.value; });
  var minValue = d3.min(data, function(d) { return d.value; });
  //Get the max tariff value
  var maxTariff = d3.max(data, function(d) { return d.tariff; });
  // Format imports
  var formatNumber = d3.format(".1f"),
    format = function(d) { return formatNumber(d); };
    
  var rescale = 1, 
    height = 480 * rescale,
    width = 960 * rescale,
    color = d3.scaleThreshold()
    .domain([0, 2, 4, 6, 8, 10, 15, 20])
    //sequential RdPu
    //.range(["#FFF7F3", "#FDE0DD", "#FCC5C0", "#FA9FB5", "#F768A1", "#DD3497", "#AE017E", "#7A0177", "#49006A"]);
    //sequential Purples
    //.range(["#FCFBFD", "#EFEDF5", "#DADAEB", "#BCBDDC", "#9E9AC8", "#807DBA", "#6A51A3", "#4A1486", "#3F007D"]);
    //sequential YlGnBu
    //.range(["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"]);
    //sequential Brown
    //.range(["#f3e6e3", "#f3e6e3", "#e3c5c1", "#d4a59e", "#c5867b", "#b56559", "#994f43", "#763d34", "#542b24"]);
    // Custom
    .range(["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"]); 



  // Div
  var divBubble2 = d3.select('#bubble2').append('div')
    .attr('class', 'tooltip')
    .attr('id', 'bubble2Div')
    .style("fill", "transparent")
    .style('opacity', 0);
  
  // Svg
  var svgBubble2 = d3.select('#bubble2')
    .append('svg')
    .attr('id', 'bubble2Svg')
    .attr('height', height)
    .attr('width', width)
    .append('g')
    .attr('transform', 'translate(0,0)');
  
  // Rect to click on (background)
  var rectBubble2 = svgBubble2.append("rect")
    .attr("height", height)
    .attr("width", width)
    .attr("class", "background")
    .style("fill", "transparent")
    .style('opacity', 0); 
  
    var radiusScale = d3.scaleSqrt()
      .domain([minValue, maxValue]) // Change to globalMinValue and globalMaxValue for same scale
      .range([2, 40]);
  
  // Forces
  
  // Constants used in the simulation
  var strengthCombine = 0.1;
  var strengthMove = 0.4;
  var strengthCharge = -2;
  var strengthCollide = 0.5;
  
  var forceXCombine =  d3.forceX(width / 2)
    .strength(strengthCombine);
  var forceYCombine =  d3.forceY(height / 2)
    .strength(strengthCombine);
  
  var forceXOrderImports =  d3.forceX(function(d) {return (Math.log(d.value + 1.1) / Math.log(maxValue + 1.1) * 0.83 * width) + 30;})
    .strength(strengthMove);
  
  var forceXOrderTariffs =  d3.forceX(function(d) {return (Math.log(d.tariff + 1.3) / Math.log(maxTariff + 1.1) * 0.83 * width) + 30;})
    .strength(strengthMove);
    
  var forceXSeparate =  d3.forceX(function(d) {
    if(d.type === 'AG') {
      return width / 4;
    } else {
      return 3 * width / 4;
    }
  }).strength(strengthMove);
  
  var forceCharge = d3.forceManyBody()
      .strength(strengthCharge);
      
  var forceCollide = d3.forceCollide()
        .strength(strengthCollide)
        .radius(function(d) {
    return radiusScale(d.value) + 2;
  });    
      
  var simulation = d3.forceSimulation()
      .force('x', forceXCombine)
      .force('y', forceYCombine)
      .force('charge', forceCharge)
      .force('collide', forceCollide);
  
  var circles = svgBubble2.selectAll('.productBubble')
      .data(data)
      .enter().append("g");
  
  // Bubbles
  circles.append('circle')
    .attr('class', 'productBubble')
    .attr('r', function(d){
    return radiusScale(d.value);
  })
  .on('click', function(d) {
    console.log(d);
  })
  .style('fill', function(d) { return color(d.tariff); 
  })
  .on('mouseover', function(d) {      
    divBubble2.transition()        
    .duration(0)      
    .style('opacity', 1);      
    divBubble2.html('<b><font size = "3">' + d.name + '</font></b>' + '<br/>' + d.type  + '<br/>' +'Imports: $' + format(d.value) 
    + 'bn' +'<br/>'+ 'Average applied tariffs: ' + format(d.tariff) + '%')
    .style('left', 720 + 'px') 
    .style('top', 134 + 'px'); 
    d3.select(this)
    .transition()
    .duration(0)
    .style('stroke-width', 1)
    .style('stroke', color(d.tariff))
    .style('fill-opacity', 0.5);
  })
  .on('mousemove', function(d) {      
    divBubble2.html('<b><font size = "3">' + d.name + '</font></b>' + '<br/>' + d.type  + '<br/>' +'Imports: $' + format(d.value) 
    + 'bn' +'<br/>'+ 'Average applied tariffs: ' + format(d.tariff) + '%')
    .style('left', 720 + 'px') 
    .style('top', 134 + 'px'); 
    d3.select(this)
    .transition()
    .duration(0)
    .style('stroke-width', 1)
    .style('stroke', color(d.tariff))
    .style('fill-opacity', 0.5);
  })
  .on('mouseout', function(d) {       
    divBubble2.transition()        
    .duration(500)      
    .style('opacity', 0);
    d3.select(this)
    .transition()
    .duration(0)
    .style('stroke-width', 'none')
    .style('stroke', 'none')
    .style('fill-opacity', 1);
  });
  
  
  var newFont = '0px sans-serif';
  //Bubbles Text on click
  circles.append("text")
    .attr('class', 'productText')
    .text(function(d) {
       var text = d.id;
        return text;
    })
    .style('fill', '#666666')
    .style('font', '0px sans-serif')
    .style('font-family', 'calibri')
    .style('text-anchor', 'middle')
    .on('mouseover', function(d) {      
      divBubble2.transition()        
      .duration(0)      
      .style('opacity', 1);      
    divBubble2.html('<b><font size = "3">' + d.name + '</font></b>' + '<br/>' + d.type  + '<br/>' +'Imports: $' + format(d.value) 
    + 'bn' +'<br/>'+ 'Average applied tariffs: ' + format(d.tariff) + '%')
      .style('left', 720 + 'px') 
      .style('top', 134 + 'px'); 
    d3.select(this.parentNode).selectAll('.productBubble')
      .transition()
      .duration(0)
      .style('stroke-width', 1)
      .style('stroke', color(d.tariff))
      .style('fill-opacity', 0.5);
    })
    .on('mousemove', function(d) {      
    divBubble2.html('<b><font size = "3">' + d.name + '</font></b>' + '<br/>' + d.type  + '<br/>' +'Imports: $' + format(d.value) 
    + 'bn' +'<br/>'+ 'Average applied tariffs: ' + format(d.tariff) + '%')
      .style('left', 720 + 'px') 
      .style('top', 134 + 'px'); 
    d3.select(this.parentNode).selectAll('.productBubble')
      .transition()
      .duration(0)
      .style('stroke-width', 1)
      .style('stroke', color(d.tariff))
      .style('fill-opacity', 0.5);
    })
    .on('mouseout', function(d) {       
      divBubble2.transition()        
      .duration(500)      
      .style('opacity', 0);
    d3.select(this.parentNode).selectAll('.productBubble')
      .transition()
      .duration(0)
      .style('stroke-width', 'none')
      .style('stroke', 'none')
      .style('fill-opacity', 1);
    });
  
    rectBubble2.on("click", function() {
    	  if (newFont === '0px sans-serif') {
    	    newFont = function(d) { 
    	      var len = d.id.length;
    	      var size = radiusScale(d.value) / 5;
    	      size *= 10 / len;
    	      size += 1;
    	      return Math.round(size)+'px sans-serif';
    	    };
    	  } else { newFont = '0px sans-serif';}
    	  d3.selectAll(".productText")
    	    .style('font', newFont)
    	    .attr("dy", '.35em');
  });
  
  
  
  // Buttons
  d3.select('#type2')
    .on('click', function(d){
      simulation
        .force('x', forceXSeparate)
        .alpha(0.3)
        .restart();      
    });
  
    d3.select('#combine2')
    .on('click', function(d){
      simulation
        .force('x', forceXCombine)
        .force('y', forceYCombine)
        .alpha(0.3)
        .restart();
    });
    
        d3.select('#orderImports2')
    .on('click', function(d){
      simulation
        .force('x', forceXOrderImports)
        .force('y', forceYCombine)
        .alpha(0.3)
        .restart();
    });
    
        d3.select('#orderTariffs2')
    .on('click', function(d){
      simulation
        .force('x', forceXOrderTariffs)
        .force('y', forceYCombine)
        .alpha(0.3)
        .restart();
    });    
  
  // Simulation
  simulation.nodes(data)
  .on('tick', ticked);
  
  function ticked() {
    circles
    .attr("transform", function (d) {
        var k = "translate(" + d.x + "," + d.y + ")";
        return k;
    });
  }
  
  
  //Legend 
  var legendTitleText = ['Color: Average applied tariffs in % - Size: Amount of imports in US$ billion - Click the background to show labels'];
  var legendRectText = [" 0<2 ", " 2<4 ", " 4<6 ", " 6<8 ", " 8<10", "10<15", "15<20", " 20< "];
  
  var legendBubble2 = svgBubble2.append('g')
    .attr('class', 'legendBubble2')
    .selectAll('g')
    .data(color.domain())
    .enter().append('g')
    .attr('transform', function(d, i) { return 'translate(' + i * 36 + ', 0)'; });
    
  var legendBubbleSize2 = svgBubble2.append('g')
    .attr('class', 'legendBubble2')
    .selectAll('g')
    .data([d3.format(".1r")(maxValue), d3.format(".1r")(maxValue) * 0.5, d3.format(".1r")(d3.format(".1r")(maxValue) * 0.1)])
    .enter().append('g');
  
  legendBubble2.append('rect')
    .attr('y', height - 38)
    .attr('x', 100)
    .attr('width', 36)
    .attr('height', 10)
    .style('fill', color);
  
  legendBubble2.append('text')
    .data(legendRectText)
    .attr('y', height - 46)
    .attr('x', 118)
    .attr('dy', '.35em')
    .style('text-anchor', 'middle')
    .style('fill', '#666666')
    .style('font', '10px sans-serif')
    .style('font-family', 'calibri')
    .text(function(d) { return d; });
  
  legendBubble2.append('text')
    .data(legendTitleText)
    .attr('y', height - 10)
    .attr('x', 100)
    .attr('dy', '.35em')
    .style('fill', '#666666')
    .style('font', '14px sans-serif')
    .style('font-family', 'calibri')
    .text(function(d) { return d; });
    
  legendBubbleSize2.append('circle')
    .attr("transform", "translate(" + 50 + "," + (height - 1) + ")")
    .attr("cy", function(d) { return -radiusScale(d); })
    .attr("r", radiusScale)
    .style("fill", "none")
    .style("stroke", "#ccc")
    .style("stroke-width", "1.5px");

  legendBubbleSize2.append("text")
    .attr("transform", "translate(" + 50 + "," + height + ")")
    .attr("y", function(d) { return -2.2 * radiusScale(d) + 3; })
    .attr("dy", "1.3em")
    .text(function(d) { return d; })
    .style("fill", "#666666")
    .style("font-family", "calibri")
    .style("font", "10px sans-serif")
    .style("text-anchor", "middle");
    
}



//Update data section (called from the onchange)
function updateData() {
  var newArray = d3.select("#optsBubble2").node().value;
  var data = dataBubble2[newArray];
  d3.select("#bubble2Svg").remove();
  d3.select("#bubble2Div").remove();
  drawBubble2(data);
}

d3.select('#optsBubble2')
  .on('change', updateData);  
  
  
  
  
  
  
  
  
  