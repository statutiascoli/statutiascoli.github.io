contentTitle = document.getElementById('result_title');
contentElement = document.getElementById('results');
const parser = new DOMParser();

fetch('assets/statuti_web.json')
    .then(response => response.json())
    .then(data => {

   function populateResults(feature_id){
        contentElement.innerHTML = ""
        contentTitle.innerHTML = feature_id
       results = []
       for (v_i in Object.keys(data)){
            v_key = Object.keys(data)[v_i]
            volume_content = data[v_key];
            if (typeof volume_content === "string") {
                if(volume_content.includes(feature_id)){
                    results.push([volume_content, [v_i]])
                }
            } else {
                books = Object.keys(volume_content);
                for (b_i in books) {
                    b_key = Object.keys(data[v_key])[b_i]
                    book_content = data[v_key][b_key];
                    if (typeof book_content === "string") {
                        if(book_content.includes(feature_id)){
                            results.push([book_content, [v_i,b_i]])
                        }
                    } else {
                        rubrics = Object.keys(data[v_key][b_key]);
                        for (r_i in rubrics) {
                            r_key = rubrics[r_i]
                            rubric_content = data[v_key][b_key][r_key];
                            if(rubric_content.includes(feature_id)){
                                results.push([rubric_content, [v_i,b_i,r_i]])
                            }
                        }
                    }
                }
            }
       }
       results.forEach((doc)=>{
            const xmlDoc = parser.parseFromString(doc[0], 'text/xml');
            const headElement = xmlDoc.getElementsByTagName('head')[0];
            if (headElement){
            card = document.createElement('div');
            card.classList.add('card');

            cardHeader = document.createElement('div');
            cardHeader.classList.add('card-header');

            cardBody = document.createElement('div');
            cardBody.classList.add('card-body');

            const cardTitle = document.createElement('h5');
            cardTitle.classList.add('card-title');
            console.log(headElement)
            cardLink = document.createElement('a');
            cardLink.href = "https://statutiascoli.github.io/statuti.html?id=" + doc[1].join("_");
            cardLink.textContent = headElement.textContent;
            cardLink.target = "_blank";
            cardTitle.appendChild(cardLink)

            cardDescription = document.createElement('p');
            cardDescription.classList.add('card-text');
            cardDescription.textContent = "SUMMARY";

            cardHeader.appendChild(cardTitle);
            cardBody.appendChild(cardDescription);
            card.appendChild(cardHeader);
            card.appendChild(cardBody);
            contentElement.appendChild(card)
            }
       })
   }



  var bounds = [[42.84455370395206, 13.556849956512453], [42.86343017090419,13.593156337738039]];

  var map = L.map('map', {
    maxBounds: bounds,
    maxBoundsViscosity: 1.0,
    minZoom: 15,
    maxZoom: 17}
    ).setView([42.854, 13.575], 15)



  center = map.getBounds().getCenter();
  map.setView(center, 15)
    // Add OpenStreetMap base layer
    /*L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain_background/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);*/
    var image = L.imageOverlay('assets/img.png', bounds).addTo(map);

    // Load GeoJSON data from file
    fetch('assets/comune.json')
      .then(response => response.json())
      .then(data => {

        function getColor(variable) {
            switch (variable) {
                case "1":
                    return 'green'; // Fill color for variable 1
                case "2":
                    return 'blue'; // Fill color for variable 2
                case "3":
                    return 'red'; // Fill color for variable 3
                case "4":
                    return 'yellow'; // Fill color for variable 4
                default:
                    return 'gray'; // Default fill color
            }
        }

        // Define GeoJSON layers
        var sestieriLayer = L.geoJSON(data.sestieri, {
          onEachFeature: function(feature, layer) {
            layer.on('click', function(event) {
                populateResults(feature.properties.id)
            });
            layer.bindPopup(feature.properties.id);
          },
          style: function(feature) {
                return {
                fillColor: getColor(feature.properties.quartiere),
                fillOpacity: 0.5,
                color: 'black',
                weight: 2
            };
          }
        }).addTo(map);

        var porteLayer = L.geoJSON(data.porte, {
         pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: data.porte.properties.icon,
                        iconSize: L.point(30, 30),
                    })
                })
           },
          onEachFeature: function(feature, layer) {
            layer.on('click', function(event) {
                populateResults(feature.properties.id)
            });
            layer.bindPopup(feature.properties.id);
          }
        }).addTo(map);

        var piazzeLayer = L.geoJSON(data.piazze, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: data.piazze.properties.icon,
                        iconSize: L.point(30, 30),
                    })
                })
           },
         onEachFeature: function(feature, layer) {
            layer.on('click', function(event) {
                populateResults(feature.properties.id)
            });
            layer.bindPopup(feature.properties.id);
          }
        }).addTo(map);

        var chieseLayer = L.geoJSON(data.chiese, {
          pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: data.chiese.properties.icon,
                        iconSize: L.point(30, 30),
                    })
                })
           },
          onEachFeature: function(feature, layer) {
            layer.on('click', function(event) {
                populateResults(feature.properties.id)
            });
            layer.bindPopup(feature.properties.id);
          }
        }).addTo(map);

        var palazziLayer = L.geoJSON(data.palazzi, {
          pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: data.palazzi.properties.icon,
                        iconSize: L.point(30, 30),
                    })
                })
           },
          onEachFeature: function(feature, layer) {
            layer.on('click', function(event) {
                populateResults(feature.properties.id)
            });
            layer.bindPopup(feature.properties.id);
          }
        }).addTo(map);

        // Define layer control
        var overlays = {
          "Sestieri": sestieriLayer,
          "Porte": porteLayer,
          "Piazze": piazzeLayer,
          "Chiese": sestieriLayer,
          "Palazzi": porteLayer
        };

        //L.control.layers(overlays).addTo(map);
      })

})

    /*leafletImage(map, function(err, canvas) {
        // now you have canvas
        // example thing to do with that canvas:
        var img = document.createElement('img');
        var dimensions = map.getSize();
        img.width = dimensions.x;
        img.height = dimensions.y;
        img.src = canvas.toDataURL();
        console.log(map.getBounds())
        document.getElementById('images').innerHTML = '';
        document.getElementById('images').appendChild(img);
    });*/

/*
{
    "_southWest": {
        "lat": 42.84455370395206,
        "lng": 13.556849956512453
    },
    "_northEast": {
        "lat": 42.86343017090419,
        "lng": 13.593156337738039
    }
}*/