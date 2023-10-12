// The svg
const svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
const projection = d3.geoMercator()
    .center([-2, 54])                // GPS of location to zoom on
    .scale(1400)                       // This is like the zoom
    .translate([ width/2, height/2 ])

// Load external data and boot
d3.json("https://raw.githubusercontent.com/martinjc/UK-GeoJSON/master/json/administrative/ni/lgd.json").then( function(ireland_data){
    d3.json("https://raw.githubusercontent.com/martinjc/UK-GeoJSON/master/json/administrative/gb/lad.json").then( function(data){


    //Combine the NI and GB data
    data.features.push(...ireland_data.features)

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(data.features)
        .join("path")
          .attr("fill", "lightgrey")
          .attr("d", d3.geoPath()
              .projection(projection)
          )
        .style("stroke", "none")

        d3.json("http://34.38.72.236/Circles/Towns/50").then( function(towns_data){
            
            var circles = svg.selectAll("circle").data(towns_data).enter()
			.append("circle");

            circles.attr("cx", function(d) {
                return projection([d.lng, d.lat])[0];
            }).attr("cy", function(d) {
                return projection([d.lng, d.lat])[1];
            }).attr("r", function(d) { return d.Population/20000 });

        })
    })
})

