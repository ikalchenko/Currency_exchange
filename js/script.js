const API_KEY = '24e5c179338dd7c0e8f35fe4fc5f0298';

class Converter {
    constructor() {
        this.symbols = Converter.getSymbols();
        this.currencies = Converter.getCurrencies();
    }

    static getSymbols() {
        let xhr = new XMLHttpRequest();
        let symbols = {};
        xhr.open('POST', 'http://www.apilayer.net/api/list?access_key=' + API_KEY, false);
        xhr.send();
        let JSONResponse = JSON.parse(xhr.responseText);
        if (JSONResponse['success'] === true) {
            for (let key in JSONResponse) {
                if (key === 'currencies') {
                    for (let symbol in JSONResponse[key]) {
                        symbols[symbol + ' - ' + JSONResponse[key][symbol]] = null;
                    }
                }
            }
            localStorage.setItem('lastSymbols', JSON.stringify(symbols));
        } else {
            symbols = JSON.parse(localStorage.getItem('lastSymbols'));
        }
    
        return symbols;
    }

    static getCurrencies() {
        let xhr = new XMLHttpRequest();
        let currencies = {};
        xhr.open('POST', 'http://www.apilayer.net/api/live?access_key=' + API_KEY, false);
        xhr.send(); 
        let JSONResponse = JSON.parse(xhr.responseText);
        if (JSONResponse['success'] === true) {
            for (let key in JSONResponse) {
                if (key === 'quotes') {
                    for (let currency in JSONResponse[key]) {
                        currencies[currency] =  JSONResponse[key][currency];
                    }
                }
            }
            localStorage.setItem('lastCurrencies', JSON.stringify(currencies));
        } else {
            currencies = JSON.parse(localStorage.getItem('lastCurrencies'));
        }
        return currencies;
    }
}

class UI {
    constructor() {
        this.currencyFrom = document.getElementById('autocomplete_from');
        this.currencyInto = document.getElementById('autocomplete_into');
        this.switchCurrenciesBtn = document.getElementById('switch_currencies');
        this.autocompleteFrom= M.Autocomplete.init(this.currencyFrom, {data : converter.symbols, minLength : 0});
        this.autocompleteInto = M.Autocomplete.init(this.currencyInto, {data : converter.symbols, minLength : 0});
    }
    switchCurrencies() {
        let temp = this.currencyFrom.value;
        this.currencyFrom.value = this.currencyInto.value;
        this.currencyInto.value = temp;     
    }
}

let converter = new Converter();
let ui = new UI();

ui.currencyFrom.addEventListener('focus', () => ui.currencyFrom.select());
ui.currencyInto.addEventListener('focus', () => ui.currencyInto.select());
ui.switchCurrenciesBtn.addEventListener('click', () => ui.switchCurrencies());



