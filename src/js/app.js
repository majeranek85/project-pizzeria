/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const app = {

    initMenu: function(){
      const thisApp = this;
      //console.log('thisApp.data:', thisApp.data);

      for (let productData in thisApp.data.products){
        new Product (thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },

    initCart: function(){
      const cartElem = document.querySelector(select.containerOf.cart);

      this.cart = new Cart(cartElem);
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.product;

      fetch(url) //wysyłamy zapytanie pod adres endpointu 'product'
        .then(function(rawResponse){
          return rawResponse.json(); //otrzymaną odp konwerujemy z JSON na tablicę
        })
        .then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse); //wyświetlamy przekonwertowaną odp

          /* save parsedResponse as thisApp.data.products */
          thisApp.data.products = parsedResponse;
          /*execute initMenu method */
          thisApp.initMenu();
        });

      console.log('thisApp.data', JSON.stringify(thisApp.data));
    },

    init: function(){
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);

      thisApp.initData();
      thisApp.initCart();
    },
  };

  app.init();
}
