(function() {
    /**
     * Extension Config && Default Values
     * @type {Object}
     */
    var defaultVals = {
        'refresh_time': 10000,
        'default_market': 'bittrex',
        'last_updated' : moment()
    };

    var markets = {
        'bittrex': {
            url: 'https://bittrex.com/api/v1.1/public/getmarketsummary?market=BTC-GRS',
            key: 'result.0.Last',
            timestamp: 'result.0.TimeStamp'
        },
        'cryptopia': {
            url: 'https://www.cryptopia.co.nz/api/GetMarket/GRS_BTC',
            key: 'Data.LastPrice'
        }
    };

    var config = {};

    var SBT = {

        init: function () {
            this.resetCurrentVals();
            this.startRequesting();
            this.bindEvents();
        },

        resetCurrentVals: function () {
            for (var key in defaultVals) {
                config[key] = localStorage[key] || defaultVals[key];
            }
        },

        bindEvents: function() {
            var self = this;
            chrome.browserAction.onClicked.addListener(function() {
                self.restartRequesting();
            });
        },

        handleSingleRequestResult: function (raw) {
            try {
                var res = JSON.parse(raw);
                this.updateLatestInfo(this.getPriceInfo(res), this.getTimestampInfo(res));
            } catch (e) {
                // exception
            }
        },

        restartRequesting: function () {
            var self = this;
            window.clearInterval(self.globalIntervalId);
            this.startRequesting();
        },

        ReadyStateChange: function (obj, funcScope, funcName) { 
            return function () { 
                if (obj.readyState == 4 && obj.status == 200) { 
                    funcScope[funcName](obj.responseText); 
                }
            };
        },

        startRequesting: function () {
            var self = this;
            this.handleSingleRequest();
            this.globalIntervalId = window.setInterval(function () {
                self.handleSingleRequest();
                self.resetCurrentVals();
            }, config.refresh_time);
        },

        handleSingleRequest: function () {
            var req = new XMLHttpRequest(),
                url = markets[config.default_market].url;
            req.open("GET", url, true);
            req.onreadystatechange = this.ReadyStateChange(req, this, 'handleSingleRequestResult');
            req.send(null);
        },

        getPriceInfo: function (res) {
            var price = this.getDescendantProp(res, markets[config.default_market].key);
            price = this.getPriceInSatoshi(price);
            price = (!price || isNaN(price)) ?
                    0 : parseFloat(price);
            return price;
        },

        getTimestampInfo: function (res) {
            var timestamp = this.getDescendantProp(res, markets[config.default_market].timestamp);
            return moment(timestamp).format("YYYY/MM/DD - HH:mm");
        },

        getPriceInSatoshi: function (price) {
            return price*100000000;
        },

        getDescendantProp: function (res, desc) {
            var arr = desc.split(".");
            while(arr.length && (res = res[arr.shift()]));
            return res;
        },

        updateLatestInfo: function (price, timestamp) {
            this.updateBadge(price);
            this.updateChartData(price, timestamp);

        },

        updateChartData: function (price, timestamp) {

            var pricesStored = JSON.parse(localStorage.getItem("priceData"));

            if (pricesStored === null) {
                pricesStored = new Object();
            }

            console.log(pricesStored);

            if (!(timestamp in pricesStored)) {
                pricesStored[timestamp] = price;

                if (pricesStored.length > 30) {
                    var keys = Object.keys(pricesStored);
                    var earliest = new Date(Math.min.apply(null,keys));
                    delete object[earliest]
                }

                console.log(pricesStored);
                localStorage.setItem("priceData", JSON.stringify(pricesStored));
            }
        },


        updateBadge: function (price) {
            chrome.browserAction.getBadgeText({}, function(result) {
                if (result < price) {
                    // price is increasing -> light green
                    chrome.browserAction.setBadgeBackgroundColor({color: "#32ba39"});
                } else if (result > price) {
                    // price is falling -> light red
                    chrome.browserAction.setBadgeBackgroundColor({color: "#f44141"});
                }
            });
            chrome.browserAction.setBadgeText({
                text: price.toString()
            });
        }
    };

    return SBT;

})().init();
