import styled from 'styled-components';
import {toAbsoluteUrl} from '../../../../_metronic/helpers'

export const HeaderWrapperStyles = styled.div` 


/* Navbar.css */
/* Add a new style for the sticky header */
.lgDrp{
    margin-left: -60px;

}
.stickyHeader {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
}

/* ... your existing styles ... */

.customInput11::placeholder{
    font-size: 14px;
}

.form-group .hh{
    top: 10px;
}
.customInput11{
    border: 1px solid #7c757e !important;
    border-radius: 12px !important;
}

.menuCustom{

        margin-left: -90px;
}

.childHeader{
    background: #262262;
    opacity: 0.9;
}
.searchInputBox:focus {
    border:0 !important
}

.moreBtn:hover{
    background: transparent !important;
}

.cartImagMain{
    position: relative;
}
.cartCounterMain{
    position: absolute;
    height: 15px;
    width: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: -7px;
    font-size: 10px;
    font-weight: 600;
}

.customSearchInp{
    background-image: url(${toAbsoluteUrl('/media/vectors/Search.png')}) !important;
    background-repeat: no-repeat !important;
    border-radius: 0px 8px 8px 0px;
    outline: none;
    padding-left: 36px;
    padding-right: 13px;
    background-position: center left 2% !important;
}

.avlText{
    color:#2C2C2C
}
.moreTextDrp{
    font-family: Inter, Helvetica, 'sans-serif' !important;
}

`