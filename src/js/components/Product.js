import {select, templates, classNames} from './settings.js';
import {utils} from './utils.js';
import AmountWidget from './components.AmountWidget.js';

class Product{
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    //console.log('new Product:', thisProduct);
  }

  renderInMenu(){
    const thisProduct = this;

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    //console.log(generatedHTML);
    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;

    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
  }

  initAccordion(){
    const thisProduct = this;

    /* [DONE] find the clickable trigger (element that should react to clicking) */
    const trigger = thisProduct.accordionTrigger;
    //console.log(trigger);
    /* [DONE] START: click event listener to trigger */
    trigger.addEventListener('click', function(event){
    //console.log('clicked');
      /* [DONE] prevent default action for event */
      event.preventDefault();
      /* [DONE] toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle('active');
      /* [DONE] find all active products */
      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
      //console.log('all active products:', activeProducts);
      /* [DONE] START LOOP: for each active product */
      for (let activeProduct of activeProducts){
        /* [DONE] START: if the active product isn't the element of thisProduct */
        if (activeProduct != thisProduct.element) {
          /* [DONE] remove class active for the active product */
          activeProduct.classList.remove('active');
        /* [DONE] END: if the active product isn't the element of thisProduct */
        }
      /* [DONE] END LOOP: for each active product */
      }
    /* [DONE] END: click event listener to trigger */
    });
  }

  initOrderForm(){
    const thisProduct = this;
    //console.log('init initOrderForm', thisProduct);
    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder(){
    const thisProduct = this;
    //console.log('processOrder', thisProduct);
    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData', formData);
    thisProduct.params = {};

    let price = thisProduct.data.price;
    //console.log('Price:',price);

    // START LOOP: for all params elements
    for (let paramId in thisProduct.data.params){
      const param = thisProduct.data.params[paramId];
      //console.log('param:', param);
      //START LOOP: for all params options
      for (let optionId in param.options){
        //console.log('param options:', optionId);
        let option = param.options[optionId];
        //console.log('option:', option);
        // check if option is selected
        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
        //console.log('option selected:', optionSelected);
        // If option is selected and is not a default option > increase price
        if (optionSelected && !option.default) {
          price += option.price;
        //else If option is not selected and is a default
        } else if (!optionSelected && option.default) {
          price -= option.price;
        }

        // find all images with class ".paramId-optionId"
        const images = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
        //console.log('images:', images);

        //START If for selected options
        if (optionSelected) {
          if(!thisProduct.params[paramId]){
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;
          //START LOOP for every image in images
          for (let image of images){
            //console.log('show selected image:', image);
            //add class ".active" for image
            image.classList.add(classNames.menuProduct.imageVisible);
          //END LOOP for every image in images
          }
        //START else for not selected options
        } else {
          //START LOOP for every image in images
          for (let image of images) {
            //remove class ".active" for image
            image.classList.remove(classNames.menuProduct.imageVisible);
          //END LOOP for every image in images
          }
        }

      //END LOOP: for all params options
      }
    // END LOOP: for all params elements
    }

    /* multiply price by amount */
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

    thisProduct.priceElem.innerHTML = thisProduct.price;

    //console.log('thisProduct.params:', thisProduct.params);
  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    //nasłuchiwanie produktu na wydarzenie z widget'u ilości produktu (amountWidget)
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    //app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
  }
}

export default Product;
