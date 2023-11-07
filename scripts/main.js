// The svg
const svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Projection to convert between lat/long coords and pixels in 2D map
const projection = d3.geoMercator()
    .center([-2, 54])                // GPS of location to zoom on - somewhere in the north of Englandish
    .scale(1900)                       // How zoomed in the map is
    .translate([ width/2, height/2 ]);

var slider = document.getElementById("num_town_input");
var output = document.getElementById("num_town_output");

var town_details = document.getElementById("town_details");

const button = document.querySelector('button');

button.addEventListener('click', reload_button_click);
slider.addEventListener("input", change_num_towns);


// Load geography data for Great Britain and northern Ireland
d3.json("https://raw.githubusercontent.com/martinjc/UK-GeoJSON/master/json/administrative/ni/lgd.json").then( function(ireland_data){
    d3.json("https://raw.githubusercontent.com/martinjc/UK-GeoJSON/master/json/administrative/gb/lad.json").then( function(data){


    //Combine the NI and GB data
    data.features.push(...ireland_data.features);

    // clear the loading animation
    svg.selectAll("*").remove();

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(data.features)
        .join("path")
          .attr("fill", "#7DB18F")
          .attr("d", d3.geoPath()
              .projection(projection)
          )
        .style("stroke", "none");

    plot_towns(slider.value);

    })
})

function plot_towns(num_towns){
    console.log("plotting " + num_towns + " towns");
    d3.json("http://34.38.72.236/Circles/Towns/" + num_towns).then( function(towns_data){

        clear_detail();
            
        var circles = svg.selectAll("circle").data(towns_data).join('circle');

        //Convert the lat and long in the same way as the map and set circle positions

        circles.attr("cx", function(d) {
            return projection([d.lng, d.lat])[0];
        }).attr("cy", function(d) {
            return projection([d.lng, d.lat])[1];
        }).attr("r", function(d) { return d.Population/20000;
        }).attr("fill", "#111C2D");

        shine_circle(circles);

        circles.on("click",  (event) => update_detail(event));

    })
}

function reload_button_click(){
    plot_towns(slider.value);
}

function change_num_towns(){
    output.innerHTML = slider.value;
}

function update_detail(e){
    town_details.innerHTML = "<p>Town: " + e.srcElement.__data__.Town + "</p>";

}

function clear_detail(){
    town_details.innerHTML = "<p>Click on a circle to see details</p>";
}

function shine_circle(c) {
    c.transition()
        .ease(d3.easeCubic)
        .duration(200)
        .attr("fill","#404956")
    
    c.transition()
        .ease(d3.easeCubic)
        .delay(200)
        .duration(200)
        .attr("fill","#111C2D")

}