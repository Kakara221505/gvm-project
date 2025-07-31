import React, { useEffect, useState } from "react";
import "./CommentSettings.css";
import Accordion from "react-bootstrap/Accordion";
// import CommonDropdown from "../../../../../../Components/CommonDropdown/CommonDropdown";
import Form from "react-bootstrap/Form";
import plus from "../../../../../../Assets/Icons/plus-sign.png";
import minus from "../../../../../../Assets/Icons/minus-sign.png";
import { useShapeContext } from "../../../../../../contexts/shapeContext";

export default function CommentSettings({ setSelectSpecialFields }) {
  const { state, actions } = useShapeContext();
  const { pages, activeCanvas, selectedObject, selectedObjIdx } = state;
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [shapes, setShapes] = useState([]);
  const { isSelectSpeacial } = state;

  useEffect(() => {
    const currCanvasData = pages.filter(
      (canvasShape) => canvasShape.ID === activeCanvas
    );
    if (currCanvasData.length > 0) {
      const shapes = [];
      currCanvasData[0]?.calendar?.layers.forEach((res) =>
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
      const currentCommentText = shapes[selectedObjIdx]?.comment;
      if (currentCommentText !== null && currentCommentText !== undefined) {
        setCommentText(currentCommentText.text);
      } else {
        setCommentText("");
      }
    }
  }, [shapes, selectedObjIdx]);

  const handleAccordionToggle = () => {
    setIsAccordionOpen(!isAccordionOpen);
  };

  const handleAddComment = () => {
    if (isSelectSpeacial) {
      let commnetShape = selectedObject.comment?.toObject();
      const UserID = selectedObject.comment.UserID;
      const LayerID = selectedObject.comment.LayerID;
      const PageID = selectedObject.comment.PageID;
      const ShapeID = selectedObject.comment.ParentAnnotationID;
      const commentId = selectedObject.comment.ID;
      const label = selectedObject.comment.label;
      const AssignDate = selectedObject.comment?.AssignDate;
      const CategoryID = selectedObject.comment?.CategoryID || 1;
      const SubCategoryID = selectedObject.comment?.SubCategoryID || 1;
      const bob_no_id = selectedObject.comment?.bob_no_id;
      const parentSelectSpecialId =
        selectedObject.comment?.parentSelectSpecialId || null;
      const isPasteSpecialParent =
        selectedObject.comment?.isPasteSpecialParent || false;
      setSelectSpecialFields((prevState) => ({
        ...prevState,
        comment: {
          ...commnetShape,
          ParentAnnotationID: ShapeID,
          PageID: PageID,
          LayerID: LayerID,
          UserID: UserID,
          label: label,
          ID: commentId,
          AssignDate: AssignDate,
          CategoryID: CategoryID,
          SubCategoryID: SubCategoryID,
          bob_no_id: bob_no_id,
          parentSelectSpecialId: parentSelectSpecialId,
          isPasteSpecialParent: isPasteSpecialParent,
          text: commentText
        },
      }));
    }
    actions.updateCommentText(commentText);
    actions.updateCommentAddEditFlag("comment");
    actions.changesThings();
  };

  return (
    <div className="my-2">
      <Accordion defaultActiveKey={null} className="border-0">
        <Accordion.Item eventKey="0" className="border-0">
          <Accordion.Header
            className="border-0 text-black fs-6"
            onClick={handleAccordionToggle}
          >
            <label htmlFor="propertyName" className="propertyTextLabel">
              {selectedObject?.comment ? "Update Comment" : "Add Comment"}
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
                  <div className="col-lg-12 px-0">
                    <Form.Control
                      className="propertyTextBox border-0"
                      type="text"
                      placeholder="Add Comment..."
                      id="inputPassword5"
                      aria-describedby="passwordHelpBlock"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />

                    <button
                      className="btn btn-primary mx-1 me-0 px-3 d-flex ms-auto my-2 mb-0"
                      onClick={handleAddComment}
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
