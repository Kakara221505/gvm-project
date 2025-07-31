import styled from 'styled-components'

// Define a styled component for a div
export const TermsAndConditionPageStyles = styled.div`
  .centered-text {
    position: absolute;
    top: 50%;
    left: 20px; /* Adjust the left position as needed */
    transform: translateY(-50%);
    text-align: center;
    z-index: 1; /* Ensure the text is above the image */
    padding-left: 60px;
    font-size: 36px;
  }

  .contactUsBefore {
    color: #fff;
  }
  .white-line {
    position: absolute;
    content: '';
    width: 20px; /* Adjust the width of the white line as needed */
    height: 3px; /* Adjust the height of the white line as needed */
    background-color: white; /* White color for the line */
    top: 50%;
    left: 18px;
    transform: translateY(-50%);
    z-index: 1; /* Ensure the line is above the image */
  }
`
