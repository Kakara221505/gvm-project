import React, { useEffect, useState, useContext } from "react";
import layer from "../../../../Assets/Icons/Layers.svg";
import up from "../../../../Assets/Icons/TriangleUp.png";
import minus from "../../../../Assets/Icons/TriangleDown.png";
import Unlock from "../../../../Assets/Icons/Unlock.png";
import Lock from "../../../../Assets/Icons/Lock.svg";
import Hide from "../../../../Assets/Icons/EyeHide.svg";
import Show from "../../../../Assets/Icons/EyeShow.png";
import TextICO from "../../../../Assets/Icons/TextIcoLayer.png";
import Plus from "../../../../Assets/SVGIcons/Plus.svg";
import Square from "../../../../Assets/Icons/square.png";
import Rect from "../../../../Assets/Icons/rectangular.png";
import circle from "../../../../Assets/Icons/circle.png";
import triangle from "../../../../Assets/Icons/triangle.png";
import Hexa from "../../../../Assets/Icons/hexagon.png";
import star from "../../../../Assets/Icons/star.png";
import DeleteWhite from "../../../../Assets/Icons/trash.svg";
// import DeleteWhite from "../../../../Assets/Icons/Trash.png";
import EditWhite from "../../../../Assets/Icons/Edit.svg";
import ShapesIcon from "../../../../Assets/Icons/ShapesIcon.png";
import LineIcon from "../../../../Assets/Icons/LineIcon.png";
import "./LayerPanel.css";
import Accordion from "react-bootstrap/Accordion";
import { useShapeContext } from "../../../../contexts/shapeContext";
import Layer from "./Layer";
import AddLayerModal from "../../../../Components/Modals/AddLayerModal";
import DeleteLayerModal from "../../../../Components/Modals/DeleteLayerModal";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import FilterModal from "./FilterModel";
import { ThemeContext } from "../../../../Theme/ThemeContext";

export default function LayerPanel() {
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [currActiveOpt, setCurrentActiveOpt] = useState();
  const [isHide, setIsHide] = useState(false);
  const [isHideId, setIsHideId] = useState();
  const [layerId, setLayerId] = useState();
  const [users, setUsers] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [mergeModalShow, setMergeModalShow] = useState(false);
  const [selectedLayers, setSelectedLayers] = useState([]);
  const [mergedLayerName, setMergedLayerName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingLayerId, setEditingLayerId] = useState(null);
  const { state, actions } = useShapeContext();
  const [layerLockStates, setLayerLockStates] = useState({});
  const [layerVisibilityStates, setLayerVisibilityStates] = useState({});
  const [layerNameError, setLayerNameError] = useState("");
  const {
    pages,
    shapes,
    currentUser,
    activeCanvas,
    selectedObject,
    selectedShapeFilter,
  } = state;
  const [show, setShow] = useState(false);
  const [selectedButtons, setSelectedButtons] = useState([]);
  const { theme } = useContext(ThemeContext);
  // const isActive = (buttonId) => selectedButtons === buttonId;
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleButtonClick = (buttonId) => {
    setSelectedButtons((prevSelected) => {
      if (prevSelected.includes(buttonId)) {
        return prevSelected.filter((id) => id !== buttonId);
      } else {
        return [...prevSelected, buttonId];
      }
    });
  };

  useEffect(() => {
    const currCanvasData = pages.filter(
      (canvasShape) => canvasShape.ID === activeCanvas
    );

    setUsers(currCanvasData[0].calendar.layers);

    if (currCanvasData[0].calendar.layers.length > 0) {
      const existingUser = currCanvasData[0].calendar.layers.find(
        (layer) => layer.ID === currentUser
      );

      if (!existingUser) {
        actions.updateCurrentUser(currCanvasData[0].calendar.layers[0]?.ID);
      }
    }
  }, [activeCanvas, pages, state.selectDate, currentUser]);

  function handleAccordionToggle(userId) {
    actions.updateCurrentUser(userId);
    setIsAccordionOpen((prev) => !prev);
    const findIndex = pages.findIndex((res) => res.ID === activeCanvas);
    pages[findIndex].calendar.layers.map((result) => {
      if (result.ID === userId) {
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
  }

  function getImgType(userShape) {
    const typeOfShape = userShape?.type;

    switch (typeOfShape) {
      case "rect":
        return Rect;
      case "ellipse":
        return circle;
      case "square":
        return Square;
      case "line":
        return LineIcon;
      case "textbox":
        return TextICO;
      case "triangle":
        return triangle;
      case "Star":
        return star;
      case "polygon":
        return Hexa;
      case "FreeForm":
        // toggleDrawPolygon();
        break;
      default:
        break;
    }
  }
  const handleHideClick = (e, layer) => {
    e.stopPropagation();
    const layerId = layer.ID;
    const newVisibilityState = !layer.IsVisible;

    setLayerVisibilityStates((prevStates) => ({
      ...prevStates,
      [layerId]: !newVisibilityState,
    }));

    // Update the layer's visibility in your state management
    actions.updateLayer({
      canvasId: activeCanvas,
      layerId: layerId,
      IsVisible: newVisibilityState,
    });

    if (layer.annotations.length >= 1) {
      layer.annotations.forEach((shape) => {
        // Initialize the original visibility state storage if not already done
        if (shape.originalVisibilityState === undefined) {
          shape.originalVisibilityState = shape.visible;
        }
        const shouldBeVisible = newVisibilityState
          ? shape.originalVisibilityState
          : false;
        shape.set({
          visible: shouldBeVisible,
          isLayerVisible: newVisibilityState,
          // IsVisible: shouldBeVisible,
        });

        const propertiesToUpdate = ["comment", "title", "icon"];
        propertiesToUpdate.forEach((prop) => {
          if (shape[prop]) {
            shape[prop].set({
              visible: shouldBeVisible,
            });
          }
        });

        actions.updateCurrentOpt({ currentObj: shape });
      });
    }
  };

  // const handleLockClick = (e, id) => {
  //   e.stopPropagation();
  //   setIsLock(!isLock);
  //   setIsLockId(id);
  // };

  const handleDelete = (e, data) => {
    const currentPage = pages.find((res) => res.ID === activeCanvas);
    if (currentPage.calendar.layers.length <= 1) {
      toast.warning("Oops, you are not able to delete this layer");
      return;
    }
    e.stopPropagation();
    setDeleteModalShow(true);
    setLayerId(data);
  };

  const handleDeleteLayer = (id) => {
    if (id) {
      const payload = {
        delCanvasId: activeCanvas,
        layerId: id,
      };
      actions.deleteLayer(payload);
      setDeleteModalShow(false);
      setLayerId({});
    } else {
      setDeleteModalShow(false);
      setLayerId({});
    }
  };

  const handleLayerSelect = (layerId) => {
    setSelectedLayers((prevSelectedLayers) => {
      if (prevSelectedLayers.includes(layerId)) {
        return prevSelectedLayers.filter((id) => id !== layerId);
      } else {
        return [...prevSelectedLayers, layerId];
      }
    });
  };

  const handleMergeLayers = () => {
    setMergedLayerName("");
    setMergeModalShow(true);
    setIsEditing(false);
  };

  const handleMergeModalClose = () => {
    setMergeModalShow(false);
    setLayerNameError("");
  };

  const handleMergeModalSave = () => {
    if (!mergedLayerName) {
      setLayerNameError("Name is required");
    } else {
      if (isEditing) {
        actions.updateLayer({
          canvasId: activeCanvas,
          layerId: editingLayerId,
          newName: mergedLayerName,
        });
      } else {
        actions.mergeLayers({
          selectedCanvasId: activeCanvas,
          layerIds: selectedLayers,
          mergedLayerName,
        });
      }
      setSelectedLayers([]);
      setMergeModalShow(false);
      setLayerNameError("");
    }
  };

  const handleEditLayerName = (layerId, currentName) => {
    setMergedLayerName(currentName);
    setEditingLayerId(layerId);
    setIsEditing(true);
    setMergeModalShow(true);
  };

  const handleLockClick = (e, layer) => {
    e.stopPropagation();
    const layerId = layer.ID;
    const newLockState = !layerLockStates[layerId];
    setLayerLockStates((prevStates) => ({
      ...prevStates,
      [layerId]: newLockState,
    }));

    actions.updateLayer({
      canvasId: activeCanvas,
      layerId: layerId,
      IsLocked: newLockState,
    });

    if (layer.annotations.length >= 1) {
      layer.annotations.forEach((shape) => {
        // Initialize the original lock state storage if not already done
        if (!shape.originalLockState) {
          shape.originalLockState = {
            lockMovementX: shape.lockMovementX,
            lockMovementY: shape.lockMovementY,
            lockScalingX: shape.lockScalingX,
            lockScalingY: shape.lockScalingY,
            lockRotation: shape.lockRotation,
            editable: shape.editable,
            selectable: shape.selectable,
            evented: shape.evented,
          };
        }

        // Determine the new lock state based on the layer's lock state and the shape's original lock state
        const shouldLock =
          newLockState || shape.originalLockState.lockMovementX;

        shape.set({
          lockMovementX: shouldLock,
          lockMovementY: shouldLock,
          lockScalingX: shouldLock,
          lockScalingY: shouldLock,
          lockRotation: shouldLock,
          editable: !shouldLock,
          selectable: !shouldLock,
          evented: !shouldLock,
        });

        const propertiesToUpdate = ["comment", "title", "icon"];
        propertiesToUpdate.forEach((prop) => {
          if (shape[prop]) {
            shape[prop].set({
              lockMovementX: shouldLock,
              lockMovementY: shouldLock,
              lockScalingX: shouldLock,
              lockScalingY: shouldLock,
              lockRotation: shouldLock,
              editable: !shouldLock,
              selectable: !shouldLock,
              evented: !shouldLock,
            });
          }
        });

        actions.updateCurrentOpt({ currentObj: shape });
      });
    }
  };

  const MergeButton = ({ handleMergeLayers, selectedLayers }) => (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id="merge-tooltip">Merge Layers</Tooltip>}
    >
      <button
        className="border-0 bg-transparent"
        onClick={handleMergeLayers}
        disabled={selectedLayers.length < 2}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="icon icon-tabler icon-tabler-arrow-merge"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="var(--text-primary)"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M8 7l4 -4l4 4" />
          <path d="M12 3v5.394a6.737 6.737 0 0 1 -3 5.606a6.737 6.737 0 0 0 -3 5.606v1.394" />
          <path d="M12 3v5.394a6.737 6.737 0 0 0 3 5.606a6.737 6.737 0 0 1 3 5.606v1.394" />
        </svg>
      </button>
    </OverlayTrigger>
  );

  const FilterButton = () => (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id="filter-tooltip">Filter</Tooltip>}
    >
      <button className="border-0 bg-transparent">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="icon icon-tabler icon-tabler-adjustments-horizontal"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="var(--text-primary)"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M14 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
          <path d="M4 6l8 0" />
          <path d="M16 6l4 0" />
          <path d="M8 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
          <path d="M4 12l2 0" />
          <path d="M10 12l10 0" />
          <path d="M17 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
          <path d="M4 18l11 0" />
          <path d="M19 18l1 0" />
        </svg>
      </button>
    </OverlayTrigger>
  );

  const AddButton = () => (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id="filter-tooltip">Add Layer</Tooltip>}
    >
      <button className="border-0 bg-transparent" onClick={() => setModalShow(true)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="icon icon-tabler icon-tabler-plus"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="var(--text-primary)"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 5l0 14" />
          <path d="M5 12l14 0" />
        </svg>
      </button>
    </OverlayTrigger>
  );

  return (
    <>
      <div className="LayerSection px-1 layerContainer">
        <div className="LayerHeading">
          <div className="row align-items-center py-2 mx-0 border-bottom border-2">
            <div className="col-lg-6 d-flex align-items-center justify-content-start pe-5">
              <img
                src={layer}
                className="fillImg1"
                alt="layer"
                width={"36px"}
                height={"36px"}
              />
              <label className="lightText pe-5">Layers</label>
            </div>
            <div className="col-lg-6 border-start border-2 d-flex justify-content-end">
              <AddButton />
              <MergeButton
                handleMergeLayers={handleMergeLayers}
                selectedLayers={selectedLayers}
              />
              <div onClick={handleShow}>
                <FilterButton />
              </div>
              <div></div>
            </div>
          </div>
        </div>

        <div className="LayerList my-3">
          <div className="Layer col-lg-5 w-100">
            <Accordion
              defaultActiveKey={currentUser}
              className="accMain border-0"
              activeKey={currentUser}
            >
              {users &&
                users.map((user, idx) => (
                  <Accordion.Item
                    eventKey={user.ID}
                    className="border-0 accItem"
                    key={idx}
                  >
                    <Accordion.Header
                      className={`accHeaderMain border-0 cursor-pointer d-flex align-items-center justify-content-between text-black fs-6 `}
                      onClick={() => handleAccordionToggle(user.ID)}
                    >
                      <div className="d-flex align-items-center">
                        <img
                          src={isAccordionOpen ? minus : up}
                          className="img-fluid adI d-flex ms-auto fs-5"
                          alt="Toggle icon"
                        />
                        <label
                          htmlFor="propertyName"
                          className={`mt-1 ps-2 propertyTextLabel1`}
                        >
                          {user?.Name}
                        </label>
                      </div>
                      <div className="d-flex ms-auto align-items-center">
                        {!layerVisibilityStates[user.ID] ? (
                          <img
                            src={Show}
                            className="d-flex filImg ms-auto"
                            onClick={(e) => {
                              setIsHide(!isHide);
                              setIsHideId(user.ID);
                              handleHideClick(e, user);
                            }}
                          />
                        ) : (
                          <img
                            src={Hide}
                            className="d-flex filImg ms-auto"
                            onClick={(e) => {
                              setIsHide(!isHide);
                              setIsHideId(user.ID);
                              handleHideClick(e, user);
                            }}
                            width={36}
                          />
                        )}
                        {!layerLockStates[user.ID] ? (
                          <img
                            src={Unlock}
                            className="d-flex filImg ms-auto"
                            onClick={(e) => handleLockClick(e, user)}
                          />
                        ) : (
                          <img
                            src={Lock}
                            className="d-flex filImg ms-auto"
                            onClick={(e) => handleLockClick(e, user)}
                            width={36}
                          />
                        )}
                        <img
                          src={DeleteWhite}
                          className="d-flex filImgICO ms-auto"
                          onClick={(e) => handleDelete(e, user)}
                          width={36}
                        />
                        <img
                          src={EditWhite}
                          className="d-flex filImgICO ms-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditLayerName(user.ID, user.Name);
                          }}
                          // width={36}
                        />
                        <div
                          className="mx-2"
                          style={{
                            display: "inline-block",
                            width: "20px",
                            height: "20px",
                            border: "1px solid var(--checkBox)",
                            borderRadius: "3px",
                            backgroundColor: selectedLayers.includes(user.ID)
                              ? "#007bff"
                              : "transparent",
                            cursor: "pointer",
                          }}
                          onClick={() => handleLayerSelect(user.ID)}
                        >
                          {selectedLayers.includes(user.ID) && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="16"
                              height="16"
                              fill="white" // Change the color of the checkmark icon
                              style={{ display: "block", margin: "2px auto" }}
                            >
                              <path d="M9 16.2l-4.2-4.2-1.4 1.4 5.6 5.6 12-12-1.4-1.4z" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body className="bodyLayer border-0 px-3">
                      <div className="fillSettings">
                        <div className="row d-flex flex-column position-relative">
                          {user.annotations &&
                            user.annotations.map((userShape, userIdx) =>
                              selectedShapeFilter.length === 0 ||
                              selectedShapeFilter.includes(userShape.type) ? (
                                <Layer
                                  key={userIdx}
                                  userShape={userShape}
                                  getImgType={getImgType}
                                  currActiveOpt={currActiveOpt}
                                  setCurrentActiveOpt={setCurrentActiveOpt}
                                  index={userIdx}
                                  selectedObject={selectedObject}
                                />
                              ) : null
                            )}
                        </div>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
            </Accordion>
          </div>
        </div>
      </div>

      <AddLayerModal show={modalShow} onHide={() => setModalShow(false)} />
      <DeleteLayerModal
        layerdata={layerId}
        show={deleteModalShow}
        onHide={(id) => handleDeleteLayer(id)}
      />

      <Modal show={mergeModalShow} onHide={handleMergeModalClose} centered dialogClassName={theme}>
        <Modal.Header closeButton className='commonModalBg'>
          <Modal.Title className="menuTextHeader" >
            {isEditing ? "Edit Layer Name" : "Merge Layers"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className='commonModalBg'>
          <Form>
            <Form.Group controlId="mergedLayerName">
              <Form.Label className="yellowText">
                {isEditing
                  ? "Enter New Layer Name:"
                  : "Enter Name For Merged Layer:"}
              </Form.Label>
              <Form.Control
                type="text"
                value={mergedLayerName}
                onChange={(e) => setMergedLayerName(e.target.value)}
              />
              {layerNameError && (
                <p className="text-danger">{layerNameError}</p>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className='commonModalBg'>
          <Button variant="secondary" onClick={handleMergeModalClose}>
            Cancel
          </Button>
          <Button variant="primary" className="loginBtn1" onClick={handleMergeModalSave}>
            {isEditing ? "Save" : "Merge"}
          </Button>
        </Modal.Footer>
      </Modal>
      {show && (
        <FilterModal
          show={show}
          handleClose={handleClose}
          selectedButtons={selectedButtons}
          setSelectedButtons={setSelectedButtons}
          handleButtonClick={handleButtonClick}
        />
      )}
    </>
  );
}
