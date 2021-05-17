var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "satellite-v9",
  accessToken: API_KEY
});

var grayscale = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "light-v10",
  accessToken: API_KEY
});

var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "outdoors-v11",
  accessToken: API_KEY
});

var baseMaps = {
  "Satellite": satellite,
	"Grayscale": grayscale,
	"Outdoors": outdoors
};

var layers = {
  TECTONIC_LINE: new L.LayerGroup(),
  EARTHQUAKES: new L.LayerGroup()
};

var myMap = L.map("map", {
	center: [23.6978, 120.9605],
	zoom: 4,
  layers: [
		layers.TECTONIC_LINE,
		layers.EARTHQUAKES
	]
});

satellite.addTo(myMap);

var overlayMaps = {
	"Fault Lines": layers.TECTONIC_LINE,
  "Earthquakes": layers.EARTHQUAKES
};

L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);

var tectonicUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


d3.json(tectonicUrl).then(function(infoTec) {

	var tecFeatures = infoTec.features;

	for (var i = 0; i < tecFeatures.length; i++) {

		var coordinates = tecFeatures[i].geometry.coordinates;

		var orderedCoordinates = [];

		orderedCoordinates.push(
			coordinates.map(coordinate => [coordinate[1], coordinate[0]])
		);

		var lines = L.polyline(orderedCoordinates, {color: "rgb(255, 165, 0)"});
		
		lines.addTo(layers.TECTONIC_LINE);
	};
});


function getColor(d) {
    return d >= 5 ? "rgb(240, 107, 107)" :
           d >= 4 ? "rgb(240, 167, 107)" :
           d >= 3 ? "rgb(243, 186, 77)" :
					 d >= 2 ? "rgb(243, 219, 77)" :
					 d >= 1 ? "rgb(225, 243, 77)" :
					 					"rgb(183, 243, 77)";
};


d3.json(earthquakeUrl).then(function(infoEarth) {
	
	var earthFeatures = infoEarth.features;

	for (var i = 0; i < earthFeatures.length; i++) {
		
		var magnitudes = earthFeatures[i].properties.mag;
		var coordinates = earthFeatures[i].geometry.coordinates;

		var circleMarkers = L.circle(
													[coordinates[1], coordinates[0]], {
														fillOpacity: 0.9,
														fillColor: getColor(magnitudes),
														color: getColor(magnitudes),
														stroke: false,
														radius: magnitudes * 17000
													});

		circleMarkers.addTo(layers.EARTHQUAKES);

		circleMarkers.bindPopup("<h3>" + earthFeatures[i].properties.place +
										"</h3><hr><p>" + new Date(earthFeatures[i].properties.time) + 
										'<br>' + '[' + coordinates[1] + ', ' + coordinates[0] + ']' + "</p>");
	};
});

var legend = L.control({position: 'bottomright'});
legend.onAdd = function () {

	var div = L.DomUtil.create('div', 'info legend'),
		grades = [0, 1, 2, 3, 4, 5];

	for (var i = 0; i < grades.length; i++) {
		div.innerHTML +=
			'<i style="background:' + getColor(grades[i]) + '"></i> ' +
			grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
	}
	return div;
};
legend.addTo(myMap);