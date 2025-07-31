// LandingLayout.js
import React, { useState, useContext, useEffect } from "react";
import LandingHeader from "./LandingHeader/LandingHeader";
import LandingSidebar from "./LandingSidebar/LandingSidebar";
import LandingContentArea from "./LandingContentArea/LandingContentArea";
import { ThemeContext } from "../../Theme/ThemeContext";
import { Outlet, useNavigate } from "react-router-dom";
// import {useNavigate} from 'react-router-dom'
export default function LandingLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [activeComponent, setActiveComponent] = useState("LandingRecentDesign"); // State to track active component
  const [showProjectPage, setShowProjectPage] = useState(false);
  const navigate = useNavigate();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavigation = (component) => {
    setActiveComponent(component);
    switch (component) {
      case "LandingUserSettings":
        navigate("profile");
        break;
      case "AdminUserList":
        navigate("userList");
        break;
      case "LandingOrganization":
        navigate("profile");
        break;
      case "AdminOrganization":
        navigate("organization");
        break;
      case "LandingUserSettings": 
        navigate("settings");
        break;
      case "LandingRecentDesign":
        navigate("/dashboard");
        break;
      case "LandingProjects":
        navigate("projects");
        break;
      case "LandingProjectsTab":
        navigate("projectstab");
        break;
      default:
        break;
    }

    // // console.log("Navigating to:", component);
    // // navigate('/profile')
    // setActiveComponent(component);
    // // Set showProjectPage to true if navigating to LandingUserSettings or LandingOrganization
    // if (
    //   component === "LandingUserSettings" ||
    //   component === "LandingOrganization"
    // ) {
    //   setShowProjectPage(true);
    // } else {
    //   setShowProjectPage(false);
    // }
  };

  return (
    <div className={`layout-container ${sidebarOpen ? "sidebar-open" : ""}`}>
      <LandingHeader
        toggleSidebar={toggleSidebar}
        toggleTheme={toggleTheme}
        handleNavigation={handleNavigation} // Pass handleNavigation function
        activeComponent={activeComponent}
      />
      <div className="content-wrapper">
        <LandingSidebar
          sidebarOpen={sidebarOpen}
          toggleTheme={toggleTheme}
          handleNavigation={handleNavigation} // Pass handleNavigation function
          activeComponent={activeComponent} // Pass activeComponent state
        />
        <LandingContentArea
          sidebarOpen={sidebarOpen}
          showProjectPage={activeComponent === "LandingUserSettings"}
          darkMode={theme === "dark"}
          toggleTheme={toggleTheme}
          activeComponent={activeComponent} // Add activeComponent prop
        />
        {/* <Outlet /> */}
      </div>
    </div>
  );
}
