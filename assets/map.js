contentTitle = document.getElementById('result_title');
contentElement = document.getElementById('result_content');
currentPage = 1
itemsPerPage = 3
paginationElement = document.getElementById('pagination');

const parser = new DOMParser();

fetch('assets/statuti_web.json').then(response => response.json()).then(data => {

    var bounds = [[42.84455370395206, 13.556849956512453], [42.86343017090419,13.593156337738039]];

    var map = L.map('map', {
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
        minZoom: 15,
        maxZoom: 17}).setView([42.854, 13.575], 15)

    center = map.getBounds().getCenter();
    map.setView(center, 15)
    var image = L.imageOverlay('assets/img.png', bounds).addTo(map);

    // Load GeoJSON data from file
    fetch('assets/comune.json').then(response => response.json()).then(geoJSONdata => {

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

       results = [];

       function populateResults(feature){
           feature_id = feature.properties.id
           contentElement.innerHTML = ""
           paginationElement.innerHTML = ""
           currentPage = 1
           contentTitle.innerHTML = feature_id
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
           displayCurrentPage(results);
           if (results.length > 3){
              generatePaginationLinks(results);
           }
        }
      })

    function displayCurrentPage(results) {
        startIndex = (currentPage - 1) * itemsPerPage;
        endIndex = startIndex + itemsPerPage;
        itemsToShow = results.slice(startIndex, endIndex);
        contentElement.innerHTML = ''; // Clear previous content
        itemsToShow.forEach((doc) => {
            xmlDoc = parser.parseFromString(doc[0], 'text/xml');
            headElement = xmlDoc.getElementsByTagName('h1')[0];
            pElement = xmlDoc.getElementsByTagName('p')[0];
            if (headElement){
                card = document.createElement('div');
                card.classList.add('card');
                cardHeader = document.createElement('div');
                cardHeader.classList.add('card-header');
                cardBody = document.createElement('div');
                cardBody.classList.add('card-body');
                cardTitle = document.createElement('h5');
                cardTitle.classList.add('card-title');
                cardLink = document.createElement('a');
                cardLink.href = "https://ascolicomune.it/statuti.html?id=" + doc[1].join("_");
                cardLink.textContent = headElement.textContent;
                cardLink.target = "_blank";
                cardTitle.appendChild(cardLink)
                cardDescription = document.createElement('p');
                cardDescription.classList.add('card-text');
                cardDescription.textContent = pElement.textContent.split(" ").slice(0, 25).join(" ") + " [...] "
                readLink = document.createElement('a');
                readLink.href = "https://ascolicomune.it/statuti.html?id=" + doc[1].join("_");
                readLink.textContent = "(Continua)"
                readLink.target = "_blank";
                cardDescription.appendChild(readLink)
                cardHeader.appendChild(cardTitle);
                cardBody.appendChild(cardDescription);
                card.appendChild(cardHeader);
                card.appendChild(cardBody);
                contentElement.appendChild(card)
            }
        });
    }


    // Function to generate pagination links
    function generatePaginationLinks(results) {
        pageCount = Math.ceil(results.length / itemsPerPage);
        paginationElement.innerHTML = ''; // Clear previous pagination links
        for (let i = 1; i <= pageCount; i++) {
            li = document.createElement('li');
            li.classList.add('page-item');
            button = document.createElement('button');
            button.classList.add('page-link');
            button.textContent = i;
            li.appendChild(button);

            // Add event listener to each pagination button
            addButtonEventListener(button, i, results);

            paginationElement.appendChild(li);
            if (i==1){
                button.classList.add('active');
            }
        }
    }
    // Function to add event listener to each pagination button
    function addButtonEventListener(button, page, results) {
        button.addEventListener('click', () => {
            currentPage = page;
            displayCurrentPage(results);

            // Remove 'active' class from all buttons
            const allButtons = paginationElement.querySelectorAll('.page-link');
            allButtons.forEach(btn => {
                btn.classList.remove('active');
            });

            // Add 'active' class to the clicked button
            button.classList.add('active');
        });
    }
})
