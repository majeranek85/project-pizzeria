import {templates, select} from '../settings.js';
import {utils} from '../utils.js';
class Home {
  constructor(){
    const thisHome = this;

    thisHome.render();
  }

  render(){
    const thisHome = this;

    /* generate HTML based on template */
    const generatedHTML = templates.home();

    /* create element using utils.createElementFromHTML */
    thisHome.element = utils.createDOMFromHTML(generatedHTML);

    /* find home page container */
    const homeContainer = document.querySelector(select.containerOf.home);

    /* add element to home page */
    homeContainer.appendChild(thisHome.element);
  }
}

export default Home;