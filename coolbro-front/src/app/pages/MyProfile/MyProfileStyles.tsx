import styled from 'styled-components'

// Define a styled component for a div
export const MyProfileStyles = styled.div`
  /* .navLinkCustom{
        background: #fff !important;
        font-size: 16px !important;
        font-style: normal !important;
        font-weight: 400 !important;
        line-height: normal !important;
    } */

  .boxNavPills {
    border-radius: 12px;
    background: #fff;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.14);
  }

  /* MyProfileStyles.css */

 /* MyProfileStyles.css */

/* Custom class for non-active tabs */
.custom-tab {
  color: #1D1B1E;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  border-radius: 0; /* Reset border-radius for non-active tabs */
}
.custom-tab.active{
  background: #262262;
  color: white; /* Change the text color for the active tab */
}

/* Custom class for the active tab */
.custom-active-tab.active {
  background: #262262;
  color: white; /* Change the text color for the active tab */
  border-radius: 0; /* Reset border-radius for the active tab */
}

/* Apply border-radius to the first active tab */
.custom-active-tab0:first-child {
  background: #262262;
  border-radius: 12px 12px 0 0  !important; /* Add !important to override Bootstrap styles */
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

}

/* Apply border-radius to the last active tab */
.custom-active-tab1:last-child {
  background: #262262;
  border-radius: 0px 0px 12px 12px !important; /* Add !important to override Bootstrap styles */
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
.custom-active-tab1:last-child img{
  filter: brightness(0) invert(1);

}
.custom-active-tab0:first-child img{
  filter: brightness(0) invert(1);

}

.noRadius.active{
  background: #262262;
  border-radius: 0px!important; /* Add !important to override Bootstrap styles */
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.noRadius{
  border-radius: 0 !important;
}

/* Apply filter to make the image white when the tab is active */
.noRadius.active img {
  filter: brightness(0) invert(1);
}



/* Apply border-radius to the last tab with active color */



  @media screen and (max-width: 1500px) {
  }
`
