class AmountWidget{
  constructor(element){
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.value = settings.amountWidget.defaultValue; // przypisana domyślna wartość liczby zamówień
    thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();

    //console.log('AmountWidget:', thisWidget);
    //console.log('constructor arguments:', element);
  }

  getElements(element){
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
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

    thisWidget.input.value = thisWidget.value; // w przeciwnym razie wartość liczby zamówień równa domyślej (1)
  }

  initActions(){
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function() {
      thisWidget.setValue(thisWidget.input.value);
    } );
    thisWidget.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
      //console.log('minus clicked');
    } );
    thisWidget.linkIncrease.addEventListener('click', function(event){
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
    thisWidget.element.dispatchEvent(event); //przypisanie elementu na którym zostanie wywołany event
  }
}
