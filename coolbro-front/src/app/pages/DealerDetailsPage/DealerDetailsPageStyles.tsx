import styled from 'styled-components'
import {toAbsoluteUrl} from '../../../_metronic/helpers'


// Define a styled component for a div
export const DealerDetailsPageStyles = styled.div`
.ratingBorder{
  border: 1.832px solid #CBCFDA;
  border-radius: 12px;
}
  /* HomeBanner.css */
  .dealerDetailImg{
    width: 200px;
  max-width: 200px;
  height: 200px;
  max-height: 200px;
  }

  .card-horizontal {
    display: flex;
    flex: 1 1 auto;
  }
.viewTitle{
  font-size: 15px;
  font-weight: normal;
}


.headText{
    color: #262262 ;
  }



  .innerTextMain {
    display: flex;
    justify-content: space-between;
  }
  .viewTitle{
    color: #262262 !important;
    font-weight: 500;
  }
  .viewChildTitle{
    color:#99A1B7;
    font-size: 16px;

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

  .priceBig{
    font-size: 21px;
    color: #262262 
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

.page-link.active, .active > .page-link

.page-link.active, .active > .page-link{
  border-radius: 4px;
background:  #262262;
font-weight: 400;
}
.page-item .page-link{
  height: 3.5rem;
    min-width: 3.5rem;
}

.rateImageDiv{
  position: relative;
}

.ratingMainDiv{
  position: absolute;
  display: flex;
  border-radius: 3px;
background: #FFA41C;
color: #fff;
font-size: 14px;
font-style: normal;
font-weight: 400;
padding: 2px;
    right: 0;
    bottom: 0;
    margin: 10px;
}


#accordionExample{
  border-radius: 12px !important;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.14);
}

#accordionExample1{
  border-radius: 12px !important;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.14);
}

#accordionExample2{
  border-radius: 12px !important;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.14);
}
#accordionExample3{
  border-radius: 12px !important;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.14);
}
.accBtn1{
   border-radius: 12px !important; 
  font-size: 18px !important;
  font-weight: 500;
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
  color: #262262 ;
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

.ratingReviewText{
  color: #808080;
}
.bigRateText{
  font-size: 36px;

}


.innerTextMain {
  display: flex;
  justify-content: space-between;
}
.viewTitle{
  color: #262262 !important;
  font-weight: 500;
}
.viewChildTitle{
  color:#99A1B7
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
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0.02%, rgba(0, 0, 0, 0.60) 109.15%);
}

.DealCardExce1{
  /* / background: #000; / */
  background: url(${toAbsoluteUrl('/media/vectors/Deal1.png')}) no-repeat;

  
}
.DealCardExce2{
  /* / background: #000; / */
  background: url(${toAbsoluteUrl('/media/vectors/Deal2.png')}) no-repeat;
  /* / border: 1px solid; / */
}
.DealCardExce3{
  /* / background: #000; / */
  background: url(${toAbsoluteUrl('/media/vectors/Deal3.png')}) no-repeat;
  /* / border: 1px solid; / */
}


.commonBGMain {
  position: relative;
}

.ratingProcessBar5{
  height: 8px;
  width: 100px;
  border-radius: 4px;
  background: var(--Header-Footer, #262262);
}
.ratingProcessBar4{
  height: 8px;
  width: 40px;
  border-radius: 4px;
  background: var(--Header-Footer, #262262);
}
.ratingProcessBar3{
  height: 8px;
  width: 30px;
  border-radius: 4px;
  background: var(--Header-Footer, #262262);
}

.ratingProcessBar2{
  height: 8px;
  width: 15px;
  border-radius: 4px;
  background: var(--Header-Footer, #262262);
}

.ratingProcessBar1{
  height: 8px;
  width: 8px;
  border-radius: 4px;
  background: var(--Header-Footer, #262262);
}

.ratingDiv{
  display: flex;

flex-direction: column;
justify-content: center;
align-items: flex-end;

flex-shrink: 0;
}

.mainRating{
  flex-shrink: 0;
}

.ratingDiv{
  display: flex;
align-items: flex-start;
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
 


