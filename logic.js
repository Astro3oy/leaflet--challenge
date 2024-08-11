var defaultMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var grayscale = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});


var detailedMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});


var globalMap = L.tileLayer('http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &amp; USGS'
});


let basemaps = {
        GrayScale: grayscale,
        "DetailedMap" : detailedMap,
        "GlobalMap" : globalMap,
        Default: defaultMap
};


var myMap = L.map("map", {
    center: [36.7783, -119.4179],
    zoom: 3,
    layers: [grayscale, detailedMap, globalMap, defaultMap]
});


defaultMap.addTo(myMap);

let tectonicplates = new L.layerGroup();

d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
.then(function(plateData){
    //console.log(plateData);

    L.geoJson(plateData,{
    color: "red",
    weight: 1
    }).addTo(tectonicplates);
});

tectonicplates.addTo(myMap);

let earthquakes = new L.layerGroup();

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
.then(
    function(earthquakeData){
        console.log(earthquakeData);
        function dataColor(depth){
            if (depth > 90)
                return "red";
            else if(depth > 70)
                return "#fc4903";
            else if(depth > 50)
                return "#fc8403";
            else if (depth > 30)
                return "#fcad03";
            else if (depth >10)
                return "#cafc03";
            else 
                return "green";
        }
        function radiusSize(mag){
            if (mag == 0)
                return 1;
            else
                return mag * 5; 
        }

        function dataStyle(feature)
        {
            return {
                opacity: 0.5,
                fillOpacity: 0.5,
                fillColor: dataColor(feature.geometry.coordinates[2]),
                color: "000000",
                radius: radiusSize(feature.properties.mag),
                weight: 0.5,
                stroke: true
            }
        }

        L.geoJson(earthquakeData, {
            pointToLayer: function(feature, latLng) {
                return L.circleMarker(latLng);
            },
            style: dataStyle, 
            onEachFeature:function(feature, layer){
                layer.bindPopup(`Magnitude: <b>${feature.properties.mag})</b><br>
                    Depth: <b>${feature.geometry.coordinates[2]}</b><br>
                    Location: <b>${feature.properties.place}</b>`);
            }
        }).addTo(earthquakes);
    }

);

earthquakes.addTo(myMap);

let overlays = {
    "Tectonic Plates": tectonicplates,
    "Earthquake Data": earthquakes
}


L.control
    .layers(basemaps, overlays)
    .addTo(myMap);

    let legend = L.control({
        position: "bottomright"
    });
    
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "Legend");
    
        let intervals = [-10, 10, 30, 50, 70, 90];
        let colors = [
            "green",
            "#cafc03",
            "#fcad03",
            "#fc8403",
            "#fc4903",
            "#red"
        ];
    
        for (var i = 0; i < intervals.length; i++) {
            div.innerHTML += "<i style='background: " + colors[i] + "'></i> "
            + intervals[i]
            + (intervals[i + 1] ? "km &ndash; " + intervals[i + 1] + "km<br>" : "+");
        }
    
        return div;
    };
    
    legend.addTo(myMap);
    