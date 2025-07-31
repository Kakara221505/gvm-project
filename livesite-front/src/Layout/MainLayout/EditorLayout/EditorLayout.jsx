import React, { useState } from "react";
import LandingHeader from "../../LandingLayout/LandingHeader/LandingHeader";
import EditorMainCanvasArea from "./EditorMainCanvasArea/EditorMainCanvasArea";
import EditorRightSideBar from "./EditorRightSideBar/EditorRightSideBar";
import EditorFooter from "./EditorFooter/EditorFooter";
import "./EditorLayout.css";
import PropertySidebar from "./EditorSidebar/PropertySidebar/PropertySidebar";
import ToolSidebar from "./EditorSidebar/ToolSidebar/ToolSidebar";

export default function EditorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // State for theme
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false); // State for right sidebar

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const toggleRightSidebar = () => {
    setRightSidebarOpen(!rightSidebarOpen);
  };

  return (
    <>
      <div className={`layout-container sticky-top ${sidebarOpen ? "sidebar-open" : ""}`}>
        <LandingHeader
          toggleSidebar={toggleSidebar}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        />
      {/* <div className="parent">
        <div className="mainEditorArea">
          <div className="toolSidebar">
            <ToolSidebar />
          </div>
          <div className="propertySidebar">
            <PropertySidebar />
          </div>
          <div className="mainCanvasArea dot dot--1 content d-flex align-items-center justify-content-center">
            <EditorMainCanvasArea />
          </div>
          <div className="toolSidebar propertySidebar">
          <EditorRightSideBar isOpen={rightSidebarOpen} onClose={toggleRightSidebar} />
          </div>
        </div>
        <div className="footerBottomBar sticky-bottom">
          <EditorFooter />
        </div>
      </div> */}
      </div>
    </>
  );
}
