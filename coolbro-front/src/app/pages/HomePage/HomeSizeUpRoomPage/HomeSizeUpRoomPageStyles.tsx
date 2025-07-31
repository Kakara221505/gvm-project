import styled from 'styled-components'
import {toAbsoluteUrl} from '../../../../_metronic/helpers'

// Define a styled component for a div
export const HomeSizeUpRoomPageStyles = styled.div`

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

  .overlay1{
    /* background: linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0.02%, rgba(0, 0, 0, 0.60) 109.15%); */
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
.zza{
  padding-left: 15px;
  padding-right: 15px;
}
.react-multiple-carousel__arrow--left{

  z-index: 0;

    }
    .react-multiple-carousel__arrow--right{
 
  z-index: 0;

    }

  @media screen and (max-width: 768px) {
    .react-multiple-carousel__arrow{
      background: transparent;
    }
    .react-multiple-carousel__arrow--left{
      left: calc(2% + 1px);
  z-index: 0;

    }
    .react-multiple-carousel__arrow--right{
      right: calc(2% + 1px);
  z-index: 0;

    }
    
  }
`
