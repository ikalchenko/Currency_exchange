const API_KEY = '24e5c179338dd7c0e8f35fe4fc5f0298';

class Converter {
    constructor() {
        this.currencyNames = Converter.getCurrencies();
    }

    static getCurrencies() {
        let xhr = new XMLHttpRequest();
        let currencies = {};
        try {
            xhr.open('POST', 'http://www.apilayer.net/api/list?access_key=' + API_KEY, false);
            xhr.send();
            let JSONResponse = JSON.parse(xhr.responseText);
            for (let key in JSONResponse) {
                if (key === 'currencies') {
                    for (let symbol in JSONResponse[key]) {
                        currencies[symbol + ' - ' + JSONResponse[key][symbol]] = null;
                    }
                }
            }
        } catch (error) {
            
        }
    
        return currencies;
    };
}

class UI {
    constructor() {
        this.currencyFrom = document.getElementById('autocomplete_from');
        this.autocompleteFrom= M.Autocomplete.init(this.currencyFrom, {data : converter.currencyNames, minLength : 0});
        this.currencyInto = document.getElementById('autocomplete_into');
        this.autocompleteInto = M.Autocomplete.init(this.currencyInto, {data : converter.currencyNames, minLength : 0});
    }
}

let converter = new Converter();
let ui = new UI();

ui.currencyFrom.addEventListener('focus', () => ui.currencyFrom.select());
ui.currencyInto.addEventListener('focus', () => ui.currencyInto.select());



