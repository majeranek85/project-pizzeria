import {select, templates, settings, classNames} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element){
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);
    
    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };
  
    //console.log('getData params:', params);
    
    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking
                                     + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event  
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event  
                                     + '?' + params.eventsRepeat.join('&'),
    };

    //console.log('getData urls', urls);
    
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsReapeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsReapeatResponse.json(),
        ]);
      }).then(function([bookings, eventsCurrent, eventsReapeat]){
        //console.log(bookings);
        //console.log(eventsCurrent);
        //console.log(eventsReapeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsReapeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        } 
      }
    }

    //console.log('thisBooking.booked', thisBooking.booked);
    
    thisBooking.updateDOM();
    
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      //console.log('loop', hourBlock);

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;
    //console.log('thisBooking.hourPicker.value', thisBooking.hourPicker.value);

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    //console.log('thisBookin.hour', thisBooking.hour);
    
    let allAvailable = false;
    //console.log('allAvailable', allAvailable);
    
    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }
      //console.log('table', tableId);
      
      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }

    } 
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
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    //console.log('thisBooking.dom.peopleAmount:',thisBooking.dom.peopleAmount);

    /* add thisBooking.dom.hoursAmount property with element found in wrapper with selector select.booking.hoursAmount*/
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    //console.log('thisBooking.dom.hoursAmount:',thisBooking.dom.hoursAmount);

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    //console.log('thisBooking.dom.datePicker', thisBooking.dom.datePicker);
    
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    //console.log('thisBooking.dom.hourPicker', thisBooking.dom.hourPicker);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    //console.log('thisBooking.dom.tables', thisBooking.dom.tables);

    thisBooking.dom.submit = thisBooking.dom.wrapper.querySelector('.booking-form');
    //console.log('thisBooking.dom.submit', thisBooking.dom.submit);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
    //console.log('thisBooking.dom.starterInputs', thisBooking.dom.starterInputs);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.datePicker.addEventListener('updated', function(){
      thisBooking.clearSelected();
    });

    thisBooking.dom.hourPicker.addEventListener('updated', function(){
      thisBooking.clearSelected();
    });

    for(let table of thisBooking.dom.tables){
      table.addEventListener('click', function(event){
        //console.log('table clicked!');
        thisBooking.clickedTable = event.target;
        //console.log(thisBooking.clickedTable);
        thisBooking.selectTable();   
      });
    }

    thisBooking.dom.submit.addEventListener('submit', function(event){
      event.preventDefault();
      thisBooking.sendReservation();
      thisBooking.clearSelected();
    });
    
  }

  clearSelected(){
    const thisBooking = this;

    for(let table of thisBooking.dom.tables){
      table.classList.remove(classNames.booking.tableSelected);
    }
  }

  selectTable(){
    const thisBooking = this;

    /* Select table/tables */
    if(thisBooking.clickedTable.classList.contains(classNames.booking.tableBooked)){
      const alert = document.getElementById('alert');
      alert.classList.toggle('active');
    } else {
      thisBooking.clickedTable.classList.toggle(classNames.booking.tableSelected);      
    }

    /* Add selected table to reservation */
    thisBooking.tablesSelected = [];

    for(let i = 0; i < thisBooking.dom.tables.length; i++) {
      if(thisBooking.dom.tables[i].classList.contains(classNames.booking.tableSelected)){
        let tableNumber = thisBooking.dom.tables[i].dataset.table;
        if(!isNaN(tableNumber)){
          tableNumber = parseInt(tableNumber);
        }
        
        thisBooking.tablesSelected.push(tableNumber);
      //console.log(thisBooking.tablesSelected); 
      } 
    }
  }

  sendReservation(){

    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      address: thisBooking.dom.address.value,
      phone: thisBooking.dom.phone.value,
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.tablesSelected,
      duration: thisBooking.hoursAmount.value,
      ppl:thisBooking.peopleAmount.value,
      starters: [],
    };
  
    //console.log('payload', payload);

    /* Add selected starters to reservation */
    for(let i = 0; i < thisBooking.dom.starters.length; i++) {
      if(thisBooking.dom.starters[i].checked == true){
        payload.starters.push(thisBooking.dom.starters[i].value);
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options) 
      .then(function(response){
        return response.json(); 
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
        
      }); 

    for(let tableId of thisBooking.tablesSelected){
      thisBooking.makeBooked(payload.date, payload.hour, payload.duration, tableId);
    }

    thisBooking.updateDOM();
  }

}

export default Booking;
