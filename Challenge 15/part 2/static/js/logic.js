var queryUrl =
	'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

function size(magnitude) {
	return magnitude * 40000;
}

function colors(magnitude) {
	var color = '';
	if (magnitude <= 1) {
		return (color = '#83FF00');
	} else if (magnitude <= 2) {
		return (color = '#FFEC00');
	} else if (magnitude <= 3) {
		return (color = '#ffbf00');
	} else if (magnitude <= 4) {
		return (color = '#ff8000');
	} else if (magnitude <= 5) {
		return (color = '#FF4600');
	} else if (magnitude > 5) {
		return (color = '#FF0000');
	} else {
		return (color = '#ff00bf');
	}
}

d3.json(queryUrl, function (data) {
	console.log(data.features);

	createFeatures(data.features);
});

function createFeatures(earthquakeData) {
	console.log(earthquakeData[0].geometry.coordinates[1]);
	console.log(earthquakeData[0].geometry.coordinates[0]);
	console.log(earthquakeData[0].properties.mag);

	function onEachFeature(feature, layer) {
		layer.bindPopup(
			'<h3>' +
				feature.properties.place +
				'</h3><hr><p>' +
				new Date(feature.properties.time) +
				'</p>' +
				'<hr> <p> Earthquake Magnitude: ' +
				feature.properties.mag +
				'</p>'
		);
	}

	var earthquakes = L.geoJSON(earthquakeData, {
		onEachFeature: onEachFeature,

		pointToLayer: function (feature, coordinates) {
			var geoMarkers = {
				radius: size(feature.properties.mag),
				fillColor: colors(feature.properties.mag),
				fillOpacity: 0.3,
				stroke: true,
				weight: 1,
			};
			return L.circle(coordinates, geoMarkers);
		},
	});

	createMap(earthquakes);
}

function createMap(earthquakes) {
	var satellitemap = L.tileLayer(
		'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
		{
			attribution:
				"© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
			tileSize: 512,
			maxZoom: 18,
			zoomOffset: -1,
			id: 'mapbox/satellite-streets-v9',
			accessToken:
				'pk.eyJ1IjoidGFsbGFudGo5NSIsImEiOiJjbGQwYmlicW0ydnZmM3BrNjhzcGxoMHVqIn0.NFVBr7AMOYS5BC5OwcXerA',
		}
	);

	var lightmap = L.tileLayer(
		'https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
		{
			attribution:
				'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			maxZoom: 18,
			id: 'light-v10',
			accessToken:
				'pk.eyJ1IjoidGFsbGFudGo5NSIsImEiOiJjbGQwYmlicW0ydnZmM3BrNjhzcGxoMHVqIn0.NFVBr7AMOYS5BC5OwcXerA',
		}
	);

	var outdoormap = L.tileLayer(
		'https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
		{
			attribution:
				'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			maxZoom: 18,
			id: 'outdoors-v9',
			accessToken:
				'pk.eyJ1IjoidGFsbGFudGo5NSIsImEiOiJjbGQwYmlicW0ydnZmM3BrNjhzcGxoMHVqIn0.NFVBr7AMOYS5BC5OwcXerA',
		}
	);

	var faultlines = new L.layerGroup();

	var baseMaps = {
		'Satellite Map': satellitemap,
		'Grayscale Map': lightmap,
		'Outdoor Map': outdoormap,
	};

	var overlayMaps = {
		Earthquakes: earthquakes,
		'Fault Lines': faultlines,
	};

	var myMap = L.map('map', {
		center: [37.09, -95.71],
		zoom: 5,
		layers: [satellitemap, earthquakes, faultlines],
	});

	L.control
		.layers(baseMaps, overlayMaps, {
			collapsed: false,
		})
		.addTo(myMap);

	var platesQuery = 'data/PB2002_plates.json';

	d3.json(platesQuery, function (plates) {
		function onEachFeature(feature, layer) {
			layer.bindPopup(
				'<h3> Tectonic Plate Name: ' + feature.properties.PlateName + '</h3>'
			);
		}

		L.geoJSON(plates, {
			onEachFeature: onEachFeature,

			style: function () {
				return {
					color: '#FF9B00',
					fillOpacity: 0,
				};
			},
		}).addTo(faultlines);
	});

	var legend = L.control({
		position: 'bottomright',
	});

	legend.onAdd = function () {
		var div = L.DomUtil.create('div', 'info legend'),
			magnitude = [0, 1, 2, 3, 4, 5];

		for (var i = 0; i < magnitude.length; i++) {
			div.innerHTML +=
				'<i style="background:' +
				colors(magnitude[i] + 1) +
				'"></i> ' +
				magnitude[i] +
				(magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
		}

		return div;
	};

	legend.addTo(myMap);
}
