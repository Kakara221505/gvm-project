import React, { useState, useEffect,useContext } from "react";
import Google from "../../Assets/Icons/Google.png";
import { Modal } from "react-bootstrap";
import "./Signup.css";
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Logo from '../../Assets/Images/Logo.png'
import OTPModal from "../OTPModal/OTPModal";
import { useNavigate } from "react-router-dom"; // Import useNavigate instead of useHistory
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ThemeContext } from "../../Theme/ThemeContext";

const validationSchema = Yup.object().shape({
  First_name: Yup.string().required('First Name is required'),
  Last_name: Yup.string().required('Last Name is required'),
  Email: Yup.string().email('Invalid email address').required('Email is required'),
  Password: Yup.string().required('Password is required') .matches(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=.*[^\w\d\s]).{8,}$/,
    'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'
  ),
  ConfirmPassword: Yup.string()
    .oneOf([Yup.ref('Password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
});

export default function Signup({
  show,
  handleClose,
  darkMode,
  handleShowLoginModal,
}) {
  const formik = useFormik({
    initialValues: {
      First_name: '',
      Last_name: '',
      Email: '',
      Password: '',
      ConfirmPassword:''
    },
    validationSchema: validationSchema,
    onSubmit: values => {
      handleSubmit(values);
    },
  });

  useEffect(() => {
    // Reset form errors and error messages when modal is closed
    if (!show) {
      formik.resetForm();
    }
  }, [show]);

  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate(); // Use useNavigate hook instead of useHistory
  const { theme } = useContext(ThemeContext);


  const handleSubmit = (values) => {
    setLoading(true);
    axios.post(`${process.env.REACT_APP_PUBLIC_BASE_URL}auth/register`, values)
      .then((response) => {
        setUserId(response.data.User.ID);
        setShowOTPModal(true);
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 409) {
            toast.error("A user with this email already exists.");
          } else if (error.response.data && error.response.data.message) {
            console.error('API error:', error.response.data.message);
            toast.error(`Error: ${error.response.data.message}`);
          } else {
            console.error('API error:', error.message);
            toast.error("An error occurred. Please try again later.");
          }
        } else {
          console.error('API error:', error.message);
          toast.error("An error occurred. Please try again later.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleVerifyOTP = (otp) => {
    setLoading(true);
    const payload = {
      ID: userId,
      Otp: otp
    };
    axios.post(`${process.env.REACT_APP_PUBLIC_BASE_URL}auth/verify_otp`, payload)
      .then((response) => {
        setLoading(false);
        localStorage.setItem("AdminToken",response.data.AccessToken);
        localStorage.setItem("UserID",response.data.User.ID)
        toast.success('SignUp successfully')
        navigate('/dashboard'); // Use navigate function to redirect
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.message) {
          console.error('API error:', error.response.data.message);
          setApiError(error.response.data.message);
          setLoading(false);
        } else {
          console.error('API error:', error.message);
        }
      });
  };

   const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  return (
    <>   
        {show && !showOTPModal && (
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
                <h3
                  className={`my-1 fw-bold menuTextHeader ${
                    darkMode ? "dark-mode" : ""
                  }`}
                >
                  Join our community
                </h3>
                <h5
                  className={`fw-normal my-3 menuTextHeader ${
                    darkMode ? "dark-mode" : ""
                  }`}
                >
                  Start your journey with our Livesuit
                </h5>
              </div>

              <div className="col-lg-10">
                <form className="px-0 mx-0" onSubmit={formik.handleSubmit}>
                  <div className="form-group my-3 mt-0">
                    <label
                      htmlFor="First_name"
                      className={`py-2 yellowText ${
                        darkMode ? "dark-mode" : ""
                      }`}
                    >
                      First Name*
                    </label>
                    <input
                      type="text"
                      className={`form-control formLoginControl ${
                        formik.touched.First_name && formik.errors.First_name ? "is-invalid" : ""
                      }`}
                      id="First_name"
                      name="First_name"
                      placeholder="Enter First Name"
                      value={formik.values.First_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.First_name && formik.errors.First_name && (
                      <div className="invalid-feedback">{formik.errors.First_name}</div>
                    )}
                  </div>
                  <div className="form-group my-3 mt-0">
                    <label
                      htmlFor="Last_name"
                      className={`py-2 yellowText ${
                        darkMode ? "dark-mode" : ""
                      }`}
                    >
                      Last Name*
                    </label>
                    <input
                      type="text"
                      className={`form-control formLoginControl ${
                        formik.touched.Last_name && formik.errors.Last_name ? "is-invalid" : ""
                      }`}
                      id="Last_name"
                      name="Last_name"
                      placeholder="Enter Last Name"
                      value={formik.values.Last_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.Last_name && formik.errors.Last_name && (
                      <div className="invalid-feedback">{formik.errors.Last_name}</div>
                    )}
                  </div>
                  
                  <div className="form-group my-3">
                    <label
                      htmlFor="Email"
                      className={`py-2 yellowText ${
                        darkMode ? "dark-mode" : ""
                      }`}
                    >
                      Email*
                    </label>
                    <input
                      type="email"
                      className={`form-control formLoginControl ${
                        formik.touched.Email && formik.errors.Email ? "is-invalid" : ""
                      }`}
                      id="Email"
                      name="Email"
                      placeholder="Email"
                      value={formik.values.Email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.Email && formik.errors.Email && (
                      <div className="invalid-feedback">{formik.errors.Email}</div>
                    )}
                  </div>
                  <div className="form-group my-3">
                    <label
                      htmlFor="Password"
                      className={`py-2 yellowText ${
                        darkMode ? "dark-mode" : ""
                      }`}
                    >
                      Password*
                    </label>
                    <div className="input-group">
                    <input
                     type={passwordVisible ? "text" : "password"}
                      className={`form-control formLoginControl ${
                        formik.touched.Password && formik.errors.Password ? "is-invalid" : ""
                      }`}
                      id="Password"
                      name="Password"
                      placeholder="Password"
                      value={formik.values.Password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                     <span className="input-group-text" onClick={togglePasswordVisibility} style={{ cursor: 'pointer' }}>
                            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                          </span>
                    {formik.touched.Password && formik.errors.Password && (
                      <div className="invalid-feedback">{formik.errors.Password}</div>
                    )}
                  </div>
                  </div>

                  <div className="form-group my-3">
    <label
      htmlFor="ConfirmPassword"
      className={`py-2 yellowText ${
        darkMode ? "dark-mode" : ""
      }`}
    >
      Confirm Password*
    </label>
    <div className="input-group">
    <input
     type={confirmPasswordVisible ? "text" : "password"}
      className={`form-control formLoginControl ${
        formik.touched.ConfirmPassword && formik.errors.ConfirmPassword ? "is-invalid" : ""
      }`}
      id="ConfirmPassword"
      name="ConfirmPassword"
      placeholder="Confirm Password"
      value={formik.values.ConfirmPassword}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
    />
     <span className="input-group-text" onClick={toggleConfirmPasswordVisibility} style={{ cursor: 'pointer' }}>
                            {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                          </span>
    {formik.touched.ConfirmPassword && formik.errors.ConfirmPassword && (
      <div className="invalid-feedback">{formik.errors.ConfirmPassword}</div>
    )}
  </div>
  </div>

                  <button
                    type="submit"
                    className="w-100 loginBtn1 my-4 rounded-2 btn btn-primary"
                    disabled={formik.isSubmitting || loading}
                  >
                    {loading ? 'Signing up...' : 'Sign Up'}
                  </button>
                  <button
                    type="button"
                    className="w-100 d-flex align-items-center menuTextHeader justify-content-center my-3 mt-0 border rounded-2 btn btn-default"
                  >
                    <img src={Google} alt="Google" className="img-fluid px-2" />
                    Sign in with Google
                  </button>
                  <div className="text-center d-flex justify-content-center">
                    <div
                      className={`menuTextHeader ${
                        darkMode ? "dark-mode" : ""
                      }`}
                    >
                      Already have an account?
                    </div>
                    <label
                      className={`px-2 loginTextColor form-check-label  cursor-pointer  yellowButtonColor ${
                        darkMode ? "dark-mode" : ""
                      }`}
                      onClick={handleShowLoginModal}
                    >
                      Signin
                    </label>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
        )}
     <OTPModal
     show={showOTPModal}
     handleClose={() => setShowOTPModal(false)}
     handleVerifyOTP={handleVerifyOTP}
     darkMode={darkMode}
     errorMessage={apiError}
     email={formik.values.Email}
   />
    </>
  );
}
