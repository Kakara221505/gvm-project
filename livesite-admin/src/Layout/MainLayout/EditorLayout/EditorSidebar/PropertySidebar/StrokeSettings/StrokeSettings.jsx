import React, { useEffect, useState } from "react";
import "./StrokeSettings.css";
import Accordion from "react-bootstrap/Accordion";
import CommonDropdown from "../../../../../../Components/CommonDropdown/CommonDropdown";
import textRight from "../../../../../../Assets/Icons/TextAlignRight.png";
import textLeft from "../../../../../../Assets/Icons/TextAlignLeft.png";
import textCenter from "../../../../../../Assets/Icons/TextAlignCenter.png";
import textJustify from "../../../../../../Assets/Icons/TextAlignJustified.png";
import { Form, InputGroup } from "react-bootstrap";
import CommonColorPicker from "../../../../../../Components/CommonColorPicker/CommonColorPicker";
import Percentage from "../../../../../../Assets/Icons/percantage.png";
import textSenCase from "../../../../../../Assets/Icons/SentenceCase.png";
import textUppercase from "../../../../../../Assets/Icons/UpperCase.png";
import textLowercase from "../../../../../../Assets/Icons/LowerCase.png";
import textUnderLine from "../../../../../../Assets/Icons/Underline.png";
import textMiddleLine from "../../../../../../Assets/Icons/Middleline.png";
import plus from "../../../../../../Assets/Icons/plus-sign.png";
import minus from "../../../../../../Assets/Icons/minus-sign.png";
import Button from "react-bootstrap/Button";
import { useShapeContext } from "../../../../../../contexts/shapeContext";

const dropdownItems = [
  { label: "Solid", href: "" },
  { label: "Dashed", href: "" },
  { label: "Dotted", href: "" },
];

export default function StrokeSettings({ changeProperty }) {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const { state } = useShapeContext();
  const { selectedObject } = state;
  const [selectedTextItem, setSelectedTextItem] = useState(null); // Define selectedItem state
  const [selectedFontItem, setSelectedFontItem] = useState(null); // Define selectedItem state
  const [selectedFontTypeItem, setSelectedFontTypeItem] = useState(null); // Define selectedItem state
  const [activeIndex, setActiveIndex] = useState(0); // State to keep track of active icon index
  const [activeIndexDecoration, setActiveIndexDecoration] = useState(0); // State to keep track of active icon index
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeType, setStrokeType] = useState("Solid");
  const [opacity, setOpacity] = useState(100);
  const [count, setCount] = useState(2);

  // Function to handle increment
  const increment = () => {
    setCount((prevCount) => prevCount + 1);
    changeProperty("strokeWidth", count + 1);
  };

  useEffect(() => {
    if (!selectedObject) {
      return;
    }
    setStrokeProperties(selectedObject);
    setIsAccordionOpen(true);
  }, [selectedObject]);

  function setStrokeProperties(selectedObject) {
    setStrokeColor(selectedObject?.stroke || "#000");
    setStrokeWidth(selectedObject.strokeWidth || 2);
    setCount(selectedObject.strokeWidth || 2);
    setOpacity(selectedObject?.opacity * 100 || 100);
    if (selectedObject?.strokeDashArray) {
      const strokeArr = selectedObject?.strokeDashArray;
      if (strokeArr[0] === 5 && strokeArr[1] === 5) {
        setStrokeType("Dashed");
      } else {
        setStrokeType("Dotted");
      }
    } else {
      setStrokeType("Solid");
    }
  }

  // Function to handle decrement
  const decrement = () => {
    if (count > 1) {
      setCount((prevCount) => prevCount - 1);
      changeProperty("strokeWidth", count - 1);
    }
  };

  const handleAccordionToggle = () => {
    setIsAccordionOpen(!isAccordionOpen);
  };

  return (
    <div className="my-2">
      <Accordion
        activeKey={isAccordionOpen ? "0" : null}
        className="border-0"
      >
        <Accordion.Item eventKey="0" className="border-0">
          <Accordion.Header
            className="border-0 text-black fs-6"
            onClick={handleAccordionToggle}
          >
            <label htmlFor="propertyName" className="propertyTextLabel">
              Stroke
            </label>

            {isAccordionOpen ? (
              <img
                src={minus}
                className="img-fluid d-flex ms-auto fs-5"
                alt="Collapse"
              />
            ) : (
              <img
                src={plus}
                className="img-fluid d-flex ms-auto fs-5"
                alt="Expand"
              />
            )}
          </Accordion.Header>

          {selectedObject ? (
            <Accordion.Body className="border-0 px-3">
              <div className="row px-0 ">
                {/* Hidden color picker */}
                <div className="col-lg-12 px-0">
                  <CommonDropdown
                    title={strokeType}
                    items={dropdownItems}
                    defaultActiveKey={1}
                    selectedTextItem={selectedTextItem?.label}
                    handleSelect={(e) => {
                      setStrokeType(e.label);
                      changeProperty("strokeType", e.label);
                    }}
                  />{" "}
                  {/* Pass selectedItem and handleSelect */}
                </div>
                
                <div className="col-lg-6 pe-0">
                  {/* <InputGroup className="pe-0 border-0">
                    <Form.Control
                      id="inlineFormInputGroup"
                      className="propertyTextBox border-end border-start-0 border-top-0 border-bottom-0"
                      placeholder="100"
                      type="number"
                      value={opacity}
                      min={0}
                      max={100}
                      step={1}
                      onChange={(e) => {
                        setOpacity(e.target.value);
                        changeProperty(
                          "opacity",
                          e.target.value / 100,
                          selectedObject?.selectable ? false : true
                        );
                      }}
                    />
                    <InputGroup.Text className="propertyTextBox border-end-0 border-start-0 border-top-0 border-bottom-0">
                      <img src={Percentage} className="img-fluid" />
                    </InputGroup.Text>
                  </InputGroup> */}
                </div>
              </div>

              <div className="row mt-2 align-items-center">
              <div className="ColorPicker col-lg-7 ps-0">
                  <CommonColorPicker
                    value={strokeColor}
                    onChange={(e) => {
                      setStrokeColor(e);
                      changeProperty(
                        selectedObject?.type === "textbox"
                          ? "textBackgroundColor"
                          : "strokeColor",
                        e,
                        selectedObject?.selectable ? false : true
                      );
                    }}
                  />
                </div>
                <div className="col-lg-5 pe-0">
                  <InputGroup className="">
                    <Button
                      onClick={decrement}
                      className="propertyTextBox border-bottom-0 border-start-0 border-top-0 border-end btn btn-default counterBtn"
                      id="button-addon1"
                    >
                      <img
                        src={minus}
                        className="img-fluid d-flex ms-auto fs-5"
                        alt="Left"
                      />
                    </Button>
                    <Form.Control
                      placeholder="0"
                      value={parseInt(count)}
                      readOnly // Make input read-only
                      className="propertyTextBox border-bottom-0 text-center  border-top-0 border p-2"
                      aria-label="Example text with button addon"
                      aria-describedby="basic-addon1"
                    />
                    <Button
                      onClick={increment}
                      className="propertyTextBoxbtn incrText btn-default counterBtn1 border-bottom-0 border-end-0 border-top-0 border-start"
                      id="button-addon1"
                    >
                      <img
                        src={plus}
                        className="img-fluid d-flex ms-auto fs-5"
                        alt="Left"
                      />
                    </Button>
                  </InputGroup>
                </div>
              </div>
            </Accordion.Body>
          ) : (
            <Accordion.Body className="border-0 px-3">
              <div className="fillSettings">
                <span className="text-muted small-font-size">
                  No Shape Selected
                </span>
              </div>
            </Accordion.Body>
          )}
        </Accordion.Item>
      </Accordion>
    </div>
  );
}
