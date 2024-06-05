const CHART_COLORS = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)'
};


fetch('assets/analysis_data.json')
    .then(response => response.json())
    .then(analysisData => {
        wordFrequencyData = analysisData["tab1"]
        //long tail distribution
        const labels = wordFrequencyData.map(item => item.word);
        const counts = wordFrequencyData.map(item => item.count);

        const ctx1 = document.getElementById('wordFrequencyChart').getContext('2d');

        const wordFrequencyChart = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Word Frequency',
                    data: counts,
                    showLine: false,
                    fill: 'origin',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive:true,
                spanGaps: true,
                animation: false,
                scales: {
                    y: {
                        type: 'logarithmic',
                        title: {
                            display: true,
                            text: 'Frequency'
                        },
                        ticks: {
                            callback: function(value, index, values) {
                                return Number(value.toString());
                            }
                        }
                    }
                }
            }
        });

        const linearScaleRadio = document.getElementById('linearScale');
        const logarithmicScaleRadio = document.getElementById('logarithmicScale');
        linearScaleRadio.addEventListener('change', function() {
            if (linearScaleRadio.checked) {
                wordFrequencyChart.options.scales.y.type = 'linear';
                wordFrequencyChart.update();
            }
        });
        logarithmicScaleRadio.addEventListener('change', function() {
            if (logarithmicScaleRadio.checked) {
                wordFrequencyChart.options.scales.y.type = 'logarithmic';
                wordFrequencyChart.update();
            }
        });


        function renderWordCloud() {
            var filteredData = wordFrequencyData.filter(item => item.count >= 200);
            var maxCount = Math.max(...filteredData.map(item => item.count));
            var wordCloudData = filteredData.map(item => [item.word, Math.sqrt(item.count / maxCount) * 100]);
            WordCloud(document.getElementById('wordCloudCanvas'), {
                list: wordCloudData,
                callbacks: {
                    wordcloudstop: function() {
                        var canvas = document.getElementById('wordCloudCanvas');
                        canvas.addEventListener('mousemove', function(event) {
                            var words = canvas.getContext('2d').getImageData(event.offsetX, event.offsetY, 1, 1);
                            var wordIndex = words.data[0] + words.data[1] * 256;
                            var hoveredWord = wordcloud2.words[wordIndex];
                            if (hoveredWord) {
                                // Display tooltip with word count
                                canvas.title = hoveredWord.word + ': ' + filteredData.find(item => item.word === hoveredWord.word).count + ' occurrences';
                            }
                        });
                    }
                }
            });
        }
        renderWordCloud();

        window.addEventListener('resize', function() {
            renderWordCloud();
        });

        //----Language
        languageData = analysisData["tab2"]


        myChart1 = new Chart(
          document.getElementById('languageBar'),
          {
              type: 'bar',
              data: {
                  labels: ['Latino', 'Volgare Ascolano', 'Italiano'],
                  datasets: [{
                    label: 'Statuti del Comune',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    data: languageData["statuti"]["comune"]
                  }, {
                    label: 'Statuti del Popolo',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    data: languageData["statuti"]["popolo"]
                  }]
                },
              options: {
                responsive:true,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }
          }
        );

            const config2 = {
          type: 'bar',
          data: {
              labels: [['Libro 1','Statuti Comune'], ['Libro 2','Statuti Comune'], ['Libro 3','Statuti Comune'], ['Libro 4','Statuti Comune'], ['Libro 1','Statuti Popolo'], ['Libro 2','Statuti Popolo'], ['Libro 3','Statuti Popolo'], ['Libro 4','Statuti Popolo'], ['Libro 5','Statuti Popolo']],
              datasets: [
                {
                  label: 'Latino',
                  backgroundColor: "rgba(75, 192, 192, 0.5)",
                  borderColor: "rgba(75, 192, 192, 1)",
                  borderWidth: 1,
                  data: languageData["libri"][0]
                },
                {
                  label: 'Volgare Ascolano',
                  backgroundColor: 'rgba(255, 205, 86, 0.5)',
                  borderColor: 'rgba(255, 205, 86, 1)',
                  borderWidth: 1,
                  data: languageData["libri"][1]
                },
                {
                  label: 'Italiano',
                  backgroundColor: 'rgba(153, 102, 255, 0.5)',
                  borderColor: 'rgba(153, 102, 255, 1)',
                  borderWidth: 1,
                  data: languageData["libri"][2]
                }
              ]
            },
          options: {
            responsive:true,
            indexAxis: 'y',
            scales: {
              x: {
                stacked: true,
              },
              y: {
                stacked: true
              }
            }
          }
        };

        // Render the chart
        const ctx = document.getElementById('myChart').getContext('2d');
        const height = 9 * 25; // Assuming 40px per label
        ctx.canvas.height = height;
        myChart2 = new Chart(ctx, config2);

        window.addEventListener('resize', function() {
            myChart1.resize()
            myChart2.resize()
        });

        //______ TF-IDF
        tab3data = analysisData["tab3"]

        const colors = [
            'rgba(75, 192, 192, 0.2)',
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(199, 199, 199, 0.2)',
            'rgba(83, 102, 255, 0.2)',
            'rgba(103, 159, 64, 0.2)'
        ];

        const borderColors = [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(199, 199, 199, 1)',
            'rgba(83, 102, 255, 1)',
            'rgba(103, 159, 64, 1)'
        ];

        const container = document.getElementById('charts-container');

        Object.keys(tab3data).forEach((book, index) => {
            const chartContainer = document.createElement('div');
            chartContainer.className = 'col-md-6 col-xl-4';
            chartContainer.innerHTML = `
                <div class="card mb-4">
                    <div class="card-body">
                        <canvas id="${book}"></canvas>
                    </div>
                </div>
            `;
            container.appendChild(chartContainer);

            const ctx = document.getElementById(book).getContext('2d');
            ctx.canvas.height = ctx.canvas.height + 20;
            let myChart3 = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: tab3data[book].map(d => d[0]),
                    datasets: [{
                        label: 'TF-IDF score',
                        data: tab3data[book].map(d => d[1]),
                        backgroundColor: colors[index % colors.length],
                        borderColor: borderColors[index % borderColors.length],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            beginAtZero: true,
                        },
                        y: {
                            max: 1,
                            beginAtZero: true,
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: "Statuti " + book.split("-")[0] + " - Libro " + book.split("-")[1]
                        },
                        legend: {
                            display: false
                        }
                    }
                }
            });
            window.addEventListener('resize', function() {
                myChart3.resize()
            });
        });
    });
