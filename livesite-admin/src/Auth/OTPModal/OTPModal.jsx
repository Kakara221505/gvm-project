import React, { useState,useContext } from "react";
import { Modal } from "react-bootstrap";
import axios from "axios";
import * as Yup from "yup";
import Logo from "../../Assets/Images/Logo.png";
import "./OTPModal.css";
import OTPInput from "react-otp-input";
import OtpTimer from '../OtpTimer/OtpTimer';
import { toast } from "react-toastify";
import { ThemeContext } from "../../Theme/ThemeContext";

const otpValidationSchema = Yup.object().shape({
  OTP: Yup.string().required("OTP is required"),
});

export default function OTPModal({ show, handleClose, handleVerifyOTP, darkMode, email }) {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [timerExpired, setTimerExpired] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [timerKey, setTimerKey] = useState(0);
  const { theme } = useContext(ThemeContext);

  const handleSubmitOTP = () => {
    setLoading(true);
    handleVerifyOTP(otp); // Call the handleVerifyOTP function with the entered OTP
  };

  const handleOtpTimeout = () => {
    if (!timerExpired) { // Ensure it's not already expired to avoid duplicate messages
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

  return (
    <Modal show={show} onHide={handleClose} size="md" centered dialogClassName={theme}>
      <Modal.Body
     className='commonModalBg'
      >
        <div
          className={`fa fa-close d-flex fs-5 ms-auto m-3 mt-0 me-0 cursor-pointer justify-content-end menuTextHeader rounded-5 ${
            darkMode ? "dark-mode" : ""
          }`}
          onClick={handleClose}
        />
        <div className="row">
          <div className="col-lg-12 py-3 pt-0">
            <div className="loginSectionDiv d-flex flex-column align-items-center justify-content-center m-auto">
              <div className="headerLogin">
                <h1
                  className={`logoText loginTextColor mb-0 ${
                    darkMode ? "dark-mode" : ""
                  }`}
                >
                  <img src={Logo} alt="Logo" className="img-fluid" />
                </h1>
              </div>
              <div className="text-center py-3">
                <h5
                  className={`fw-normal my-3 menuTextHeader ${
                    darkMode ? "dark-mode" : ""
                  }`}
                >
                  Please Enter the OTP to Verify your Account{" "}
                </h5>
              </div>

              <div className="col-lg-10">
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  numInputs={4}
                  containerStyle="otp-container"
                  inputStyle="otp-input"
                  focusStyle="otp-focus"
                  renderSeparator={<span>-</span>}
                  renderInput={(props) => <input {...props} />}
                />
                
                {showResendButton && (
                  <label
                    className="text-black py-3 text-end d-block cursor-pointer"
                    onClick={handleResendOTP}
                  >
                    Resend OTP
                  </label>
                )}
                <OtpTimer key={timerKey} initialTime={60} onTimeout={handleOtpTimeout} /> 
                <button
                  type="button"
                  className="w-75 d-block m-auto mt-3 mb-3 py-2 rounded-2 btn btn-primary loginBtn1"
                  onClick={handleSubmitOTP} // Call handleSubmitOTP function on button click
                  disabled={otp.length !== 4 || loading || timerExpired} // Disable the button if OTP is not 4 digits, if loading is true, or if timer has expired
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
                {errorMessage && (
                  <div className="text-danger">{errorMessage}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
