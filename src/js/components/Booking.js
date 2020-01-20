import {select, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element){
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();

  }

  render(element){
    const thisBooking = this;

    /* generate HTML based on template */
    const generatedHTML = templates.bookingWidget();

    /* create empty DOM object thisBooking.dom */
    thisBooking.dom = {};

    /* add element into thisBooking.dom */
    thisBooking.dom.wrapper = element;
    //console.log('thisBooking.dom.wrapper:', thisBooking.dom.wrapper);

    /* add generatedHTML into thisBooking.dom.wrapper */
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    /* add thisBooking.dom.peopleAmount property with element found in wrapper with selector select.booking.peopleAmount*/
    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
    //console.log('thisBooking.dom.peopleAmount:',thisBooking.dom.peopleAmount);

    /* add thisBooking.dom.hoursAmount property with element found in wrapper with selector select.booking.hoursAmount*/
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
    //console.log('thisBooking.dom.hoursAmount:',thisBooking.dom.hoursAmount);

    thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);

    thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  }

}

export default Booking;