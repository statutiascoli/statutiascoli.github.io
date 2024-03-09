volumeSelect = document.getElementById('volume-select');
bookSelect = document.getElementById('book-select');
rubricSelect = document.getElementById('rubric-select');
contentElement = document.getElementById('content');







fetch('assets/statuti_web.json')
    .then(response => response.json())
    .then(data => {
        // Function to generate navigation based on volumes
        function generateNavigation() {
            volumes = Object.keys(data);
            volumeSelect.addEventListener('change', handleVolumeChange);
            for (v_i in volumes) {
                option = document.createElement('option');
                option.value = v_i;
                option.textContent = volumes[v_i];
                volumeSelect.appendChild(option);
            }
        }

        // Function to populate books and content
        function populateBooksAndContent(selectedVolume) {
            volume_selected_key = Object.keys(data)[selectedVolume]
            volume_selected = data[volume_selected_key];
            if (typeof volume_selected === "string") {
                updateURLParams(selectedVolume, null, null); // Update URL params
                contentElement.innerHTML = volume_selected;
            } else {
                books = Object.keys(volume_selected);
                for (b_i in books) {
                    option = document.createElement('option');
                    option.value = b_i;
                    option.textContent = books[b_i];
                    bookSelect.appendChild(option);
                }
            }
            // Trigger book change event if books are available
            if (bookSelect.options.length > 0) {
                bookSelect.selectedIndex = 0; // Select the first book by default
                selectedBook = bookSelect.value;
                updateURLParams(selectedVolume, selectedBook, null); // Update URL params
                populateRubricsAndContent(selectedVolume, selectedBook);
            }
        }

        // Function to populate rubrics and content
        function populateRubricsAndContent(selectedVolume, selectedBook) {
            volume_selected_key = Object.keys(data)[selectedVolume]
            book_selected_key = Object.keys(data[volume_selected_key])[selectedBook]
            book_selected = data[volume_selected_key][book_selected_key];
            if (typeof book_selected === "string") {
                updateURLParams(selectedVolume, selectedBook, null); // Update URL params
                contentElement.innerHTML = book_selected;
            } else {
                rubrics = Object.keys(book_selected);
                for (r_i in rubrics) {
                    option = document.createElement('option');
                    option.value = r_i;
                    option.textContent = rubrics[r_i];
                    rubricSelect.appendChild(option);
                }
            }
            if (rubricSelect.options.length > 0) {
                rubricSelect.selectedIndex = 0; // Select the first rubric by default
                selectedRubric = rubricSelect.value;
                updateURLParams(selectedVolume, selectedBook, selectedRubric); // Update URL params
                rubric_key = Object.keys(data[volume_selected_key][book_selected_key])[selectedRubric];
                rubricText = data[volume_selected_key][book_selected_key][rubric_key]
                contentElement.innerHTML = rubricText;
            }
        }

        // Function to programmatically select volume, book, and rubric
        function selectDocument(volume, book, rubric) {
            volumeSelect.value = volume;
            handleVolumeChange({ target: volumeSelect });
            if (book && rubric) {
                bookSelect.value = book;
                handleBookChange({ target: bookSelect });
                rubricSelect.value = rubric;
                handleRubricChange({ target: rubricSelect });
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
            rubricSelect.innerHTML = '';
            populateBooksAndContent(selectedVolume);
        }

        // Function to handle book change event
        function handleBookChange(event) {
            selectedVolume = volumeSelect.value;
            selectedBook = event.target.value;
            updateURLParams(selectedVolume, selectedBook, null); // Update URL params
            contentElement.innerHTML = ''; // Clear previous content
            rubricSelect.innerHTML = '';
            populateRubricsAndContent(selectedVolume, selectedBook);
        }

        // Function to handle rubric change event
        function handleRubricChange(event) {
            selectedVolume = volumeSelect.value;
            selectedBook = bookSelect.value;
            selectedRubric = event.target.value;
            updateURLParams(selectedVolume, selectedBook, selectedRubric); // Update URL params
            volume_selected_key = Object.keys(data)[selectedVolume]
            book_selected_key = Object.keys(data[volume_selected_key])[selectedBook]
            rubric_key = Object.keys(data[volume_selected_key][book_selected_key])[selectedRubric];
            rubricText = data[volume_selected_key][book_selected_key][rubric_key]
            contentElement.innerHTML = rubricText;
        }

        // Function to update URL parameters
        function updateURLParams(volume, book, rubric) {
            console.log(volume, book, rubric)
            params = new URLSearchParams(window.location.search);
            params.delete('id'); // Clear existing volume param
            id_p = ""
            if (volume){
                id_p += volume
                if (book){
                    id_p += '_'+book
                }
                 if (rubric){
                     id_p += '_'+rubric
                 }
            }
            params.set('id', id_p);
            window.history.replaceState({}, '', `${location.pathname}?${params}`);
        }

        // Function to get URL parameters
        function getURLParams() {
            let volume = null;
            let book = null;
            let rubric = null;

            params = new URLSearchParams(window.location.search);
            id_p = params.get('id');
            if (id_p){
                pathSegments = id_p.split('_')
                if (pathSegments.length >= 1) {
                    volume = pathSegments[0];
                }
                if (pathSegments.length >= 2) {
                    book = pathSegments[1];
                }
                if (pathSegments.length >= 3) {
                    rubric = pathSegments[2];
                }
            }

            return { volume, book, rubric };
        }

        // Attach event listeners for book and rubric changes
        bookSelect.addEventListener('change', handleBookChange);
        rubricSelect.addEventListener('change', handleRubricChange);

        // Generate initial navigation
        generateNavigation();

        // Check URL parameters and update selections accordingly
        var { volume, book, rubric } = getURLParams();
        if (volume) {
            try{
                selectDocument(volume, book, rubric);
            }
            catch{
                selectDocument(0);
            }
        } else{
                selectDocument(0);
        }
    });
