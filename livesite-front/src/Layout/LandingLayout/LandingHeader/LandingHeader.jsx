import React, { useState, useRef, useContext } from "react";
import "../LandingLayout.css";
import defaultAvatar from "../../../Assets/Images/defaultAvatar.png";
import Notification from "../../../Assets/Icons/Notification.png";
import Settings from "../../../Assets/Icons/Setting.png";
import Login from "../../../Auth/Login/Login";
import Signup from "../../../Auth/Signup/Signup";
import Dark from "../../../Assets/Icons/Light.png";
import Light from "../../../Assets/Icons/Dark.png";
import Logo from "../../../Assets/Images/Logo.png";
import { Link } from "react-router-dom";

import { ThemeContext } from "../../../Theme/ThemeContext";
import { Dropdown, Offcanvas } from "react-bootstrap";
import AddProjectModal from "./AddProjectModal/AddProjectModal";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ShareModal from "./ShareModal/ShareModal";
import AccessPeopleModal from "./AccessPeopleModal/AccessPeopleModal";
import PrintOffcanvas from "./PrintOffCanvas/PrintOffCanvas";

export default function LandingHeader({
  toggleSidebar,
  darkMode,
  toggleTheme,
  filesPreview,
}) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const fileInputRef = useRef(null); // Define fileInputRef
  const [file, setFile] = useState({});
  const { theme } = useContext(ThemeContext);
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  let { projectId } = useParams();

  const [showShareModal, setShowShareModal] = useState(false); // State for share modal
  const [showAccessModal, setShowAccessModal] = useState(false); // State for access modal
  const [showPrintOffcanvas, setShowPrintOffcanvas] = useState(false); // State for Print Offcanvas

  const currentUrl = location.pathname + location.search;

  const handleShowModal = () => setShowModal(true);
  const handleHideModal = () => setShowModal(false);

  const handleCloseModal = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
  };

  const handleShowLoginModal = () => {
    setShowLoginModal(true);
    setShowSignupModal(false); // Close signup modal if it's open
  };

  const handleShowSignupModal = () => {
    setShowSignupModal(true);
    setShowLoginModal(false); // Close login modal if it's open
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setFile(file);
    filesPreview(file);
    if (!file) return;
  };

  const handleLogout = () => {
    // Remove localStorage items
    localStorage.removeItem("AdminToken");
    localStorage.removeItem("UserId");
    toast.success("Logout successfully");
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
  };

  const handleShowShareModal = () => {
    setShowShareModal(true);
  };

  const handleShowAccessModal = () => {
    setShowAccessModal(true);
    setShowShareModal(false); // Close ShareModal when opening AccessPeopleModal
  };

  const handleCloseAccessModal = () => {
    setShowAccessModal(false);
  };

  const handleBackToShareModal = () => {
    setShowAccessModal(false);
    setShowShareModal(true); // Show ShareModal when going back from AccessPeopleModal
  };
  

  const handleOpenPrintOffcanvas = () => {
    setShowPrintOffcanvas(true);
  };

  const handleClosePrintOffcanvas = () => {
    setShowPrintOffcanvas(false);
  };


  return (
    <>
      <div className={`header py-0 sticky-top ${darkMode ? "dark-mode" : ""}`}>
        <div className="d-flex align-items-center px-3">
          <div className="d-flex align-items-center">
            <button
              className="hamburger bg-transparent border-0 ps-0"
              onClick={toggleSidebar}
            >
              <svg
                width="30"
                height="35"
                className=""
                viewBox="0 0 23 28"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 16H24.5"
                  stroke="var(--text-secondary)"
                  strokeLinecap="round"
                />
                <path
                  d="M7.5 20H24.5"
                  stroke="var(--text-secondary)"
                  strokeLinecap="round"
                />
                <path
                  d="M7.5 12H24.5"
                  stroke="var(--text-secondary)"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div className="brand-logo px-4 ms-2 d-flex align-items-center">
              <h1 className={`logoText mb-0 ${darkMode ? "dark-mode" : ""}`}>
                <img src={Logo} className="w-75 img-fluid" />
              </h1>
            </div>
          </div>
          <div className="col  d-flex align-items-center justify-content-between">
            {
              <div
                className={`d-flex  align-items-center mt-2}  `}
                style={{
                  visibility: !localStorage.getItem("AdminToken")
                    ? "hidden"
                    : "visible",
                }}
              >
                <Link to="/dashboard" className="home-link link-no-underline">
                  <h6
                    className={`mb-0 px-3 ps-0 menuTextHeader ${
                      darkMode ? "dark-mode" : ""
                    }`}
                  >
                    Home
                  </h6>
                </Link>

                <Dropdown
                  style={{ backgroundColor: "transparent", display: "flex" }}
                >
                  <Dropdown.Toggle
                    className={`menuTextHeader setFileBackGround py-0 ${
                      darkMode ? "dark-mode" : ""
                    }`}
                  >
                    File
                  </Dropdown.Toggle>

                  <Dropdown.Menu id="file-drp-menu">
                    <Dropdown.Item
                      className="ItemFile menuTextHeader"
                      onClick={handleShowModal}
                    >
                      New Project
                    </Dropdown.Item>
                    <Dropdown.Item className="ItemFile menuTextHeader" href="#/action-2">
                      Open Project
                    </Dropdown.Item>
                    <Dropdown.Item className="ItemFile menuTextHeader" href="#/action-3">
                      Save
                    </Dropdown.Item>
                    <Dropdown.Item className="ItemFile menuTextHeader" href="#/action-3">
                      Save As
                    </Dropdown.Item>
                    <Dropdown.Item className="ItemFile menuTextHeader" href="#/action-3">
                      Close
                    </Dropdown.Item>
                    <Dropdown.Item className="ItemFile menuTextHeader"onClick={handleOpenPrintOffcanvas}>
                      Print
                    </Dropdown.Item>
                    <Dropdown.Item className="ItemFile menuTextHeader" href="#/action-3">
                      Share
                    </Dropdown.Item>
                    <Dropdown.Item className="ItemFile menuTextHeader" href="#/action-3">
                      Account
                    </Dropdown.Item>
                    <Dropdown.Item className="ItemFile menuTextHeader" href="#/action-3">
                      Option
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                {
                  <div
                    style={{
                      display:
                        currentUrl !== `/editor/${projectId}`
                          ? "none"
                          : "block",
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*, .pdf"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      onChange={handleImageUpload}
                    />
                    <h6
                      className={`mb-0 px-3 menuTextHeader cursor-pointer ${
                        darkMode ? "dark-mode" : ""
                      }`}
                      onClick={() => fileInputRef.current.click()}
                    >
                      Import
                    </h6>
                  </div>
                }
                <h6
                  className={`mb-0 px-3 menuTextHeader ${
                    darkMode ? "dark-mode" : ""
                  }`}
                >
                  Edit
                </h6>
                <h6
                  className={`mb-0 px-3 menuTextHeader ${
                    darkMode ? "dark-mode" : ""
                  }`}
                >
                  View
                </h6>
                <h6
                  className={`mb-0 px-3 menuTextHeader ${
                    darkMode ? "dark-mode" : ""
                  }`}
                >
                  Help
                </h6>
              </div>
            }

            <div className="avatarSection d-flex align-items-center">
              <div className="notificationSection d-flex align-items-center">
                <button
                  className="d-flex align-items-center justify-content-center btn btn-primary loginBtn1   mx-1 px-3"
                  onClick={handleShowShareModal}
                >
                  Share
                </button>{" "}
                <button
                  onClick={toggleTheme}
                  className="d-flex align-items-center justify-content-center btn btn-default notificationSectionIcon mx-1"
                >
                  {darkMode ? (
                    <img src={Dark} alt="defaultAvatar" />
                  ) : (
                    <img src={Light} alt="defaultAvatar" />
                  )}
                </button>
                {/* <button className="d-flex align-items-center justify-content-center btn btn-default notificationSectionIcon mx-1">
                  <img src={Notification} alt="defaultAvatar" />
                </button>{" "} */}
                <button className="d-flex align-items-center justify-content-center btn btn-default notificationSectionIcon mx-1">
                  <img src={Settings} alt="defaultAvatar" />
                </button>
                <button className="d-flex align-items-center justify-content-center btn btn-default notificationSectionIcon mx-1">
                  <img src={Notification} alt="defaultAvatar" />
                </button>{" "}
              </div>
              <div className="authSection d-flex">
                {!localStorage.getItem("AdminToken") && (
                  <button
                    className="btn btn-primary loginBtn1 mx-1 me-0"
                    onClick={handleShowLoginModal}
                  >
                    Login
                  </button>
                )}
                {localStorage.getItem("AdminToken") && (
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="default"
                      id="dropdown-basic"
                      className="btn btn-default bg-transparent avtButton"
                    >
                      <img
                        className="borderAvatar"
                        src={defaultAvatar}
                        height={40}
                        width={40}
                        alt="defaultAvatar"
                      />
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="w-auto">
                      <Dropdown.Item
                        href="/dashboard/profile"
                        className="px-4 text-start"
                      >
                        My Profile
                      </Dropdown.Item>
                      <Dropdown.Item
                        href="#/action-2"
                        className="px-4 text-start"
                        onClick={handleLogout}
                      >
                        Logout
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddProjectModal show={showModal} onHide={handleHideModal} />

      <ShareModal
        show={showShareModal}
        handleClose={handleCloseShareModal}
        handleShowAccessModal={handleShowAccessModal}
      />
      <AccessPeopleModal
        show={showAccessModal}
        handleClose={handleCloseAccessModal}
        handleBackToShareModal={handleBackToShareModal}
      />
      <Login
        handleShowSignupModal={handleShowSignupModal}
        show={showLoginModal}
        handleClose={handleCloseModal}
        title="Modal heading"
        body="Woohoo, you are reading this text in a modal!"
        onClose={handleCloseModal}
        darkMode={darkMode}
      />

      <Signup
        show={showSignupModal}
        handleShowLoginModal={handleShowLoginModal}
        handleClose={handleCloseModal}
        title="Modal heading"
        body="Woohoo, you are reading this text in a modal!"
        onClose={handleCloseModal}
        darkMode={darkMode}
      />

<PrintOffcanvas
        showPrintOffcanvas={showPrintOffcanvas}
        handleClosePrintOffcanvas={handleClosePrintOffcanvas}
      />
    </>
  );
}
