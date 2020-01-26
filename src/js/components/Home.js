import {templates, select} from '../settings.js';
import {utils} from '../utils.js';
class Home {
  constructor(){
    const thisHome = this;

    
    thisHome.render();
    thisHome.initSlider();
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

  initSlider(){
    const thisHome = this;

    thisHome.slides = document.querySelectorAll('#slides .slide')
    let currentSlide = 0;
    
    setInterval(nextSlide, 3000);

    function nextSlide() {
      thisHome.slides[currentSlide].className = 'slide';
      currentSlide = (currentSlide + 1)%thisHome.slides.length;
      thisHome.slides[currentSlide].className = 'slide active';
    }
  }
}

export default Home;