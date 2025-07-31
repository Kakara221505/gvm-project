import styled from 'styled-components'
import {toAbsoluteUrl} from '../../../../../_metronic/helpers'

// Define a styled component for a div
export const ProfileDetailsSectionStyles = styled.div`
  .navLinkCustom {
    background: #fff !important;
    font-size: 16px !important;
    font-style: normal !important;
    font-weight: 400 !important;
    line-height: normal !important;
  }
  .invalid-feedback-gender{
    width: 100%;
    margin-bottom: 5px;
    font-size: 0.95rem;
    color: var(--bs-danger-text);
  }

  .boxNavPills {
    border-radius: 12px;
    background: #fff;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.14);
  }

  .mainImageEditUpload{
    position: absolute;
    top: 80%;
    bottom: 0;
    right: 0;
  }

  /* #femaleOutlineBtn {
    border-radius: 12px;
    border: 1px solid #eb9354;
    color: #eb9354;
  }

  #otherOutlineBtn {
    border-radius: 12px;
    color: #ff7f7f;
    border: 1px solid #ff7f7f;
  } */

  /* #maleOutlineBtn {
    border-radius: 12px;
    color: #3ca5dc;
    border: 1px solid var(--Primary, #3ca5dc);
  } */

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


  .image-input-wrapper11 {
    background: url(${toAbsoluteUrl('/media/vectors/AvtarUploader.png')}) no-repeat;
    background-position: center;
    background-repeat: no-repeat;
  }

  .image-input [data-kt-image-input-action=change]{
    left: 85%;
  }
  .filteredImg {
    filter: brightness(0) invert(1) !important;
  }



  /* Apply border-radius to the last tab with active color */

  @media screen and (max-width: 1500px) {
  }
`
