import React from "react";
import LandingRecentDesign from "./LandingRecentDesign/LandingRecentDesign";
import LandingUserSettings from "./LandingUserSettings/LandingUserSettings";
import LandingOrganization from "./LandingOrganization/LandingOrganization";
import LandingProjects from "./LandingProjects/LandingProjects";
import { Outlet } from "react-router-dom";
import LandingProjectsTab from "./LandingProjectsTab/LandingProjectsTab";

export default function LandingContentArea({
  sidebarOpen,
  showProjectPage,
  activeComponent,
  darkMode,
  toggleTheme,
}) {

  return (
    <div
      className={`main ${sidebarOpen ? "sidebar-open" : ""} ${
        darkMode ? "dark-mode" : ""
      }`}
    >
      {showProjectPage ? (
        <>
          <LandingUserSettings />
          {/* <LandingProjectsTab/> */}
        </>
      ) : (
        <>
          {/* {activeComponent === "LandingOrganization" && <LandingOrganization />}
           {activeComponent === "LandingRecentDesign" && <LandingRecentDesign darkMode={darkMode} />}
           {activeComponent === "LandingProjects" && <LandingProjects />} */}
          {/* {activeComponent === "LandingRecentDesign" && <LandingRecentDesign darkMode={darkMode} />} */}
          <Outlet />
        </>
      )}
    </div>
  );
}
