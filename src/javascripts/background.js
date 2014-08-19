(function() {
    /**
     * Extension Config && Default Values
     * @type {Object}
     */
    var defaultVals = {
        'refresh_time': 15000,
        'default_market': '796'
    };

    var markets = {
        'btce': {
            url: 'https://btc-e.com/api/2/btc_usd/ticker',
            key: 'ticker.last'
        },
        'bitstamp': {
            url: 'https://www.bitstamp.net/api/ticker/',
            key: 'last'
        },
        'btcchina': {
            url: 'https://data.btcchina.com/data/ticker',
            key: 'ticker.last'
        },
        'huobi': {
            url: 'http://market.huobi.com/staticmarket/ticker_btc_json.js',
            key: 'ticker.last'
        },
        'okcoin': {
            url: 'https://www.okcoin.cn/api/ticker.do',
            key: 'ticker.last'
        },
        'chbtc': {
            url: 'http://api.chbtc.com/data/ticker',
            key: 'ticker.last'
        },
        '796': {
            url: 'http://api.796.com/v3/futures/ticker.html?type=weekly',
            key: 'ticker.last'
        },
        'btctrade': {
            url: 'http://www.btctrade.com/api/ticker',
            key: 'last'
        },
        'btc100': {
            url: 'https://www.btc100.com/apidata/getdata.json',
            key: '0.bit'
        },
        'bitfinex': {
            url: 'https://api.bitfinex.com/v1/pubticker/btcusd',
            key: 'last_price'
        },
        'peatio': {
            url: 'https://peatio.com/api/v2/tickers/btccny.json',
            key: 'ticker.last'
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
                this.updateLatestInfo(this.getPriceInfo(res));   
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
            price = (!price || isNaN(price)) ? 
                    0 : parseFloat(price).toFixed(0);
            return price;
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
            chrome.browserAction.setBadgeText({
                text: price
            });
        }
    };

    return SBT;

})().init();
