const API_KEY = 'your_api_key'; // past here your api code from currencylayer.com

class Converter {
    constructor() {
        this.symbols = Converter.getSymbols();
        this.currencies = Converter.getCurrencies();
    }

    convert(quantity, currencyFrom, currencyInto) {
        let from = this.getRate(currencyFrom.slice(0, 3));
        let into = this.getRate(currencyInto.slice(0, 3));
        return quantity / from * into;
    }

    getRate(currency) {
        for (let cy in this.currencies) {
            if (cy === currency) {
                return this.currencies[cy];
            }
        }
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
                        currencies[currency.slice(3, 6)] =  JSONResponse[key][currency];
                    }
                }
            }
            localStorage.setItem('lastCurrencies', JSON.stringify(currencies));
            localStorage.setItem('lastUpdate', Date.now());
        } else {
            currencies = JSON.parse(localStorage.getItem('lastCurrencies'));
        }
        return currencies;
    }
}

class UI {
    constructor() {
        this.quantity = document.getElementById('quantity');
        this.currencyFrom = document.getElementById('autocomplete_from');
        this.currencyInto = document.getElementById('autocomplete_into');
        this.switchCurrenciesBtn = document.getElementById('switch_currencies');
        this.autocompleteFrom= M.Autocomplete.init(this.currencyFrom, {data : converter.symbols, minLength : 0});
        this.autocompleteInto = M.Autocomplete.init(this.currencyInto, {data : converter.symbols, minLength : 0});
        this.convertBtn = document.getElementById('convert');
        this.resultDiv = document.getElementById('result');
        this.resultCard = document.getElementById('resultCard');
    }

    convert() {
        let isValid = this.validate();
        if (isValid) {
            let result = converter.convert(this.quantity.value, this.currencyFrom.value, this.currencyInto.value);
            this.resultCard.classList.remove('hide');   
            while (this.resultDiv.hasChildNodes()) {
                this.resultDiv.removeChild(this.resultDiv.lastChild);
            }
            let div = document.createElement('h3');
            div.innerHTML = Number(this.quantity.value) + ' ' 
                            + this.currencyFrom.value.slice(0, 3) 
                            + ' <i class="material-icons">arrow_forward</i> ' 
                            + Number(result.toFixed(5)) + ' ' 
                            + this.currencyInto.value.slice(0, 3);
            this.resultDiv.appendChild(div);
            div = document.createElement('h5');
            div.classList.add('grey-text');
            div.innerHTML = 1 + ' ' 
                            + this.currencyFrom.value.slice(0, 3) 
                            + ' <i class="material-icons tiny">arrow_forward</i> ' 
                            + Number(converter.convert(1, this.currencyFrom.value, this.currencyInto.value).toFixed(5)) + ' ' 
                            + this.currencyInto.value.slice(0, 3);
            this.resultDiv.appendChild(div);
            div = document.createElement('div');
            let lastUPD = new Date(Number(localStorage.getItem('lastUpdate')));
            div.innerHTML = 'Last update was ' 
                            + lastUPD.getDate() + '.' 
                            + (lastUPD.getMonth() + 1) + '.' 
                            + lastUPD.getFullYear() + ' at ' 
                            + lastUPD.getHours() + ':' 
                            + lastUPD.getMinutes();
            this.resultDiv.appendChild(div);

        }
    }

    validate() {
        let valid = true;
        if (this.quantity.value === '') {
            this.error('Empty field', this.quantity);
            valid = false;
        }
        if (this.currencyFrom.value === '') {
            this.error('Empty field', this.currencyFrom);
            valid = false;
        }
        if (this.currencyInto.value === '') {
            this.error('Empty field', this.currencyInto);
            valid = false;
        }
        let validFrom = false;
        let validInto = false;
        for (let symbol in converter.symbols) {
            if (this.currencyFrom.value === symbol && !validFrom) {
                validFrom = true;
            }
            if (this.currencyInto.value === symbol && !validInto) {
                validInto = true;
            }
        }
        if (!validFrom && this.currencyFrom.value !== '') {
            this.error('Invalid currency', this.currencyFrom);
            valid = false;
        }
        if (!validInto && this.currencyInto.value !== '') {
            this.error('Invalid currency', this.currencyInto);
            valid = false;
        }
        
        return valid;
    }

    error(text, node) {
        let parentNode = node.parentNode;
        if (node === this.quantity) {
            node.classList.add('invalid');
            parentNode.children[2].setAttribute('data-error', text);
        } else {
            node.classList.add('invalid');
            parentNode.children[3].setAttribute('data-error', text);
        }
    }

    errorReset(node) {
        let parentNode = node.parentNode;
        if (node === this.quantity) {
            node.classList.remove('invalid');
        } else {
            node.classList.remove('invalid');
        }
    }

    switchCurrencies() {
        let temp = this.currencyFrom.value;
        this.currencyFrom.value = this.currencyInto.value;
        this.currencyInto.value = temp;
        this.errorReset(this.currencyFrom);
        this.errorReset(this.currencyInto);
    }
}

let converter = new Converter();
let ui = new UI();

ui.quantity.addEventListener('input', () => {
    if (Number(ui.quantity.value) < 0) {
        ui.quantity.value = 0;
    }
    ui.errorReset(ui.quantity)
});
ui.currencyFrom.addEventListener('change', () => ui.errorReset(ui.currencyFrom));
ui.currencyInto.addEventListener('change', () => ui.errorReset(ui.currencyInto));
ui.convertBtn.addEventListener('click', () => ui.convert());
ui.currencyFrom.addEventListener('focus', () => ui.currencyFrom.select());
ui.currencyInto.addEventListener('focus', () => ui.currencyInto.select());
ui.switchCurrenciesBtn.addEventListener('click', () => ui.switchCurrencies());