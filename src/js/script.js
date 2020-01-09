/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

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

      console.log('thisProduct.params:', thisProduct.params);
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

      app.cart.add(thisProduct);
    }
  }

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
        console.log('minus clicked');
      } );
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
        console.log('plus clicked');
      } );
    }

    announce(){
      const thisWidget = this;

      const event = new Event('updated'); // stworzenie instancji klasy 'Event'
      thisWidget.element.dispatchEvent(event); //przypisanie elementu na którym zostanie wywołany event
    }
  }

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = []; //tablica do przechowywania produktów w koszyku

      thisCart.getElements(element);
      thisCart.initActions();

      console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {}; //obiekt przechowujący elementy DOM w komponencie Cart

      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    }

    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }

    add(menuProduct){
      const thisCart = this;

      const generatedHTML = templates.cartProduct(menuProduct);
      //console.log('generatedHTML:', generatedHTML);
      const generateDOM = utils.createDOMFromHTML(generatedHTML);
      //console.log('generateDOM:', generateDOM);
      thisCart.dom.productList.appendChild(generateDOM);
      //console.log('adding product:', menuProduct);
      thisCart.products.push(menuProduct);
      console.log('thisCart.products', thisCart.products);
    }
  }

  class CartProduct{
    constructor(menuProduct, element){
       thisCartProduct = this;

      // thisCartProduct.id = menuProduct.id

       console.log('thisCartProduct', thisCartProduct);
    }
  }

  const app = {

    initMenu: function(){
      const thisApp = this;
      //console.log('thisApp.data:', thisApp.data);

      for (let productData in thisApp.data.products){
        new Product (productData, thisApp.data.products[productData]);
      }
    },

    initCart: function(){
      const cartElem = document.querySelector(select.containerOf.cart);

      this.cart = new Cart(cartElem);
    },

    initData: function(){
      //const thisApp = this;

      this.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
