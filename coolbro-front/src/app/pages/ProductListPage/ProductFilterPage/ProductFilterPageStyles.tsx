import styled from 'styled-components'

// Define a styled component for a div
export const ProductFilterPageStyles = styled.div`
.underLineClear:hover {
  text-decoration: underline;
}
  /* HomeBanner.css */
  .badgeSecondary{
    background: #E0E0E0;
  }
.filterMain{
  border-radius: 12px ;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.14);
}
  #accordionExample{
    border-radius: 12px !important;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.14);
  }
  .accBtn{
    /* border-radius: 12px !important; */
    font-size: 18px !important;
  }
  .accordion-button:not(.collapsed){
    color: #000;
    background: transparent;
    border-bottom: 0;
  }
  .accordion-button:not(.collapsed)::after{
    filter: brightness(0.5);
  }
  .headText{
    color: #2C2C2C ;
  }
  .bodyAcc{
    border-top:0;
  }
  .customCheckBox:checked{
    background-color: #262262;
    border-color: #262262;
    width: 18px;
    height: 18px;
    border-radius: 2px;
  }

  .customCheckBox[type=checkbox]{
    width: 18px;
    height: 18px;
    border-radius: 2px;
    border-color: #262262;
  }

  .formCustomCheck{
    display: flex;
    align-items: center;
    margin-top: 5px;
    margin-bottom: 5px;
  }
  .form-check-label{
    font-size: 15px;
  }
  .customCheckLabel{
    margin-left: 12px;
    font-weight: 400;
  }
  @media screen and (max-width: 1500px) {
  
  }
`
