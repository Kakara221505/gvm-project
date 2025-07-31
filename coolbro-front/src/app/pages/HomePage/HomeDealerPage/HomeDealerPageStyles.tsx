import styled from 'styled-components'
import {toAbsoluteUrl} from '../../../../_metronic/helpers'

// Define a styled component for a div
export const HomeDealerBrandPageStyles = styled.div`



.primaryTextBold.qq {
    font-size: 120px;
}

.bg-gold {
  background: url(${toAbsoluteUrl('/media/vectors/DelaerSliderCommon.png')}) no-repeat;
  background-size: cover;
    width: 100% !important;
    max-width: 98%;
}


.react-multi-carousel-item {
    display: flex;
    justify-content: center;
}
  .innerTextMain {
    display: flex;
    justify-content: space-between;
  }
  .excText {
    font-size: 30px;
    font-weight: 500;
    text-transform: uppercase;
  }
  .viewText {
    font-size: 22px;
    font-weight: 500;
    cursor:pointer !important;
  }

  .bottomRoomText{
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
  }
  .card-img1{
    border-radius: 12px;
  }

  .react-multi-carousel-list {
    display: flex;
    align-items: center;
    overflow: hidden;
    position: inherit !important;
}

.react-multiple-carousel__arrow::before {
    font-size: 40px;
    color: #fff;
    display: block;
    text-align: center;
    z-index: 2;
    position: relative;
    font-weight: bolder;
}

.react-multiple-carousel__arrow{
  background: transparent !important;
  filter: invert(1) !important;
}

  .overlay1{
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0.02%, rgba(0, 0, 0, 0.60) 109.15%);
  }
  
  .DealCardExce1{
    /* background: #000; */
    background: url(${toAbsoluteUrl('/media/vectors/Deal1.png')}) no-repeat;
 
    
  }
  .DealCardExce2{
    /* background: #000; */
    background: url(${toAbsoluteUrl('/media/vectors/Deal2.png')}) no-repeat;
    /* border: 1px solid; */
  }
  .DealCardExce3{
    /* background: #000; */
    background: url(${toAbsoluteUrl('/media/vectors/Deal3.png')}) no-repeat;
    /* border: 1px solid; */
  }

  /* Example arrow styling */
.carousel-container {
  position: relative;
}

.react-multiple-carousel__arrow--right{
  right: calc(-0% + 1px);
  z-index: 0;

}

.react-multiple-carousel__arrow--left{
  left: calc(-0% + 1px);
  z-index: 0;
}

.slick-next:before, .slick-prev:before {
    font-size: 20px;
    line-height: 1;
    opacity: 1;
    color: #262262;
}
.slick-next:after, .slick-next:before {
    font-size: 20px;
    line-height: 1;
    opacity: 1;
    color: #262262;
}

  @media screen and (max-width: 1500px) {

  }
`
