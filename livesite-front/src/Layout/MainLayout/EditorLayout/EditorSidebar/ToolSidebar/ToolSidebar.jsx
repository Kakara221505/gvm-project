import React, { useState, useEffect, useRef } from "react";
import "./ToolSideBar.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import triangle from "../../../../../Assets/Icons/triangle.png";
import Hexa from "../../../../../Assets/Icons/hexagon.png";
import star from "../../../../../Assets/Icons/star.png";
import MoreArrow from "../../../../../Assets/Icons/MoreDropArrow.png";
import { useShapeContext } from "../../../../../contexts/shapeContext";

const shapesDropdownItems = [
  { label: "Triangle", image: triangle },
  { label: "Hexagon", image: Hexa },
  { label: "Star", image: star },
];

export default function ToolSidebar({ setShapeToDraw, openPropertySidebar }) {
  const [showShapesMenu, setShowShapesMenu] = useState(false);
  const [selectShapesMenu, setSelectShapesMenu] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [propertySidebarOpen, setPropertySidebarOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState("select");
  const shapeRef = useRef(null);
  const { state, actions } = useShapeContext();
  const { selectedObject, selectedShapeType, activeCanvas } = state;

  useEffect(() => {
    function handleClickOutside(event) {
      if (shapeRef.current && !shapeRef.current.contains(event.target)) {
        setShowShapesMenu(false);
        setSelectShapesMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [shapeRef, selectShapesMenu]);

  const toggleShapesMenu = () => {
    setShowShapesMenu(!showShapesMenu);
  };

  function handleShapeClick(shape) {
    setSelectShapesMenu(true);
    setShapeToDraw(shape);
    setActiveIcon(shape);
    actions.selectShapeType(true);
  }

  function handleMoreOptionClick() {
    setShowMoreOptions(!showMoreOptions);
  }

  useEffect(() => {
    if (propertySidebarOpen) {
      document.querySelector(".property-icon").classList.add("activeLayer");
    } else {
      document.querySelector(".property-icon").classList.remove("activeLayer");
    }
  }, [propertySidebarOpen]);

  useEffect(() => {
    if (propertySidebarOpen && selectedObject) {
      setActiveIcon("property");
    } else if (showShapesMenu) {
      setActiveIcon("ShapesIcon");
    } else {
      setActiveIcon("select");
      actions.selectShapeType(true);
    }
  }, [propertySidebarOpen, showShapesMenu, activeCanvas, selectedObject]);
  return (
    <section className="ToolSidebar">
      <div className="row">
        <div className="col-lg-12 px-1">
          <div className="iconBar"> 
            <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id="add-project-tooltip">Property Explorer</Tooltip>
              }
            >
              <a
                onClick={() => {
                  openPropertySidebar();
                  setPropertySidebarOpen(!propertySidebarOpen);
                }}
                className={`property-icon border-bottom border-2  cursor-pointer ${
                  propertySidebarOpen && selectedObject
                    ? "active rounded-2"
                    : ""
                }`}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13 4L3 4"
                    stroke="var(--text-secondary)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11 19L3 19"
                    stroke="var(--text-secondary)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21 19L17 19"
                    stroke="var(--text-secondary)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21 11.5L11 11.5"
                    stroke="var(--text-secondary)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21 4L19 4"
                    stroke="var(--text-secondary)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 11.5L3 11.5"
                    stroke="var(--text-secondary)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14.5 2C14.9659 2 15.1989 2 15.3827 2.07612C15.6277 2.17761 15.8224 2.37229 15.9239 2.61732C16 2.80109 16 3.03406 16 3.5L16 4.5C16 4.96594 16 5.19891 15.9239 5.38268C15.8224 5.62771 15.6277 5.82239 15.3827 5.92388C15.1989 6 14.9659 6 14.5 6C14.0341 6 13.8011 6 13.6173 5.92388C13.3723 5.82239 13.1776 5.62771 13.0761 5.38268C13 5.19891 13 4.96594 13 4.5L13 3.5C13 3.03406 13 2.80109 13.0761 2.61732C13.1776 2.37229 13.3723 2.17761 13.6173 2.07612C13.8011 2 14.0341 2 14.5 2Z"
                    stroke="var(--text-secondary)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12.5 17C12.9659 17 13.1989 17 13.3827 17.0761C13.6277 17.1776 13.8224 17.3723 13.9239 17.6173C14 17.8011 14 18.0341 14 18.5L14 19.5C14 19.9659 14 20.1989 13.9239 20.3827C13.8224 20.6277 13.6277 20.8224 13.3827 20.9239C13.1989 21 12.9659 21 12.5 21C12.0341 21 11.8011 21 11.6173 20.9239C11.3723 20.8224 11.1776 20.6277 11.0761 20.3827C11 20.1989 11 19.9659 11 19.5L11 18.5C11 18.0341 11 17.8011 11.0761 17.6173C11.1776 17.3723 11.3723 17.1776 11.6173 17.0761C11.8011 17 12.0341 17 12.5 17Z"
                    stroke="var(--text-secondary)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.5 9.5C9.96594 9.5 10.1989 9.5 10.3827 9.57612C10.6277 9.67761 10.8224 9.87229 10.9239 10.1173C11 10.3011 11 10.5341 11 11L11 12C11 12.4659 11 12.6989 10.9239 12.8827C10.8224 13.1277 10.6277 13.3224 10.3827 13.4239C10.1989 13.5 9.96594 13.5 9.5 13.5C9.03406 13.5 8.80109 13.5 8.61732 13.4239C8.37229 13.3224 8.17761 13.1277 8.07612 12.8827C8 12.6989 8 12.4659 8 12L8 11C8 10.5341 8 10.3011 8.07612 10.1173C8.17761 9.87229 8.37229 9.67761 8.61732 9.57612C8.80109 9.5 9.03406 9.5 9.5 9.5Z"
                    stroke="var(--text-secondary)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </OverlayTrigger>

            <div onClick={() => handleShapeClick("select")}>
              <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="text-tooltip">Select</Tooltip>}
              >
                <a
                  href="#"
                  className={`cursor-pointer border-2  border-bottom ${
                    activeIcon === "select" && selectedShapeType
                      ? "active rounded-2"
                      : ""
                  }`}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                        className={activeIcon === "select" && selectedShapeType ? "fillImg4" : ""}

                  >
                    <path
                      d="M2 9.2L2 12.8M12.8 2L9.2 2M7.5 20H9M20 7.5V9M2.13343 4.69898C2.28806 3.97158 2.54837 3.42488 2.98663 2.98663C3.41266 2.56059 3.94119 2.3027 4.63858 2.14661M19.8666 4.69898C19.7119 3.97158 19.4516 3.42488 19.0134 2.98663C18.5963 2.5696 18.0811 2.31369 17.4054 2.15665M4.63858 19.8534C3.94119 19.6973 3.41266 19.4394 2.98663 19.0134C2.55627 18.583 2.2975 18.0481 2.14189 17.3402"
                      stroke="var(--text-secondary)"
                      strokeLinecap="round"
                    />
                    <path
                      d="M13.7813 20.9656C11.9693 21.0908 10.1739 12.64 11.4067 11.407C12.6396 10.174 21.091 11.9681 20.9657 13.7802C20.8795 14.9669 18.8709 15.4363 18.9295 16.491C18.9467 16.7999 19.3369 17.0814 20.1173 17.6445C20.6596 18.0358 21.2126 18.4157 21.7456 18.8195C21.9583 18.9807 22.0423 19.2516 21.9798 19.5071C21.6798 20.7341 20.7394 21.6785 19.5075 21.9798C19.252 22.0423 18.9811 21.9583 18.8199 21.7455C18.4162 21.2124 18.0363 20.6594 17.6451 20.117C17.0821 19.3365 16.8006 18.9463 16.4918 18.9291C15.4372 18.8704 14.9679 20.8793 13.7813 20.9656Z"
                      stroke="var(--text-secondary)"
                    />
                  </svg>
                </a>
              </OverlayTrigger>
            </div>

            <div onClick={() => handleShapeClick("FreeForm")}>
              <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="pen-tool-tooltip">Free Form</Tooltip>}
              >
                <a
                  href="#"
                  className={`${
                    activeIcon === "FreeForm" && selectedShapeType
                      ? "active rounded-2"
                      : ""
                  }`}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={activeIcon === "FreeForm" && selectedShapeType ? "fillImg4" : ""}

                  >
                    <circle
                      cx="9"
                      cy="4"
                      r="2"
                      stroke="var(--text-secondary)"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="19"
                      cy="7"
                      r="2"
                      stroke="var(--text-secondary)"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="2"
                      stroke="var(--text-secondary)"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="4"
                      cy="18"
                      r="2"
                      stroke="var(--text-secondary)"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10.9171 4.5752L17.0848 6.4255M19.1544 8.99455L19.8476 18.0061M18.0162 19.7523L5.98574 18.2484M8.32812 5.88435L4.67383 16.1164"
                      stroke="var(--text-secondary)"
                      strokeLinecap="round"
                    />
                  </svg>
                </a>
              </OverlayTrigger>
            </div>

            <div onClick={() => handleShapeClick("Rectangle")}>
              <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="line-tooltip">Rectangle</Tooltip>}
              >
                <a
                  href="#"
                  className={`${
                    activeIcon === "Rectangle" && selectedShapeType
                      ? "active rounded-2"
                      : ""
                  }`}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={activeIcon === "Rectangle" && selectedShapeType ? "fillImg4" : ""}

                  >
                    <path
                      d="M2 12C2 9.19974 2 7.79961 2.54497 6.73005C3.02433 5.78924 3.78924 5.02433 4.73005 4.54497C5.79961 4 7.19974 4 10 4H14C16.8003 4 18.2004 4 19.27 4.54497C20.2108 5.02433 20.9757 5.78924 21.455 6.73005C22 7.79961 22 9.19974 22 12C22 14.8003 22 16.2004 21.455 17.27C20.9757 18.2108 20.2108 18.9757 19.27 19.455C18.2004 20 16.8003 20 14 20H10C7.19974 20 5.79961 20 4.73005 19.455C3.78924 18.9757 3.02433 18.2108 2.54497 17.27C2 16.2004 2 14.8003 2 12Z"
                      stroke="var(--text-secondary)"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </OverlayTrigger>
            </div>

            <div onClick={() => handleShapeClick("circle")}>
              <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="line-tooltip">Circle</Tooltip>}
              >
                <a
                  href="#"
                  className={`${
                    activeIcon === "circle" && selectedShapeType
                      ? "active rounded-2"
                      : ""
                  }`}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={activeIcon === "circle" && selectedShapeType ? "fillImg4" : ""}

                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="var(--text-secondary)"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </OverlayTrigger>
            </div>
            <div onClick={() => handleShapeClick("line")}>
              <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="line-tooltip">Line</Tooltip>}
              >
                <a
                  href="#"
                  className={`${
                    activeIcon === "line" && selectedShapeType
                      ? "active rounded-2"
                      : ""
                  }`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={activeIcon === "line" && selectedShapeType ? "fillImg4" : ""}

                  >
                    <path
                      d="M1.28249 14.7175L14.7176 1.28238"
                      stroke="var(--text-secondary)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </OverlayTrigger>
            </div>

            <div className="shape-section  position-relative" ref={shapeRef}>
              <div className="shapeHead">
                <OverlayTrigger
                  overlay={<Tooltip id="pen-tool-tooltip">More Shapes</Tooltip>}
                  placement="right"
                >
                  <a
                    onClick={toggleShapesMenu}
                    className={`border-2  border-bottom cursor-pointer ${
                      showShapesMenu ? "active rounded-2 " : ""
                    }`}
                  >
                    <svg
                      className={`${showShapesMenu ? "active-icon" : ""}`}
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      
                    >
                      <path
                        d="M14.6171 4.76655C15.6275 3.16588 16.1327 2.36554 16.7947 2.12444C17.2503 1.95852 17.7497 1.95852 18.2053 2.12444C18.8673 2.36554 19.3725 3.16588 20.3829 4.76655C21.5202 6.56824 22.0889 7.46908 21.9887 8.21239C21.92 8.72222 21.6634 9.18799 21.2693 9.51835C20.6947 10 19.6298 10 17.5 10C15.3702 10 14.3053 10 13.7307 9.51835C13.3366 9.18799 13.08 8.72222 13.0113 8.21239C12.9111 7.46908 13.4798 6.56824 14.6171 4.76655Z"
                        stroke="var(--text-secondary)"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 6C2 4.33345 2 3.50018 2.42441 2.91603C2.56147 2.72738 2.72738 2.56147 2.91603 2.42441C3.50018 2 4.33345 2 6 2C7.66655 2 8.49982 2 9.08397 2.42441C9.27262 2.56147 9.43853 2.72738 9.57559 2.91603C10 3.50018 10 4.33345 10 6C10 7.66655 10 8.49982 9.57559 9.08397C9.43853 9.27262 9.27262 9.43853 9.08397 9.57559C8.49982 10 7.66655 10 6 10C4.33345 10 3.50018 10 2.91603 9.57559C2.72738 9.43853 2.56147 9.27262 2.42441 9.08397C2 8.49982 2 7.66655 2 6Z"
                        stroke="var(--text-secondary)"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="17.5"
                        cy="18"
                        r="4"
                        stroke="var(--text-secondary)"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.49994 14.5L2.5 21.5M2.50006 14.5L9.5 21.5"
                        stroke="var(--text-secondary)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </OverlayTrigger>
              </div>
              <div
                className={`shapeMenu ${
                  showShapesMenu ? "active rounded-2" : ""
                }`}
              >
                {showShapesMenu && !selectShapesMenu && (
                  <div className="dropdownContent">
                    <ul className="shapes-menu list-unstyled py-2 px-2 position-absolute top-0 start-100 bg-white rounded-2 border">
                      {shapesDropdownItems.map((shape, index) => (
                        <li
                          key={index}
                          className={`py-2 w-100 d-flex align-items-center ms-auto cursor-pointer ${
                            activeIcon === shape.label ? "active rounded-2" : ""
                          }`}
                          onClick={() => {
                            if (shape.isMoreOption) {
                              handleMoreOptionClick();
                            } else {
                              handleShapeClick(shape.label);
                              setActiveIcon(shape.label);
                            }
                          }}
                        >
                          {shape.isMoreOption ? (
                            <img
                              src={MoreArrow}
                              className="fillImg1 img-fluid d-flex justify-content-end m-auto"
                            />
                          ) : (
                            <img
                              src={shape.image}
                              alt={shape.label}
                              className={`fillImg1 px-2 ${
                                activeIcon === shape.label ? "active-icon" : ""
                              }`}
                            />
                          )}
                          <label
                            className={`menuTextHeader text-black fs-6 ps-1 cursor-pointer ${
                              activeIcon === shape.label ? "active-label" : ""
                            }`}
                          >
                            {shape.label}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div onClick={() => handleShapeClick("text")}>
              <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="text-tooltip">Text</Tooltip>}
              >
                <a
                  href="#"
                  className={`cursor-pointer border-2  border-bottom ${
                    activeIcon === "text" && selectedShapeType
                      ? "active rounded-2"
                      : ""
                  }`}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={activeIcon === "text" && selectedShapeType ? "fillImg4" : ""}

                  >
                    <path
                      d="M15 21H9"
                      stroke="var(--text-secondary)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12.5 3C12.5 2.72386 12.2761 2.5 12 2.5C11.7239 2.5 11.5 2.72386 11.5 3H12.5ZM11.5 21C11.5 21.2761 11.7239 21.5 12 21.5C12.2761 21.5 12.5 21.2761 12.5 21H11.5ZM11.5 3V21H12.5V3H11.5Z"
                      fill="var(--text-secondary)"
                    />
                    <path
                      d="M19 6C19 5.37191 19 5.05787 18.9194 4.78267C18.7518 4.21026 18.3066 3.71716 17.7541 3.49226C17.4886 3.38413 17.1885 3.35347 16.5884 3.29216C15.1695 3.14718 13.3874 3 12 3C10.6126 3 8.83047 3.14718 7.41161 3.29216C6.8115 3.35347 6.51144 3.38413 6.24586 3.49226C5.69344 3.71716 5.24816 4.21026 5.08057 4.78267C5 5.05787 5 5.37191 5 6"
                      stroke="var(--text-secondary)"
                      strokeLinecap="round"
                    />
                  </svg>
                </a>
              </OverlayTrigger>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
