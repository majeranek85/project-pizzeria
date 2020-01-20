import {settings, select} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{
  constructor(element){
    super(element, settings.amountWidget.defaultValue);

    const thisWidget = this;

    thisWidget.setValue(thisWidget.dom.input.value);
    thisWidget.initActions();

    //console.log('AmountWidget:', thisWidget);
    //console.log('constructor arguments:', element);
  }

  getElements(){
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value){
    const thisWidget = this;

    const newValue = parseInt(value); //konwertowanie argumentu 'value' na liczbę

    /* TODO: Add validation */
    //Jeśli "nowa wartość liczby zamówień"  != od domyślnej(1) oraz >= od domyślnej minimalnej(1) oraz <= od domyślnej maksymalnej(9)
    if (newValue != thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){

      thisWidget.value = newValue;
      thisWidget.announce(); // nastąpi  uruchomienie eventu 'updated' (zaktualizowanie wartości zamówienia do nowej wart)
    }

    thisWidget.dom.input.value = thisWidget.value; // w przeciwnym razie wartość liczby zamówień równa domyślej (1)
  }


  initActions(){
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function() {
      thisWidget.setValue(thisWidget.dom.input.value);
    } );
    thisWidget.dom.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
      //console.log('minus clicked');
    } );
    thisWidget.dom.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
      //console.log('plus clicked');
    } );
  }

  announce(){
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    }); // stworzenie instancji klasy 'Event'
    thisWidget.dom.wrapper.dispatchEvent(event); //przypisanie elementu na którym zostanie wywołany event
  }
}

export default AmountWidget;
