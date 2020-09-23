/* UofT SCS Data Analytics Boot Camp
  Unit 17 - Visualizing-Data-with-Leaflet
  Part : Leaflet-Step-2
  Filename: app.js
  Author:   Vivianti Santosa
  Date:     2020-09-22
*/

// Selectable backgrounds of our map - tile layers:  
//streetmap layers
var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
});
// satellite background
  var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "satellite-streets-v11",
  accessToken: API_KEY
});
// light background   https://api.mapbox.com/styles/v1/mapbox/light-v10.html?
var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "light-v10",
  accessToken: API_KEY
});
// dark background
var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "dark-v10",
  accessToken: API_KEY
});

var satelite

// Store our API endpoint inside queryUrl 
// get last month earthquake all over the world
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
var plateLink ="https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL
d3.json(queryUrl, function(earthquakeData) {
  d3.json(plateLink, function(plateData) {
  // Once we get a response, send the data.features object to the createFeatures function
    createLayers(earthquakeData.features, plateData);
  }); 
});

// Define function to set the circle color based on the magnitude
function circleColor(magnitude) {
  if (magnitude < 1) {
    return "GreenYellow"  }
  else if (magnitude < 2) {
    return "Yellow"  }
  else if (magnitude < 3) {
    return "Orange"  }
  else if (magnitude < 4) {
    return "OrangeRed"  }
  else if (magnitude < 5) {
    return "Red"  }
  else {
    return "Maroon"}
  }

function createLayers(earthquakeData,plateData) {
  // Define a function we want to run once for each feature in the features array
  
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + 
      "<br>" + "Magnitude: " + feature.properties.mag +"</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakesLayer = L.geoJSON(earthquakeData, {
    pointToLayer: function(earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: (earthquakeData.properties.mag) * 10000,
        color: "#000000",
        weight: 0.5,
        fillColor: circleColor(earthquakeData.properties.mag),
        fillOpacity: 0.75
      });
    },
    onEachFeature: onEachFeature
  });

  // Create a GeoJSON layer containing the techtonic plate data
  var tectonicplatesLayer = L.geoJson(plateData, {
    color: "orange",
    weight: 2
  });

  // Sending both layers to the createMap function
  createMap(earthquakesLayer,tectonicplatesLayer);
}

function createMap(earthquakesLayer,tectonicplatesLayer) {
  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Satellite Map": satellitemap,
    "Light Map": lightmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
   // "Tectonic Plates": tectonicplates,
    "Earthquakes": earthquakesLayer,
    "Tectonicplates" : tectonicplatesLayer
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [darkmap, tectonicplatesLayer, earthquakesLayer]
  });

  // Add Legend at the right bottom corner
  var legend = L.control({
    position: "bottomright"
  });

  legend.onAdd = function() {
    var div = L
      .DomUtil
      .create("div", "info legend");

    var grades = [0, 1, 2, 3, 4, 5];
    var colors = [
      "GreenYellow",
      "Yellow",
      "Orange",
      "OrangeRed",
      "Red",
      "Maroon"
    ];
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
        grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };

  legend.addTo(myMap);

  // Add the layer control to the map and pass in our baseMaps and overlayMaps
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}
