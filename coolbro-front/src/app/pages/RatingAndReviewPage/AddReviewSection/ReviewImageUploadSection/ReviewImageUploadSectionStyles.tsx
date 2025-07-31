import styled from 'styled-components'

// Define a styled component for a div
export const ReviewImageUploadSectionStyles = styled.div`
.dragText{
    color: #99A1B7;
    font-size: 16px;
}

.dropzone{
    background: transparent;
    border:0;
}

.customDashed {
    background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='11' ry='11' stroke='%23333' stroke-width='3' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='round'/%3e%3c/svg%3e");
    border-radius: 11px;
    border-color: #262262;
}

.customDashedImageBorder {
    border: 2px dashed #99A1B7;
    border-radius: 12px;
}

.customDisc{
    padding-top: 13px;
}

.radioBorder{
    border: 2px solid #262262;
}

.thumbnailPreview{
    height: 150px;
    width: 150px;
    border: 2px solid grey;
    border-radius: 50%;
}

.centerImage {
    position: relative;
    display: flex;
  align-items: center;
  justify-content: center; 
}
.submitBtn{
    margin: 10px;
}

.custom-file-input input[type="file"] {
    display: none;
  }

  .custom-file-input {
    display: inline-block;
    padding: 10px 20px;
    background-color: #262262;
    color: red;
    cursor: pointer;
  }

.nav-underline .nav-link.active {
  color: #262262;
  text-decoration: underline;
  text-underline-offset: 0.8em;
}

.nav-underline .nav-link:hover {
    color: #262262; 
}

/* .custom-button-color {
    background-color: #262262 !important;
    color: #fff;
  } */
  /* .custom-button-color:hover{
    color: gold;
  } */

.custom-button-outline{
    background-color: white;
    font-weight: 700;
    color: #262262 !important;
    border: 1px solid #262262 !important;
}


.image-container {
    position: relative;
    display: inline-block;
  }
  
  .remove-button {
    position: absolute;
    z-index: 1;
    right: 2px;
    bottom: 42px;
    padding: 5px 10px;
    cursor: pointer;
  }


  .custom-checkbox input[type="checkbox"] {
  
    display: none;
  }

.custom-checkbox .checkmark {
    position: relative;
    display: inline-block;
    width: 20px;
    height: 20px;
    background-color: #ccc;
    border: 1px solid #999;
    border-radius: 4px;
  }
  

  .custom-checkbox input[type="checkbox"]:checked + .checkmark::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;
    background-color: #fff;
    border-radius: 50%;
  }

  .faded-text{
    opacity: 0.5;
  }

  .image-group{
    border-radius: 5%;
    height: 85px;
    width: 85px;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.14);
  }

.custom-remove-button{
    border: grey;
    border-radius: 50%;
    z-index: 1;
    position: relative;
    right: 18%;
    bottom: 35px;
    width: 25px;
    height: 25px;
}

.important-content{
    border: 2px solid #262262;
}
  
  
.ql-toolbar.ql-snow{
  border: 1px solid #7c757e !important;
}

.ql-toolbar.ql-snow + .ql-container.ql-snow{
  border: 1px solid #7c757e !important;
  border-top: 0 !important;
}
 
.ql-toolbar.ql-snow{
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}
.ql-snow.ql-toolbar button, .ql-snow .ql-toolbar button{
  border: 1px solid #99A1B7 !important;
    border-radius: 4px !important;
    margin: 3px 3px !important;
    height: 28px !important;
    padding: 5px 5px !important;
}

.ql-container.ql-snow {
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
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

.page-link.active, .activePageStyle > .page-link {
  background: #262262; /* Set the desired background color for the active page */
  color: #fff;
}

.page-item .page-link{
  height: 3.3rem;
  min-width: 3.5rem;
  border-radius: 4px;
}

`