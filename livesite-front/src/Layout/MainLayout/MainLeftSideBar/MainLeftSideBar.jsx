import React, { useEffect, useState } from "react";
import ToolSidebar from "../EditorLayout/EditorSidebar/ToolSidebar/ToolSidebar";
import PropertySidebar from "../EditorLayout/EditorSidebar/PropertySidebar/PropertySidebar";
import { useShapeContext } from "../../../contexts/shapeContext";

export default function MainLeftSideBar({
  setShapeToDraw,
  backgroundColor,
  canvasBackgroundColor,
  filesPreviewShape,
}) {
  const [propertySidebarOpen, setPropertySidebarOpen] = useState(false);
  const { state } = useShapeContext();
  const { selectedObject } = state;

  useEffect(() => {
    if (!selectedObject) {
      setPropertySidebarOpen(false);
      return;
    }
  }, [selectedObject]);

  const togglePropertySidebar = () => {
    setPropertySidebarOpen(!propertySidebarOpen);
  };

  return (
    <>
      <div className="toolSidebar p-0">
        <ToolSidebar
          setShapeToDraw={setShapeToDraw}
          openPropertySidebar={togglePropertySidebar}
        />
        {propertySidebarOpen && (
          <PropertySidebar
            backgroundColor={backgroundColor}
            canvasBackgroundColor={canvasBackgroundColor}
            filesPreviewShape={filesPreviewShape}
          />
        )}
      </div>
    </>
  );
}
