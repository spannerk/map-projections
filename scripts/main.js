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

            
        var circles = svg.selectAll("circle").data(towns_data).join('circle');
        clear_detail();

        //Convert the lat and long in the same way as the map and set circle positions

        circles.attr("cx", function(d) {
            return projection([d.lng, d.lat])[0];
        }).attr("cy", function(d) {
            return projection([d.lng, d.lat])[1];
        }).attr("r", function(d) { return d.Population/20000;
        }).attr("fill", "#111C2D");

        // animate the circles a bit by briefly changing the colour a shade lighter
        shine_circle(circles);

        // add an event listener to update the details pane with information about the town clicked on
        circles.on("click",  (event) => update_detail(event));

    })
}

function reload_button_click(){
    plot_towns(slider.value);
}

function change_num_towns(){
    output.innerHTML = slider.value;
}

function display_wiki_data(wiki_data){
    town_image.innerHTML="<img src="+wiki_data.originalimage.source+" alt=Town wiki image>";
    town_summary.innerHTML=wiki_data.extract_html;
}

function update_detail(e){

    // remove the results of any previous selection
    clear_detail();

    // change the color of the circle clicked on
    svg.selectAll("circle")
        .filter((d, i) => (d.lat == e.srcElement.__data__.lat) &  (d.lng == e.srcElement.__data__.lng))
        .attr("fill", "#C43333");

    // list the basic details from the data
    town_details.innerHTML = "<p>Town: " + e.srcElement.__data__.Town 
    + "</p><p>County: " + e.srcElement.__data__.County 
    + "</p><p>Population: " + e.srcElement.__data__.Population
    + "</p>";

    // get a local map based on the area around the town co-ordinates
    var bounding_box = [e.srcElement.__data__.lng - 0.01, e.srcElement.__data__.lat - 0.01, e.srcElement.__data__.lng + 0.01,e.srcElement.__data__.lat + 0.01];
    town_map.innerHTML =    '<iframe width="425" height="350" src="https://www.openstreetmap.org/export/embed.html?bbox='
    + bounding_box[0] + '%2C'
    + bounding_box[1] + '%2C'
    + bounding_box[2] + '%2C'
    + bounding_box[3]
    + '&amp;layer=mapnik"></iframe><br/><small><a href="https://www.openstreetmap.org/#map=16/'
    + e.srcElement.__data__.lat
    + '/' 
    + e.srcElement.__data__.lng
    + '">View Larger Map</a></small>'

    // get some additional details from wikipedia API if possible
    d3.json('https://en.wikipedia.org/api/rest_v1/page/summary/'+e.srcElement.__data__.Town).then( function(wikipedia_data){
        if (wikipedia_data.type='disambiguation') {
            town_name = e.srcElement.__data__.Town + ",_" + e.srcElement.__data__.County;
            d3.json('https://en.wikipedia.org/api/rest_v1/page/summary/'+town_name).then( function(wikipedia_data_disambiguated){  
                display_wiki_data(wikipedia_data_disambiguated);
             })   
          }
        else if (wikipedia_data.type='standard') {
            display_wiki_data(wikipedia_data);
        }
 
    })

}

function clear_detail(){
    town_details.innerHTML = "<p>Click on a circle to see details</p>";
    town_image.innerHTML = "";
    town_summary.innerHTML = "";
    town_map.innerHTML = "";
    svg.selectAll("circle").attr("fill", "#111C2D");
}

function shine_circle(c) {
    c.transition()
        .ease(d3.easeCubic)
        .duration(200)
        .attr("fill","#404956");
    
    c.transition()
        .ease(d3.easeCubic)
        .delay(200)
        .duration(200)
        .attr("fill","#111C2D");

}