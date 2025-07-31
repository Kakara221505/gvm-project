import styled from 'styled-components'

// Define a styled component for a div
export const HomeBannerStyles = styled.div`
  /* HomeBanner.css */

  .innerCarouselImage {
    position: relative;
  }

  .bolderHeadingMain {
    color: #fff;
    font-family: MuseoModerno;
    font-size: 45px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }

  .bolderHeadingChild {
    color: #fff;
    font-family: MuseoModerno;
    font-size: 34px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }

  .floatingTextCarousel {
    position: absolute;
    text-align: center;
    top: 65%;
    left: 58%;
    transform: translate(-50%, -50%);
  }

  .carousel-indicators {
    bottom: 10px ;
  }

  .carousel-indicators [data-bs-target] {
    background-color: transparent; /* Set the indicator background color */
    border: 1px solid #fff !important; /* Add a border to create a circular shape */
    border-radius: 50% !important; /* Make the indicators circular */
    width: 15px; /* Adjust the width of the indicators */
    height: 15px; /* Adjust the height of the indicators */
    margin: 0 5px !important; /* Adjust the margin between indicators */
  }

  .carousel-indicators .active {
    background-color: #fff !important; /* Set the active indicator's background color */
    border-radius: 50% !important; /* Make the indicators circular */
    border: none !important;
    width: 17px ; /* Adjust the width of the indicators */
    height: 17px; /* Adjust the height of the indicators */
    margin: 0 5px !important; /* Adjust the margin between indicators */
  }

  @media (min-width: 1000px) and (max-width:1400px) {
    .bolderHeadingMain {
      font-size: 35px;

    }
    .bolderHeadingChild {
      font-size: 25px;
    }
    .floatingTextCarousel {
      top: 64%;
    }
  }

  @media (min-width: 768px) and (max-width:999px) {
    .bolderHeadingMain {
      font-size: 30px;

    }
    .bolderHeadingChild {
      font-size: 20px;
    }
    .floatingTextCarousel {
      top: 64%;
    }
  }
  /* @media screen and (max-width: 1200px) {
    .bolderHeadingChild {
      font-size: 35px;
    }
    .floatingTextCarousel {
      top: 64%;
    }
  }
  @media screen and (max-width: 1000px) {
    .bolderHeadingChild {
      font-size: 35px;
    }
    .floatingTextCarousel {
      top: 64%;
    }
  } */

`
