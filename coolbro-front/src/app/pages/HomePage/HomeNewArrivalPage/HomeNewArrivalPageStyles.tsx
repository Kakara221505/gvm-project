import styled from 'styled-components'
import {toAbsoluteUrl} from '../../../../_metronic/helpers'

// Define a styled component for a div
export const HomeNewArrivalPageStyles = styled.div`
  .innerTextMain {
    display: flex;
    justify-content: space-between;
  }
  .viewTitle {
    color: #262262 !important;
    font-weight: 500;
  }
  .priceTitle {
    color: #262262 !important;
    font-weight: 500;
    font-size: 21px;

  }

  .viewChildTitle {
    color: #99a1b7;
    font-size: 15px;
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

  .bottomRoomText {
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
  }
  .card-img1 {
    border-radius: 12px;
  }

  .overlay1 {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0.02%, rgba(0, 0, 0, 0.6) 109.15%);
  }

  .DealCardExce1 {
    /* background: #000; */
    background: url(${toAbsoluteUrl('/media/vectors/Deal1.png')}) no-repeat;
  }
  .DealCardExce2 {
    /* background: #000; */
    background: url(${toAbsoluteUrl('/media/vectors/Deal2.png')}) no-repeat;
    /* border: 1px solid; */
  }
  .DealCardExce3 {
    /* background: #000; */
    background: url(${toAbsoluteUrl('/media/vectors/Deal3.png')}) no-repeat;
    /* border: 1px solid; */
  }

  .commonBGMain {
    position: relative;
  }

  .commonBGACMain {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }


  @media screen and (max-width: 1500px) {
    
  }
`
