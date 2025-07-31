import React, { useEffect, useState } from "react";
import "./IconSettings.css";
import { useShapeContext } from "../../../../../../contexts/shapeContext";
import Accordion from "react-bootstrap/Accordion";
// import CommonDropdown from "../../../../../../Components/CommonDropdown/CommonDropdown";
import plus from "../../../../../../Assets/Icons/plus-sign.png";
import minus from "../../../../../../Assets/Icons/minus-sign.png";
import icon from "../../../../../../Assets/Icons/emoji-smile-svgrepo-com.svg";
export default function IconSettings() {
  const { state, actions } = useShapeContext();
  const { selectedObject, selectedObjIdx, pages, activeCanvas, showEmoji } =
    state;
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [currentIcon, setCurrentIcon] = useState(null);
  const [shapes, setShapes] = useState([]);

  useEffect(() => {
    const currCanvasData = pages.filter(
      (canvasShape) => canvasShape.ID === activeCanvas
    );
    if (currCanvasData.length > 0) {
      const shapes = [];
      currCanvasData[0].calendar?.layers.forEach((res) =>
        shapes.push(...res?.annotations)
      );
      setShapes(shapes);
    }
  }, [activeCanvas, pages]);

  useEffect(() => {
    if (shapes?.length < 1) {
      return;
    }
    if (selectedObjIdx !== -1 && selectedObject !== undefined) {
      const currentIcon = shapes[selectedObjIdx]?.icon;
      if (currentIcon !== null && currentIcon !== undefined) {
        setCurrentIcon(currentIcon._element.currentSrc);
      } else {
        setCurrentIcon(null);
      }
    }
  }, [shapes, selectedObjIdx]);

  const handleAccordionToggle = () => {
    setIsAccordionOpen(!isAccordionOpen);
  };

  function handleAddIcon() {
    if (showEmoji) {
      actions.toggleShowEmoji(false);
    } else {
      actions.toggleShowEmoji(true);
    }
  }

  return (
    <div className="my-2 hrColor">
      <Accordion defaultActiveKey={null} className="border-0">
        <Accordion.Item eventKey="0" className="border-0">
          <Accordion.Header
            className="border-0 text-black fs-6"
            onClick={handleAccordionToggle}
          >
            <label htmlFor="propertyName h4" className="propertyTextLabel">
              {selectedObject?.icon ? "Update Icon" : "Add Icon"}
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
          {selectedObject ? (
            <Accordion.Body className="border-0 px-3 pb-2">
              <div className="fillSettings">
                <div className="row">
                  <div className="col-lg-12 px-0 text-start">
                    {/* <Form.Control
                  className="propertyTextBox border-0"
                  type="text"
                  placeholder="Add Title"
                  id="inputPassword5"
                  aria-describedby="passwordHelpBlock"
                  // value={titleText}
                  // onChange={(e)=> setTitleText(e.target.value)}
                /> */}
                    {currentIcon && (
                      <div>
                        <span className="text-muted small">Current Icon: </span>
                        <img
                          src={currentIcon || ""}
                          alt="icon"
                          width={25}
                        ></img>
                      </div>
                    )}

                    <button
                      className="btn btn-primary mx-1 me-0 px-3 d-flex ms-auto my-2 mb-0"
                      onClick={handleAddIcon}
                    >
                      <span className="mx-2">
                        {currentIcon ? "Edit" : "Add"} Icon
                      </span>
                      <img src={icon} alt="icon" width={20}></img>
                    </button>
                  </div>
                </div>
              </div>
            </Accordion.Body>
          ) : (
            <Accordion.Body className="border-0 px-3 pb-2">
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
