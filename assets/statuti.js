const volumeSelect = document.getElementById('volume-select');
const bookSelect = document.getElementById('book-select');
const statuteSelect = document.getElementById('statute-select');
const contentElement = document.getElementById('content');

fetch('assets/statuti_web.json')
    .then(response => response.json())
    .then(data => {
        // Function to generate navigation based on volumes
        function generateNavigation() {
            volumes = Object.keys(data);
            volumeSelect.addEventListener('change', handleVolumeChange);
            volumes.forEach(volume => {
                const option = document.createElement('option');
                option.value = volume;
                option.textContent = volume;
                volumeSelect.appendChild(option);
            });
        }

        // Function to populate books and content
        function populateBooksAndContent(selectedVolume) {
            volume_selected = data[selectedVolume];
            if (typeof volume_selected === "string") {
                updateURLParams(selectedVolume, null, null); // Update URL params
                contentElement.innerHTML = volume_selected;
            } else {
                const books = Object.keys(volume_selected);
                books.forEach(book => {
                    const option = document.createElement('option');
                    option.value = book;
                    option.textContent = book;
                    bookSelect.appendChild(option);
                });
            }
            // Trigger book change event if books are available
            if (bookSelect.options.length > 0) {
                bookSelect.selectedIndex = 0; // Select the first book by default
                const selectedBook = bookSelect.value;
                updateURLParams(selectedVolume, selectedBook, null); // Update URL params
                populateStatutesAndContent(selectedVolume, selectedBook);
            }
        }

        // Function to populate statutes and content
        function populateStatutesAndContent(selectedVolume, selectedBook) {
            const book_selected = data[selectedVolume][selectedBook];
            if (typeof book_selected === "string") {
                updateURLParams(selectedVolume, selectedBook, null); // Update URL params
                contentElement.innerHTML = book_selected;
            } else {
                const statutes = Object.keys(book_selected);
                statutes.forEach(statute => {
                    const option = document.createElement('option');
                    option.value = statute;
                    option.textContent = statute;
                    statuteSelect.appendChild(option);
                });
            }
            if (statuteSelect.options.length > 0) {
                statuteSelect.selectedIndex = 0; // Select the first statute by default
                const selectedStatute = statuteSelect.value;
                updateURLParams(selectedVolume, selectedBook, selectedStatute); // Update URL params
                const statuteText = data[selectedVolume][selectedBook][selectedStatute];
                contentElement.innerHTML = statuteText;
            }
        }

        // Function to programmatically select volume, book, and statute
        function selectDocument(volume, book, statute) {
            volumeSelect.value = volume;
            handleVolumeChange({ target: volumeSelect });
            if (book && statute) {
                bookSelect.value = book;
                handleBookChange({ target: bookSelect });
                statuteSelect.value = statute;
                handleStatuteChange({ target: statuteSelect });
            } else if (book) {
                bookSelect.value = book;
                handleBookChange({ target: bookSelect });
            }
        }

        // Function to handle volume change event
        function handleVolumeChange(event) {
            selectedVolume = event.target.value;
            updateURLParams(selectedVolume, null, null); // Update URL params
            contentElement.innerHTML = ''; // Clear previous content
            bookSelect.innerHTML = '';
            statuteSelect.innerHTML = '';
            populateBooksAndContent(selectedVolume);
        }

        // Function to handle book change event
        function handleBookChange(event) {
            const selectedVolume = volumeSelect.value;
            const selectedBook = event.target.value;
            updateURLParams(selectedVolume, selectedBook, null); // Update URL params
            contentElement.innerHTML = ''; // Clear previous content
            statuteSelect.innerHTML = '';
            populateStatutesAndContent(selectedVolume, selectedBook);
        }

        // Function to handle statute change event
        function handleStatuteChange(event) {
            const selectedVolume = volumeSelect.value;
            const selectedBook = bookSelect.value;
            const selectedStatute = event.target.value;
            updateURLParams(selectedVolume, selectedBook, selectedStatute); // Update URL params
            const statuteText = data[selectedVolume][selectedBook][selectedStatute];
            contentElement.innerHTML = statuteText;
        }

        // Function to update URL parameters
        function updateURLParams(volume, book, statute) {
            console.log(volume, book, statute)
            const params = new URLSearchParams(window.location.search);
            params.delete('s'); // Clear existing volume param
            params.delete('l'); // Clear existing book param
            params.delete('r'); // Clear existing statute param
            params.set('s', volume);
            if (book) params.set('l', book);
            if (statute) params.set('r', statute);
            window.history.replaceState({}, '', `${location.pathname}?${params}`);
        }

        // Function to get URL parameters
        function getURLParams() {
            const params = new URLSearchParams(window.location.search);
            const volume = params.get('s');
            const book = params.get('l');
            const statute = params.get('r');
            return { volume, book, statute };
        }

        // Attach event listeners for book and statute changes
        bookSelect.addEventListener('change', handleBookChange);
        statuteSelect.addEventListener('change', handleStatuteChange);

        // Generate initial navigation
        generateNavigation();

        // Check URL parameters and update selections accordingly
        const { volume, book, statute } = getURLParams();
        if (volume) {
            try{
                selectDocument(volume, book, statute);
            }
            catch{
                selectDocument('Statuti del Comune', 'Introduzione');
            }
        } else{
                selectDocument('Statuti del Comune', 'Introduzione');
        }
    });
