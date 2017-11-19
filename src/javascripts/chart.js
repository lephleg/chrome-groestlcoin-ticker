(function() {

    var config = {
        type: 'line',
        data: {
            labels: parsePriceTimestamps(),
            datasets: [{
                label: "Price in satoshis",
                backgroundColor: window.chartColors.blue,
                borderColor: window.chartColors.blue,
                data: parsePriceData(),
                fill: false
            }]
        },
        options: {
            legend: {
                display: false
            },
            responsive: true,
            title:{
                display:true,
                text:'BTC/GRS 1min price chart'
            },
            tooltips: {
                mode: 'index',
                intersect: false
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Time'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Price'
                    }
                }]
            }
        }
    };

    window.onload = function() {
        var ctx = document.getElementById("canvas").getContext("2d");
        window.myLine = new Chart(ctx, config);
    };

    function parsePriceData() {
        var prices = JSON.parse(localStorage.getItem("priceData"));
        return Object.values(prices);
    }

    function parsePriceTimestamps() {
        var prices = JSON.parse(localStorage.getItem("priceData"));
        return Object.keys(prices);
    }

})();
