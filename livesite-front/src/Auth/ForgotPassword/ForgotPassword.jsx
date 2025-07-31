import React, { useState,useContext, useEffect } from "react";
import { Modal } from "react-bootstrap";
import Logo from "../../Assets/Images/Logo.png";
import ForgotOTPModal from "../ForgotOTPModal/ForgotOTPModal";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../Theme/ThemeContext";

const ForgotPassword = ({ show, handleClose }) => {
  const [Email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    if (!show) {
      setEmail("");
      setEmailError("");
      setErrorMessage("");
    }
  }, [show]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    setErrorMessage(""); // Reset error message when email changes

    if (!e.target.value) {
      setEmailError("Email is required");
    } else if (!validateEmail(e.target.value)) {
      setEmailError("Invalid email format");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = () => {
    if (!Email || emailError) {
      setErrorMessage("Please enter a valid email");
      return;
    }

    setLoading(true);
    axios.post(`${process.env.REACT_APP_PUBLIC_BASE_URL}auth/send_otp`, { Email })
      .then((response) => {
        setLoading(false);
        setShowConfirmModal(true); // Show confirmation modal
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

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    handleClose();
    navigate('/');
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} size="md" centered dialogClassName={theme}>
        <Modal.Body      className='commonModalBg'>
          <div className="fa fa-close d-flex fs-5 ms-auto m-3 mt-0 me-0 cursor-pointer justify-content-end menuTextHeader" onClick={handleClose} />

          <div className="row">
            <div className="col-lg-12 py-3 pt-0">
              <div className="loginSectionDiv d-flex flex-column align-items-center justify-content-center m-auto">
                <div className="headerLogin">
                  <h1 className="logoText loginTextColor mb-0 ">
                    <img src={Logo} className="img-fluid" alt="Logo" />
                  </h1>
                </div>
                <div className="text-center py-3">
                  <h3 className="my-1 fw-bold menuTextHeader">Forgot Password</h3>
                  <h6 className="fw-normal my-3 menuTextHeader">
                    Enter your registered email to reset your password.
                  </h6>
                </div>

                <form className="w-100 px-5">
                  <div className="form-group my-3 mt-0">
                    <input
                      type="email"
                      className={`form-control formLoginControl ${emailError ? "is-invalid" : ""}`}
                      name="email"
                      placeholder="Email"
                      value={Email}
                      onChange={handleChange}
                    />
                    {emailError && <div className="invalid-feedback">{emailError}</div>}
                  </div>
                  {errorMessage && <div className="text-danger">{errorMessage}</div>}
                  <button
                    type="button"
                    className="w-75 d-block m-auto mt-4 rounded-2 btn btn-primary"
                    onClick={handleSubmit}
                    disabled={loading || !Email || emailError} // Disable button if loading, email is empty, or email format is invalid
                  >
                    {!loading ? 'Submit' : 'Submitting...'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <ForgotOTPModal
        show={showConfirmModal}
        handleClose={handleCloseConfirmModal}
        email={Email}
      />
    </>
  );
};

export default ForgotPassword;
