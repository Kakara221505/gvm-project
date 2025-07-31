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
  { label: "Normal", href: "" },
  { label: "Italic", href: "" },
];

export default function TextSettings({ changeProperty }) {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const { state, actions } = useShapeContext();
  const { selectedObject } = state;
  const [fontStyle, setFontStyle] = useState("Inter");
  const [selectedTextItem, setSelectedTextItem] = useState(null);
  const [fontSize, setFontSize] = useState("20");
  const [selectedFontItem, setSelectedFontItem] = useState("20");
  const [fontWeight, setFontWeight] = useState("Normal");
  const [selectedFontTypeItem, setSelectedFontTypeItem] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikeThrough, setIsStrikeThrough] = useState(false);
  const [activeIndexDecoration, setActiveIndexDecoration] = useState({
    sentenceCase: true,
    upperCase: false,
    lowercase: false,
  });
  const [activeTextDecoration, setActiveTextDecoration] = useState({
    underline: false,
    strikethrough: false,
  });
  var isFlag = null;
  const [textAlign, setTextAlign] = useState("left");
  const [textDecoration, setTextDecoration] = useState("lowercase");

  const handleIconClick = (index) => {
    setActiveIndex(index);
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
    switch (index) {
      case 0:
        actions.updateTextTransform("Capitalize");
        setTextDecoration("Capitalize");
        setActiveIndexDecoration({
          sentenceCase: true,
          upperCase: false,
          lowercase: false,
        });
        changeProperty("textTransform", "capitalize", isFlag);
        break;
      case 1:
        actions.updateTextTransform("Uppercase");
        setTextDecoration("Uppercase");
        setActiveIndexDecoration({
          sentenceCase: false,
          upperCase: true,
          lowercase: false,
        });
        changeProperty("textTransform", "Uppercase", isFlag);
        break;
      case 2:
        actions.updateTextTransform("Lowercase");
        setTextDecoration("Lowercase");
        setActiveIndexDecoration({
          sentenceCase: false,
          upperCase: false,
          lowercase: true,
        });
        changeProperty("textTransform", "Lowercase", isFlag);
        break;
      case 3:
        setIsUnderline((prevState) => !prevState);
        changeProperty("underline", !isUnderline, isFlag);
        break;
      case 4:
        setIsStrikeThrough((prevState) => !prevState);
        changeProperty("linethrough", !isStrikeThrough, isFlag);
        break;
      default:
        break;
    }
  };

  const handleTextTypeChange = (selectedTextItem) => {
    setSelectedTextItem(selectedTextItem);
    setFontStyle(selectedTextItem.label);
    changeProperty(
      "fontFamily",
      selectedTextItem?.label,
      selectedObject?.selectable ? false : true
    );
  };

  const handleFontSizeChange = (selectedFontItem) => {
    setSelectedFontItem(selectedFontItem);
    setFontSize(selectedFontItem.label);
    changeProperty(
      "fontSize",
      selectedFontItem.label,
      selectedObject?.selectable ? false : true
    );
  };

  const handleFontTypeChange = (selectedFontTypeItem) => {
    setSelectedFontTypeItem(selectedFontTypeItem);
    setFontWeight(selectedFontTypeItem.label);
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
    setFontSize(selectedObject?.fontSize || 20);
    switch (selectedObject?.textAlign) {
      case "left":
        setTextAlign(selectedObject?.textAlign);
        setActiveIndex(0);
        break;
      case "center":
        setTextAlign(selectedObject?.textAlign);
        setActiveIndex(1);
        break;
      case "right":
        setTextAlign(selectedObject?.textAlign);
        setActiveIndex(2);
        break;
      case "justify":
        setTextAlign(selectedObject?.textAlign);
        setActiveIndex(3);
        break;
      default:
        break;
    }

    if (selectedObject) {
      setIsUnderline(selectedObject?.underline ? true : false);
      setIsStrikeThrough(selectedObject?.linethrough ? true : false);
    }

    if (selectedObject?.fontWeight === "bold") {
      setFontWeight(true);
    } else {
      setFontWeight(selectedObject?.fontWeight);
    }

    if (selectedObject?.textTransform === "Uppercase") {
      actions.updateTextTransform("Uppercase");
      setActiveIndexDecoration({
        sentenceCase: false,
        upperCase: true,
        lowercase: false,
      });
    } else if (selectedObject?.textTransform === "Lowercase") {
      actions.updateTextTransform("Lowercase");
      setActiveIndexDecoration({
        sentenceCase: false,
        upperCase: false,
        lowercase: true,
      });
    }
  }

  return (
    <div className="my-2">
      <Accordion
        defaultActiveKey={null}
        activeKey={isAccordionOpen ? "0" : null}
        className="border-0"
        onSelect={(eventKey) => setIsAccordionOpen(eventKey === "0")}
      >
        <Accordion.Item eventKey="0" className="border-0">
          <Accordion.Header className="border-0 text-black fs-6">
            <label htmlFor="propertyName" className="propertyTextLabel">
              Text
            </label>
            <img
              src={isAccordionOpen ? minus : plus}
              className="img-fluid d-flex ms-auto fs-5"
              alt={isAccordionOpen ? "Collapse" : "Expand"}
            />
          </Accordion.Header>
          <Accordion.Body className="border-0 px-3">
            {selectedObject && selectedObject?.type === "textbox" ? (
              <div className="fillSettings">
                <div className="row">
                  <div className="col-lg-12 px-0">
                    <CommonDropdown
                      title={fontStyle}
                      items={dropdownItems}
                      selectedTextItem={selectedTextItem?.label}
                      handleSelect={handleTextTypeChange}
                    />
                  </div>
                  <div className="row mx-0 px-0 my-2">
                    <div className="col-lg-3 px-0">
                      <CommonDropdown
                        title={fontSize}
                        items={fontSizeItems}
                        selectedFontItem={selectedFontItem.label}
                        handleSelect={handleFontSizeChange}
                        defaultActiveKey={1}
                      />
                    </div>
                    <div className="col-lg-9 px-0 ps-3">
                      <CommonDropdown
                        title={fontWeight}
                        items={fontTypeItems}
                        selectedFontTypeItem={selectedFontTypeItem?.label}
                        handleSelect={handleFontTypeChange}
                      />
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
                              alt="Text Align Left"
                              className="img-fluid"
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
                            className={`commonIcon textCenterIcon ${
                              activeIndex === 1 ? "active" : ""
                            }`}
                            onClick={() => handleIconClick(1)}
                          >
                            <img
                              src={textCenter}
                              alt="Text Align Center"
                              className="img-fluid"
                            />
                          </div>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="bottom"
                          overlay={<Tooltip id="tooltip-right">Right</Tooltip>}
                        >
                          <div
                            className={`commonIcon textRightIcon ${
                              activeIndex === 2 ? "active" : ""
                            }`}
                            onClick={() => handleIconClick(2)}
                          >
                            <img
                              src={textRight}
                              alt="Text Align Right"
                              className="img-fluid"
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
                            className={`commonIcon textJustifyIcon ${
                              activeIndex === 3 ? "active" : ""
                            }`}
                            onClick={() => handleIconClick(3)}
                          >
                            <img
                              src={textJustify}
                              alt="Text Align Justify"
                              className="img-fluid"
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
                        Case
                      </label>
                    </div>
                    <div className="col-lg-8 px-0">
                      <div className="switches-container">
                        <OverlayTrigger
                          placement="bottom"
                          overlay={
                            <Tooltip id="tooltip-sentenceCase">
                              Sentence Case
                            </Tooltip>
                          }
                        >
                          <div
                            className={`commonIcon textCaseIcon ${
                              activeIndexDecoration.sentenceCase ? "active" : ""
                            }`}
                            onClick={() => handleIconClickDecoration(0)}
                          >
                            <img
                              src={textSenCase}
                              alt="Sentence Case"
                              className="img-fluid"
                            />
                          </div>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="bottom"
                          overlay={
                            <Tooltip id="tooltip-uppercase">Uppercase</Tooltip>
                          }
                        >
                          <div
                            className={`commonIcon textCaseIcon ${
                              activeIndexDecoration.upperCase ? "active" : ""
                            }`}
                            onClick={() => handleIconClickDecoration(1)}
                          >
                            <img
                              src={textUppercase}
                              alt="Uppercase"
                              className="img-fluid"
                            />
                          </div>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="bottom"
                          overlay={
                            <Tooltip id="tooltip-lowercase">Lowercase</Tooltip>
                          }
                        >
                          <div
                            className={`commonIcon textCaseIcon ${
                              activeIndexDecoration.lowercase ? "active" : ""
                            }`}
                            onClick={() => handleIconClickDecoration(2)}
                          >
                            <img
                              src={textLowercase}
                              alt="Lowercase"
                              className="img-fluid"
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
                            <Tooltip id="tooltip-underline">Underline</Tooltip>
                          }
                        >
                          <div
                            className={`commonIcon textUnderLineIcon ${
                              isUnderline ? "active" : ""
                            }`}
                            onClick={() => handleIconClickDecoration(3)}
                          >
                            <img
                              src={textUnderLine}
                              alt="Underline"
                              className="img-fluid"
                            />
                          </div>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="bottom"
                          overlay={
                            <Tooltip id="tooltip-middleline">
                              Strikethrough
                            </Tooltip>
                          }
                        >
                          <div
                            className={`commonIcon textMiddleLineIcon ${
                              isStrikeThrough ? "active" : ""
                            }`}
                            onClick={() => handleIconClickDecoration(4)}
                          >
                            <img
                              src={textMiddleLine}
                              alt="Strikethrough"
                              className="img-fluid"
                            />
                          </div>
                        </OverlayTrigger>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}
