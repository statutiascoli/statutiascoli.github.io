
calendarCurrentPage = 1
calendarResults = []
var itemsPerPage = 3; // Adjust as needed
if (window.innerWidth < 767.98) {
    itemsPerPage = 4; // Adjust for smaller screens
}

const parser = new DOMParser();

fetch('assets/statuti_web.json').then(response => response.json()).then(data => {

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

