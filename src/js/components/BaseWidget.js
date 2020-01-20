class BaseWidget{
  constructor(wrapperElement, initialValue){
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctValue = initialValue;  
  }

  get value(){
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  set value(value){
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value); 

    if (newValue != thisWidget.correctValue && thisWidget.isValid(newValue)){
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }

    thisWidget.renderValue();
  }

  setValue(value){
    const thisWidget = this;

    thisWidget.value = value;
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