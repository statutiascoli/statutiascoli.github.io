contentTitle = document.getElementById('result_title');
contentElement = document.getElementById('results');
const parser = new DOMParser();

fetch('assets/statuti_web.json')
    .then(response => response.json())
    .then(data => {



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
      .then(geoJSONdata => {

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
        var selectedLayer = null
        var selectedMarker = null
        var clickedOnFeature = true;

        function resetSestiere(layer){
            layer.setStyle({
                weight: 2,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.5,
        });
        }
        function selectSestiere(layer){
            layer.setStyle({
                weight: 2,
                color: 'black',
                dashArray: '',
                fillOpacity: 0.7,
            });
        }


        function markerSelector(layer, feature) {
            if (selectedMarker !== layer) {
                    if (selectedMarker) {
                        L.DomUtil.removeClass(selectedMarker._icon, 'selectedMarker');
                        selectedMarker = null;
                    }
                    selectedMarker = layer;
                    populateResults(feature);
                    L.DomUtil.addClass(selectedMarker._icon, 'selectedMarker');

                    // Deselect the polygon if it's selected
                    if (selectedLayer) {
                        // Reset style of the selected polygon
                        resetSestiere(selectedLayer)
                        selectedLayer = null;
                    }
                }
        }

        var sestieriLayer = L.geoJSON(geoJSONdata.sestieri, {
            onEachFeature: function(feature, layer) {
                layer.on('click', function(e) {
                    // Check if the clicked layer is different from the currently selected layer
                    if (selectedLayer !== layer) {
                        // Reset style of the previously selected layer, if exists
                        if (selectedLayer) {
                            resetSestiere(selectedLayer)
                            selectedLayer.bringToBack();
                        }
                        selectedLayer = layer; // Update the selected layer
                        populateResults(feature)
                        selectSestiere(layer)
                        e.target.bringToFront();
                    }
                    // Deselect the marker if it's selected
                    if (selectedMarker) {
                        L.DomUtil.removeClass(selectedMarker._icon, 'selectedMarker');
                        selectedMarker = null;
                    }
                });
                layer.bindTooltip(feature.properties.id);
                layer.on('mouseover', function(e) {
                    // Apply hover style only if the layer is not selected
                    if (layer !== selectedLayer) {
                        selectSestiere(layer)
                        layer.bringToFront();
                    }
                });
                layer.on('mouseout', function(e) {
                    // Reset style only if the layer is not selected
                    if (layer !== selectedLayer) {
                        resetSestiere(layer)
                        e.target.bringToBack();
                    }
                });
            },
            className: 'sestiere-polygon',
            style: function(feature) {
                return {
                    fillColor: getColor(feature.properties.quartiere),
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.5,
                };
            }
        }).addTo(map);


        var porteLayer = L.geoJSON(geoJSONdata.porte, {
         pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: geoJSONdata.porte.properties.icon,
                        iconSize: L.point(30, 30),
                    })
                })
           },
          onEachFeature: function(feature, layer) {
            layer.on('click', function(event) {
                markerSelector(layer, feature)
            });
            layer.bindTooltip(feature.properties.id);
          }
        }).addTo(map);

        var piazzeLayer = L.geoJSON(geoJSONdata.piazze, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: geoJSONdata.piazze.properties.icon,
                        iconSize: L.point(30, 30),
                    })
                })
           },
         onEachFeature: function(feature, layer) {
            layer.on('click', function(event) {
                markerSelector(layer, feature)
            });
            layer.bindTooltip(feature.properties.id);
          }
        }).addTo(map);

        var chieseLayer = L.geoJSON(geoJSONdata.chiese, {
          pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: geoJSONdata.chiese.properties.icon,
                        iconSize: L.point(30, 30),
                    })
                })
           },
          onEachFeature: function(feature, layer) {
            layer.on('click', function(event) {
                markerSelector(layer, feature)
            });
            layer.bindTooltip(feature.properties.id);
          }
        }).addTo(map);

        var palazziLayer = L.geoJSON(geoJSONdata.palazzi, {
          pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: geoJSONdata.palazzi.properties.icon,
                        iconSize: L.point(30, 30),
                    })
                })
           },
          onEachFeature: function(feature, layer) {
            layer.on('click', function(event) {
                markerSelector(layer, feature)
            });
            layer.bindTooltip(feature.properties.id);
          }
        }).addTo(map);

        map.on('click', function(event) {
            if (event.originalEvent.target.nodeName == 'path')
                return;
            else {
                if (selectedLayer) {
                    resetSestiere(selectedLayer)
                    selectedLayer = null;
                }
                if (selectedMarker) {
                    L.DomUtil.removeClass(selectedMarker._icon, 'selectedMarker');
                    selectedMarker = null;
                }
                populateResults(null);
             }
        });

        var colorModified = false;


        // Custom control to modify polygon layer colors
        var customControl = L.Control.extend({
            onAdd: function(map) {
                var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control p-1 bg-light');

                // Create first radio button: Quartieri
                var quartieriDiv = L.DomUtil.create('div', 'form-check', container);
                var quartieriCheckbox = L.DomUtil.create('input', 'form-check-input', quartieriDiv);
                quartieriCheckbox.type = 'radio';
                quartieriCheckbox.name = 'customRadio';
                quartieriCheckbox.id = 'quartieriRadio';
                quartieriCheckbox.value = 'quartieri';
                var quartieriLabel = L.DomUtil.create('label', 'form-check-label', quartieriDiv);
                quartieriLabel.setAttribute('for', 'quartieriRadio');
                quartieriLabel.innerHTML = 'Quartieri';

                // Create second radio button: Proprietari
                var proprietariDiv = L.DomUtil.create('div', 'form-check', container);
                var proprietariCheckbox = L.DomUtil.create('input', 'form-check-input', proprietariDiv);
                proprietariCheckbox.type = 'radio';
                proprietariCheckbox.name = 'customRadio';
                proprietariCheckbox.id = 'proprietariRadio';
                proprietariCheckbox.value = 'proprietari';
                var proprietariLabel = L.DomUtil.create('label', 'form-check-label', proprietariDiv);
                proprietariLabel.setAttribute('for', 'proprietariRadio');
                proprietariLabel.innerHTML = 'Proprietari';

                // Create third radio button: Ricchezza
                var ricchezzaDiv = L.DomUtil.create('div', 'form-check', container);
                var ricchezzaCheckbox = L.DomUtil.create('input', 'form-check-input', ricchezzaDiv);
                ricchezzaCheckbox.type = 'radio';
                ricchezzaCheckbox.name = 'customRadio';
                ricchezzaCheckbox.id = 'ricchezzaRadio';
                ricchezzaCheckbox.value = 'ricchezza';
                var ricchezzaLabel = L.DomUtil.create('label', 'form-check-label', ricchezzaDiv);
                ricchezzaLabel.setAttribute('for', 'ricchezzaRadio');
                ricchezzaLabel.innerHTML = 'Ricchezza';

                // Attach change event listener to radio buttons
                L.DomEvent.on(container, 'change', function(e) {
                    var selectedValue = e.target.value;
                    if (selectedValue === 'quartieri') {
                        // Reset colors of the polygon layer to quartieri
                        sestieriLayer.eachLayer(function(layer) {
                            layer.setStyle({
                                fillColor: getColor(layer.feature.properties.quartiere)
                            });
                        });
                    } else if (selectedValue === 'proprietari') {
                        // Modify the colors of the polygon layer to proprietari
                        sestieriLayer.eachLayer(function(layer) {
                            layer.setStyle({
                                fillColor: getPopColor(layer.feature.properties.proprietari)
                            });
                        });
                    } else if (selectedValue === 'ricchezza') {
                        sestieriLayer.eachLayer(function(layer) {
                            layer.setStyle({
                                fillColor: getMoneyColor(layer.feature.properties.summa, layer.feature.properties.proprietari)
                            });
                        });
                    }
                });

                return container;
            }
        });
        // Add the custom control to the map
        new customControl().addTo(map);


        // Function to generate a random color
        function getPopColor(variable) {
            if (150 < variable && variable <= 200) {
                return '#330033'; // Fill color for variable 1
            } else if (100 < variable && variable <= 150) {
                return '#660066'; // Fill color for variable 2
            } else if (50 < variable && variable <= 100) {
                return '#990099'; // Fill color for variable 3
            } else if (20 < variable && variable <= 50) {
                return '#cc00cc'; // Fill color for variable 4
            } else if (0 < variable && variable <= 20) {
                return '#ff99ff'; // Fill color for variable 5
            } else {
                return 'white'; // Default fill color
            }
        }
        function getMoneyColor(money, pop) {
            summa = calcolaValoreMedievale(money)
            variable = (summa/pop).toFixed(2)
            if (variable <= 100) {
                return '#FF0000'; // Orange color for range 0 - 100
            } else if (variable <= 200) {
                return '#FF3300'; // Orange color for range 101 - 200
            } else if (variable <= 300) {
                return '#FF6600'; // Orange color for range 201 - 300
            } else if (variable <= 400) {
                return '#FF9900'; // Orange color for range 301 - 400
            } else if (variable <= 500) {
                return '#FFCC00'; // Orange color for range 401 - 500
            } else if (variable <= 600) {
                return '#FFFF00'; // Orange color for range 501 - 600
            } else if (variable <= 700) {
                return '#CCFF00'; // Orange color for range 601 - 700
            } else if (variable <= 800) {
                return '#99FF00'; // Orange color for range 701 - 800
            } else if (variable <= 900) {
                return '#66FF00'; // Orange color for range 801 - 900
            } else if (variable <= 1000) {
                return '#33CC00'; // Orange color for range 901 - 1000
            } else if (variable <= 1200) {
                return '#009900'; // Orange color for range 901 - 1000
            } else if (variable <= 1400) {
                return '#006600'; // Orange color for range 901 - 1000
            }
             else {
                return '#FFFFFF'; // Default fill color
            }
        }

        function getMoney(money, pop) {
            summa = calcolaValoreMedievale(money)
            variable = (summa/pop).toFixed(0)
            return variable
        }

        function calcolaValoreMedievale(money) {
            var totaleDenari = (money[0] * 240) + (money[1] * 12) + money[2];
            var valoreLibra = totaleDenari / 240;
            return valoreLibra.toFixed(0);
        }

       function populateResults(feature){
            feature_id = feature.properties.id
            contentElement.innerHTML = ""
            contentTitle.innerHTML = feature_id
            if (feature_id.includes("sestiere")){
                sezione_quartiere = document.createElement('p');
                sezione_quartiere.textContent = "Quartiere: " + feature.properties.quartiere
                sezione_desc = document.createElement('p');
                sezione_desc.textContent = "Il sestiere sorgeva presumibilmente da X a Y e conteneva..."
                contentElement.appendChild(sezione_quartiere)
                contentElement.appendChild(sezione_desc)
                if (feature.properties.proprietari){
                    sezione_prop = document.createElement('p');
                    sezione_prop.textContent = "Proprietari Censiti (Catasto del 1381): " + feature.properties.proprietari
                    sezione_val = document.createElement('p');
                    sezione_val.textContent = "Valore Totale (Catasto del 1381): Libbre " + feature.properties.summa[0] + ", Soldi " + feature.properties.summa[1] + ", Denari " + + feature.properties.summa[2]
                    sezione_procap = document.createElement('p');
                    sezione_procap.textContent = "Valore Pro Capite (Catasto 1381): Libbre " + getMoney(feature.properties.summa, feature.properties.proprietari)
                    contentElement.appendChild(sezione_prop)
                    contentElement.appendChild(sezione_val)
                    contentElement.appendChild(sezione_procap)
                }
                else{
                    sezione_prop = document.createElement('p');
                    sezione_prop.textContent = "Proprietari Censiti (Catasto del 1381): Non Disponibile"
                    sezione_val = document.createElement('p');
                    sezione_val.textContent = "Valore Totale (Catasto del 1381): Non Disponibile"
                    sezione_procap = document.createElement('p');
                    sezione_procap.textContent = "Valore Pro Capite (Catasto 1381): Non Disponibile"
                    contentElement.appendChild(sezione_prop)
                    contentElement.appendChild(sezione_val)
                    contentElement.appendChild(sezione_procap)
                }
            }
           results = []
           if (feature_id){
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
           }
           results.forEach((doc)=>{
                const xmlDoc = parser.parseFromString(doc[0], 'text/xml');
                const headElement = xmlDoc.getElementsByTagName('head')[0];
                const pElement = xmlDoc.getElementsByTagName('p')[0];
                if (headElement){
                card = document.createElement('div');
                card.classList.add('card');

                cardHeader = document.createElement('div');
                cardHeader.classList.add('card-header');

                cardBody = document.createElement('div');
                cardBody.classList.add('card-body');

                const cardTitle = document.createElement('h5');
                cardTitle.classList.add('card-title');
                cardLink = document.createElement('a');
                cardLink.href = "https://statutiascoli.github.io/statuti.html?id=" + doc[1].join("_");
                cardLink.textContent = headElement.textContent;
                cardLink.target = "_blank";
                cardTitle.appendChild(cardLink)

                cardDescription = document.createElement('p');
                cardDescription.classList.add('card-text');
                cardDescription.textContent = pElement.textContent.split(" ").slice(0, 25).join(" ") + " [...] "
                readLink = document.createElement('a');
                readLink.href = "https://statutiascoli.github.io/statuti.html?id=" + doc[1].join("_");
                readLink.textContent = "(Continua)"
                readLink.target = "_blank";
                cardDescription.appendChild(readLink)


                cardHeader.appendChild(cardTitle);
                cardBody.appendChild(cardDescription);
                card.appendChild(cardHeader);
                card.appendChild(cardBody);
                contentElement.appendChild(card)
                }
           })
        }
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