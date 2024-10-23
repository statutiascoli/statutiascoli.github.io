categoryCurrentPage = 1
categoryResults = []

var itemsPerPage = 3; // Adjust as needed
if (window.innerWidth < 767.98) {
    itemsPerPage = 4; // Adjust for smaller screens
}

const parser = new DOMParser();

fetch('assets/statuti_web.json').then(response => response.json()).then(data => {

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
                cardLink.href = "https://statutiascoli.it/statuti.html?id=" + doc[1].join("_");
                cardLink.textContent =  resultElementVolume + ", " + resultElementBook + ", " + resultElementRubric
                cardLink.target = "_blank";
                cardTitle.appendChild(cardLink)
                cardDescription = document.createElement('p');
                cardDescription.classList.add('card-text');
                cardDescription.textContent = headElement.textContent;
                readLink = document.createElement('a');
                readLink.href = "https://statutiascoli.it/statuti.html?id=" + doc[1].join("_");
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
})

