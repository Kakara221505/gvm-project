import React, { useState, useEffect,useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import Logo from '../../Assets/Images/Logo.png';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ForgotPassword from "../ForgotPassword/ForgotPassword";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ThemeContext } from "../../Theme/ThemeContext";
const validationSchema = Yup.object().shape({
  Email: Yup.string().email('Invalid Email address').required('Email is required'),
  Password: Yup.string().required('Password is required').matches(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).{8,}$/,
    'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'
  ),
});

const Login = ({
  show,
  handleClose,
  onClose,
  darkMode,
  handleShowSignupModal,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const formik = useFormik({
    initialValues: {
      Email: '',
      Password: '',
    },
    validationSchema: validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
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

  const handleSubmit = (values) => {
    setLoading(true);
    axios.post(`${process.env.REACT_APP_PUBLIC_BASE_URL}auth/login_with_password`, values)
      .then((response) => {
        localStorage.setItem("AdminToken", response.data.AccessToken);
        localStorage.setItem("UserID", response.data.User.ID);
        toast.success('Login successfully');
        navigate('/dashboard');
      })
      .catch((error) => {
        setLoading(false);
        console.error('API error:', error.message);
        // toast.error(error.message);
        if (error.response.status === 401) {
          toast.error(error.response.data.message || 'Unauthorized');
        } else {
          setErrorMessage(error.message);
        }
      });
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPasswordModal(true);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <>
      {show && !showForgotPasswordModal && (
        <Modal show={show} onHide={handleClose} size="md"  dialogClassName={theme} centered>
          <Modal.Body
            className='commonModalBg'
          >
            <div
              className={`fa fa-close d-flex fs-5 ms-auto m-3 mt-0 me-0 cursor-pointer justify-content-end menuTextHeader ${darkMode ? "dark-mode" : ""
                }`}
              onClick={onClose}
            />

            <div className="row">
              <div className="col-lg-12 py-3 pt-0">
                <div className="loginSectionDiv d-flex flex-column align-items-center justify-content-center m-auto">
                  <div className="headerLogin">
                    <h1
                      className={`logoText loginTextColor mb-0 ${darkMode ? "dark-mode" : ""
                        }`}
                    >
                      <img src={Logo} className="img-fluid" alt="Logo" />
                    </h1>
                  </div>
                  <div className="text-center py-3">
                    <h3
                      className={`my-1 fw-bold menuTextHeader ${darkMode ? "dark-mode" : ""
                        }`}
                    >
                      Sign in to your account
                    </h3>
                    <h5
                      className={`fw-normal my-3 menuTextHeader ${darkMode ? "dark-mode" : ""
                        }`}
                    >
                      Start your demo version
                    </h5>
                  </div>

                  <div className="col-lg-10">
                    <form className="px-0 mx-0 " onSubmit={formik.handleSubmit}>
                      <div className="form-group my-3 mt-0">
                        <label
                          htmlFor="Email"
                          className={`py-2 yellowText ${darkMode ? "dark-mode" : ""}`}
                        >
                          Email*
                        </label>
                        <input
                          type="email"
                          className={`form-control formLoginControl ${formik.touched.Email && formik.errors.Email ? "is-invalid" : ""}`}
                          name="Email"
                          value={formik.values.Email}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="Email"
                        />
                        {formik.touched.Email && formik.errors.Email && (
                          <div className="invalid-feedback">{formik.errors.Email}</div>
                        )}
                      </div>
                      <div className="form-group my-3">
                        <label
                          htmlFor="Password"
                          className={`py-2 yellowText ${darkMode ? "dark-mode" : ""}`}
                        >
                          Password*
                        </label>
                        <div className="input-group">
                          <input
                            type={passwordVisible ? "text" : "password"}
                            className={`form-control formLoginControl ${formik.touched.Password && formik.errors.Password ? "is-invalid" : ""}`}
                            id="Password"
                            name="Password"
                            value={formik.values.Password}
                            placeholder="Enter Password"
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
                      <div className="d-flex justify-content-between">
                        {/* <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="exampleCheck1"
                          />
                          <label
                            className={`form-check-label lightText ${darkMode ? "dark-mode" : ""}`}
                          >
                            Remember Me
                          </label>
                        </div> */}
                        <label
                          onClick={handleForgotPasswordClick}
                          className={`form-check-label yellowText cursor-pointer ${darkMode ? "dark-mode" : ""}`}
                        >
                          Forgot Password?
                        </label>
                      </div>
                      {errorMessage && <div className="text-danger">{errorMessage}</div>}
                      <button className="loginBtn1 w-100 my-4 rounded-2 btn btn-primary" type="submit" disabled={loading || !formik.isValid}>
                        {!loading && <span className='indicator-label'>Sign In</span>}
                        {loading && (
                          <span className='indicator-progress d-block'>
                            Please wait...
                            <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                          </span>
                        )}
                      </button>

                      <div className="text-center d-flex justify-content-center">
                        <div className={`menuTextHeader ${darkMode ? "dark-mode" : ""}`}>
                          Don’t have an account?
                        </div>
                        <label
                          className={`px-2 loginTextColor1  form-check-label cursor-pointer yellowButtonColor ${darkMode ? "dark-mode" : ""}`}
                          onClick={handleShowSignupModal}
                        >
                          Signup
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

      <ForgotPassword
        show={showForgotPasswordModal}
        handleClose={() => setShowForgotPasswordModal(false)}
      />
    </>
  );
};

export default Login;
