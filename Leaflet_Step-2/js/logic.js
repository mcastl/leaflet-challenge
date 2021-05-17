var myMap = L.map("map", {
	center: [37.09, -95.71],
	zoom: 5
});
  
L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
	attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
	maxZoom: 18,
	id: "light-v10",
	accessToken: API_KEY
}).addTo(myMap);

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(queryUrl).then(function(data) {

	function getColor(d) {
    return d >= 5 ? "rgb(240, 107, 107)" :
           d >= 4 ? "rgb(240, 167, 107)" :
           d >= 3 ? "rgb(243, 186, 77)" :
					 d >= 2 ? "rgb(243, 219, 77)" :
					 d >= 1 ? "rgb(225, 243, 77)" :
					 					"rgb(183, 243, 77)";
	}

	var features = data.features;
	for (var i = 0; i < features.length; i++) {
		
		var magnitudes = features[i].properties.mag;
		var coordinates = features[i].geometry.coordinates;

        L.circle(
			[coordinates[1], coordinates[0]], {
				fillOpacity: 0.75,
				fillColor: getColor(magnitudes),
				color: "black",
				weight: 0.5,
				radius: magnitudes * 15000
			}).bindPopup("<h3>" + features[i].properties.place +
				"</h3><hr><p>" + new Date(features[i].properties.time) + 
				'<br>' + '[' + coordinates[1] + ', ' + coordinates[0] + ']' + "</p>").addTo(myMap);
	};	

	var legend = L.control({position: 'bottomright'});
	legend.onAdd = function () {
	
		var div = L.DomUtil.create('div', 'info legend'),
			grades = [0, 1, 2, 3, 4, 5],
			labels = [];

		for (var i = 0; i < grades.length; i++) {
			div.innerHTML +=
				'<i style="background:' + getColor(grades[i]) + '"></i> ' +
				grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
		}
		return div;
	};
	legend.addTo(myMap);
});