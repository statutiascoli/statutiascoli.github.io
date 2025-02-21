cityCurrentPage = 1
cityResults = []
regionCurrentPage = 1
regionResults = []
categoryCurrentPage = 1
categoryResults = []
calendarCurrentPage = 1
calendarResults = []
var itemsPerPage = 3; // Adjust as needed
if (window.innerWidth < 767.98) {
    itemsPerPage = 4; // Adjust for smaller screens
}
cityMapCenter = null
regionMapCenter = null

const parser = new DOMParser();

fetch('assets/statuti_web.json').then(response => response.json()).then(data => {

   document.getElementById('citymap-tab').addEventListener('click', function(){
        if (window.cityMap) {
            window.cityMap.invalidateSize();
            setMapViewCity();
        }
   });
   document.getElementById('regionmap-tab').addEventListener('click', function(){
        if (window.regionMap) {
            window.regionMap.invalidateSize();
            setMapViewRegion();
        }
   });


   fetch('assets/comune.geojson').then(response => response.json()).then(geoJSONdata => {
        //city map
        var cityMapBounds = [[42.832855972, 13.542545443], [42.875313139, 13.617094353]];

        var cityMap = L.map('map_city', {
            maxBounds: [[42.84455370395206, 13.556849956512453], [42.86343017090419,13.593156337738039]],
            maxBoundsViscosity: 1.0,
            minZoom: 15,
            maxZoom: 17}).setView([42.854, 13.575], 15)
        var cityMapimage = L.imageOverlay('assets/city.png', cityMapBounds).addTo(cityMap);

        cityMapCenter = cityMap.getBounds().getCenter();
        cityMap.setView(cityMapCenter, 15)
        window.cityMap = cityMap

        setMapViewCity()
        window.addEventListener('resize', function() {
            if (window.cityMap) {
                setMapViewCity();
            }
            if (window.regionMap) {
                setMapViewRegion();
            }
        });

        function getColor(variable) {
            switch (variable) {
                case "Quartiere Sancto Emidio":
                    return 'green'; // Fill color for variable 1
                case "Quartiere Sancta Maria":
                    return 'blue'; // Fill color for variable 2
                case "Quartiere Sancto Jacobo":
                    return 'red'; // Fill color for variable 3
                case "Quartiere Sancto Venantio":
                    return 'yellow'; // Fill color for variable 4
                default:
                    return 'gray'; // Default fill color
            }
        }

        function getCityIcon(variable) {
            switch (variable) {
                case "porta":
                    return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d=\"M336.6 156.5c1.3 1.1 2.7 2.2 3.9 3.3c9.3 8.2 23 10.5 33.4 3.6l67.6-45.1c11.4-7.6 14.2-23.2 5.1-33.4C430 66.6 410.9 50.6 389.7 37.6c-11.9-7.3-26.9-1.4-32.1 11.6l-30.5 76.2c-4.5 11.1 .2 23.6 9.5 31.2zM328 36.8c5.1-12.8-1.6-27.4-15-30.5C294.7 2.2 275.6 0 256 0s-38.7 2.2-57 6.4C185.5 9.4 178.8 24 184 36.8l30.3 75.8c4.5 11.3 16.8 17.2 29 16c4.2-.4 8.4-.6 12.7-.6s8.6 .2 12.7 .6c12.1 1.2 24.4-4.7 29-16L328 36.8zM65.5 85c-9.1 10.2-6.3 25.8 5.1 33.4l67.6 45.1c10.3 6.9 24.1 4.6 33.4-3.6c1.3-1.1 2.6-2.3 4-3.3c9.3-7.5 13.9-20.1 9.5-31.2L154.4 49.2c-5.2-12.9-20.3-18.8-32.1-11.6C101.1 50.6 82 66.6 65.5 85zm314 137.1c.9 3.3 1.7 6.6 2.3 10c2.5 13 13 23.9 26.2 23.9h80c13.3 0 24.1-10.8 22.9-24c-2.5-27.2-9.3-53.2-19.7-77.3c-5.5-12.9-21.4-16.6-33.1-8.9l-68.6 45.7c-9.8 6.5-13.2 19.2-10 30.5zM53.9 145.8c-11.6-7.8-27.6-4-33.1 8.9C10.4 178.8 3.6 204.8 1.1 232c-1.2 13.2 9.6 24 22.9 24h80c13.3 0 23.8-10.8 26.2-23.9c.6-3.4 1.4-6.7 2.3-10c3.1-11.4-.2-24-10-30.5L53.9 145.8zM104 288H24c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24V312c0-13.3-10.7-24-24-24zm304 0c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24V312c0-13.3-10.7-24-24-24H408zM24 416c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24V440c0-13.3-10.7-24-24-24H24zm384 0c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24V440c0-13.3-10.7-24-24-24H408zM272 192c0-8.8-7.2-16-16-16s-16 7.2-16 16V464c0 8.8 7.2 16 16 16s16-7.2 16-16V192zm-64 32c0-8.8-7.2-16-16-16s-16 7.2-16 16V464c0 8.8 7.2 16 16 16s16-7.2 16-16V224zm128 0c0-8.8-7.2-16-16-16s-16 7.2-16 16V464c0 8.8 7.2 16 16 16s16-7.2 16-16V224z\"/></svg>";
                case "altro":
                case "piazza":
                    return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d=\"M320 64A64 64 0 1 0 192 64a64 64 0 1 0 128 0zm-96 96c-35.3 0-64 28.7-64 64v48c0 17.7 14.3 32 32 32h1.8l11.1 99.5c1.8 16.2 15.5 28.5 31.8 28.5h38.7c16.3 0 30-12.3 31.8-28.5L318.2 304H320c17.7 0 32-14.3 32-32V224c0-35.3-28.7-64-64-64H224zM132.3 394.2c13-2.4 21.7-14.9 19.3-27.9s-14.9-21.7-27.9-19.3c-32.4 5.9-60.9 14.2-82 24.8c-10.5 5.3-20.3 11.7-27.8 19.6C6.4 399.5 0 410.5 0 424c0 21.4 15.5 36.1 29.1 45c14.7 9.6 34.3 17.3 56.4 23.4C130.2 504.7 190.4 512 256 512s125.8-7.3 170.4-19.6c22.1-6.1 41.8-13.8 56.4-23.4c13.7-8.9 29.1-23.6 29.1-45c0-13.5-6.4-24.5-14-32.6c-7.5-7.9-17.3-14.3-27.8-19.6c-21-10.6-49.5-18.9-82-24.8c-13-2.4-25.5 6.3-27.9 19.3s6.3 25.5 19.3 27.9c30.2 5.5 53.7 12.8 69 20.5c3.2 1.6 5.8 3.1 7.9 4.5c3.6 2.4 3.6 7.2 0 9.6c-8.8 5.7-23.1 11.8-43 17.3C374.3 457 318.5 464 256 464s-118.3-7-157.7-17.9c-19.9-5.5-34.2-11.6-43-17.3c-3.6-2.4-3.6-7.2 0-9.6c2.1-1.4 4.8-2.9 7.9-4.5c15.3-7.7 38.8-14.9 69-20.5z\"/></svg>";
                case "chiesa":
                    return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 512\"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d=\"M344 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V48H264c-13.3 0-24 10.7-24 24s10.7 24 24 24h32v46.4L183.3 210c-14.5 8.7-23.3 24.3-23.3 41.2V512h96V416c0-35.3 28.7-64 64-64s64 28.7 64 64v96h96V251.2c0-16.9-8.8-32.5-23.3-41.2L344 142.4V96h32c13.3 0 24-10.7 24-24s-10.7-24-24-24H344V24zM24.9 330.3C9.5 338.8 0 354.9 0 372.4V464c0 26.5 21.5 48 48 48h80V273.6L24.9 330.3zM592 512c26.5 0 48-21.5 48-48V372.4c0-17.5-9.5-33.6-24.9-42.1L512 273.6V512h80z\"/></svg>";
                case "palazzo":
                    return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 576 512\"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d=\"M288 0H400c8.8 0 16 7.2 16 16V80c0 8.8-7.2 16-16 16H320.7l89.6 64H512c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H336V400c0-26.5-21.5-48-48-48s-48 21.5-48 48V512H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64H165.7L256 95.5V32c0-17.7 14.3-32 32-32zm48 240a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM80 224c-8.8 0-16 7.2-16 16v64c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V240c0-8.8-7.2-16-16-16H80zm368 16v64c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V240c0-8.8-7.2-16-16-16H464c-8.8 0-16 7.2-16 16zM80 352c-8.8 0-16 7.2-16 16v64c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V368c0-8.8-7.2-16-16-16H80zm384 0c-8.8 0-16 7.2-16 16v64c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V368c0-8.8-7.2-16-16-16H464z\"/></svg>";
            }
        }

        var selectedLayer = null
        var selectedMarker = null

        function resetSestiere(layer){
            layer.setStyle({
                weight: 2,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7,
            });
        }

        function selectSestiere(layer){
            layer.setStyle({
                weight: 2,
                color: 'black',
                dashArray: '',
                fillOpacity: 1,
            });
        }
        sestieri = geoJSONdata.features.slice(0, 24);
        var sestieriLayer = L.geoJSON(sestieri, {
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
                        populateResults(feature.properties.id, feature.properties.title, "city-results", cityCurrentPage, cityResults, feature.properties.quartiere)
                        selectSestiere(layer)
                        e.target.bringToFront();
                    }
                    // Deselect the marker if it's selected
                    if (selectedMarker) {
                        L.DomUtil.removeClass(selectedMarker._icon, 'selectedMarker');
                        selectedMarker = null;
                    }
                });
                layer.bindTooltip(feature.properties.title);
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
                    fillOpacity: 0.7,
                };
            }
        }).addTo(cityMap);

        cityMarkers = geoJSONdata.features.slice(24);
        var cityMapMarkersLayer = L.geoJSON(cityMarkers, {
             pointToLayer: function (feature, latlng) {
                    return L.marker(latlng, {
                        icon: L.divIcon({
                            html: getCityIcon(feature.properties.type),
                            iconSize: L.point(30, 30)
                        })
                    })
              },
             onEachFeature: function(feature, layer) {
                layer.on('click', function(event) {
                    if (selectedMarker !== layer) {
                        if (selectedMarker) {
                            L.DomUtil.removeClass(selectedMarker._icon, 'selectedMarker');
                            selectedMarker = null;
                        }
                        selectedMarker = layer;
                        populateResults(feature.properties.id, feature.properties.title, "city-results", cityCurrentPage, cityResults)
                        L.DomUtil.addClass(selectedMarker._icon, 'selectedMarker');
                        // Deselect the polygon if it's selected
                        if (selectedLayer) {
                            // Reset style of the selected polygon
                            resetSestiere(selectedLayer)
                            selectedLayer = null;
                        }
                    }
                });
                layer.bindTooltip(feature.properties.title);
             }
        }).addTo(cityMap);

        cityMap.on('click', function(event) {
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
                populateResults(null, null, "city-results", cityCurrentPage, cityResults)
             }
        });
    })

   fetch('assets/territorio.geojson').then(response => response.json()).then(geoJSONdata => {
        //region map
        var regionMapBounds = [[42.321619480, 12.644150122], [43.293500927,14.540690849]];

        var regionMap = L.map('map_territory', {
            maxBounds: [[42.601619944327965, 13.009185791015627], [43.104993581605505,14.140777587890627]],
            maxBoundsViscosity: 1.0,
            zoom: 10,
            minZoom: 10,
            maxZoom: 12}).setView([42.85499758703556, 13.57538174536857], 10)
        var regionMapimage = L.imageOverlay('assets/terr.png', regionMapBounds).addTo(regionMap);

        regionMapCenter = regionMap.getBounds().getCenter();
        regionMap.setView(regionMapCenter, 10)
        window.regionMap = regionMap
        setMapViewRegion()

        var marker = L.marker([42.85499758703556, 13.57538174536857], {
            interactive: false,  // Make the marker non-interactive
            icon: L.divIcon({
                html: "<svg class=\"city\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d=\"M489.2 287.9h-27.4c-2.6 0-4.6 2-4.6 4.6v32h-36.6V146.2c0-2.6-2-4.6-4.6-4.6h-27.4c-2.6 0-4.6 2-4.6 4.6v32h-36.6v-32c0-2.6-2-4.6-4.6-4.6h-27.4c-2.6 0-4.6 2-4.6 4.6v32h-36.6v-32c0-6-8-4.6-11.7-4.6v-38c8.3-2 17.1-3.4 25.7-3.4 10.9 0 20.9 4.3 31.4 4.3 4.6 0 27.7-1.1 27.7-8v-60c0-2.6-2-4.6-4.6-4.6-5.1 0-15.1 4.3-24 4.3-9.7 0-20.9-4.3-32.6-4.3-8 0-16 1.1-23.7 2.9v-4.9c5.4-2.6 9.1-8.3 9.1-14.3 0-20.7-31.4-20.8-31.4 0 0 6 3.7 11.7 9.1 14.3v111.7c-3.7 0-11.7-1.4-11.7 4.6v32h-36.6v-32c0-2.6-2-4.6-4.6-4.6h-27.4c-2.6 0-4.6 2-4.6 4.6v32H128v-32c0-2.6-2-4.6-4.6-4.6H96c-2.6 0-4.6 2-4.6 4.6v178.3H54.8v-32c0-2.6-2-4.6-4.6-4.6H22.8c-2.6 0-4.6 2-4.6 4.6V512h182.9v-96c0-72.6 109.7-72.6 109.7 0v96h182.9V292.5c.1-2.6-1.9-4.6-4.5-4.6zm-288.1-4.5c0 2.6-2 4.6-4.6 4.6h-27.4c-2.6 0-4.6-2-4.6-4.6v-64c0-2.6 2-4.6 4.6-4.6h27.4c2.6 0 4.6 2 4.6 4.6v64zm146.4 0c0 2.6-2 4.6-4.6 4.6h-27.4c-2.6 0-4.6-2-4.6-4.6v-64c0-2.6 2-4.6 4.6-4.6h27.4c2.6 0 4.6 2 4.6 4.6v64z\"/></svg>",
                iconSize: L.point(30, 30)
            })
        }).addTo(regionMap);

        function getRegionIcon(variable) {
            return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d=\"M32 192V48c0-8.8 7.2-16 16-16h64c8.8 0 16 7.2 16 16V88c0 4.4 3.6 8 8 8h32c4.4 0 8-3.6 8-8V48c0-8.8 7.2-16 16-16h64c8.8 0 16 7.2 16 16V88c0 4.4 3.6 8 8 8h32c4.4 0 8-3.6 8-8V48c0-8.8 7.2-16 16-16h64c8.8 0 16 7.2 16 16V192c0 10.1-4.7 19.6-12.8 25.6L352 256l16 144H80L96 256 44.8 217.6C36.7 211.6 32 202.1 32 192zm176 96h32c8.8 0 16-7.2 16-16V224c0-17.7-14.3-32-32-32s-32 14.3-32 32v48c0 8.8 7.2 16 16 16zM22.6 473.4L64 432H384l41.4 41.4c4.2 4.2 6.6 10 6.6 16c0 12.5-10.1 22.6-22.6 22.6H38.6C26.1 512 16 501.9 16 489.4c0-6 2.4-11.8 6.6-16z\"/></svg>"
        }

        var selectedRegionMarker = null

        var cityMapMarkersLayer = L.geoJSON(geoJSONdata.features, {
             pointToLayer: function (feature, latlng) {
                    return L.marker(latlng, {
                        icon: L.divIcon({
                            html: getRegionIcon(feature.properties.type),
                            iconSize: L.point(30, 30)
                        })
                    })
              },
             onEachFeature: function(feature, layer) {
                layer.on('click', function(event) {
                    if (selectedRegionMarker !== layer) {
                        if (selectedRegionMarker) {
                            L.DomUtil.removeClass(selectedRegionMarker._icon, 'selectedMarker');
                            selectedRegionMarker = null;
                        }
                        selectedRegionMarker = layer;
                        populateResults(feature.properties.id, feature.properties.title, "region-results", regionCurrentPage, regionResults)
                        L.DomUtil.addClass(selectedRegionMarker._icon, 'selectedMarker');
                    }
                });
                layer.bindTooltip(feature.properties.title);
             }
        }).addTo(regionMap);

        regionMap.on('click', function(event) {
            if (event.originalEvent.target.nodeName == 'path')
                return;
            else {
                if (selectedRegionMarker) {
                    L.DomUtil.removeClass(selectedRegionMarker._icon, 'selectedMarker');
                    selectedRegionMarker = null;
                }
                populateResults(null, null, "region-results", regionCurrentPage, regionResults)
             }
        });
    })

    //categories
    categoriesButtons = document.querySelectorAll(".categories button")
    categoriesButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var target = this.getAttribute('data-target');
            var title = this.getAttribute('data-title');
            var activeButton = document.querySelector('.categories button.active');
            // Remove 'active' class from previously active button, if any
            if (activeButton) {
                activeButton.classList.remove('active');
            }
            // Add 'active' class to the clicked button
            this.classList.add('active');

            populateResultsCategories(target, title, "categories-results", categoryCurrentPage, categoryResults)
        });
    });

   function populateResultsCategories(category, title, tab, currentPage, results){
       document.querySelector('.' + tab + ' .result-content').innerHTML = ""
       document.querySelector('.' + tab + ' .pagination').innerHTML = ""
       currentPage = 1
       document.querySelector('.' + tab + ' .result-title').innerHTML = ""
       results = []
       if (category){
           document.querySelector('.' + tab + ' .result-title').innerHTML = title
           for (v_i in Object.keys(data)){
                v_key = Object.keys(data)[v_i]
                volume_content = data[v_key];
                if (typeof volume_content === "object") {
                    books = Object.keys(volume_content);
                    for (b_i in books) {
                        b_key = Object.keys(data[v_key])[b_i]
                        book_content = data[v_key][b_key];
                        if (typeof book_content === "object") {
                            rubrics = Object.keys(data[v_key][b_key]);
                            for (r_i in rubrics) {
                                r_key = rubrics[r_i]
                                rubric_content = data[v_key][b_key][r_key];
                                rubricDoc = parser.parseFromString(rubric_content, 'text/xml');
                                if (rubricDoc.querySelector("div").hasAttribute('ana')) {
                                    var rubric_category = rubricDoc.querySelector("div").getAttribute('ana');
                                    if (rubric_category.includes(category)) {
                                        results.push([rubricDoc, [v_i,b_i,r_i]])
                                    }
                                }
                            }
                        }
                    }
                }
           }
       }
       displayCurrentPage(results, tab, currentPage);
       if (results.length > 3){
          generatePaginationLinks(results, tab, currentPage);
       }
   }

   function populateResults(identifier, title, tab, currentPage, results, quartiere=null){
       document.querySelector('.' + tab + ' .result-content').innerHTML = ""
       document.querySelector('.' + tab + ' .pagination').innerHTML = ""
       currentPage = 1
       document.querySelector('.' + tab + ' .result-title').innerHTML = ""
       if (tab === "city-results"){
          document.querySelector('.' + tab + ' .result-quartiere').innerHTML = ""
       }
       results = []
       if (identifier){
           document.querySelector('.' + tab + ' .result-title').innerHTML = title
           if (quartiere){
              document.querySelector('.' + tab + ' .result-quartiere').innerHTML = quartiere
           }
           for (v_i in Object.keys(data)){
                v_key = Object.keys(data)[v_i]
                volume_content = data[v_key];
                if (typeof volume_content === "object") {
                    books = Object.keys(volume_content);
                    for (b_i in books) {
                        b_key = Object.keys(data[v_key])[b_i]
                        book_content = data[v_key][b_key];
                        if (typeof book_content === "object") {
                            rubrics = Object.keys(data[v_key][b_key]);
                            for (r_i in rubrics) {
                                r_key = rubrics[r_i]
                                rubric_content = data[v_key][b_key][r_key];
                                if(rubric_content.includes(identifier)){
                                    rubricDoc = parser.parseFromString(rubric_content, 'text/xml');
                                    headElement = rubricDoc.getElementsByTagName('h1')[0];
                                    if (headElement){
                                        results.push([rubricDoc, [v_i,b_i,r_i]])
                                    }
                                }
                            }
                        }
                    }
                }
           }
       }
       displayCurrentPage(results, tab, currentPage);
       if (results.length > 3){
          generatePaginationLinks(results, tab, currentPage);
       }
   }

   function displayCurrentPage(results, tab, currentPage) {
        startIndex = (currentPage - 1) * itemsPerPage;
        endIndex = startIndex + itemsPerPage;
        itemsToShow = results.slice(startIndex, endIndex);
        document.querySelector('.' + tab + ' .result-content').innerHTML = ''; // Clear previous content
        itemsToShow.forEach((doc) => {
            xmlDoc = doc[0]
            headElement = xmlDoc.getElementsByTagName('h1')[0];
            pElement = xmlDoc.getElementsByTagName('p')[0];
            if (headElement){
                resultElementVolume = (doc[1][0] == 1) ? "Statuti del Comune" : (doc[1][0] == 2) ? "Statuti del Popolo" : "Introduzione";
                resultElementBook = "Libro " + doc[1][1]
                resultElementRubric = "Rubrica " +  xmlDoc.querySelector('.numeroRubrica num').getAttribute('value');
                card = document.createElement('div');
                card.classList.add('card');
                card.classList.add('mb-3');
                cardHeader = document.createElement('div');
                cardHeader.classList.add('card-header');
                cardBody = document.createElement('div');
                cardBody.classList.add('card-body');
                cardTitle = document.createElement('h5');
                cardTitle.classList.add('card-title');
                cardLink = document.createElement('a');
                cardLink.href = "https://ascolicomune.it/statuti.html?id=" + doc[1].join("_");
                cardLink.textContent =  resultElementVolume + ", " + resultElementBook + ", " + resultElementRubric
                cardLink.target = "_blank";
                cardTitle.appendChild(cardLink)
                cardDescription = document.createElement('p');
                cardDescription.classList.add('card-text');
                cardDescription.textContent = headElement.textContent;
                readLink = document.createElement('a');
                readLink.href = "https://ascolicomune.it/statuti.html?id=" + doc[1].join("_");
                readLink.textContent = " (Leggi Rubrica)"
                readLink.target = "_blank";
                cardDescription.appendChild(readLink)
                cardHeader.appendChild(cardTitle);
                cardBody.appendChild(cardDescription);
                card.appendChild(cardHeader);
                card.appendChild(cardBody);
                document.querySelector('.' + tab + ' .result-content').appendChild(card)
            }
        });
    }

   // Function to generate pagination links
   function generatePaginationLinks(results, tab, currentPage) {
        pageCount = Math.ceil(results.length / itemsPerPage);
        document.querySelector('.' + tab + ' .pagination').innerHTML = ''; // Clear previous pagination links
        for (let i = 1; i <= pageCount; i++) {
            li = document.createElement('li');
            li.classList.add('page-item');
            button = document.createElement('button');
            button.classList.add('page-link');
            button.textContent = i;
            li.appendChild(button);

            // Add event listener to each pagination button
            addButtonEventListener(button, i, results, tab, currentPage);
            document.querySelector('.' + tab + ' .pagination').appendChild(li);
            if (i==1){
                button.classList.add('active');
            }
        }
    }
   // Function to add event listener to each pagination button
   function addButtonEventListener(button, page, results, tab, currentPage) {
        button.addEventListener('click', () => {
            currentPage = page;
            displayCurrentPage(results, tab, currentPage);

            // Remove 'active' class from all buttons
            const allButtons = document.querySelector('.' + tab + ' .pagination').querySelectorAll('.page-link');
            allButtons.forEach(btn => {
                btn.classList.remove('active');
            });

            // Add 'active' class to the clicked button
            button.classList.add('active');
        });
    }

   function setMapViewCity() {
        let isMobile = window.innerWidth <= 768;
        let minZoom = isMobile ? 14 : 15;
        window.cityMap.setMinZoom(minZoom);
        window.cityMap.setZoom(minZoom);
   }
   function setMapViewRegion() {
        let isMobile = window.innerWidth <= 768;
        let minZoom = isMobile ? 9 : 10;
        window.regionMap.setMinZoom(minZoom);
        window.regionMap.setZoom(minZoom);
   }

   fetch('assets/holidays.json').then(response => response.json()).then(calendarData => {
       const months = [
            "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
            "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
        ];

        // Days in each month for the year 1496
        const daysInMonth = [
            31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 // Leap year February
        ];

        const dayNames = ["Lu", "Ma", "Me", "Gi", "Ve", "Sa", "Do"];

        let currentMonth = 0; // January
        // January 1, 1496 was a Friday
        const startDay = 4; // Friday


        function getStartDayOfMonth(month) {
            let dayOffset = startDay;
            for (let i = 0; i < month; i++) {
                dayOffset += daysInMonth[i];
            }
            return dayOffset % 7;
        }

        function loadCalendar(month) {
            const firstDay = getStartDayOfMonth(month);
            const monthDays = daysInMonth[month];
            const calendarDays = document.querySelector('.calendar-days');
            calendarDays.innerHTML = '';

            // Add day names
            dayNames.forEach(day => {
                const dayDiv = document.createElement('div');
                dayDiv.textContent = day;
                dayDiv.classList.add('calendar-head');
                calendarDays.appendChild(dayDiv);
            });

            // Add empty slots for days of the previous month
            for (let i = 0; i < firstDay; i++) {
                const emptyDiv = document.createElement('div');
                calendarDays.appendChild(emptyDiv);
            }

            // Add days of the current month
            for (let i = 1; i <= monthDays; i++) {
                const dayDiv = document.createElement('div');
                dayDiv.textContent = i;
                if (month==3 && i==9){
                    dayDiv.classList.add('clickable-day');
                    dayDiv.classList.add('historical-day');
                    dayDiv.addEventListener('click', () => {
                        populateResultsHistorical("calendar-results", calendarCurrentPage, calendarResults)
                    });
                }
                // Check if the day is clickable
                if (calendarData.some(d => d.month === month && d.day === i)) {
                    let dayData = calendarData.find(d => d.month === month && d.day === i);
                    dayDiv.classList.add('clickable-day');
                    dayDiv.setAttribute('data-target', dayData.id);
                    dayDiv.setAttribute('data-title', dayData.title);
                    dayDiv.addEventListener('click', () => {
                        populateResults(dayDiv.getAttribute('data-target'), dayDiv.getAttribute('data-title'), "calendar-results", calendarCurrentPage, calendarResults)
                    });
                }

                calendarDays.appendChild(dayDiv);
            }

            // Update month and year display
            document.getElementById('monthYear').textContent = `${months[month]} 1496`;
        }

        document.getElementById('prevMonth').addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
            }
            loadCalendar(currentMonth);
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
            }
            loadCalendar(currentMonth);
        });

        // Initial load
        loadCalendar(currentMonth);

        function populateResultsHistorical(tab, currentPage, results){
           document.querySelector('.' + tab + ' .result-content').innerHTML = ""
           document.querySelector('.' + tab + ' .pagination').innerHTML = ""
           currentPage = 1
           document.querySelector('.' + tab + ' .result-title').innerHTML = ""
           results = []
           document.querySelector('.' + tab + ' .result-title').innerHTML = "Stampa degli Statuti del 1496"
           rubric_content = data["Conclusione"];
           xmlDoc = parser.parseFromString(rubric_content, 'text/xml');
           document.querySelector('.' + tab + ' .result-content').innerHTML = ''; // Clear previous content
            pElement = xmlDoc.getElementsByTagName('p')[1].textContent;
            card = document.createElement('div');
            card.classList.add('card');
            card.classList.add('mb-3');
            cardHeader = document.createElement('div');
            cardHeader.classList.add('card-header');
            cardBody = document.createElement('div');
            cardBody.classList.add('card-body');
            cardTitle = document.createElement('h5');
            cardTitle.classList.add('card-title');
            cardLink = document.createElement('a');
            cardLink.href = "https://ascolicomune.it/statuti.html?id=3";
            cardLink.textContent =  "Conclusione"
            cardLink.target = "_blank";
            cardTitle.appendChild(cardLink)
            cardDescription = document.createElement('p');
            cardDescription.classList.add('card-text');
            console.log(pElement)
            cardDescription.textContent = "[...]" + pElement;
            readLink = document.createElement('a');
            readLink.href = "https://ascolicomune.it/statuti.html?id=3";
            readLink.textContent = " (Leggi Conclusione)"
            readLink.target = "_blank";
            cardDescription.appendChild(readLink)
            cardHeader.appendChild(cardTitle);
            cardBody.appendChild(cardDescription);
            card.appendChild(cardHeader);
            card.appendChild(cardBody);
            document.querySelector('.' + tab + ' .result-content').appendChild(card)
       }
    })
})

