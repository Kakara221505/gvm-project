import React, { useState, useEffect } from "react";
import "./PropertySidebar.css";
import { OverlayTrigger, Tooltip, Form, InputGroup } from "react-bootstrap";
import { fabric } from "fabric";
import FillSettings from "./FillSettings/FillSettings";
import TextSettings from "./TextSettings/TextSettings";
import StrokeSettings from "./StrokeSettings/StrokeSettings";
import CommentSettings from "./CommentSettings/CommentSettings";
import TitleSettings from "./TitleSettings/TitleSettings";
import IconSettings from "./IconSettings/IconSettings";
import { useShapeContext } from "../../../../../contexts/shapeContext";
import prop from "../../../../../Assets/Icons/Property.png";
import CommonColorPicker from "../../../../../Components/CommonColorPicker/CommonColorPicker";

export default function PropertySidebar({
  canvasBackgroundColor,
  backgroundColor,
  filesPreviewShape,
}) {
  const { state, actions } = useShapeContext();
  const { selectedObject, X_Cord, Y_Cord, currentObjHeight, currentObjWidth } =
    state;

  const [fillType, setFillType] = useState("Solid");
  const [fillColor, setFillColor] = useState("#ffffff");
  const [color1, setColor1] = useState("#1DB8CE");
  const [color2, setColor2] = useState("#FFFFFF");
  const [fillEnabled, setFillEnabled] = useState(true);
  const [selectedPattern, setSelectedPattern] = useState("Diagonal");
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [xPosition, setXPosition] = useState(0);
  const [yPosition, setYPosition] = useState(0);

  useEffect(() => {
    // Round off X and Y coordinates to two decimal places
    const roundedX = (Math.round(X_Cord * 100) / 100).toFixed(2);
    const roundedY = (Math.round(Y_Cord * 100) / 100).toFixed(2);
    setXPosition(roundedX);
    setYPosition(roundedY);
  }, [X_Cord, Y_Cord]);

  useEffect(() => {
    // Round off height and width to two decimal places
    const roundedHeight = Math.round(currentObjHeight * 100) / 100;
    const roundedWidth = Math.round(currentObjWidth * 100) / 100;
    setHeight(roundedHeight);
    setWidth(roundedWidth);
  }, [currentObjHeight, currentObjWidth]);

  const fillProps = {
    fillType,
    setFillType,
    fillColor,
    setFillColor,
    color1,
    setColor1,
    color2,
    setColor2,
    fillEnabled,
    setFillEnabled,
    selectedPattern,
    setSelectedPattern,
  };

  const { strokeColor, strokeWidth } = state.properties;

  useEffect(() => {
    // Update the input fields when a new object is selected
    if (selectedObject) {
      setWidth(parseInt(selectedObject?.width) || 0);
      setHeight(parseInt(selectedObject?.height) || 0);
      setXPosition(parseInt(selectedObject?.left) || 0);
      setYPosition(parseInt(selectedObject?.top) || 0);
    }
  }, [selectedObject]);

  const handleWidthChange = (e) => {
    const newWidth = parseInt(e.target.value);
    setWidth(newWidth);
    if (selectedObject) {
      selectedObject.set("scaleX", newWidth / selectedObject.width);
      updateShapeProperty("width", newWidth);
    }
  };

  const handleHeightChange = (e) => {
    const newHeight = parseFloat(e.target.value);
    setHeight(newHeight);
    if (selectedObject) {
      selectedObject.set("scaleY", newHeight / selectedObject.height);
      updateShapeProperty("height", newHeight);
    }
  };

  const handleBackgroundColorChange = (colorBG) => {
    canvasBackgroundColor(colorBG); // Call the setter function to update the background color state
  };

  const handleXPositionChange = (e) => {
    const newX = parseFloat(e.target.value);
    setXPosition(newX);
    if (selectedObject) {
      selectedObject.set("left", newX);
      updateShapeProperty("left", newX);
    }
  };

  const handleYPositionChange = (e) => {
    const newY = parseFloat(e.target.value);
    setYPosition(newY);
    if (selectedObject) {
      selectedObject.set("top", newY);
      updateShapeProperty("top", newY);
    }
  };

  function changeFontProperty(field, value, isFlag) {
    updateShapeProperty(field, value, isFlag);
    const payload = { field, value };
    actions.updateProperties(payload);
  }

  function changeStrokeProperty(field, value, isFlag) {
    updateShapeProperty(field, value, isFlag);
    // const payload = { field, value };
    // actions.updateProperties(payload);
  }

  function changeTextProperty(field, value, isFlag) {
    updateShapeProperty(field, value, isFlag);
    const payload = { field, value };
    actions.updateProperties(payload);
  }

  const capitalizeFirstLetter = (text) => {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  function updateShapeProperty(field, value, isFlag) {
    if (selectedObject) {
      if (isFlag) {
        selectedObject.setSelectionStyles({ [field]: value });
      } else {
        selectedObject.set({ [field]: value });
      }
      selectedObject.setCoords(); // Update the coordinates after setting new properties
      actions.updateCanvas(); // Trigger canvas update
    }
    let text = selectedObject?.text;
    let beforeSelection = text?.slice(0, selectedObject?.selectionStart);
    let selectedText = text?.slice(
      selectedObject?.selectionStart,
      selectedObject?.selectionEnd
    );
    let afterSelection = text?.slice(selectedObject?.selectionEnd);
    switch (field) {
      case "fillColor":
        if (isFlag) {
          selectedObject.setSelectionStyles({ fill: value });
        } else {
          selectedObject.set({
            fill: getFillValue(field, value),
          });
        }
        break;
      case "fillType":
        if (isFlag) {
          selectedObject.setSelectionStyles({
            fill: getFillValue(field, value),
          });
        } else {
          selectedObject.set({
            fill: getFillValue(field, value),
          });
        }
        break;
      case "color1":
        if (isFlag) {
          selectedObject.setSelectionStyles({
            fill: getFillValue(field, value),
          });
        } else {
          selectedObject.set({
            fill: getFillValue(field, value),
          });
        }
        break;
      case "color2":
        if (isFlag) {
          selectedObject.setSelectionStyles({
            fill: getFillValue(field, value),
          });
        } else {
          selectedObject.set({
            fill: getFillValue(field, value),
          });
        }
        break;
      case "pattern":
        if (isFlag) {
          selectedObject.setSelectionStyles({
            fill: getFillValue(field, value),
          });
        } else {
          selectedObject.set({
            fill: getFillValue(field, value),
          });
        }
        break;
      case "strokeColor":
        selectedObject.set({
          stroke: value || "#000000",
        });
        break;
      case "strokeWidth":
        selectedObject?.set({
          strokeWidth: value || 2,
        });
        break;
      case "strokeType":
        selectedObject.set({
          strokeDashArray:
            value === "Dashed" ? [5, 5] : value === "Dotted" ? [1, 5] : null,
        });
        break;
      case "fontSize":
        if (isFlag) {
          selectedObject.setSelectionStyles("fontSize", value ? value : "");
        } else {
          selectedObject.set(field, value ? value : "12");
        }
        break;
      case "fontFamily":
        if (isFlag) {
          selectedObject.setSelectionStyles("fontFamily", value ? value : "");
        } else {
          selectedObject.set("fontFamily", value ? value : "");
        }
        break;
      case "fontWeight":
        if (isFlag) {
          selectedObject.setSelectionStyles(field, value ? value : "");
        } else {
          selectedObject.set(field, value ? value : "");
        }
        break;
      case "textAlign":
        selectedObject.set(field, value ? value : "");
        break;
      case "textDecoration":
        switch (value) {
          case "underline":
            if (isFlag) {
              selectedObject.setSelectionStyles({ linethrough: "" });
              selectedObject.setSelectionStyles({ underline: value });
            }
            break;
          case "overline":
            selectedObject.set("underline", false);
            selectedObject.set("overline", true);
            selectedObject.set("linethrough", false);
            break;
          case "linethrough":
            if (isFlag) {
              selectedObject.setSelectionStyles({ underline: "" });
              selectedObject.setSelectionStyles({ linethrough: value });
            }
            break;
          default:
            break;
        }
        break;
      case "textTransform":
        switch (value) {
          case "Uppercase":
            if (isFlag) {
              selectedObject.set(
                "text",
                beforeSelection + selectedText.toUpperCase() + afterSelection
              );
            }
            //  else {
            //   selectedObject.set("text", selectedObject?.text.toUpperCase());
            // }
            break;
          case "Lowercase":
            if (isFlag) {
              selectedObject.set(
                "text",
                beforeSelection + selectedText.toLowerCase() + afterSelection
              );
            }
            //  else {
            //   selectedObject.set("text", selectedObject?.text.toLowerCase());
            // }
            break;
          case "capitalize":
            if (isFlag) {
              selectedObject.set(
                "text",
                capitalizeFirstLetter(
                  beforeSelection + selectedText.toLowerCase() + afterSelection
                )
              );
            }
            break;
          default:
            // Default case
            break;
        }
        break;
      case "opacity":
        selectedObject.set("opacity", value ? value : "");
        break;

      default:
        break;
    }
  }

  const getFillValue = (field, value) => {
    if (field === "fillType") {
      switch (value) {
        case "Solid":
          return fillEnabled ? value : "#fff";
        case "Gradient":
          return createGradientFill();
        case "Image":
          return createImageFill();
        case "Pattern":
          return createHatchFill(value);
        default:
          return "";
      }
    } else {
      switch (fillType) {
        case "Solid":
          return fillEnabled ? value : "#fff";
        case "Gradient":
          return createGradientFill();
        case "image":
          return createImageFill();
        case "Pattern":
          return createHatchFill(value);
        default:
          return "";
      }
    }
  };

  const createGradientFill = () => {
    const gradient = new fabric.Gradient({
      type: "linear",
      gradientUnits: "pixels",
      coords: { x1: 0, y1: 0, x2: 0, y2: 200 },
      colorStops: [
        { offset: 0, color: color1 },
        { offset: 1, color: color2 },
      ],
    });
    return gradient;
  };

  const createImageFill = () => {
    // return imageURL;
  };

  const createHatchFill = (pattern) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 20;
    canvas.height = 20;

    switch (pattern) {
      case "Diagonal":
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(20, 20);
        ctx.stroke();
        break;
      case "Horizontal":
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;

        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(20, 10);
        ctx.stroke();
        break;
      case "Vertical":
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;

        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(10, 20);
        ctx.stroke();
        break;
      default:
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(20, 20);
        ctx.stroke();
    }

    const patternType = new fabric.Pattern({
      source: canvas,
      repeat: "repeat",
    });

    return patternType;
  };
  return (
    <section className="pt-2 propertyMainSide border-bottom">
      <div className="">
        <div className="row d-flex align-items-center py-3 mx-0 border-bottom border-2">
          <div className="col-lg-9 d-flex align-items-center me-auto">
            <svg
              className=""
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
            <label className="ps-2 yellowText"> Property Explorer</label>
          </div>
          {/* <div className="col-lg-3 invisible border-start">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <Form.Select
                    className="border-0 "
                    aria-label="Default select example"
                  >
                    <option>Page 1</option>
                    <option value="1">2</option>
                    <option value="2">3</option>
                    <option value="3">4</option>
                  </Form.Select>
                </div>
                <div className="addLayer cursor-pointer">
                  <img src={prop} className="d-flex adIc  ms-auto px-2" />
                </div>
              </div>
            </div> */}
        </div>

        <nav id="main-menu" className="p-2 pt-0">
          <ul className="nav-bar d-flex justify-content-between mt-0 ps-0 col-lg-12">
            {selectedObject && (
              <li className="nav-button-home">
                <div className="d-flex align-items-center propertyTextContainer my-4 mb-0">
                  <InputGroup className="pe-2 ">
                    <InputGroup.Text className="propertyTextBox border-end-0 border-start-0 border-top-0 border-bottom-0">
                      X
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      value={xPosition}
                      onChange={handleXPositionChange}
                      className="propertyTextBox border-start  border-top-0 border-bottom-0 border-end-0"
                      placeholder="X Position"
                    />
                  </InputGroup>
                  <InputGroup className=" pe-0 ps-2">
                    <InputGroup.Text className="propertyTextBox border-start-0 border-top-0 border-bottom-0">
                      Y
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      value={yPosition}
                      onChange={handleYPositionChange}
                      className="propertyTextBox border-start  border-top-0 border-bottom-0 border-end-0 "
                      placeholder="Y Position"
                    />
                  </InputGroup>
                </div>
              </li>
            )}
          </ul>

          <ul className="nav-bar d-flex justify-content-between mt-0 ps-0 col-lg-12">
            {selectedObject && (
              <li className="nav-button-home">
                <div className="d-flex align-items-center propertyTextContainer col-lg-8">
                  <InputGroup className="pe-2">
                    <InputGroup.Text className="propertyTextBox border-end-0 border-start-0 border-top-0 border-bottom-0">
                      W
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      value={width}
                      onChange={handleWidthChange}
                      className="propertyTextBox border-start  border-top-0 border-bottom-0 border-end-0"
                      placeholder="Width"
                    />
                  </InputGroup>
                  <InputGroup className=" pe-0 ps-2">
                    <InputGroup.Text className="propertyTextBox border-start-0 border-top-0 border-bottom-0">
                      H
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      value={height}
                      onChange={handleHeightChange}
                      className="propertyTextBox border-start  border-top-0 border-bottom-0 border-end-0 "
                      placeholder="Height"
                    />
                  </InputGroup>
                </div>
              </li>
            )}
            {!selectedObject && (
              <li>
                <CommonColorPicker
                  value={backgroundColor}
                  onChange={(e) => handleBackgroundColorChange(e)}
                />
              </li>
            )}
          </ul>

          <hr className="hrColor py-0 my-0" />
          {selectedObject && (
            <>
              <FillSettings
                changeProperty={changeFontProperty}
                fillProps={fillProps}
                filesPreviewShape={filesPreviewShape}
              />
              <hr className="hrColor py-0 my-0" />
              {selectedObject?.type === "textbox" && (
                <TextSettings changeProperty={changeTextProperty} />
              )}
              <hr className="hrColor py-0 my-0" />
              <StrokeSettings changeProperty={changeStrokeProperty} />
              {selectedObject?.type !== "textbox" && (
                <>
                  <hr className="hrColor py-0 my-0" />
                  <CommentSettings />
                  <hr className="hrColor py-0 my-0" />
                  <TitleSettings />
                  <IconSettings />
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </section>
  );
}
