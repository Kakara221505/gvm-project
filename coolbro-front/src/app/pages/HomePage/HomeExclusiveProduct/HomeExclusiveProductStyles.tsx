import styled from 'styled-components'
import {toAbsoluteUrl} from '../../../../_metronic/helpers'

// Define a styled component for a div
export const HomeExclusiveProductStyles = styled.div`
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

  .imageCardText {
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
  }
  .imageCardText1 {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;

  }

  .oneCard {
    position: relative;
  }

  .twoCard{
    position: relative;
  }

  .allNewBtn {
    font-size: 40px;
  }

  .saveBtnText {
    font-size: 20px;
    font-style: normal;
    font-weight: 500;
  }

  @media screen and (max-width: 1500px) {
  }
`
