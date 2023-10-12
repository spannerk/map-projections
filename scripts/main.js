// The svg
const svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Projection to convert between lat/long coords and pixels in 2D map
const projection = d3.geoMercator()
    .center([-2, 54])                // GPS of location to zoom on - somewhere in the north of Englandish
    .scale(1400)                       // This is like the zoom
    .translate([ width/2, height/2 ]);


const button = document.querySelector('button');
button.addEventListener('click', reload_button_click);

// Load geography data for Great Britain and northern Ireland
d3.json("https://raw.githubusercontent.com/martinjc/UK-GeoJSON/master/json/administrative/ni/lgd.json").then( function(ireland_data){
    d3.json("https://raw.githubusercontent.com/martinjc/UK-GeoJSON/master/json/administrative/gb/lad.json").then( function(data){


    //Combine the NI and GB data
    data.features.push(...ireland_data.features);

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(data.features)
        .join("path")
          .attr("fill", "lightgrey")
          .attr("d", d3.geoPath()
              .projection(projection)
          )
        .style("stroke", "none");

    plot_towns(50);

    })
})

function plot_towns(num_towns){
    console.log("plotting " + num_towns + " towns");
    d3.json("http://34.38.72.236/Circles/Towns/" + num_towns).then( function(towns_data){
            
    var circles = svg.selectAll("circle").data(towns_data).join('circle');

    //Convert the lat and long in the same way as the map

    circles.attr("cx", function(d) {
        return projection([d.lng, d.lat])[0];
    }).attr("cy", function(d) {
        return projection([d.lng, d.lat])[1];
    }).attr("r", function(d) { return d.Population/20000 });

})
}

function reload_button_click(){
    plot_towns(50);
}