// LandingSidebar.js
import React, { useContext, useEffect, useState } from "react";
import defaultAvatar from "../../../Assets/Images/defaultAvatar.png";
import Home from "../../../Assets/Icons/Home.png";
import DarkHome from "../../../Assets/Icons/DarkHome.png";
import Folder from "../../../Assets/Icons/Folder.png";
import DarkFolder from "../../../Assets/Icons/DarkFolder.png";

import DarkDelete from "../../../Assets/Icons/DarkDelete.png";
import Delete from "../../../Assets/Icons/Delete.png";
import Team from "../../../Assets/Icons/Team.png";
import DarkTeam from "../../../Assets/Icons/DarkTeam.png";

import Paper from "../../../Assets/Icons/Paper.png";
import DarkPaper from "../../../Assets/Icons/DarkPaper.png";

import "./LandingSidebar.css";
import { ThemeContext } from "../../../Theme/ThemeContext";
import { useShapeContext } from "../../../contexts/shapeContext";

export default function LandingSidebar({
  sidebarOpen,
  darkMode,
  toggleTheme,
  handleNavigation,
  activeComponent,
}) {
  const sidebarClass = `sidebar px-4 py-3 ${sidebarOpen ? "open px-0" : ""} ${
    darkMode ? "dark-mode" : ""
  }`;
  const { theme } = useContext(ThemeContext);
  const [isLogin, setIsLogin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { state, actions } = useShapeContext();
  const { userRole } = state;
  const handleShowModal = () => setShowModal(true);
  const handleHideModal = () => setShowModal(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const userToken = localStorage.getItem("AdminToken");
    if (userToken) {
      setIsLogin(true);
    }
  }, []);
  return (
    <div id="sidenav" className={sidebarClass}>
      <div className="d-flex flex-column ">
        <div className="d-flex flex-column ">
          <div className="loginAvatarSection py-2">
            <div className="d-flex align-items-center">
              <img
                src={defaultAvatar}
                height={40}
                width={40}
                className="borderAvatar"
                alt="defaultAvatar"
              />
              <div className="d-flex flex-column text-start">
                {/* <h1 className={`logoText mb-0 ${darkMode ? "dark-mode" : ""}`}> */}

                <small
                  className={`fw-medium lightText fs-6 mx-2 ${
                    darkMode ? "dark-mode" : ""
                  }`}
                >
                  Personal
                </small>
                <div className="d-flex align-items-center">
                  <small className="fw-normal avatarText mx-2">Free</small>
                  <i className="fa fa-user avatarText"></i>
                  <small className="fw-normal avatarText mx-2">1</small>
                </div>
              </div>
            </div>
          </div>
          <div className="sideMenuSection my-3">
            <a
              className={`d-flex cursor-pointer align-items-center menuTextHeader ${
                activeComponent === "LandingRecentDesign" ? "active" : ""
              } ${darkMode ? "dark-mode" : ""}`}
              onClick={() => handleNavigation("LandingRecentDesign")}
            >
              <svg
                width="24"
                height="24"
                className="me-3"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.15722 20.7714V17.7047C9.1572 16.9246 9.79312 16.2908 10.581 16.2856H13.4671C14.2587 16.2856 14.9005 16.9209 14.9005 17.7047V17.7047V20.7809C14.9003 21.4432 15.4343 21.9845 16.103 22H18.0271C19.9451 22 21.5 20.4607 21.5 18.5618V18.5618V9.83784C21.4898 9.09083 21.1355 8.38935 20.538 7.93303L13.9577 2.6853C12.8049 1.77157 11.1662 1.77157 10.0134 2.6853L3.46203 7.94256C2.86226 8.39702 2.50739 9.09967 2.5 9.84736V18.5618C2.5 20.4607 4.05488 22 5.97291 22H7.89696C8.58235 22 9.13797 21.4499 9.13797 20.7714V20.7714"
                  stroke="var(--text-secondary)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Home
            </a>
            {isLogin && (
              <>
                {(userRole === "ORGANIZATION" || userRole === "ADMIN") && (
                  <>
                    <a
                      onClick={() =>
                        handleNavigation(
                          userRole === "ADMIN"
                            ? "AdminOrganization"
                            : "LandingOrganization"
                        )
                      } // Set active component to LandingProfile
                      className={`d-flex align-items-center cursor-pointer menuTextHeader ${
                        activeComponent === "LandingOrganization"
                          ? "active cursor-pointer"
                          : ""
                      } ${darkMode ? "dark-mode" : ""}`}
                    >
                      {" "}
                      <svg
                        className="me-3"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M16 10L18.1494 10.6448C19.5226 11.0568 20.2092 11.2628 20.6046 11.7942C21 12.3256 21 13.0425 21 14.4761V22"
                          stroke="var(--text-secondary)"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8 9L11 9M8 13L11 13"
                          stroke="var(--text-secondary)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 22V19C12 18.0572 12 17.5858 11.7071 17.2929C11.4142 17 10.9428 17 10 17H9C8.05719 17 7.58579 17 7.29289 17.2929C7 17.5858 7 18.0572 7 19V22"
                          stroke="var(--text-secondary)"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M2 22L22 22"
                          stroke="var(--text-secondary)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M3 22V6.71724C3 4.20649 3 2.95111 3.79118 2.32824C4.58237 1.70537 5.74742 2.04355 8.07752 2.7199L13.0775 4.17122C14.4836 4.57937 15.1867 4.78344 15.5933 5.33965C16 5.89587 16 6.65344 16 8.16857V22"
                          stroke="var(--text-secondary)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Organization
                    </a>
                    <a
                      onClick={() =>
                        handleNavigation(
                          userRole === "ADMIN"
                            ? "AdminUserList"
                            : "LandingUserSettings"
                        )
                      } // Set active component to LandingProfile
                      className={`d-flex align-items-center cursor-pointer menuTextHeader ${
                        activeComponent === "LandingUserSettings"
                          ? "active cursor-pointer"
                          : ""
                      } ${darkMode ? "dark-mode" : ""}`}
                    >
                      {" "}
                      <svg
                        className="me-3"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11.5 14.0116C9.45338 13.9164 7.38334 14.4064 5.57757 15.4816C4.1628 16.324 0.453365 18.0441 2.71266 20.1966C3.81631 21.248 5.04549 22 6.59087 22H12"
                          stroke="var(--text-secondary)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M15.5 6.5C15.5 8.98528 13.4853 11 11 11C8.51472 11 6.5 8.98528 6.5 6.5C6.5 4.01472 8.51472 2 11 2C13.4853 2 15.5 4.01472 15.5 6.5Z"
                          stroke="var(--text-secondary)"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M18 20.7143V22M18 20.7143C16.8432 20.7143 15.8241 20.1461 15.2263 19.2833M18 20.7143C19.1568 20.7143 20.1759 20.1461 20.7737 19.2833M18 14.2857C19.1569 14.2857 20.1761 14.854 20.7738 15.7169M18 14.2857C16.8431 14.2857 15.8239 14.854 15.2262 15.7169M18 14.2857V13M22 14.9286L20.7738 15.7169M14.0004 20.0714L15.2263 19.2833M14 14.9286L15.2262 15.7169M21.9996 20.0714L20.7737 19.2833M20.7738 15.7169C21.1273 16.2271 21.3333 16.8403 21.3333 17.5C21.3333 18.1597 21.1272 18.773 20.7737 19.2833M15.2262 15.7169C14.8727 16.2271 14.6667 16.8403 14.6667 17.5C14.6667 18.1597 14.8728 18.773 15.2263 19.2833"
                          stroke="var(--text-secondary)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      User Settings
                    </a>
                  </>
                )}
                <a
                  onClick={() => handleNavigation("LandingProjectsTab")} // Set active component to LandingProfile
                  className={`d-flex align-items-center cursor-pointer menuTextHeader ${
                    activeComponent === "LandingProjectsTab"
                      ? "active cursor-pointer"
                      : ""
                  } ${darkMode ? "dark-mode" : ""}`}
                >
                  {" "}
                  <svg
                    className="me-3"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M21.4189 15.7321C21.4189 19.3101 19.3099 21.4191 15.7319 21.4191H7.94988C4.36288 21.4191 2.24988 19.3101 2.24988 15.7321V7.93211C2.24988 4.35911 3.56388 2.25011 7.14288 2.25011H9.14288C9.86088 2.25111 10.5369 2.58811 10.9669 3.16311L11.8799 4.37711C12.3119 4.95111 12.9879 5.28911 13.7059 5.29011H16.5359C20.1229 5.29011 21.4469 7.11611 21.4469 10.7671L21.4189 15.7321Z"
                      stroke="var(--text-secondary)"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M7.48096 14.463H16.216"
                      stroke="var(--text-secondary)"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  Projects
                </a>
                <select
                  className={`form-select ${hover ? "border-primary" : ""}`}
                  aria-label="Default select example"
                  onMouseEnter={() => setHover(true)}
                  onMouseLeave={() => setHover(false)}
                  style={{
                    borderColor: hover ? "var(--bs-primary)" : "transparent",
                  }}
                >
                  <option selected>
                    <span className="d-flex align-items-center">
                      <svg
                        className="me-2"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 2H14L20 8V22H6V2Z"
                          stroke="var(--bs-secondary)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14 2V8H20"
                          stroke="var(--bs-secondary)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10 13H14"
                          stroke="var(--bs-secondary)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10 17H14"
                          stroke="var(--bs-secondary)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Content
                    </span>
                  </option>
                  <option value="PrivacyPolicy">Privacy Policy</option>
                  <option value="TermsCondition">Terms & Condition</option>
                  <option value="HelpSupport">Help & Support</option>
                  <option value="Contact">Contact</option>
                </select>
                {/* <a
                  onClick={() => handleNavigation(userRole === "ADMIN" ? "AdminUserList" : "LandingUserSettings")} // Set active component to LandingProfile
                  className={`d-flex align-items-center cursor-pointer menuTextHeader ${
                    activeComponent === "LandingUserSettings"
                      ? "active cursor-pointer"
                      : ""
                  } ${darkMode ? "dark-mode" : ""}`}
                >
                  {" "}
                  <svg
                    className="me-3"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 2H14L20 8V22H6V2Z"
                      stroke="var(--text-secondary)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 2V8H20"
                      stroke="var(--text-secondary)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 13H14"
                      stroke="var(--text-secondary)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 17H14"
                      stroke="var(--text-secondary)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Content
                </a> */}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="d-flex flex-column position-absolute bottomMenu pe-4">
        <a
          className={`d-flex align-items-center menuTextHeader ${
            darkMode ? "dark-mode" : ""
          }`}
          href="#home"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="me-3"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.8877 10.8967C19.2827 10.7007 20.3567 9.50473 20.3597 8.05573C20.3597 6.62773 19.3187 5.44373 17.9537 5.21973"
              stroke="var(--text-secondary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19.7285 14.2502C21.0795 14.4522 22.0225 14.9252 22.0225 15.9002C22.0225 16.5712 21.5785 17.0072 20.8605 17.2812"
              stroke="var(--text-secondary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M11.8867 14.6638C8.67273 14.6638 5.92773 15.1508 5.92773 17.0958C5.92773 19.0398 8.65573 19.5408 11.8867 19.5408C15.1007 19.5408 17.8447 19.0588 17.8447 17.1128C17.8447 15.1668 15.1177 14.6638 11.8867 14.6638Z"
              stroke="var(--text-secondary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M11.8867 11.8879C13.9957 11.8879 15.7057 10.1789 15.7057 8.06888C15.7057 5.95988 13.9957 4.24988 11.8867 4.24988C9.77766 4.24988 8.06766 5.95988 8.06766 8.06888C8.05966 10.1709 9.75666 11.8809 11.8587 11.8879H11.8867Z"
              stroke="var(--text-secondary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5.88472 10.8967C4.48872 10.7007 3.41572 9.50473 3.41272 8.05573C3.41272 6.62773 4.45372 5.44373 5.81872 5.21973"
              stroke="var(--text-secondary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4.04388 14.2502C2.69288 14.4522 1.74988 14.9252 1.74988 15.9002C1.74988 16.5712 2.19388 17.0072 2.91188 17.2812"
              stroke="var(--text-secondary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Create a team
        </a>
        <hr
          className={`py-0 my-0 lightText opacity-100 ${
            darkMode ? "dark-mode" : ""
          }`}
        />
        <a
          href="#news"
          className={`yellowButtonColor menuTextHeader ${
            darkMode ? "dark-mode" : ""
          }`}
        >
          {" "}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="me-3"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.3249 9.46826C19.3249 9.46826 18.7819 16.2033 18.4669 19.0403C18.3169 20.3953 17.4799 21.1893 16.1089 21.2143C13.4999 21.2613 10.8879 21.2643 8.27991 21.2093C6.96091 21.1823 6.13791 20.3783 5.99091 19.0473C5.67391 16.1853 5.13391 9.46826 5.13391 9.46826"
              stroke="var(--text-secondary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20.7082 6.23975H3.75024"
              stroke="var(--text-secondary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17.4407 6.23973C16.6557 6.23973 15.9797 5.68473 15.8257 4.91573L15.5827 3.69973C15.4327 3.13873 14.9247 2.75073 14.3457 2.75073H10.1127C9.5337 2.75073 9.0257 3.13873 8.8757 3.69973L8.6327 4.91573C8.4787 5.68473 7.8027 6.23973 7.0177 6.23973"
              stroke="var(--text-secondary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Trash
        </a>
      </div>
      {/* <AddProjectModal show={showModal} onHide={handleHideModal} /> */}
    </div>
  );
}
