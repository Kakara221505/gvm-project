import styled from 'styled-components'

// Define a styled component for a div
export const MyOrderCardStyles = styled.div`

.orderIDHover:hover{
  text-decoration: underline;
  cursor: pointer;
}

.innerMainSectionList{
    border-radius: 0px 0px 12px 12px;

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
  .shipped{
    color: #1E91CF;
  }

  .processing{
    color: rgba(255, 0, 0, 0.50);
  }

  .delivered{
    color: #4CB64C;
  }

  .cancelled{
    color: #000;
  }
  .customMyOrderListAction{
    padding: 12px 18px 12px 18px;
    background: #fff;

  }
  .customMyOrderListAction.active {
    border-radius: 12px 12px 0px 0px;
    padding: 12px 18px 5px 18px;
    border-bottom: 1px solid #ccc;
    background: #f9f9f9;
    border-color: #ccc;
  }
  
  .nav-pills .custom-active-nav-link.active,
  .nav-pills .show > .custom-active-nav-link {
    background-color: #262262;
    color: #fff; /* Optionally, set the text color to white or another appropriate color */
    border-radius: 12px;
    font-weight: 500;
    font-size: 14px;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.14);
    padding: 12px 18px 12px 18px;
    border: 0;

  }

  .customMyOrderList {
    border-radius: 12px;
    border: 0px solid #ccc;
    background: #fff;
  }

  .custom-active-nav-link {
    background-color: #fff;
    color: #262262; /* Optionally, set the text color to white or another appropriate color */
    border-radius: 12px;
    font-weight: 500;
    font-size: 14px;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.14);
    padding: 12px 18px 12px 18px;
    border: 0;

  }
`
