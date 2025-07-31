import styled from 'styled-components'
import {toAbsoluteUrl} from '../../../../_metronic/helpers'

// Define a styled component for a div
export const HomeClimateSolutionPageStyles = styled.div`
  .climateCard img {
    aspect-ratio: 4/3;
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
    cursor: pointer !important;
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

  @media screen and (max-width: 1500px) {
  }
`
