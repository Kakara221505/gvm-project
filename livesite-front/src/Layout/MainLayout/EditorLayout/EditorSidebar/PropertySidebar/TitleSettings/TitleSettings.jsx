import React, { useEffect, useState } from "react";
import "./TitleSettings.css";
import Accordion from "react-bootstrap/Accordion";
// import CommonDropdown from "../../../../../../Components/CommonDropdown/CommonDropdown";
import Form from "react-bootstrap/Form";
import plus from "../../../../../../Assets/Icons/plus-sign.png";
import minus from "../../../../../../Assets/Icons/minus-sign.png";
import { useShapeContext } from "../../../../../../contexts/shapeContext";

export default function TitleSettings() {
  const { state, actions } = useShapeContext();
  const { selectedObject, selectedObjIdx, pages, activeCanvas } = state;
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [titleText, setTitleText] = useState("");
  const [shapes, setShapes] = useState([]);

  useEffect(() => {
    const currCanvasData = pages.filter(
      (canvasShape) => canvasShape.ID === activeCanvas
    );
    if (currCanvasData.length > 0) {
      const shapes = [];
      currCanvasData[0].calendar.layers.forEach((res) =>
        shapes.push(...res.annotations)
      );
      setShapes(shapes);
    }
  }, [activeCanvas, pages]);

  useEffect(() => {
    if (shapes?.length < 1) {
      return;
    }
    if (selectedObjIdx !== -1 && selectedObject !== undefined) {
      const currentTitleText = shapes[selectedObjIdx]?.title;
      if (currentTitleText !== null && currentTitleText !== undefined) {
        setTitleText(currentTitleText.text);
      } else {
        setTitleText("");
      }
    }
  }, [shapes, selectedObjIdx]);

  const handleAccordionToggle = () => {
    setIsAccordionOpen(!isAccordionOpen);
  };
  const handleAddTitle = () => {
    actions.updateTitleText(titleText);
    actions.updateCommentAddEditFlag("title");
  };

  return (
    <div className="my-2 ">
      <Accordion defaultActiveKey={null} className="border-0">
        <Accordion.Item eventKey="0" className="border-0">
          <Accordion.Header
            className="border-0 text-black fs-6"
            onClick={handleAccordionToggle}
          >
            <label htmlFor="propertyName" className="propertyTextLabel">
              {selectedObject?.title ? "Update Title" : "Add Title"}
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
            <Accordion.Body className="border-0 px-3 pb-2 ">
              <div className="fillSettings">
                <div className="row">
                  <div className="col-lg-12 px-0">
                    <Form.Control
                      className="propertyTextBox border-0"
                      type="text"
                      placeholder="Add Title..."
                      id="inputPassword5"
                      aria-describedby="passwordHelpBlock"
                      value={titleText}
                      onChange={(e) => setTitleText(e.target.value)}
                    />

                    <button
                      className="btn btn-primary mx-1 me-0 px-3 d-flex ms-auto my-2 mb-0"
                      onClick={handleAddTitle}
                    >
                      Save
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
