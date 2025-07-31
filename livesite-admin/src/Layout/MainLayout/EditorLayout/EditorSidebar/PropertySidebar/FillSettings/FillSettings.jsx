import React, { useState, useEffect } from "react";
import "./FillSettings.css";
import Accordion from "react-bootstrap/Accordion";
import Dropdown from "react-bootstrap/Dropdown";
import { Form, InputGroup } from "react-bootstrap";
import CommonDropdown from "../../../../../../Components/CommonDropdown/CommonDropdown";
import CommonColorPicker from "../../../../../../Components/CommonColorPicker/CommonColorPicker";
import Percentage from "../../../../../../Assets/Icons/percantage.png";
import plus from "../../../../../../Assets/Icons/plus-sign.png";
import minus from "../../../../../../Assets/Icons/minus-sign.png";
import { useShapeContext } from "../../../../../../contexts/shapeContext";

const dropdownItems = [
  { label: "Solid", href: "" },
  { label: "Gradient", href: "" },
  { label: "Image", href: "" },
  { label: "Pattern", href: "" },
];
const patternDropdownItems = [
  { label: "Diagonal", href: "" },
  { label: "Horizontal", href: "" },
  { label: "Vertical", href: "" },
];

export default function FillSettings({
  changeProperty,
  fillProps,
  filesPreviewShape,
}) {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const { state, actions } = useShapeContext();
  const [selectedItem, setSelectedItem] = useState(null); // Define selectedItem state
  const [uploadedImage, setUploadedImage] = useState(null);
  const { selectedObject } = state;
  const [opacity, setOpacity] = useState(100);

  const {
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
  } = fillProps;

  useEffect(() => {
    if (!selectedObject) {
      return;
    }
    setFillTypeProperties(selectedObject);
    setIsAccordionOpen(true);
  }, [selectedObject]);

  function setFillTypeProperties(selectedObj) {
    if (typeof selectedObj.fill === "string") {
      if (selectedObj.fill === "") {
        setFillColor("");
        setFillType("Solid");
      } else if (selectedObj.fill !== "") {
        setFillEnabled(true);
        setFillColor(selectedObj?.fill);
        setFillType("Solid");
      }
    } else {
      if (selectedObj?.fill?.type) {
        if (selectedObj?.fill?.type === "linear") {
          setFillType("Gradient");
          setColor1(selectedObj?.fill?.colorStops?.[0]?.color || "#ffffff");
          setColor2(selectedObj?.fill?.colorStops?.[1]?.color || "#000000");
        } else if (selectedObj?.fill?.type === "pattern" || selectedObj?.fill?.repeat) {
          setFillType("Pattern");
          if (selectedObj?.pattern === "Diagonal") {
            setSelectedPattern("Diagonal");
          } else if (selectedObj?.pattern === "Horizontal") {
            setSelectedPattern("Horizontal");
          } else if (selectedObj?.pattern === "Vertical") {
            setSelectedPattern("Vertical");
          }
        }
      } else if (selectedObj.fillType === "Image") {
        setFillType("Image");
      } else if (selectedObj?.fill?.id || selectedObj?.fill?.repeat) {
        setFillType("Pattern");
        if (selectedObj?.fill?.id === 1) {
          setSelectedPattern("Diagonal");
        } else if (selectedObj?.pattern === "Horizontal") {
          setSelectedPattern("Horizontal");
        } else if (selectedObj?.pattern === "Vertical") {
          setSelectedPattern("Vertical");
        }
      } else {
        setFillType("Solid");
      }
    }
    setOpacity(selectedObj?.opacity * 100);
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];

    filesPreviewShape(file);
    // try {
    //   const imageUrl = await loadImageAsDataURL(file);
    //   setUploadedImage(imageUrl);
    // } catch (error) {
    //   console.error("Error handling image upload:", error);
    // }
  };

  const handleAccordionToggle = () => {
    setIsAccordionOpen(!isAccordionOpen);
  };

  return (
    <div className="my-2">
      <Accordion activeKey={isAccordionOpen ? "0" : null} className="border-0">
        <Accordion.Item eventKey="0" className="border-0">
          <Accordion.Header
            className="border-0 text-black fs-6"
            onClick={handleAccordionToggle}
          >
            <label htmlFor="propertyName" className="propertyTextLabel">
              Fill
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
            <Accordion.Body className="border-0 px-3 pb-0">
              <div className="fillSettings">
                <div className="row">
                  <div className="col-lg-12 px-0">
                    <CommonDropdown
                      title={fillType}
                      items={dropdownItems}
                      selectedItem={selectedItem}
                      handleSelect={(e) => {
                        setFillType(e.label);
                        changeProperty(
                          "fillType",
                          e.label,
                          selectedObject?.selectable ? false : true
                        );
                      }}
                    />
                  </div>
                  <div className="row px-0 mx-0 my-2 ">
                    {fillType === "Solid" && (
                      <div className="row px-0 mx-0 mb-0">
                        <div className="ColorPicker col-lg-7 ps-0">
                          <CommonColorPicker
                            value={fillColor}
                            onChange={(e) => {
                              setFillColor(e);
                              changeProperty(
                                "fillColor",
                                e,
                                selectedObject?.selectable ? false : true
                              );
                            }}
                          />
                        </div>
                        <div className="col-lg-5 pe-0">
                          <InputGroup className="pe-0 border-0">
                            <Form.Control
                              id="inlineFormInputGroup"
                              className="propertyTextBox border-end border-start-0 border-top-0 border-bottom-0"
                              placeholder="10"
                              value={opacity}
                              type="number"
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
                          </InputGroup>
                        </div>
                      </div>
                    )}

                    {fillType === "Gradient" && (
                      <div className="row px-0 mx-0 my-2 mb-0">
                        <div className="ColorPicker col-lg-4 px-1">
                          <CommonColorPicker
                            value={color1}
                            onChange={(e) => {
                              setColor1(e);
                              changeProperty(
                                "color1",
                                e,
                                selectedObject?.selectable ? false : true
                              );
                            }}
                          />
                        </div>
                        <div className="ColorPicker col-lg-4 px-1">
                          <CommonColorPicker
                            value={color2}
                            onChange={(e) => {
                              setColor2(e);
                              changeProperty(
                                "color2",
                                e,
                                selectedObject?.selectable ? false : true
                              );
                            }}
                          />
                        </div>
                        <div className="col-lg-4 px-1">
                          <InputGroup className="pe-0 border-0">
                            <Form.Control
                              id="inlineFormInputGroup"
                              className="propertyTextBox border-end border-start-0 border-top-0 border-bottom-0"
                              placeholder="10"
                              value={opacity}
                              type="number"
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
                          </InputGroup>
                        </div>
                      </div>
                    )}
                    {fillType === "Image" && (
                      <div className="d-flex py-2 px-1">
                        <input
                          type="file"
                          onChange={handleImageUpload}
                          accept="image/*"
                        />
                      </div>
                    )}
                    {fillType === "Pattern" && (
                      <div className="row px-0 mx-0">
                        <div className="col-lg-12 px-0">
                          <CommonDropdown
                            title={
                              selectedPattern ||
                              selectedPattern.label ||
                              "Select Pattern"
                            }
                            items={patternDropdownItems}
                            selectedItem={selectedPattern.label}
                            handleSelect={(e) => {
                              setSelectedPattern(e.label);
                              changeProperty("pattern", e.label);
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="row mx-0 px-0"></div>
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
