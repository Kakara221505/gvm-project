import React, { useState, useContext, useEffect } from "react";
import { Modal } from "react-bootstrap";
import axios from "axios";
import Logo from "../../Assets/Images/Logo.png";
import OTPInput from "react-otp-input";
import ConfirmPassword from "../ConfirmPassword/ConfirmPassword";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import OtpTimer from '../OtpTimer/OtpTimer';
import { ThemeContext } from "../../Theme/ThemeContext";

export default function OTPModal({ show, handleClose, darkMode, email }) {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [timerExpired, setTimerExpired] = useState(false);
    const [showResendButton, setShowResendButton] = useState(false);
    const [timerKey, setTimerKey] = useState(0);
    const { theme } = useContext(ThemeContext);

    const navigate = useNavigate();

    const handleChangeOtp = (value) => {
        setOtp(value);
        setErrorMessage("");
    };

    const handleOtpTimeout = () => {
        if (!timerExpired) {
            setTimerExpired(true);
            setShowResendButton(true);
            toast.error("OTP expired. Please request a new one.");
        }
    };


    const handleResendOTP = () => {
        setLoading(true);
        axios
            .post(`${process.env.REACT_APP_PUBLIC_BASE_URL}auth/send_otp`, { Email: email })
            .then((response) => {
                setLoading(false);
                setOtp(""); // Clear the OTP input
                setTimerExpired(false); // Reset the timer expired state
                setShowResendButton(false); // Hide the resend button
                setTimerKey(prevKey => prevKey + 1); // Change the key to reset the timer
                toast.success("OTP sent to your email");
            })
            .catch((error) => {
                setLoading(false);
                if (error.response && error.response.data && error.response.data.message) {
                    setErrorMessage(error.response.data.message);
                } else {
                    setErrorMessage("An error occurred. Please try again later.");
                }
            });
    };

    const handleSubmit = () => {
        setLoading(true);
        axios
            .post(`${process.env.REACT_APP_PUBLIC_BASE_URL}auth/verify_forgot_password_otp`, {
                Email: email,
                Otp: parseInt(otp),
            })
            .then((response) => {
                if (response.status === 200) {
                    setLoading(false);
                    toast.success("OTP verified successfully");
                    localStorage.setItem("AdminToken", response.data.AccessToken);
                    // localStorage.setItem("UserID", response.data.User.ID);
                    setShowConfirmModal(true);
                } else {
                    // Handle unexpected status codes
                    setLoading(false);

                    setErrorMessage("An error occurred. Please try again later123.");
                }
            })
            .catch((error) => {
                setLoading(false);
                setErrorMessage(error.response.data.message);
                console.error(error)
            });
    };


    const handleCloseConfirmModal = () => {
        setShowConfirmModal(false);
        handleClose();
        navigate('/');
    };

    useEffect(() => {
        if (!show) {
            setOtp("");
            setErrorMessage("");
            setLoading(false);
            setTimerExpired(false);
            setShowResendButton(false);
        }
    }, [show]);

    return (
        <>
            <Modal show={show} onHide={handleClose} size="md" centered dialogClassName={theme}>
                <Modal.Body
                className='commonModalBg'
                >
                    <div
                        className={`fa fa-close d-flex fs-5 ms-auto m-3 mt-0 me-0 cursor-pointer justify-content-end menuTextHeader rounded-5 ${darkMode ? "dark-mode" : ""
                            }`}
                        onClick={handleClose}
                    />
                    <div className="row">
                        <div className="col-lg-12 py-3 pt-0">
                            <div className="loginSectionDiv d-flex flex-column align-items-center justify-content-center m-auto">
                                <div className="headerLogin">
                                    <h1
                                        className={`logoText loginTextColor mb-0 ${darkMode ? "dark-mode" : ""
                                            }`}
                                    >
                                        <img src={Logo} alt="Logo" className="img-fluid" />
                                    </h1>
                                </div>
                                <div className="text-center py-3">
                                    <h5
                                        className={`fw-normal my-3 menuTextHeader ${darkMode ? "dark-mode" : ""
                                            }`}
                                    >
                                        Please Enter the OTP to Verify your Account{" "}
                                    </h5>
                                </div>

                                <div className="col-lg-10">
                                    <OTPInput
                                        value={otp}
                                        onChange={handleChangeOtp}
                                        numInputs={4}
                                        containerStyle="otp-container"
                                        inputStyle="otp-input"
                                        focusStyle="otp-focus"
                                        separator={<span>-</span>}
                                        isInputNum
                                        renderInput={(props) => <input {...props} />}
                                    />

                                    {showResendButton && (
                                        <label className="text-black py-3 text-end d-block cursor-pointer" onClick={handleResendOTP}>
                                            Resend OTP
                                        </label>
                                    )}
                                    {errorMessage && (
                                        <div className="text-danger">{errorMessage}</div>
                                    )}

                                    <OtpTimer key={timerKey} initialTime={60} onTimeout={handleOtpTimeout} />
                                    <button
                                        type="button"
                                        className="w-75 d-block m-auto mt-3 mb-3 py-2 rounded-2 btn btn-primary"
                                        onClick={handleSubmit}
                                        disabled={otp.length < 4 || loading} // Disable button if loading or OTP length is less than 4
                                    >
                                        {!loading ? "Verify OTP" : "Verifying..."}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
            <ConfirmPassword
                show={showConfirmModal}
                handleClose={handleCloseConfirmModal}
            />
        </>
    );
}
