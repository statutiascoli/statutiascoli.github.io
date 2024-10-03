regionCurrentPage = 1
regionResults = []
var itemsPerPage = 3; // Adjust as needed
if (window.innerWidth < 767.98) {
    itemsPerPage = 4; // Adjust for smaller screens
}
regionMapCenter = null

const parser = new DOMParser();

fetch('assets/statuti_web.json').then(response => response.json()).then(data => {

   fetch('assets/territorio.geojson').then(response => response.json()).then(geoJSONdata => {
        //region map
        var regionMapBounds = [[42.321619480, 12.644150122], [43.293500927,14.540690849]];

        var regionMap = L.map('map_territory', {
            maxBounds: [[42.601619944327965, 13.009185791015627], [43.104993581605505,14.140777587890627]],
            maxBoundsViscosity: 1.0,
            zoom: 10,
            minZoom: 10,
            maxZoom: 12}).setView([42.85499758703556, 13.57538174536857], 10)

        var lowResOverlay = L.imageOverlay('assets/terrLOW.png', regionMapBounds).addTo(regionMap);
        function loadHighResImage() {
            var highResOverlay = L.imageOverlay('assets/terr.png', regionMapBounds);
            highResOverlay.on('load', function() {
                regionMap.removeLayer(lowResOverlay);
            });
            highResOverlay.addTo(regionMap);
        }
        loadHighResImage();

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

   function setMapViewRegion() {
        let isMobile = window.innerWidth <= 768;
        let minZoom = isMobile ? 9 : 10;
        window.regionMap.setMinZoom(minZoom);
        window.regionMap.setZoom(minZoom);
   }
})

