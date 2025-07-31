import styled from "styled-components";
import {toAbsoluteUrl} from '../../../_metronic/helpers'

// Define a styled component for a div
export const AuthStyles = styled.div`
.login-4 .clip-home {
    position: relative;
}
.login-4 .bg-img {
    background: url(${toAbsoluteUrl('/media/vectors/sideVectorLogin.png')});
    background-size: cover;
    background-position: center right;
    background-repeat: no-repeat;
    min-height: 100vh;
    padding: 0;
    position:relative;
}
.m-login__logo {
    position:absolute;
    top:0;
    right:14%;
    left:0;
    bottom:0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.form-section{
    display:flex;
    justify-content:center;
    align-items:center;
}

.welcomeText{
    color: #1D1B1E;
}
.dontText{
    color:#99A1B7;
}

`;