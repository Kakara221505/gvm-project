import styled from 'styled-components'
import {toAbsoluteUrl} from '../../../../../../../_metronic/helpers'

// Define a styled component for a div
export const StepsStyles = styled.div`


  .unselected-button-male{
    font-size: 14px;
    font-weight: 500;
    border-radius: 12px;
    color: #3ca5dc;
    border: 1px solid var(--Primary, #3ca5dc) !important;
  }

  .selected-button-male{
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    background:#3ca5dc ;
    color: #fff !important
  }
  
  .selected-button-Image{
    filter: brightness(0) invert(1) !important;
  }

  .unselected-button-female{
    font-size: 14px;
    font-weight: 500;
    border-radius: 12px;
    color: #eb9354;
    border: 1px solid var(--Primary, #eb9354) !important;
  }

  .selected-button-female{
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    background:#eb9354 ;
    color: #fff !important
  }

  .unselected-button-other{
    font-size: 14px;
    font-weight: 500;
    border-radius: 12px;
    color: #ff7f7f;
    border: 1px solid var(--Primary, #ff7f7f) !important;
  }

  .selected-button-other{
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    background:#ff7f7f ;
    color: #fff !important
  }




.addProductPage{
    /* background-color: rgb(244, 253, 253) !important; */
}

.thumbnailButton{
  z-index: 1;
  position: absolute;
  right: 0;
  left: 35%;
  /* top: 0; */
  bottom: 10px;
}
.thumbnailButton label{
    color: #37187b;
}
/* .thumbnailButton label:hover{
    color: red;
} */






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