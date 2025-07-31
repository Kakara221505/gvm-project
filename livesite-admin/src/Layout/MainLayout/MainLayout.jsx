import React, { useState, useEffect, useContext } from "react";
import "./MainLayout.css";
import MainLeftSideBar from "./MainLeftSideBar/MainLeftSideBar";
import MainRightSidebar from "./MainRightSidebar/MainRightSidebar";
import MainLayoutArea from "./MainLayoutArea/MainLayoutArea";
import LandingHeader from "../LandingLayout/LandingHeader/LandingHeader";
import EditorFooter from "./EditorLayout/EditorFooter/EditorFooter";
import toggleFooterBtn from "../../Assets/Icons/arrow-up-double-sharp.png";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import downArrow from "../../Assets/Icons/ChevronArrow.png";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useShapeContext } from "../../../src/contexts/shapeContext.js";
import { ThemeContext } from "../../Theme/ThemeContext.jsx";
import _ from "lodash";
import { getApiCaller, postApiCaller } from "../../Lib/apiCaller.js";
import { GlobalValues } from "../../Lib/GlobalValues.js";
import { getDisableStyle } from "../../Lib/Globalfunctions.js";

function Sidebar({
  side,
  onToggle,
  setShapeToDraw,
  backgroundColor,
  canvasBackgroundColor,
  filesPreviewShape,
  setSelectSpecialFields,
}) {
  const { state, actions } = useShapeContext();
  const [collapsed, setCollapsed] = useState(false);
  const handleToggle = () => {
    setCollapsed(!collapsed);
    onToggle(!collapsed);
  };
  const clonedState = _.cloneDeep(state);

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
                  setSelectSpecialFields={setSelectSpecialFields}
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
  const { headers, projectId, userID } = GlobalValues();
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const { state, actions, undoStack, redoStack } = useShapeContext();
  const {
    selectedObject,
    pages,
    multipleSelection,
    currentUser,
    activeCanvas,
    projectDetails,
    properties,
    currentCategory,
    currentSubCategory,
    isSelectSpeacial,
    isProjecteEditable
  } = state;
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
  const [isAlignLeft, setAlignLeft] = useState(false);
  const [isAlignCenter, setAlignCenter] = useState(false);
  const [isAlignRight, setAlignRight] = useState(false);
  const [isAlignJustify, setAlignJustify] = useState(false);
  const [selectSpecialFields, setSelectSpecialFields] = useState({});
  const [textSize, setTextSize] = useState(20);
  const [count, setCount] = useState(2);
  const [action, setAction] = useState("");
  const [isBorderType, IsBorderType] = useState("Solid");
  const [selectedFont, setSelectedFont] = useState("Arial"); // State to store the selected font
  const [layersList, setLayersList] = useState(); // State to store the selected font
  const [selectedLayer, setSelectedLayer] = useState(); // State to store the selected font
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [subCategoryList, setSubCategoryList] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] =
    useState(currentSubCategory);
  const { theme, toggleTheme } = useContext(ThemeContext);
  var isFlag = null;
  const [projectName, setProjectName] = useState("");
  const [layerExist, setLayerExist] = useState(true);
  const clonedState = _.cloneDeep(state);

  useEffect(() => {
    setProjectName(projectDetails?.Name);
  }, [projectDetails]);

  useEffect(() => {
    const checkLayerExist = () => {
      pages.forEach((page) => {
        if (page?.ID === activeCanvas) {
          if (!page?.calendar?.layers || page?.calendar?.layers.length === 0) {
            setLayerExist(false);
          } else {
            setLayerExist(true);
          }
        }
      });
    };

    checkLayerExist();
  }, [pages, activeCanvas]);

  useEffect(() => {
    setSelectedLayer(currentUser);
    if (selectedObject) {
      setTextSize(selectedObject?.fontSize || 20);
      setSelectedFont(selectedObject?.fontFamily || "Arial");
      setIsBold(selectedObject?.fontWeight === "bold" ? true : false);
      setIsItalic(selectedObject?.fontStyle === "italic" ? true : false);
      setIsStrikeThrough(selectedObject?.linethrough ? true : false);
      setIsUnderline(selectedObject?.underline ? true : false);
      setFillColor(selectedObject?.fill);
      setStrokeColor(selectedObject?.stroke);
      IsBorderType(selectedObject.strokeType);
      setCount(selectedObject.strokeWidth);
      setAlignLeft(selectedObject?.textAlign === "left");
      setAlignCenter(selectedObject?.textAlign === "center");
      setAlignRight(selectedObject?.textAlign === "right");
      setAlignJustify(selectedObject?.textAlign === "justify");
    } else {
      IsBorderType(properties.strokeType);
    }
  }, [currentUser, selectedObject]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getApiCaller(
          `category/get_category_all_data`,
          headers
        );
        const categories = response.data?.map((categorie) => ({
          value: categorie.ID,
          Name: categorie.CatepgoryName,
        }));
        setCategoryList(categories);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubCategory = async () => {
      const data = {
        ProjectID: projectId,
        CategoryID: [selectedCategory],
      };

      try {
        const response = await postApiCaller(
          `category/get_sub_category_all_data`,
          data,
          headers
        );
        const subcategorys = response.data?.map((subcategory) => ({
          value: subcategory.ID,
          Name: subcategory.SubCategoryName,
        }));
        setSubCategoryList(subcategorys);
        actions.updateCurrentSubCategory(subcategorys[0].value);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (activeCanvas) {
      fetchSubCategory();
    }
  }, [selectedCategory]);

  useEffect(() => {
    const findCanvasIndex = pages.findIndex(
      (res) => res.ID === state.activeCanvas
    );
    if (findCanvasIndex !== -1) {
      setLayersList(pages[findCanvasIndex].calendar.layers);
    }
  }, [activeCanvas, pages]);

  const updateFunctionData = () => {
    if (!selectedObject?.isEditing) {
      isFlag = false;
    }

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
    switch (action) {
      case "bold":
        changeTextProperty("fontWeight", isBold ? "bold" : "", isFlag);
        // selectedObject.setSelectionStyles({ fontWeight: 'bold' });
        break;

      case "italic":
        changeTextProperty("fontStyle", isItalic ? "italic" : "", isFlag);
        // selectedObject.setSelectionStyles({ fontStyle: 'italic' });
        break;

      case "underline":
        changeTextProperty("underline", isUnderline ? true : false, isFlag);
        break;
      case "strike-through":
        changeTextProperty(
          "linethrough",
          isStrikeThrough ? true : false,
          isFlag
        );
        // selectedObject.setSelectionStyles({ textDecoration: 'underline' });
        break;
    }
  };

  function changeTextProperty(field, value, isFlag) {
    const payload = { field, value };
    actions.updateProperties(payload);
    actions.updateState(clonedState);
    updateShapeProperty(field, value, isFlag);
  }

  function updateShapeProperty(field, value, isFlag) {
    actions.isAnyDataChanges(true);
    if (isSelectSpeacial) {
      setSelectSpecialFields((prevState) => ({
        ...prevState,
        [field === "fillColor"
          ? "fill"
          : field === "strokeColor"
          ? "stroke"
          : field]: value,
        ...(field === "strokeType" && {
          strokeDashArray:
            value === "Dashed" ? [5, 5] : value === "Dotted" ? [1, 4] : [],
        }),
      }));
    }
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
          selectedObject?.set({ stroke: value || "#000000" });
        }
        break;
      case "strokeWidth":
        selectedObject?.set({ strokeWidth: value || 2 });
        break;
      case "strokeType":
        selectedObject?.set({
          strokeDashArray:
            value === "Dashed" ? [5, 5] : value === "Dotted" ? [1, 5] : null,
        });
        break;
      case "fillColor":
        if (isFlag) {
          selectedObject?.setSelectionStyles({ fill: value || "#ffffff" });
        } else {
          selectedObject?.set({ fill: value || "#ffffff" });
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
    actions.multipleSelection(true);
  };

  const handleLayerSelect = (selectedLayer) => {
    setSelectedLayer(selectedLayer);
    // actions.resetShape();
    actions.updateCurrentUser(Number(selectedLayer));
    actions.selectShapeType(true);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    actions.updateCurrentCategory(Number(category));
  };

  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory(subCategory);
    actions.updateCurrentSubCategory(Number(subCategory));
  };

  const handleBorderSelect = (selectedItem) => {
    IsBorderType(selectedItem);
    actions.multipleSelection(true);
    changeStrokeProperty("strokeType", selectedItem);
    // selectedObject ? isBorderType : selectedItem
  };

  const handleBorderWidthChange = (e) => {
    if (selectedObject?.type === "textbox") {
      return;
    }
    actions.multipleSelection(true);
    setCount(parseInt(e.target.value));
    changeStrokeProperty("strokeWidth", parseInt(e.target.value));
    // selectedObject ? count : parseInt(e.target.value)
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
    fillColor,
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

  function changeFontProperty(field, value, isFlag) {
    const payload = { field, value };
    actions.updateState(clonedState);
    actions.updateField(payload);
    if (!selectedObject) {
      actions.updateProperties(payload);
      return;
    }
    updateShapeProperty(field, value, isFlag);
  }

  function changeStrokeProperty(field, value, isFlag) {
    const payload = { field, value };
    actions.updateField(payload);
    if (!selectedObject) {
      actions.updateProperties(payload);
      return;
    }
    actions.updateState(clonedState);
    updateShapeProperty(field, value, isFlag);
  }

  const handleAlignIconClick = (index) => {
    actions.isAnyDataChanges(true);
    setAlignLeft(index === 0);
    setAlignCenter(index === 1);
    setAlignRight(index === 2);
    setAlignJustify(index === 3);

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
    actions.multipleSelection(true);
  };

  return (
    <div>
      <div className="layout-container" >
        <div className="sticky-top">
          <LandingHeader
            filesPreview={filesPreview}
            toggleTheme={toggleTheme}
          />
          <div className="d-flex border-bottom header py-0">
            <p
              className="align-content-center lightText mb-0 ms-1 me-3 fs-6 fw-bold"
              style={{
                maxWidth: "100px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {projectName}
            </p>
            {/* <button onClick={handleSaveData}>save Data</button> */}
            <div className="childHead my-1 py-2 bg-red d-flex align-items-center" style={getDisableStyle(!isProjecteEditable)}>
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

                  <Dropdown.Menu id="drpMenu" className="px-2">
                    <Dropdown.Item eventKey="Arial">Arial</Dropdown.Item>
                    <Dropdown.Item eventKey="Sul Sans">Sul Sans</Dropdown.Item>
                    <Dropdown.Item eventKey="Calibri">Calibri</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <Form.Control
                  className="px-2"
                  id="textDro"
                  type="number"
                  aria-label=""
                  value={textSize}
                  onChange={(e) => {
                    handleChangeFontSize(e);
                  }}
                />
              </InputGroup>
              <div class="ms-2">
                <OverlayTrigger
                  placement="bottom"
                  overlay={<Tooltip id="tooltip-bold">Bold</Tooltip>}
                >
                  <div
                    className={`boldIc ${
                      isBold ? "bg-primary" : ""
                    } rounded-2 cursor-pointer`}
                    onClick={() => {
                      setIsBold(!isBold);
                      // if (!selectedObject) return;
                      actions.multipleSelection(true);
                      setAction("bold");
                    }}
                  >
                    <i className="fa fa-bold  lightText fs-6" />
                  </div>
                </OverlayTrigger>
              </div>
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="tooltip-italic">Italic</Tooltip>}
              >
                <div
                  className={`boldIc ${
                    isItalic ? "bg-primary" : ""
                  } rounded-2 cursor-pointer`}
                  onClick={() => {
                    setIsItalic(!isItalic);
                    // if (!selectedObject) return;
                    actions.multipleSelection(true);
                    setAction("italic");
                  }}
                >
                  <i className="fa fa-italic  lightText fs-6" />
                </div>
              </OverlayTrigger>
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="tooltip-underline">Underline</Tooltip>}
              >
                <div
                  className={`boldIc ${
                    isUnderline ? "bg-primary" : ""
                  } rounded-2 cursor-pointer`}
                  onClick={() => {
                    setIsUnderline(!isUnderline);
                    // if (!selectedObject) return;
                    actions.multipleSelection(true);
                    setAction("underline");
                  }}
                >
                  <i className="fa fa-underline  lightText fs-6" />
                </div>
              </OverlayTrigger>
              <div class="border-end pe-2">
                <OverlayTrigger
                  placement="bottom"
                  overlay={
                    <Tooltip id="tooltip-strikethrough">Strikethrough</Tooltip>
                  }
                >
                  <div
                    className={`boldIc ${
                      isStrikeThrough ? "bg-primary" : ""
                    }  rounded-2 cursor-pointer`}
                    onClick={() => {
                      setIsStrikeThrough(!isStrikeThrough);
                      // if (!selectedObject) return;
                      actions.multipleSelection(true);
                      setAction("strike-through");
                    }}
                  >
                    <i className="fa fa-strikethrough lightText fs-6" />
                  </div>
                </OverlayTrigger>
              </div>

              <div className="catMain pe-1 ps-2">
                <div className="d-flex justify-content-around align-items-center">
                  <div className="catMain mb-1 px-0 ">
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="outline-secondary"
                        className="px-1 ps-2"
                        id="input-group-dropdown-8"
                      >
                        <svg
                          className=""
                          xmlns="http://www.w3.org/2000/svg"
                          class="icon icon-tabler icon-tabler-line-height"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          strokeWidth="2.5"
                          stroke="var(--text-primary)"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M3 8l3 -3l3 3" />
                          <path d="M3 16l3 3l3 -3" />
                          <path d="M6 5l0 14" />
                          <path d="M13 6l7 0" />
                          <path d="M13 12l7 0" />
                          <path d="M13 18l7 0" />
                        </svg>
                        <img
                          src={downArrow}
                          className="img-fluid w-50"
                          alt="Dropdown Arrow"
                        />
                      </Dropdown.Toggle>

                      <Dropdown.Menu id="drpMenu">
                        <Dropdown.Item eventKey="Arial">1.15</Dropdown.Item>
                        <Dropdown.Item eventKey="Sul Sans">1.5</Dropdown.Item>
                        <Dropdown.Item eventKey="Calibri">Double</Dropdown.Item>
                        <Dropdown.Item eventKey="Calibri">
                          Add Space Before Paragraph
                        </Dropdown.Item>
                        <Dropdown.Item eventKey="Calibri">
                          Add Space After Paragraph
                        </Dropdown.Item>
                        <Dropdown.Item eventKey="Calibri">
                          Custom Spacing
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
              </div>
              <div className="catMain pe-0 ps-0">
                <div className="d-flex justify-content-around align-items-center">
                  {[
                    {
                      index: 0,
                      icon: "fa-align-left",
                      tooltip: "Align Left",
                      isActive: isAlignLeft,
                    },
                    {
                      index: 1,
                      icon: "fa-align-center",
                      tooltip: "Align Center",
                      isActive: isAlignCenter,
                    },
                    {
                      index: 2,
                      icon: "fa-align-right",
                      tooltip: "Align Right",
                      isActive: isAlignRight,
                    },
                    {
                      index: 3,
                      icon: "fa-align-justify",
                      tooltip: "Align Justify",
                      isActive: isAlignJustify,
                    },
                  ].map(({ index, icon, tooltip, isActive }) => (
                    <OverlayTrigger
                      key={index}
                      placement="bottom"
                      overlay={
                        <Tooltip
                          id={`tooltip-${tooltip
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {tooltip}
                        </Tooltip>
                      }
                    >
                      <div
                        className={`boldIc ${
                          isActive && "bg-primary"
                        } rounded-2 cursor-pointer`}
                        onClick={() => handleAlignIconClick(index)}
                      >
                        <i className={`fa ${icon} lightText fs-6`} />
                      </div>
                    </OverlayTrigger>
                  ))}
                  <div class="border-start px-1 ms-2 d-flex align-items-center">
                    <OverlayTrigger
                      placement="bottom"
                      overlay={<Tooltip id="tooltip-bold">Undo</Tooltip>}
                    >
                      <button
                        className={`boldIc rounded-2 cursor-pointer`}
                        onClick={() => {
                          actions.undo();
                        }}
                        disabled={
                          undoStack[activeCanvas]?.length === 0 ||
                          undoStack[activeCanvas]?.length === undefined
                        }
                      >
                        <i className="fa fa-undo  lightText fs-6 cls" />
                      </button>
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="bottom"
                      overlay={<Tooltip id="tooltip-bold">Redo</Tooltip>}
                    >
                      <button
                        className={`boldIc rounded-2 cursor-pointer`}
                        onClick={() => {
                          actions.redo();
                        }}
                        disabled={
                          redoStack[activeCanvas]?.length === 0 ||
                          redoStack[activeCanvas]?.length === undefined
                        }
                      >
                        <i className="fa fa-repeat  lightText fs-6 cls" />
                      </button>
                    </OverlayTrigger>
                  </div>
                </div>
              </div>
              <div className="catMain border-start">
                <Form.Select
                  id="input-group-dropdown-0"
                  aria-label="Default select example"
                  value={selectedLayer}
                  onChange={(e) => handleLayerSelect(e.target.value)}
                  style={{ fontSize: "14px" }}
                >
                  {layersList?.map((layer, index) => {
                    return (
                      <option value={Number(layer.ID)} key={index}>
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
                        value={
                          selectedObject ? fillColor : properties.fillColor
                        }
                        onChange={(e) => {
                          setFillColor(e.target.value);
                          changeFontProperty(
                            "fillColor",
                            e.target.value,
                            selectedObject?.isEditing ? true : false
                          );
                          actions.multipleSelection(true);
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
                        value={
                          selectedObject ? strokeColor : properties.strokeColor
                        }
                        onChange={(e) => {
                          setStrokeColor(e.target.value);
                          changeStrokeProperty(
                            "strokeColor",
                            e.target.value,
                            false
                          );
                          actions.multipleSelection(true);
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

                    <Dropdown.Menu id="drpMenu" className="lineIcoIco">
                      <Dropdown.Item
                        className="d-flex justify-content-center py-0 imgLineMain"
                        id="fontFam"
                        eventKey={"Solid"}
                      >
                        <img
                          src="https://cdn-icons-png.flaticon.com/128/271/271207.png"
                          className="w-25"
                        />
                      </Dropdown.Item>
                      <Dropdown.Item
                        className="d-flex justify-content-center py-0 imgLineMain"
                        id="fontFam"
                        eventKey={"Dashed"}
                      >
                        <img
                          src="https://cdn-icons-png.flaticon.com/128/9974/9974562.png"
                          className="w-25"
                        />
                      </Dropdown.Item>
                      <Dropdown.Item
                        className="d-flex justify-content-center py-0 imgLineMain"
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
                    value={selectedObject ? count : properties.strokeWidth}
                    onChange={(e) => handleBorderWidthChange(e)}
                    min={1}
                  />
                </InputGroup>
              </div>
              <div className="catMain border-start">
                <Form.Select
                  id="input-group-dropdown-0"
                  aria-label="Default select example"
                  value={selectedCategory}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  style={{ fontSize: "14px" }}
                >
                  {categoryList?.map((cateogry, index) => {
                    return (
                      <option value={cateogry.value} key={index}>
                        {cateogry.Name}
                      </option>
                    );
                  })}
                </Form.Select>
              </div>
              <div className="catMain border-start">
                <Form.Select
                  id="input-group-dropdown-0"
                  aria-label="Default select example"
                  value={selectedSubCategory}
                  onChange={(e) => handleSubCategorySelect(e.target.value)}
                  style={{ fontSize: "14px" }}
                >
                  {subCategoryList?.map((subCateogry, index) => {
                    return (
                      <option value={subCateogry.value} key={index}>
                        {subCateogry.Name}
                      </option>
                    );
                  })}
                </Form.Select>
              </div>
            </div>
          </div>
        </div>
        <div className="editorAreaHeight">
          <div className="content">
            {layerExist && (
              <Sidebar
                side="left"
                onToggle={toggleLeft}
                filesPreviewShape={filesPreviewShape}
                setShapeToDraw={setShapeToDraw}
                backgroundColor={backgroundColor}
                canvasBackgroundColor={chnageBGColor}
                setSelectSpecialFields={setSelectSpecialFields}
              />
            )}
            <div className="main11">
              <MainLayoutArea
                filesPreviewShape={filePreviewShape}
                backgroundColor={backgroundColor}
                canvasBackgroundColor={chnageBGColor}
                filePreview={filePreview}
                shapeToDraw={shapeToDraw}
                setShapeToDraw={setShapeToDraw}
                selectSpecialFields={selectSpecialFields}
                setSelectSpecialFields={setSelectSpecialFields}
              />
            </div>
            <Sidebar side="right" onToggle={toggleRight} />
          </div>
        </div>

        <div className="">
          <EditorFooter setSelectSpecialFields={setSelectSpecialFields} />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
