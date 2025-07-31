import React, { useState, useContext } from "react";
import { Modal } from "react-bootstrap";
import Logo from "../../Assets/Images/Logo.png";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ThemeContext } from "../../Theme/ThemeContext";

export default function ConfirmPassword({ show, handleClose }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
    setError("");
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };


  const handleChangeConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
    setError("");
  };

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("AdminToken");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_PUBLIC_BASE_URL}auth/forgot_password`,
        { NewPassword: password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLoading(false);
      toast.success("Password changed successfully");
      localStorage.removeItem("AdminToken");
      handleClose(); // Close the modal after successful password reset
      navigate('/'); // Navigate to the dashboard after successful password reset

    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="md" centered dialogClassName={theme}>
      <Modal.Body className='commonModalBg'>
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
                <h3 className="my-1 fw-bold menuTextHeader">Reset Password</h3>
                <h6 className="fw-normal my-3 menuTextHeader">You can reset your password here.</h6>
              </div>

              <form className="w-100 px-5">
                <div className="form-group py-2">
                  <div className="input-group">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      className="form-control formLoginControl"
                      placeholder="Password"
                      value={password}
                      onChange={handleChangePassword}
                    />
                    <span className="input-group-text" onClick={togglePasswordVisibility} style={{ cursor: 'pointer' }}>
                      {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>
                <div className="form-group py-3">
                  <div className="input-group">
                    <input
                      type={confirmPasswordVisible ? "text" : "password"}
                      placeholder="Confirm Password"
                      className="form-control formLoginControl"
                      value={confirmPassword}
                      onChange={handleChangeConfirmPassword}
                    />
                    <span className="input-group-text" onClick={toggleConfirmPasswordVisibility} style={{ cursor: 'pointer' }}>
                      {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>
                {error && <div className="text-danger">{error}</div>}
                <button
                  type="button"
                  className="w-75 d-block m-auto mt-4 loginBtn1 rounded-2 btn btn-primary"
                  onClick={handleSubmit}
                  disabled={!password || !confirmPassword || loading}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
