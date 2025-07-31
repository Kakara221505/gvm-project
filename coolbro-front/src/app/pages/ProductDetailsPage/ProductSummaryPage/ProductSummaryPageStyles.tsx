import styled from 'styled-components'

// Define a styled component for a div
export const ProductSummaryPageStyles = styled.div`
  /* HomeBanner.css */

  .reviewLinkHover:hover{
    text-decoration: underline;
    cursor: pointer;
  }

  .card-horizontal {
    display: flex;
    flex: 1 1 auto;
  }
  .page-link.active,
  .active > .page-link .page-link.active,
  .active > .page-link {
    border-radius: 4px;
    background: #262262;
    font-weight: 400;
  }
  .page-item .page-link {
    height: 3.5rem;
    min-width: 3.5rem;
  }

  .textKeyFeature {
    color: #000;
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
  }

  .outerVariantActive{
    height:40px;
    width: 40px;
    border-radius: 50%;
    background: #fff;
    outline: 1px solid red;
  }
  .outerVariant{
    height:38px;
    width: 38px;
    border-radius: 50%;
    background: #CACACA;
    box-shadow:  0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);

  }
  .customSlide {
  background-color: green;
  height: 10rem;
  margin: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

  .incrementBtn{
    cursor: pointer;
    fill: var(--White, #FFF);
filter: drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.10));
    height:38px;
    width: 38px;
    border-radius: 50%;
    background: #fff;
    font-size: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
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
