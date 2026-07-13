
calendarCurrentPage = 1
calendarResults = []
var itemsPerPage = 3; // Adjust as needed
if (window.innerWidth < 767.98) {
    itemsPerPage = 4; // Adjust for smaller screens
}

const parser = new DOMParser();

Promise.all([
  fetch('assets/statuti_web.json').then(r => r.json()),
  fetch('assets/holidays.json').then(r => r.json())
]).then(([data, calendarData]) => {

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
    const LABELS = {
        months: {
            it: ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"],
            en: ["January","February","March","April","May","June","July","August","September","October","November","December"]
        },
        days: {
            it: ["Lu","Ma","Me","Gi","Ve","Sa","Do"],
            en: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
        }
    };


    //NEW
    function showDayEvents(dayEvents, month, day, tab) {
        const resultTitle = document.querySelector(
            '.' + tab + ' .result-title'
        );

        const resultContent = document.querySelector(
            '.' + tab + ' .result-content'
        );

        const pagination = document.querySelector(
            '.' + tab + ' .pagination'
        );

        resultContent.innerHTML = '';
        pagination.innerHTML = '';

        // Column title
        const monthName = lingua === 'en'
            ? LABELS.months.en[month]
            : LABELS.months.it[month];

        resultTitle.textContent = `${day} ${monthName} 1496`;

        // Create a separate card for each event in that day
        dayEvents.forEach(event => {
            const card = document.createElement('div');
            card.classList.add('card', 'mb-3');

            const cardBody = document.createElement('div');
            cardBody.classList.add('card-body');

            const cardTitle = document.createElement('h5');
            cardTitle.classList.add('card-title');
            cardTitle.textContent = event.title;

            cardBody.appendChild(cardTitle);

            // Show descriptions only if present in the JSON
            /*if (event.desc) {
                const cardDescription = document.createElement('p');
                cardDescription.classList.add('card-text');
                cardDescription.textContent = event.desc;

                cardBody.appendChild(cardDescription);
            }*/

            const openButton = document.createElement('button');
            openButton.type = 'button';
            openButton.classList.add('btn', 'btn-outline-primary');

            openButton.innerHTML = `
                <span class="it ${lingua === 'en' ? 'd-none' : ''}">
                    Consulta le rubriche
                </span>
                <span class="en ${lingua === 'it' ? 'd-none' : ''}">
                    Browse the statutes
                </span>
            `;

            openButton.addEventListener('click', () => {
                setParamInUrl('id', event.id);

                populateResults(
                    event.id,
                    event.title,
                    tab,
                    calendarCurrentPage,
                    calendarResults
                );
            });

            cardBody.appendChild(openButton);
            card.appendChild(cardBody);
            resultContent.appendChild(card);
        });
    }

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
        for (let i = 0; i < 7; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-head');

            dayDiv.innerHTML = `
                <span class="it ${lingua === 'en' ? 'd-none' : ''}">${LABELS.days.it[i]}</span>
                <span class="en ${lingua === 'it' ? 'd-none' : ''}">${LABELS.days.en[i]}</span>
            `;

            calendarDays.appendChild(dayDiv);
        }

        // Add empty slots for days of the previous month
        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement('div');
            calendarDays.appendChild(emptyDiv);
        }

        // Add days of the current month
        for (let i = 1; i <= monthDays; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = i;
            /*if (month==3 && i==9){
                dayDiv.classList.add('clickable-day');
                dayDiv.classList.add('historical-day');
                dayDiv.addEventListener('click', () => {
                    document.querySelectorAll('.calendar-days .clickable-day.active').forEach(el => el.classList.remove('active'));
                    dayDiv.classList.add('active');
                    populateResultsHistorical("calendar-results", calendarCurrentPage, calendarResults)
                });
            }*/
            // Check if the day is clickable
           /* if (calendarData.some(d => d.month === month && d.day === i)) {
                let dayData = calendarData.find(d => d.month === month && d.day === i);
                dayDiv.classList.add('clickable-day');
                dayDiv.setAttribute('data-target', dayData.id);
                dayDiv.setAttribute('data-title', dayData.title);
                dayDiv.addEventListener('click', () => {
                    const target = dayDiv.getAttribute('data-target');
                    document.querySelectorAll('.calendar-days .clickable-day.active').forEach(el => el.classList.remove('active'));
                    dayDiv.classList.add('active');
                    setParamInUrl('id', target);
                    populateResults(dayDiv.getAttribute('data-target'), dayDiv.getAttribute('data-title'), "calendar-results", calendarCurrentPage, calendarResults)
                });
            }*/

           // Retrieve all events associated to this day
            const dayEvents = calendarData.filter(
                d => d.month === month && d.day === i
            );

            if (dayEvents.length > 0) {
                dayDiv.classList.add('clickable-day');

                dayDiv.setAttribute('data-month', month);
                dayDiv.setAttribute('data-day', i);

                const isHistoricalDay = dayEvents.some(
                    event => event.id === 'stampaStatuti'
                );

                if (isHistoricalDay) {
                    dayDiv.classList.add('historical-day');
                }

                dayDiv.addEventListener('click', () => {
                    document
                        .querySelectorAll('.calendar-days .clickable-day.active')
                        .forEach(el => el.classList.remove('active'));

                    dayDiv.classList.add('active');

                    if (dayEvents.length === 1) {
                        const event = dayEvents[0];

                        setParamInUrl('id', event.id);

                        if (event.id === 'stampaStatuti') {
                            populateResultsHistorical(
                                "calendar-results",
                                calendarCurrentPage,
                                calendarResults
                            );
                        } else {
                            populateResults(
                                event.id,
                                event.title,
                                "calendar-results",
                                calendarCurrentPage,
                                calendarResults
                            );
                        }
                    } else {
                        setParamInUrl('id', '');

                        showDayEvents(
                            dayEvents,
                            month,
                            i,
                            "calendar-results"
                        );
                    }
                });
            }

            calendarDays.appendChild(dayDiv);
        }

        // Update month and year display
        document.getElementById('monthYear').innerHTML = `
            <span class="it ${lingua === 'en' ? 'd-none' : ''}">${LABELS.months.it[month]}</span>
            <span class="en ${lingua === 'it' ? 'd-none' : ''}">${LABELS.months.en[month]}</span>
            <span class="year"> 1496</span>
            `;
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

    function populateResultsHistorical(tab, currentPage, results){
        document.querySelector('.' + tab + ' .result-content').innerHTML = ""
        document.querySelector('.' + tab + ' .pagination').innerHTML = ""
        currentPage = 1
        document.querySelector('.' + tab + ' .result-title').innerHTML = ""
        results = []
        document.querySelector('.' + tab + ' .result-title').innerHTML = "Stampa degli Statuti"
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
        cardLink.href = "https://statutiascoli.it/statuti.html?id=3";
        cardLink.textContent =  "Conclusione"
        cardLink.target = "_blank";
        cardTitle.appendChild(cardLink)
        cardDescription = document.createElement('p');
        cardDescription.classList.add('card-text');
        console.log(pElement)
        cardDescription.textContent = "[...]" + pElement;
        readLink = document.createElement('a');
        readLink.href = "https://statutiascoli.it/statuti.html?id=3";
        readLink.textContent = " (Leggi Conclusione)"
        readLink.target = "_blank";
        cardDescription.appendChild(readLink)
        cardHeader.appendChild(cardTitle);
        cardBody.appendChild(cardDescription);
        card.appendChild(cardHeader);
        card.appendChild(cardBody);
        document.querySelector('.' + tab + ' .result-content').appendChild(card)
    }

    function getParamFromUrl(key) {
        try {
            const url = new URL(window.location.href);
            return (url.searchParams.get(key) || '').toString().trim();
        } catch (e) {
            return '';
        }
    }

    function setParamInUrl(key, value) {
        try {
            const url = new URL(window.location.href);
            if (value) url.searchParams.set(key, value);
            else url.searchParams.delete(key);
            window.history.replaceState({}, '', url.toString());
        } catch (e) {
            // ignore
        }
    }

    function autoOpenFromUrl() {
        const calId = getParamFromUrl('id');
        if (!calId) return;

        // Find the day in holidays.json
        const entry = calendarData.find(d => String(d.id) === String(calId));
        if (!entry) return;

        if (typeof entry.month === 'number') {
            currentMonth = entry.month;
            loadCalendar(currentMonth);
        }
        
        if (entry.id === 'stampaStatuti') {
            populateResultsHistorical(
                "calendar-results",
                calendarCurrentPage,
                calendarResults
            );
        } else {
            populateResults(
                String(entry.id),
                entry.title,
                "calendar-results",
                calendarCurrentPage,
                calendarResults
            );
        }

       /* const dayEl = document.querySelector(`.clickable-day[data-target="${CSS.escape(String(entry.id))}"]`);
        if (dayEl) dayEl.classList.add('active');*/
        const dayEl = document.querySelector(
            `.clickable-day[data-month="${entry.month}"][data-day="${entry.day}"]`
        );

        if (dayEl) {
            dayEl.classList.add('active');
        }
    }

    loadCalendar(currentMonth);
    autoOpenFromUrl();
})

