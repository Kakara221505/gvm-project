import styled from 'styled-components'

// Define a styled component for a div
export const ProductCardPageStyles = styled.div`
  /* HomeBanner.css */

  ul.pagination{
    flex-wrap: nowrap;
  }

  .productName:hover{
    cursor: pointer;
    text-decoration: underline;
  }
  .filterMain{
    border-radius: 12px ;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.14);
  }
  
  .viewText11{
    color:#262262 !important;
  }
  .card-horizontal {
  display: flex;
  flex: 1 1 auto;
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

.break-me{
  display: flex;
  justify-content: center;
  align-items: center;
}

.rateImageDiv1{
  position: relative;
}

.ratingMainDiv1{
  display: flex;
    border-radius: 3px;
    background: #FFA41C;
    color: #fff;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    padding: 4px;
    height: 30px;
    width: 60px !important;
    justify-content: center;
}

.commonBGMain {
    position: relative;
  }

  .commonBGACMain {
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  @media screen and (max-width: 1500px) {

  }
`
