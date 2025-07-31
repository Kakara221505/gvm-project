import React from "react";
import LandingRecentDesign from "./LandingRecentDesign/LandingRecentDesign";
import LandingUserSettings from "./LandingUserSettings/LandingUserSettings";
import LandingOrganization from "./LandingOrganization/LandingOrganization";
import LandingProjects from "./LandingProjects/LandingProjects";
import { Outlet } from 'react-router-dom'



export default function LandingContentArea({ sidebarOpen, showProjectPage, activeComponent, darkMode, toggleTheme }) {
  // console.log("showProjectPage:", showProjectPage);
  
  return (
    <div className={`main ${sidebarOpen ? "sidebar-open" : ""} ${darkMode ? "dark-mode" : ""}`}>
      {showProjectPage ? (
        <LandingUserSettings />
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

