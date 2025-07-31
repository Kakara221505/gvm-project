import styled from 'styled-components'
import {toAbsoluteUrl} from '../../../../_metronic/helpers'

// Define a styled component for a div


export const HorizontalDealerCardStyles = styled.div`

.dealerImg{
  width: 200px;
  max-width: 200px;
  height: 200px;
  max-height: 200px;
}
.ratingBorder{
  border: 1.832px solid #CBCFDA;
  border-radius: 12px;
}
  /* HomeBanner.css */
  .card-horizontal {
    display: flex;
    flex: 1 1 auto;
  }
  .viewTitle {
    font-size: 15px;
    font-weight: normal;
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

  .rateImageDiv {
    position: relative;
  }

  .ratingMainDiv {
    position: absolute;
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
  }

  @media screen and (max-width: 1500px) {
  }
`
