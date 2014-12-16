var nodes = [],
width = 800,
height = 500,
layout_gravity = -0.05,
damper = 0.1,
circles = [];

var center = {x: width/2, y: height/2};

var svg = d3.select("#canvas").append("svg")
  .attr("height", height)
  .attr("width", width);

var fill_color = d3.scale.ordinal()
  .domain(["negative", "positive"])
  .range(["#d84b2a", "#7aa25c"])

//initialize everything, everything will now also run
initialize();

function initialize() {
  // json data is made into an "array" in variable data

  d3.json("https://api.myjson.com/bins/3ckmb", function(error, data) {
    //json file is loaded, this is when you can start doing data manipulations
    //and building the visualization
    
    max_xp = d3.max(data, function(d){return (d["male xp"]+d["female xp"])/2;});
    min_xp = d3.min(data, function(d){return (d["male xp"]+d["female xp"])/2;});

    y_scale = d3.scale.linear()
      .domain([min_xp, max_xp])
      .range([0, height])

    var node;
    nodes = data.map(function(d) {
      node = {
        gap: d.gap,
        xp: (d["male xp"]+d["female xp"])/2,
        sign: d.gap < 0 ? "negative":"positive",
        company: d.company,
        title: d.title,
        fsalary: d["female salary"],
        msalary: d["male salary"],
        x: Math.random()*width,
        y: y_scale(d.xp)
      };
      return node
    });
    //nodes is what we actually want to work with
  
  circles = svg.selectAll("circle").data(nodes);
  max_amt = d3.max(data, function(d){return Math.abs(d.gap);});
  min_amt = d3.min(data, function(d){return Math.abs(d.gap);});
  
  radius_scale = d3.scale.pow().exponent(0.5)
    .domain([min_amt, max_amt])
    .range([20, 50]);
  tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-1, 0])
  .html(function(d) {
    return "<span class = 'center'><strong>Difference: </strong> <span style='color:red'>" + d.gap + "</span></span><br><strong>Company: </strong>" + d.company + "</span><br><strong>Title: </strong>" + d.title + "</span><br><strong>Male Salary: </strong>" + d.msalary + "</span><br><strong>Female Salary: </strong>" + d.fsalary;
  });
      // function to move mouseover item to front of SVG stage, in case
    // another bubble overlaps it

  svg.call(tip);

  circles.enter().append("circle")
    .attr("r", function(d) {return radius_scale(Math.abs(d.gap));})
    .attr("fill", function(d) {return fill_color(d.sign);})
    .attr("stroke-width", 2)
    .attr("stroke", function(d) {return d3.rgb(fill_color(d.sign)).darker();})
    .attr("class", "bubble")
    .on("mouseover", function(d) {
      temp = d3.select(this);
      tip.show(d);
    })
    .on("mouseout", function(d) {
      tip.hide(d);
    });

  execute();

  }); //end d3.json

}

//functions to generate the graph once we have proper data
function start() {
  force = d3.layout.force()
    .nodes(nodes)
    .size([width, height])
}

function charge(d) {
  return -Math.pow(radius_scale(Math.abs(d.gap)), 2.0) / 8;
}

function move_towards_center(alpha) {
  return function(d) {
    d.x = d.x + (center.x - d.x) * (damper + 0.02) * alpha;
    d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha;
  };
}

function execute(){  
  start();
  force.gravity(layout_gravity)
      .charge(charge)
      .friction(0.9)
      .on("tick", function(e) {
          circles.each(move_towards_center(e.alpha*1.2))
               .attr("cx", function(d) {return d.x;})
               .attr("cy", function(d) {return d.y;});
      });
  force.start();   
} 
