(function() {
    /**
     * Extension Config && Default Values
     * @type {Object}
     */
    var defaultVals = {
        'refresh_time': 10000,
        'default_market': '796'
    };

    var markets = {
        'bittrex': {
            url: 'https://bittrex.com/api/v1.1/public/getticker?market=BTC-GRS',
            key: 'result.Last'
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
                this.updateLatestInfo(this.getPriceInfo(res),res);
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

        getPriceInSatoshi: function (price) {
            return price*100000000;
        },

        getDescendantProp: function (res, desc) {
            var arr = desc.split(".");
            while(arr.length && (res = res[arr.shift()]));
            return res;
        },

        updateLatestInfo: function (price) {
            this.updateBadge(price);
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
