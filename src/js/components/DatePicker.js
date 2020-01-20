/* global flatpickr */
import BaseWidget from './BaseWidget.js';
import { select, settings } from '../settings.js';
import {utils} from '../utils.js';

class DatePicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date()));

    const thisWidget = this;
    console.log(thisWidget);
    
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
    
    thisWidget.initPlugin();
  }

  initPlugin(){
    const thisWidget = this;

    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);

    const options = {

      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      locale: {
        'firstDayOfWeek': 1 // start week on Monday
      },
      disable: [
        function(date) {
          return (date.getDay() === 1);
        }
      ],
      onChange: 
        function(dateStr){
          thisWidget.value = dateStr;
        },
        
    };
    
    flatpickr(thisWidget.dom.input, options);
  }

  parseValue(value){ //konwertowanie argumentu 'value' na liczbę
    return value;
  }

  isValid(){
    return true;
  }

  renderValue(){
    console.log('render');
  }
}

export default DatePicker;