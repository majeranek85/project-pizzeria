class BaseWidget{
  constructor(wrapperElement, initialValue){
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.value = initialValue;  
  }

  setValue(value){
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value); 

    if (newValue != thisWidget.value && thisWidget.isValid(newValue)){
      thisWidget.value = newValue;
      thisWidget.announce();
    }

    thisWidget.renderValue();
  }

  parseValue(value){ //konwertowanie argumentu 'value' na liczbę
    return parseInt(value);
  }

  isValid(value){
    return !isNaN(value); //spr czy wartość nie jest liczbą
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }

  announce(){
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    }); // stworzenie instancji klasy 'Event'

    thisWidget.dom.wrapper.dispatchEvent(event); //przypisanie elementu na którym zostanie wywołany event
  }
}

export default BaseWidget;