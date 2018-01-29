///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Sankey Diagram
//
// Marc Gumowski
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* Based on : 
    http://bl.ocks.org/git-ashish/8959771
    https://bl.ocks.org/wvengen/cab9b01816490edb7083
*/

// The data are loaded in the main .Rmd file under the var name data.
// This script has to be loaded in the main file.




// Parameters
var rescale = 1,
    height = 480 * rescale, // * 0.73 for 2005
    width  = 960 * rescale,
    tooltipOffsetX = 0,
    tooltipOffsetY = 475;
    
// Div
var divSankey = d3.select('#sankey').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);
    
// Svg
var svgSankey = d3.select("#sankey")
    .append("svg")
    .attr('id', 'sankeySvg')
    .attr('height', height)
    .attr('width', width);
    
// Rect to click on (background)
var rectSankey = svgSankey.append("rect")
    .attr("height", height)
    .attr("width", width)
    .attr("class", "background")
    .style("fill", "transparent")
    .style('opacity', 0);    

var formatNumberSankey = d3.format(".1f"),
    formatSankey = function(d) { return "$" + formatNumberSankey(d) + "bn"; };

var sankey = d3.sankey()
    .nodeWidth(30)
    .nodePadding(8)
    .extent([[1, 1], [width - 1, height - 6]]);
    
var link = svgSankey.append("g")
    .attr("class", "links")
  .selectAll("path");

var node = svgSankey.append("g")
    .attr("class", "nodes")
  .selectAll("g");



// Sankey Diagram
sankey(dataSankey);

link = link
    .data(dataSankey.links)
    .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("id", function(d,i){
        d.id = i;
        return "link-"+i;
      })
      .attr("stroke-width", function(d) { return Math.max(1, d.dy); })
      .style("stroke", function(d) { return d.color; })
      .style("fill", "none")
      .style("stroke-opacity", 0.2)
      .on('click', function(d) {
         console.log(d);
      })
      .on('mouseover', function(d) {      
        divSankey.transition()        
          .duration(0)      
          .style('opacity', 1);
        divSankey.html('<b><font size = "3">' + d.source.name + " to " + d.target.name + '</font></b>' + '<br/>' + formatSankey(d.value))
          .style('left', tooltipOffsetX + 'px')    //Tooltip positioning, edit CSS
          .style('top', tooltipOffsetY + 'px');    //Tooltip positioning, edit CSS
        d3.select(this)
          .style("stroke-opacity", 0.6);
        })
      .on('mousemove', function(d) {
        divSankey.transition()        
        .duration(0)      
        .style('opacity', 1);
       divSankey.html('<b><font size = "3">' + d.source.name + " to " + d.target.name + '</font></b>' + '<br/>' + formatSankey(d.value))
        .style('left', tooltipOffsetX + 'px')  //Tooltip positioning, edit CSS   
        .style('top', tooltipOffsetY + 'px');  //Tooltip positioning, edit CSS  
      })  
      .on('mouseout', function(d) {       
        divSankey.transition()        
          .duration(500)
          .style('opacity', 0);
        d3.select(this)
          .style("stroke-opacity", 0.2);
       });                                      

node = node
    .data(dataSankey.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .on('click', function(d) {
         console.log(d);
      })
      .on('mouseover.tip', function(d) {
        divSankey.transition()        
        .duration(0)      
        .style('opacity', 1);      
       divSankey.html('<b><font size = "3">' + d.name + '</font></b>' + '<br/>' + formatSankey(d.value))
        .style('left', tooltipOffsetX + 'px')   //Tooltip positioning, edit CSS    
        .style('top', tooltipOffsetY + 'px');   //Tooltip positioning, edit CSS
        })
      .on('mouseover.path', highlight_node_links)  
      .on('mousemove.tip', function (d) {
        divSankey.transition()        
        .duration(0)      
        .style('opacity', 1);      
      divSankey.html('<b><font size = "3">' + d.name + '</font></b>' + '<br/>' + formatSankey(d.value))
        .style('left', tooltipOffsetX + 'px')   //Tooltip positioning, edit CSS   
        .style('top', tooltipOffsetY + 'px');   //Tooltip positioning, edit CSS 
      })  
      .on('mouseout.tip', function(d) {       
        divSankey.transition()        
        .duration(500)
        .style('opacity', 0);
       })                                               
      .on('mouseout.path', highlight_node_links);
      
node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .attr("fill", function(d) { return d.color; })
      .style("fill-opacity", 0.9)
      .style("shape-rendering", "crispEdges")
      .style("stroke", "#000")
      .style("stroke-width", 0);

node.append("text")
      .attr("class", "nodeText")
      .text(function(d) { return d.iso; })
      .style('font', '0 sans-serif')
      .style("pointer-events", "none")
      //.style("text-shadow", "0 1px 0 #fff")
      //.style("fill", "#666666")
      .style("font-weight", "bold")
      .style("font-family", "calibri");

      
// Text on click
var newFont = '0px sans-serif';
rectSankey.on("click", function() {
    	  if (newFont === '0px sans-serif') {
    	    newFont = '13px sans-serif';
    	  } else { newFont = '0px sans-serif';}
    	  d3.selectAll(".nodeText")
    	    .style('font', newFont)
    	    .attr("x", -6)
          .attr("y", function(d) { return d.dy / 2; })
          .attr("dy", "0.35em")
          .attr("text-anchor", "end")
          .attr("transform", null)
        .filter(function(d) { return d.x < width / 2; })
          .attr("x", 6 + sankey.nodeWidth())
          .attr("text-anchor", "start");
        });



      
// Highlight forward links functions
function highlight_node_links(node, i) {

    var remainingNodes=[],
        nextNodes=[];

    var stroke_opacity = 0;
    var stroke_opacity_all = 0;
    if(d3.select(this).attr("data-clicked") == "1" ){
      d3.select(this).attr("data-clicked", "0");
      stroke_opacity = 0.2;
      stroke_opacity_all = 0.2;
    }else{
      d3.select(this).attr("data-clicked", "1");
      stroke_opacity = 0.6;
      stroke_opacity_all = 0.2;
    }

    var traverse = [{
                      linkType : "sourceLinks",
                      nodeType : "target"
                    }, {
                      linkType : "targetLinks",
                      nodeType : "source"                      
                    }];

    d3.selectAll(".link").style("stroke-opacity", stroke_opacity_all);

    traverse.forEach(function(step){
      node[step.linkType].forEach(function(link) {
        remainingNodes.push(link[step.nodeType]);
        highlight_link(link.id, stroke_opacity);
      });

      while (remainingNodes.length) {
        nextNodes = [];
        remainingNodes.forEach(function(node) {
          node[step.linkType].forEach(function(link) {
            nextNodes.push(link[step.nodeType]);
            highlight_link(link.id, stroke_opacity);
          });
        });
        remainingNodes = nextNodes;
      }
    });
  }

  function highlight_link(id,opacity){
      
      d3.select("#link-"+id).style("stroke-opacity", opacity);
  }
  
  
 //Legend 
  var legendTitleText = [''];
  var legend = svgSankey.selectAll('.legend')
  .data(legendTitleText)
  .enter().append('g')
  .attr('class', 'legend')
  .attr('transform', function(d, i) { return 'translate(' + i * 27 + ', 0)'; });
  
  legend.append('text')
  .attr('y', height - 25)
  .attr('x', 0)
  .attr('dy', '.35em')
  .text('Size: Amount of imports in US$ billion')
  .style('fill', '#666666')
  .style('font', '14px sans-serif')
  .style('font-family', 'calibri'); 
  
  legend.append('text')
  .attr('y', height - 10)
  .attr('x', 0)
  .attr('dy', '.35em')
  .text('Click the background to show labels')
  .style('fill', '#666666')
  .style('font', '14px sans-serif')
  .style('font-family', 'calibri'); 
  