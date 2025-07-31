import React, { useEffect, useState } from "react";
import "./TextSettings.css";
import Accordion from "react-bootstrap/Accordion";
import CommonDropdown from "../../../../../../Components/CommonDropdown/CommonDropdown";
import textRight from "../../../../../../Assets/Icons/TextAlignRight.png";
import textLeft from "../../../../../../Assets/Icons/TextAlignLeft.png";
import textCenter from "../../../../../../Assets/Icons/TextAlignCenter.png";
import textJustify from "../../../../../../Assets/Icons/TextAlignJustified.png";

import textSenCase from "../../../../../../Assets/Icons/SentenceCase.png";
import textUppercase from "../../../../../../Assets/Icons/UpperCase.png";
import textLowercase from "../../../../../../Assets/Icons/LowerCase.png";
import textUnderLine from "../../../../../../Assets/Icons/Underline.png";
import textMiddleLine from "../../../../../../Assets/Icons/Middleline.png";
import plus from "../../../../../../Assets/Icons/plus-sign.png";
import minus from "../../../../../../Assets/Icons/minus-sign.png";

import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useShapeContext } from "../../../../../../contexts/shapeContext";

const dropdownItems = [
  { label: "Inter", href: "" },
  { label: "Arial", href: "" },
  { label: "Sul Sans", href: "" },
  { label: "Calibri", href: "" },
];
const fontSizeItems = [
  { label: "8", href: "" },
  { label: "10", href: "" },
  { label: "12", href: "" },
  { label: "14", href: "" },
  { label: "16", href: "" },
  { label: "18", href: "" },
  { label: "20", href: "" },
  { label: "22", href: "" },
  { label: "24", href: "" },
  { label: "26", href: "" },
];
const fontTypeItems = [
  { label: "Bold", href: "" },
  { label: "Semibold", href: "" },
  { label: "Medium", href: "" },
  { label: "Normal", href: "" },
  { label: "Italic", href: "" },
];
export default function TextSettings({ changeProperty }) {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const { state, actions } = useShapeContext();
  const { selectedObject, currentTextTransform } = state;
  const [fontStyle, setFontStyle] = useState("Inter");
  const [selectedTextItem, setSelectedTextItem] = useState(null); // Define selectedItem state
  const [fontSize, setFontSize] = useState("20");
  const [selectedFontItem, setSelectedFontItem] = useState("20"); // Define selectedItem state
  const [fontWeight, setFontWeight] = useState("Normal");
  const [selectedFontTypeItem, setSelectedFontTypeItem] = useState(null); // Define selectedItem states
  const [activeIndex, setActiveIndex] = useState(0); // State to keep track of active icon index
  const [activeIndexDecoration, setActiveIndexDecoration] = useState({
    sentenaceCase: true,
    upperCase: false,
    lowercase: false,
  }); // State to keep track of active icon index
  const [activeTextDecoration, setActiveTextDecoration] = useState({
    underline: false,
    strikethrough: false,
  }); // State to keep track of active icon index
  const [textAlign, setTextAlign] = useState("left");
  const [textDecoration, setTextDecoration] = useState("lowercase");

  const handleIconClick = (index) => {
    setActiveIndex(index); // Set active index to the clicked icon's index
    switch (index) {
      case 0:
        setTextAlign("left");
        changeProperty("textAlign", "left");
        break;
      case 1:
        setTextAlign("center");
        changeProperty("textAlign", "center");
        break;
      case 2:
        setTextAlign("right");
        changeProperty("textAlign", "right");
        break;
      case 3:
        setTextAlign("justify");
        changeProperty("textAlign", "justify");
        break;

      default:
        break;
    }
  };

  const handleIconClickDecoration = (index) => {
    switch (index) {
      case 0:
        actions.updateTextTransform("Capitalize");
        setTextDecoration("Capitalize");
        changeProperty(
          "textTransform",
          "capitalize",
          // selectedObject?.selectable ? false : true
          true
        );
        break;
      case 1:
        actions.updateTextTransform("Uppercase");
        setTextDecoration("Uppercase");
        changeProperty(
          "textTransform",
          "Uppercase",
          true
        );
        break;
      case 2:
        actions.updateTextTransform("Lowercase");
        setTextDecoration("Lowercase");
        changeProperty(
          "textTransform",
          "Lowercase",
          true
        );
        break;
      case 3:
        console.log(activeTextDecoration)
        setTextDecoration("underline");
        changeProperty(
          "textDecoration",
          "underline",
          true
        );
        break;
      case 4:
        setTextDecoration("linethrough");
        changeProperty(
          "textDecoration",
          "linethrough",
          true
        );
        break;

      default:
        break;
    }
  };

  const handleTextTypeChange = (selectedTextItem) => {
    setSelectedTextItem(selectedTextItem); // Update selectedItem state
    setFontStyle(selectedTextItem.label);
    changeProperty(
      "fontFamily",
      selectedTextItem?.label,
      selectedObject?.selectable ? false : true
    );
  };

  // Handler function for pattern change
  const handleFontSizeChange = (selectedFontItem) => {
    setSelectedFontItem(selectedFontItem); // Update selectedPattern state
    setFontSize(selectedFontItem.label);
    changeProperty(
      "fontSize",
      selectedFontItem.label,
      selectedObject?.selectable ? false : true
    );

    // Handle any additional logic if needed
  };
  const handleFontTypeChange = (selectedFontTypeItem) => {
    setSelectedFontTypeItem(selectedFontTypeItem);
    setFontWeight(selectedFontTypeItem.label); // Update selectedPattern state
    changeProperty(
      "fontWeight",
      selectedFontTypeItem.label,
      selectedObject?.selectable ? false : true
    );
  };

  const handleAccordionToggle = () => {
    setIsAccordionOpen(!isAccordionOpen);
  };

  useEffect(() => {
    if (!selectedObject) {
      return;
    }
    handleTextProperties(selectedObject);
    if (selectedObject?.type === "textbox") {
      setIsAccordionOpen(true);
    }
  }, [selectedObject]);

  function handleTextProperties(selectedObject) { 
    setFontStyle(selectedObject?.fontFamily || "helvetica");
    setTextAlign(selectedObject?.textAlign || "left");
    setFontSize(selectedObject?.fontSize || 20);

    if (selectedObject?.fontWeight === "bold") {
      setFontWeight(true);
    } else {
      setFontWeight(selectedObject?.fontWeight);
    }

    if (selectedObject?.textTransform === "Uppercase") {
      actions.updateTextTransform("Uppercase");
      setActiveIndexDecoration(1);
    } else if (selectedObject?.textTransform === "Lowercase") {
      actions.updateTextTransform("Lowercase");
      setActiveIndexDecoration(2);
    }
  }

  return (
    <div className="my-2">
      <Accordion
        defaultActiveKey={null}
        activeKey={
          selectedObject && selectedObject?.type == "textbox" ? "0" : null
        }
        className="border-0"
      >
        <Accordion.Item eventKey="0" className="border-0">
          <Accordion.Header
            className="border-0 text-black fs-6"
            onClick={handleAccordionToggle}
          >
            <label htmlFor="propertyName" className="propertyTextLabel">
              Text
            </label>

            {isAccordionOpen ? (
              <img
                src={minus}
                className="img-fluid d-flex ms-auto fs-5"
                alt="Left"
              />
            ) : (
              <img
                src={plus}
                className="img-fluid d-flex ms-auto fs-5"
                alt="Left"
              />
            )}
          </Accordion.Header>
          {selectedObject && selectedObject?.type === "textbox" ? (
            <Accordion.Body className="border-0 px-3">
              <div className="fillSettings">
                <div className="row">
                  <div className="col-lg-12 px-0">
                    <CommonDropdown
                      title={fontStyle}
                      items={dropdownItems}
                      selectedTextItem={selectedTextItem?.label}
                      handleSelect={handleTextTypeChange}
                    />{" "}
                    {/* Pass selectedItem and handleSelect */}
                  </div>
                  <div className="row mx-0 px-0 my-2">
                    <div className="col-lg-3 px-0">
                      <CommonDropdown
                        title={fontSize}
                        items={fontSizeItems}
                        selectedFontItem={selectedFontItem.label}
                        handleSelect={handleFontSizeChange}
                        defaultActiveKey={1}
                      />{" "}
                    </div>
                    <div className="col-lg-9 px-0 ps-3">
                      <CommonDropdown
                        title={fontWeight}
                        items={fontTypeItems}
                        selectedFontTypeItem={selectedFontTypeItem?.label}
                        handleSelect={handleFontTypeChange}
                      />{" "}
                    </div>
                  </div>
                  <div className="row mx-0 px-0 my-3 mb-2 align-items-center">
                    <div className="col-lg-4 px-0">
                      <label
                        htmlFor="propertyName"
                        className="fs-6 text-start propertyTextLabel"
                      >
                        Align
                      </label>
                    </div>
                    <div className="col-lg-8 px-0">
                      <div className="switches-container">
                        <OverlayTrigger
                          placement="bottom"
                          overlay={<Tooltip id="tooltip-left">Left</Tooltip>}
                        >
                          <div
                            className={`commonIcon leftIcon ${
                              activeIndex === 0 ? "active" : ""
                            }`}
                            onClick={() => handleIconClick(0)}
                          >
                            <img
                              src={textLeft}
                              className="img-fluid"
                              alt="Left"
                            />
                          </div>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="bottom"
                          overlay={
                            <Tooltip id="tooltip-center">Center</Tooltip>
                          }
                        >
                          <div
                            className={`commonIcon centerIcon ${
                              activeIndex === 1 ? "active" : ""
                            }`}
                            onClick={() => handleIconClick(1)}
                          >
                            <img
                              src={textCenter}
                              className="img-fluid"
                              alt="Center"
                            />
                          </div>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="bottom"
                          overlay={<Tooltip id="tooltip-right">Right</Tooltip>}
                        >
                          <div
                            className={`commonIcon rightIcon ${
                              activeIndex === 2 ? "active" : ""
                            }`}
                            onClick={() => handleIconClick(2)}
                          >
                            <img
                              src={textRight}
                              className="img-fluid"
                              alt="Right"
                            />
                          </div>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="bottom"
                          overlay={
                            <Tooltip id="tooltip-justify">Justify</Tooltip>
                          }
                        >
                          <div
                            className={`commonIcon justifyIcon ${
                              activeIndex === 3 ? "active" : ""
                            }`}
                            onClick={() => handleIconClick(3)}
                          >
                            <img
                              src={textJustify}
                              className="img-fluid"
                              alt="Justify"
                            />
                          </div>
                        </OverlayTrigger>
                      </div>
                    </div>
                  </div>
                  <div className="row mx-0 px-0 my-3 mb-2 align-items-center">
                    <div className="col-lg-4 px-0">
                      <label
                        htmlFor="propertyName"
                        className="fs-6 text-start propertyTextLabel"
                      >
                        Decoration
                      </label>
                    </div>
                    <div className="col-lg-8 px-0">
                      <div className="switches-container">
                        <OverlayTrigger
                          placement="bottom"
                          overlay={
                            <Tooltip id="tooltip-left">Sentenace Case</Tooltip>
                          }
                        >
                          <div
                            className={`commonIcon leftIcon ${
                              activeIndexDecoration.sentenaceCase ? "active" : ""
                            }`}
                            onClick={() => {
                              setActiveIndexDecoration({
                                ...activeIndexDecoration,
                                sentenaceCase: true,
                                upperCase: false,
                                lowercase: false,
                              });
                              handleIconClickDecoration(0);
                            }}
                          >
                            <img
                              src={textSenCase}
                              className="img-fluid"
                              alt="Left"
                            />
                          </div>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="bottom"
                          overlay={
                            <Tooltip id="tooltip-center">Uppercase</Tooltip>
                          }
                        >
                          <div
                            className={`commonIcon centerIcon ${
                              activeIndexDecoration.upperCase ? "active" : ""
                            }`}
                            onClick={() => {
                              setActiveIndexDecoration({
                                ...activeIndexDecoration,
                                sentenaceCase: false,
                                upperCase: true,
                                lowercase: false,
                              });
                              handleIconClickDecoration(1);
                            }}
                          >
                            <img
                              src={textUppercase}
                              className="img-fluid"
                              alt="Center"
                            />
                          </div>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="bottom"
                          overlay={
                            <Tooltip id="tooltip-right">Lowercase</Tooltip>
                          }
                        >
                          <div
                            className={`commonIcon rightIcon ${
                              activeIndexDecoration.lowercase ? "active" : ""
                            }`}
                            onClick={() => {
                              setActiveIndexDecoration({
                                ...activeIndexDecoration,
                                sentenaceCase: false,
                                upperCase: false,
                                lowercase: true,
                              });
                              handleIconClickDecoration(2);
                            }}
                          >
                            <img
                              src={textLowercase}
                              className="img-fluid"
                              alt="Right"
                            />
                          </div>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="bottom"
                          overlay={
                            <Tooltip id="tooltip-justify">Underline</Tooltip>
                          }
                        >
                          <div
                            className={`commonIcon justifyIcon ${
                              activeTextDecoration.underline ? "active" : ""
                            }`}
                            onClick={() => {
                              setActiveTextDecoration({
                                ...activeTextDecoration,
                                underline: true,
                                strikethrough: false,
                              });
                              handleIconClickDecoration(3);
                            }}
                          >
                            <img
                              src={textUnderLine}
                              className="img-fluid"
                              alt="Justify"
                            />
                          </div>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="bottom"
                          overlay={
                            <Tooltip id="tooltip-justify">
                              Strikethrough{" "}
                            </Tooltip>
                          }
                        >
                          <div
                            className={`commonIcon justifyIcon ${
                              activeTextDecoration.strikethrough ? "active" : ""
                            }`}
                            onClick={() => {
                              setActiveTextDecoration({
                                ...activeTextDecoration,
                                underline: false,
                                strikethrough: true,
                              });
                              handleIconClickDecoration(4);
                            }}
                          >
                            <img
                              src={textMiddleLine}
                              className="img-fluid"
                              alt="Justify"
                            />
                          </div>
                        </OverlayTrigger>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Accordion.Body>
          ) : (
            <Accordion.Body className="border-0 px-3">
              <div className="fillSettings">
                <span className="text-muted small-font-size">
                  No Text Selected
                </span>
              </div>
            </Accordion.Body>
          )}
        </Accordion.Item>
      </Accordion>
    </div>
  );
}
