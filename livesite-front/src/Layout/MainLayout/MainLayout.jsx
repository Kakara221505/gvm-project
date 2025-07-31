import React, { useState, useEffect, useContext } from "react";
import "./MainLayout.css";
import MainLeftSideBar from "./MainLeftSideBar/MainLeftSideBar";
import { fabric } from "fabric";
import MainRightSidebar from "./MainRightSidebar/MainRightSidebar";
import MainLayoutArea from "./MainLayoutArea/MainLayoutArea";
import LandingHeader from "../LandingLayout/LandingHeader/LandingHeader";
import EditorFooter from "./EditorLayout/EditorFooter/EditorFooter";
import toggleFooterBtn from "../../Assets/Icons/arrow-up-double-sharp.png";
import { ShapeProvider } from "../../contexts/shapeContext";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import downArrow from "../../Assets/Icons/ChevronArrow.png";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useShapeContext } from "../../../src/contexts/shapeContext.js";
import { ThemeContext } from "../../Theme/ThemeContext.jsx";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "react-toastify";
import saveData from "../../Components/SaveData/SaveEditorData.js";
import { postApiCaller } from "../../Lib/apiCaller.js";
import { GlobalValues } from "../../Lib/GlobalValues.js";

function Sidebar({
  side,
  onToggle,
  setShapeToDraw,
  backgroundColor,
  canvasBackgroundColor,
  filesPreviewShape,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const handleToggle = () => {
    setCollapsed(!collapsed);
    onToggle(!collapsed);
  };

  return (
    <>
      <div className="position-relative border-start bgDarkLightSide">
        {side === "right" && (
          <div
            className="handle d-flex mt-3  justify-content-basel align-items-center position-absolute top-0  start-0"
            onClick={handleToggle}
          >
            <button className="rightBtn border-end-0 rounded-4">
              <div className="triangle-right w-auto">
                <img
                  src={toggleFooterBtn}
                  className="img-fluid rightImg"
                  alt="ss"
                />
              </div>
            </button>
          </div>
        )}
        <aside
          className={`sidebar1 ${side}-sidebar ${collapsed ? "collapsed" : ""}`}
        >
          <div className="sidebar-content">
            {side === "left" ? (
              <div className="scrollable">
                <MainLeftSideBar
                  setShapeToDraw={setShapeToDraw}
                  filesPreviewShape={filesPreviewShape}
                  backgroundColor={backgroundColor}
                  canvasBackgroundColor={canvasBackgroundColor}
                />
              </div>
            ) : (
              <div className="scrollable">
                <MainRightSidebar />
              </div>
            )}
          </div>
        </aside>
        {side === "left" && (
          <div
            className="handle d-flex mt-3  justify-content-basel align-items-center position-absolute top-0  end-0"
            onClick={handleToggle}
          >
            {/* <button className="z-1 leftBtn border-start-0 rounded-4">
              <div className="triangle-left w-auto">
                <img
                  src={toggleFooterBtn}
                  className="img-fluid leftImg"
                  alt="ss"
                />
              </div>
            </button> */}
          </div>
        )}
      </div>
    </>
  );
}

function MainLayout() {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const { state, actions } = useShapeContext();
  const { selectedObject, pages, currentUser, activeCanvas } = state;
  const [shapeToDraw, setShapeToDraw] = useState("");
  const [filePreview, setFilePreview] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#f7f7fa");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [fillColor, setFillColor] = useState("#ffffff");
  const [filePreviewShape, setFilePreviewShape] = useState("");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikeThrough, setIsStrikeThrough] = useState(false);
  const [textSize, setTextSize] = useState(20);
  const [count, setCount] = useState(2);
  const [action, setAction] = useState("");
  const [isBorderType, IsBorderType] = useState("Solid");
  const [selectedFont, setSelectedFont] = useState("Arial"); // State to store the selected font
  const [layersList, setLayersList] = useState(); // State to store the selected font
  const [selectedLayer, setSelectedLayer] = useState(); // State to store the selected font
  const { theme, toggleTheme } = useContext(ThemeContext);
  var isFlag = null;
  let propertiesColor = {
    fillColor: "",
    strokeColor: "",
  };
  const { headers, getDate, token, projectId } = GlobalValues();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // projects && saveData(projects, state, backgroundColor)
  }, [projects]);

  useEffect(() => {
    setSelectedLayer(currentUser);
    if (selectedObject) {
      setTextSize(selectedObject?.fontSize);
      setSelectedFont(selectedObject?.fontFamily);
    }
  }, [currentUser, selectedObject]);

  useEffect(() => {
    setLoading(false);
  }, [projectId, navigate]);

  useEffect(() => {
    const findCanvasIndex = pages.findIndex(
      (res) => res.ID === state.activeCanvas
    );
    if (findCanvasIndex !== -1) {
      setLayersList(pages[findCanvasIndex].calendar.layers);
    }
  }, [pages]);

  const updateFunctionData = () => {
    if (!selectedObject?.isEditing) {
      isFlag = false;
    }
    // if (strokeColor !== "#00000" || !selectedObject?.isEditing) {
    //   isFlag = true;
    // }
    const selectionStart = selectedObject?.selectionStart;
    const selectionEnd = selectedObject?.selectionEnd;

    if (selectionStart !== selectionEnd) {
      var selectedText = selectedObject?.text.slice(
        selectionStart,
        selectionEnd
      );
      if (selectedText != "") {
        isFlag = true;
      }
    }
    // if (selectedObject && selectedObject.type === "textbox") {
    switch (action) {
      case "bold":
        console.log("calling");
        changeTextProperty("fontWeight", isBold ? "bold" : "", isFlag);
        // selectedObject.setSelectionStyles({ fontWeight: 'bold' });
        break;

      case "italic":
        changeTextProperty("fontStyle", isItalic ? "italic" : "", isFlag);
        // selectedObject.setSelectionStyles({ fontStyle: 'italic' });
        break;

      case "underline":
        changeTextProperty(
          "textDecoration",
          isUnderline ? "underline" : "none",
          isFlag
        );
        break;
      case "strike-through":
        changeTextProperty(
          "textDecoration",
          isStrikeThrough ? "line-through" : "none",
          isFlag
        );
        // selectedObject.setSelectionStyles({ textDecoration: 'underline' });
        break;
    }
    // canvas.renderAll();
    // }
  };

  function changeTextProperty(field, value, isFlag) {
    const payload = { field, value };
    actions.updateProperties(payload);
    updateShapeProperty(field, value, isFlag);
  }

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
    switch (field) {
      case "strokeColor":
        if (isFlag) {
          selectedObject?.setSelectionStyles({ stroke: value || "#000000" });
        } else {
          selectedObject?.set({
            stroke: value || "#000000",
          });
        }
        break;
      case "strokeWidth":
        selectedObject?.set({
          strokeWidth: value || 2,
        });
        break;
      case "strokeType":
        selectedObject?.set({
          strokeDashArray:
            value === "Dashed" ? [5, 5] : value === "Dotted" ? [1, 5] : null,
        });
        break;
      case "fillColor":
        if (isFlag) {
          selectedObject?.setSelectionStyles({ fill: value || "#000000" });
        } else {
          selectedObject?.set({
            fill: value || "#ffffff",
          });
        }
        break;
      case "textAlign":
        selectedObject?.set(field, value ? value : "");
        break;
      case "fontSize":
        if (isFlag) {
          selectedObject?.setSelectionStyles("fontSize", value ? value : "");
        } else {
          selectedObject?.set(field, value ? value : "12");
        }
        break;
      case "fontFamily":
        if (isFlag) {
          selectedObject?.setSelectionStyles("fontFamily", value ? value : "");
        } else {
          selectedObject?.set("fontFamily", value ? value : "");
        }
        break;
      case "fontWeight":
        if (isFlag) {
          selectedObject?.setSelectionStyles(field, value ? value : "");
        } else {
          selectedObject?.set(field, value ? value : "");
        }
        break;
      case "textAlign":
        if (isFlag) {
          selectedObject?.setSelectionStyles(field, value ? value : "");
        } else {
          selectedObject?.set(field, value ? value : "");
        }
        break;
      case "textDecoration":
        switch (value) {
          case "underline":
            if (isFlag && isUnderline) {
              selectedObject?.setSelectionStyles({ underline: value });
            }
            break;
          case "line-through":
            if (isFlag && isStrikeThrough) {
              selectedObject?.setSelectionStyles({ linethrough: value });
            }
            break;
          case "none":
            if (isFlag && !isStrikeThrough) {
              selectedObject?.setSelectionStyles({ linethrough: "" });
            }
            if (isFlag && !isUnderline) {
              selectedObject?.setSelectionStyles({ underline: "" });
            }
            break;

          default:
            break;
        }

        break;
      case "textTransform":
        switch (value) {
          case "Uppercase":
            selectedObject?.set("text", selectedObject.text.toUpperCase());
            break;
          case "Lowercase":
            selectedObject?.set("text", selectedObject.text.toLowerCase());
            break;
          case "Capitalize":
            selectedObject?.set(
              "text",
              capitalizeFirstLetter(selectedObject.text)
            );
            break;
          default:
            // Default case
            break;
        }
        break;
      case "opacity":
        selectedObject?.set(field, value ? value : "");
        break;
      default:
        break;
    }
  }

  // Function to handle selection of font from the dropdown
  const handleFontSelect = (selectedFont) => {
    updateFunctionData();
    setSelectedFont(selectedFont);
    changeTextProperty("fontFamily", selectedFont, isFlag);
  };

  useEffect(() => {
    if (selectedObject) {
      setFillColor(selectedObject.fill);
      setStrokeColor(selectedObject.stroke);
    } else {
      SelectColor();
    }
  }, [selectedObject]);

  useEffect(() => {
    SelectColor();
  }, [currentUser]);

  const SelectColor = () => {
    const pageIndex = pages.findIndex((res) => res.ID === activeCanvas);
    if (pageIndex !== -1) {
      pages[pageIndex].calendar.layers.forEach((item) => {
        if (item.ID === currentUser) {
          // item[field] = value;
          propertiesColor.fillColor = item.fillColor;
          propertiesColor.strokeColor = item.strokeColor;
          setFillColor(item.fillColor);
          setStrokeColor(item.strokeColor);
        }
      });
    }
  };

  const handleLayerSelect = (selectedLayer) => {
    setSelectedLayer(selectedLayer);
    actions.resetShape();
    actions.updateCurrentUser(selectedLayer);
    const findIndex = pages.findIndex((res) => res.ID === activeCanvas);
    pages[findIndex].calendar.layers.map((result) => {
      if (result.ID === selectedLayer) {
        const propertiesObject = {
          fillColor: result.fillColor,
          strokeColor: result.strokeColor,
        };
        for (const [key, value] of Object.entries(propertiesObject)) {
          const payload = { field: key, value: value };
          actions.updateProperties(payload);
        }
      }
    });
  };

  const handleBorderSelect = (selectedItem) => {
    IsBorderType(selectedItem);
    changeStrokeProperty("strokeType", selectedItem);
  };

  const handleBorderWidthChange = (e) => {
    if (selectedObject?.type === "textbox") {
      return;
    }
    setCount(parseInt(e.target.value));
    changeStrokeProperty("strokeWidth", parseInt(e.target.value));
  };

  const capitalizeFirstLetter = (text) => {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  useEffect(() => {
    updateFunctionData();
  }, [
    selectedObject,
    action,
    isBold,
    isItalic,
    isUnderline,
    isStrikeThrough,
    textSize,
    selectedFont,
  ]);

  const toggleLeft = () => {
    setLeftCollapsed(!leftCollapsed);
  };

  const toggleRight = () => {
    setRightCollapsed(!rightCollapsed);
  };

  const filesPreview = (filePreview) => {
    setFilePreview(filePreview);
  };

  const filesPreviewShape = (filePreviewShape) => {
    setFilePreviewShape(filePreviewShape);
  };

  const chnageBGColor = (colorBG) => {
    setBackgroundColor(colorBG);
  };

  useEffect(() => {}, [setFilePreview, backgroundColor, filePreviewShape]);

  function changeLayerColor(field, value) {
    const payload = {
      canvasId: activeCanvas,
      layerId: currentUser,
      [field]: value,
    };
    const payload1 = { field, value };
    actions.updateProperties(payload1);
    actions.updateLayer(payload);
  }

  function changeFontProperty(field, value, isFlag) {
    const payload = { field, value };
    actions.updateProperties(payload);
    if (!selectedObject) {
      return;
    }
    updateShapeProperty(field, value, isFlag);
  }

  function changeStrokeProperty(field, value, isFlag) {
    const payload = { field, value };
    actions.updateProperties(payload);
    if (!selectedObject) {
      return;
    }
    updateShapeProperty(field, value, isFlag);
  }

  const handleAlignIconClick = (index) => {
    switch (index) {
      case 0:
        changeTextProperty("textAlign", "left");
        break;
      case 1:
        changeTextProperty("textAlign", "center");
        break;
      case 2:
        changeTextProperty("textAlign", "right");
        break;
      case 3:
        changeTextProperty("textAlign", "justify");
        break;

      default:
        break;
    }
  };

  const handleChangeFontSize = (e) => {
    updateFunctionData();
    setTextSize(e.target.value);
    changeTextProperty("fontSize", e.target.value, isFlag);
  };
  return (
    <div>
      {/* <ShapeProvider> */}
      <div className="layout-container">
        <div className="sticky-top">
          <LandingHeader
            filesPreview={filesPreview}
            toggleTheme={toggleTheme}
          />
          <div className="d-flex border-bottom header py-0">
            <p className="align-content-center lightText mb-0 mx-4 fs-6 fw-bold">
              {projectName}
            </p>
            <div className="childHead my-1 py-2 bg-red d-flex align-items-center">
              <div className="ps-0 catMain">
                <InputGroup
                  className={`${
                    selectedFont !== "Arial" ? `fontCatSome` : `fontCat`
                  }`}
                >
                  <Dropdown onSelect={handleFontSelect}>
                    <Dropdown.Toggle
                      variant="outline-secondary"
                      className="px-1 border-end"
                      id="input-group-dropdown-3"
                    >
                      {selectedFont}
                      <img
                        src={downArrow}
                        className="img-fluid w-25"
                        alt="Dropdown Arrow"
                      />
                    </Dropdown.Toggle>

                    <Dropdown.Menu id="drpMenu" className='px-2'>
                      <Dropdown.Item eventKey="Arial">Arial</Dropdown.Item>
                      <Dropdown.Item eventKey="Sul Sans">
                        Sul Sans
                      </Dropdown.Item>
                      <Dropdown.Item eventKey="Calibri">Calibri</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>

                  <Form.Control
                  className='px-2'
                    id="textDro"
                    type="number"
                    aria-label=""
                    value={textSize}
                    onChange={(e) => {
                      handleChangeFontSize(e);
                    }}
                  />
                </InputGroup>
              </div>

              <div className="catMain border-start">
                <div className="d-flex justify-content-around">
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<Tooltip id="tooltip-bold">Bold</Tooltip>}
                  >
                    <button
                      className={`boldIc ${
                        isBold ? "bg-primary" : ""
                      } border-0 rounded-2 cursor-pointer`}
                      onClick={() => {
                        setIsBold(!isBold);
                        setAction("bold");
                      }}
                    >
                      <i className="fa fa-bold fs-6 lightText" />
                    </button>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<Tooltip id="tooltip-italic">Italic</Tooltip>}
                  >
                    <div
                      className={`boldIc ${
                        isItalic ? "bg-primary" : ""
                      } rounded-2 cursor-pointer`}
                      onClick={() => {
                        setAction("italic");
                        setIsItalic(!isItalic);
                      }}
                    >
                      <i className="fa fa-italic  lightText fs-6" />
                    </div>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="bottom"
                    overlay={
                      <Tooltip id="tooltip-underline">Underline</Tooltip>
                    }
                  >
                    <div
                      className={`boldIc ${
                        isUnderline ? "bg-primary" : ""
                      } rounded-2 cursor-pointer`}
                      onClick={() => {
                        setAction("underline");
                        setIsUnderline(!isUnderline);
                      }}
                    >
                      <i className="fa fa-underline  lightText fs-6" />
                    </div>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="bottom"
                    overlay={
                      <Tooltip id="tooltip-strikethrough">
                        Strikethrough
                      </Tooltip>
                    }
                  >
                    <div
                      className={`boldIc ${
                        isStrikeThrough ? "bg-primary" : ""
                      }  rounded-2 cursor-pointer`}
                      onClick={() => {
                        setAction("strike-through");
                        setIsStrikeThrough(!isStrikeThrough);
                      }}
                    >
                      <i className="fa fa-strikethrough lightText fs-6" />
                    </div>
                  </OverlayTrigger>
                </div>
              </div>
              <div className="catMain border-start">
                <div className="d-flex justify-content-around align-items-center">
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<Tooltip id="tooltip-left">Align Left</Tooltip>}
                  >
                    <div
                      className={`boldIc rounded-2 cursor-pointer`}
                      onClick={() => handleAlignIconClick(0)}
                    >
                      <i className="fa fa-align-left lightText fs-6" />
                    </div>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="bottom"
                    overlay={
                      <Tooltip id="tooltip-center">Align Center</Tooltip>
                    }
                  >
                    <div
                      className={`boldIc rounded-2 cursor-pointer`}
                      onClick={() => handleAlignIconClick(1)}
                    >
                      <i className="fa fa-align-center lightText fs-6" />
                    </div>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<Tooltip id="tooltip-right">Align Right</Tooltip>}
                  >
                    <div
                      className={`boldIc  rounded-2 cursor-pointer`}
                      onClick={() => handleAlignIconClick(2)}
                    >
                      <i className="fa fa-align-right lightText fs-6" />
                    </div>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="bottom"
                    overlay={
                      <Tooltip id="tooltip-justify">Align Justify</Tooltip>
                    }
                  >
                    <div
                      className={`boldIc  rounded-2 cursor-pointer`}
                      onClick={() => handleAlignIconClick(3)}
                    >
                      <i className="fa fa-align-justify lightText fs-6" />
                    </div>
                  </OverlayTrigger>
                  <br />
                </div>
              </div>
              <div className="catMain border-start">
                <Form.Select
                  id="input-group-dropdown-0"
                  aria-label="Default select example"
                  value={selectedLayer}
                  onChange={(e) => handleLayerSelect(e.target.value)}
                >
                  {layersList?.map((layer, index) => {
                    return (
                      <option value={layer.ID} key={index}>
                        {layer.Name}
                      </option>
                    );
                  })}
                </Form.Select>
              </div>
              <div className="catMain border-start px-2 ">
                <div className="d-flex justify-content-around">
                  <div className="d-flex flex-column align-items-center">
                    <OverlayTrigger
                      placement="bottom"
                      overlay={<Tooltip id="tooltip-bold">Fill</Tooltip>}
                    >
                      <input
                        id="colorPick"
                        type="color"
                        value={fillColor}
                        onChange={(e) => {
                          setFillColor(e.target.value);
                          changeFontProperty(
                            "fillColor",
                            e.target.value,
                            selectedObject?.selectable ? false : true
                          );
                          changeLayerColor("fillColor", e.target.value);
                        }}
                      />
                    </OverlayTrigger>
                  </div>
                  <div className="d-flex flex-column align-items-center px-2">
                    <OverlayTrigger
                      placement="bottom"
                      overlay={<Tooltip id="tooltip-bold">Stroke</Tooltip>}
                    >
                      <input
                        id="colorPick"
                        type="color"
                        value={strokeColor}
                        onChange={(e) => {
                          setAction("strokeColor");
                          setStrokeColor(e.target.value);
                          if (selectedObject?.fontFamily) {
                            changeStrokeProperty(
                              "textBackgroundColor",
                              e.target.value,
                              selectedObject?.selectable ? false : true
                            );
                          } else {
                            changeStrokeProperty(
                              "strokeColor",
                              e.target.value,
                              selectedObject?.selectable ? false : true
                            );
                          }
                          changeLayerColor("strokeColor", e.target.value);
                        }}
                      />
                    </OverlayTrigger>
                  </div>
                </div>
              </div>

              <div className="catMain border-start">
                <InputGroup className="fontCat1">
                  <Dropdown onSelect={handleBorderSelect}>
                    <Dropdown.Toggle
                      variant="outline-secondary"
                      className="px-1 py-1 border-end lineBtn d-flex justify-content-around align-items-center"
                      id="input-group-dropdown-3"
                    >
                      {isBorderType === "Solid" && (
                        <img
                          src="https://cdn-icons-png.flaticon.com/128/271/271207.png"
                          className="lineico1"
                        />
                      )}
                      {isBorderType === "Dashed" && (
                        <img
                          src="https://cdn-icons-png.flaticon.com/128/9974/9974562.png"
                          className="lineico1"
                        />
                      )}
                      {isBorderType === "Dotted" && (
                        <img
                          src="https://cdn-icons-png.flaticon.com/128/512/512142.png"
                          className="lineico1"
                        />
                      )}
                      <img
                        src={downArrow}
                        className="caaretImg"
                        alt="Dropdown Arrow"
                      />
                    </Dropdown.Toggle>

                    <Dropdown.Menu id="drpMenu">
                      <Dropdown.Item
                        className="d-flex justify-content-center py-0"
                        id="fontFam"
                        eventKey={"Solid"}
                      >
                        <img
                          src="https://cdn-icons-png.flaticon.com/128/271/271207.png"
                          className="w-25"
                        />
                      </Dropdown.Item>
                      <Dropdown.Item
                        className="d-flex justify-content-center py-0"
                        id="fontFam"
                        eventKey={"Dashed"}
                      >
                        <img
                          src="https://cdn-icons-png.flaticon.com/128/9974/9974562.png"
                          className="w-25"
                        />
                      </Dropdown.Item>
                      <Dropdown.Item
                        className="d-flex justify-content-center py-0"
                        id="fontFam"
                        eventKey={"Dotted"}
                      >
                        <img
                          src="https://cdn-icons-png.flaticon.com/128/512/512142.png"
                          className="w-25"
                        />
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>

                  <Form.Control
                    id="textDro"
                    type="number"
                    className=""
                    value={count}
                    onChange={(e) => handleBorderWidthChange(e)}
                    min={1}
                  />
                </InputGroup>
              </div>
            </div>
          </div>
        </div>
        <div className="editorAreaHeight">
          <div className="content">
            <Sidebar
              side="left"
              onToggle={toggleLeft}
              filesPreviewShape={filesPreviewShape}
              setShapeToDraw={setShapeToDraw}
              backgroundColor={backgroundColor}
              canvasBackgroundColor={chnageBGColor}
            />
            <div className="main11">
              <MainLayoutArea
                filesPreviewShape={filePreviewShape}
                backgroundColor={backgroundColor}
                canvasBackgroundColor={chnageBGColor}
                filePreview={filePreview}
                shapeToDraw={shapeToDraw}
                setShapeToDraw={setShapeToDraw}
              />
            </div>
            <Sidebar side="right" onToggle={toggleRight} />
          </div>
        </div>

        <div className="">
          <EditorFooter />
        </div>
      </div>
      {/* </ShapeProvider> */}
    </div>
  );
}

export default MainLayout;
