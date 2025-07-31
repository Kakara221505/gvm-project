import styled from 'styled-components'

// Define a styled component for a div
export const MyOrdersSectionStyles = styled.div`
  /* In your CSS file or style tag */

  /* Add this CSS to your component's stylesheet or a global CSS file */
.tabs-container {
  overflow-x: auto;
  white-space: nowrap;
}

/* Optional: You can style the scrollbar if needed */
.tabs-container::-webkit-scrollbar {
  width: 12px;
}

.tabs-container::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 8px;
}

.tabs-container::-webkit-scrollbar-thumb:hover {
  background-color: #555;
}

  /* styles.css */
.active-tab {
  background-color: #262262;
  color: #fff;
  border-radius: 12px;
  font-weight: 500;
  font-size: 14px;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.14);
  padding: 12px 18px 12px 18px;
  border: 0;
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
  .statusTextShipped{
    color: #1E91CF;
  }

  .statusTextProcessing{
    color: rgba(255, 0, 0, 0.50);
  }

  .statusTextDelivered{
    color: #4CB64C;
  }

  .statusTextCancelled{
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
