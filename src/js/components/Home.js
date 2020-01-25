import {templates} from '../settings.js';
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
  }
}

export default Home;