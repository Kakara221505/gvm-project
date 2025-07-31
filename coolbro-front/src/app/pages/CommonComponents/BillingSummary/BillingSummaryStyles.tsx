import styled from 'styled-components'

// Define a styled component for a div
export const BillingSummaryStyles = styled.div`
  .card-horizontal {
    display: flex;
    flex: 1 1 auto;
  }
  .card-title11 {
    font-size: 14px;
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
  .applyText {
    border-radius: 12px 0px 0px 12px;
    border: 1px solid var(--Header-Footer, #262262);
  }
  .applyBtn {
    border-radius: 0px 12px 12px 0px;
    background: #262262;
    color: #fff;
  }
`
