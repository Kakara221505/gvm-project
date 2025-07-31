import styled from 'styled-components'

// Define a styled component for a div
export const OrderDetailStyles = styled.div`
  .zz {
    background: red;
  }

  .rateImageDiv1 {
    position: relative !important;
    cursor: pointer;

  }

  .ratingMainDiv1 {
    position: absolute !important;
    display: flex;
    border-radius: 3px;
    background: #ffa41c;
    color: #fff;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    padding: 4px;
    right: 0;
    bottom: 0;
    margin: 15px;
    z-index: 0;
  }

  .boxNavPills {
    border-radius: 12px;
    background: #fff;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.14);
  }
  .accordionHead {
    display: flex;
    width: 32px;
    height: 32px;
    font-size: 15px;
    justify-content: center;
    align-items: center;
    border-radius: 7.68px;
    background: var(--Header-Footer, #262262);
    color: #fff;
  }

  .customCheckBoxDefault:checked {
    background-color: #262262;
    border-color: #262262;
    width: 15px;
    height: 15px;
    border-radius: 2px;
  }

  .customCheckBoxDefault[type='checkbox'] {
    width: 15px;
    height: 15px;
    border-radius: 2px;
    border-color: #262262;
  }

  .customCheckBox:checked {
    background-color: #262262;
    border-color: #262262;
    width: 30px;
    height: 30px;
    border-radius: 2px;
  }

  .customCheckBox[type='checkbox'] {
    width: 30px;
    height: 30px;
    border-radius: 2px;
    border-color: #262262;
  }

  .formCustomCheck {
    display: flex;
    align-items: center;
    margin-top: 5px;
    margin-bottom: 5px;
  }

  .DealerBodyWrapper {
    height: 100vh;
    max-height: 60vh;
    overflow-y: auto;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 12px;
    opacity: 0.5;
    background: #000;
    z-index: 99;
    display: flex;
    justify-content: center;
  }

  .overlay i {
    font-size: 5rem; /* Adjust the size of the tick icon */
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
  }

  .profileText{
    color: #1D1B1E;
  }

  .justifyContentMobileBetween {
    justify-content: space-between !important;
  }
`
