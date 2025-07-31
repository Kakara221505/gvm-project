import React, { useState, useEffect, useRef } from "react";
import threeDot from "../../../../Assets/Icons/three-dots-svgrepo-com.svg";
import { useShapeContext } from "../../../../contexts/shapeContext";
import EyeShow from "../../../../Assets/Icons/EyeShow.png";
import EyeHide from "../../../../Assets/Icons/EyeHide.svg";
import Unlock from "../../../../Assets/Icons/Unlock.png";
import Lock from "../../../../Assets/Icons/Lock.svg";

const Layer = ({
  userShape,
  getImgType,
  setCurrentActiveOpt,
  currActiveOpt,
  index,
  currentLayerShapes,
  selectedObject,
}) => {
  const [showOpt, setShowOpt] = useState(false);
  const { state, actions } = useShapeContext();
  const [isHide, setIsHide] = useState(false);
  const [shapeLockStates, setShapeLockStates] = useState({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pages, shapes, currentUser, activeCanvas } = state;

  const optionsRef = useRef(null); // Reference for the options menu

  useEffect(() => {
    function handleClickOutside(event) {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOpt(false);
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [optionsRef]);

  function handleLayerOptionClick(e) {
    e.stopPropagation();
    setCurrentActiveOpt(index);
    setIsMenuOpen((prev) => !prev);
    if (index === currActiveOpt) {
      setShowOpt((prev) => !prev);
    } else {
      setShowOpt(true);
    }
  }

  function handleOptions(type) {
    switch (type) {
      case "DUPLICATE":
        actions.updateCurrentOpt({ currentOption: 1, currentObj: userShape });
        break;
      case "DELETE":
        actions.updateCurrentOpt({ currentOption: 2, currentObj: userShape });
        break;
      case "ADD_COMMENT":
        actions.updateCurrentOpt({ currentOption: 3, currentObj: userShape });
        break;
      case "UPDATE_COMMENT":
        actions.updateCurrentOpt({ currentOption: 3, currentObj: userShape });
        break;
      case "ADD_TITLE":
        actions.updateCurrentOpt({ currentOption: 4, currentObj: userShape });
        break;
      case "ADD_ICON":
        actions.updateCurrentOpt({ currentOption: 5, currentObj: userShape });
        break;
      case "SELECT_SHAPE":
        actions.updateCurrentOpt({ currentOption: 7, currentObj: userShape });
        break;
      case "HIDE_INDIVIDUAL_SHAPE":
        const propertiesToUpdate = ["visible", "comment", "title", "icon"];

        propertiesToUpdate.forEach((prop) => {
          if (prop === "visible") {
            userShape.set({ visible: isHide });
          } else if (userShape[prop]) {
            userShape[prop].set({ visible: isHide });
          }
        });

        actions.updateCurrentOpt({ currentObj: userShape });
        break;
      default:
        break;
    }
    handleLayerRemove();
  }

  function handleLayerRemove() {
    setShowOpt(false);
    setCurrentActiveOpt(null);
    setIsMenuOpen(false);
  }

  const handleShapeLockClick = (e, shapeId) => {
    e.stopPropagation();

    const parentLayerId = userShape.LayerID;
    const currentPage = pages.find((res) => res.ID === activeCanvas);
    const parentLayer = currentPage.calendar.layers.find(
      (layer) => layer.ID === parentLayerId
    );

    const isParentLayerLocked = parentLayer.IsLocked;

    if (isParentLayerLocked) {
      // If the parent layer is locked, do not allow unlocking the shape
      return;
    }

    const newLockState = !shapeLockStates[shapeId];
    setShapeLockStates((prevStates) => ({
      ...prevStates,
      [shapeId]: newLockState,
    }));

    const propertiesToUpdate = ["comment", "title", "icon"];

    userShape.set({
      lockMovementX: newLockState,
      lockMovementY: newLockState,
      lockScalingX: newLockState,
      lockScalingY: newLockState,
      lockRotation: newLockState,
      editable: !newLockState,
      selectable: !newLockState,
      evented: !newLockState,
      IsLocked: newLockState,
    });

    propertiesToUpdate.forEach((prop) => {
      if (userShape[prop]) {
        userShape[prop].set({
          lockMovementX: newLockState,
          lockMovementY: newLockState,
          lockScalingX: newLockState,
          lockScalingY: newLockState,
          lockRotation: newLockState,
          editable: !newLockState,
          selectable: !newLockState,
          evented: !newLockState,
          IsLocked: newLockState,
        });
      }
    });

    actions.updateCurrentOpt({ currentObj: userShape });
  };

  const handleShapeClick = () => {
    if (!isMenuOpen) {
      setCurrentActiveOpt(index);
      handleOptions("SELECT_SHAPE");
    }
  };

  return (
    <div
      className={`position-relative ${
        selectedObject?.ID === userShape?.ID && "active"
      }`}
      onClick={handleShapeClick}
    >
      <div className="d-flex flex-row justify-content-between align-items-center  ">
        <div className="iconText w-auto  me-auto ps-2 py-2">
          <img
            src={getImgType(userShape)}
            className="img-fluid"
            alt="shape-img"
            width={30}
          />
          <label className="ps-2">{userShape?.type}</label>
        </div>
        {!isHide && (
          <img
            src={EyeShow}
            className="d-flex ms-auto cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setIsHide(!isHide);
              handleOptions("HIDE_INDIVIDUAL_SHAPE");
            }}
          />
        )}
        {isHide && (
          <img
            src={EyeHide}
            className="d-flex ms-auto cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setIsHide(!isHide);
              handleOptions("HIDE_INDIVIDUAL_SHAPE");
            }}
            width={36}
          />
        )}
        {!shapeLockStates[userShape?.id] ? (
          <img
            src={Unlock}
            className="d-flex cursor-pointer"
            onClick={(e) => handleShapeLockClick(e, userShape.id)}
            width={36}
          />
        ) : (
          <img
            src={Lock}
            className="d-flex cursor-pointer"
            onClick={(e) => handleShapeLockClick(e, userShape.id)}
            width={36}
          />
        )}
        <img
          src={threeDot}
          className="img-fluid cursor-pointer ms-1"
          alt="three-dot"
          width={20}
          onClick={handleLayerOptionClick}
        />
      </div>

      {currActiveOpt === index && showOpt && (
        <div
          ref={optionsRef}
          className="d-flex flex-column fs-6 border p-2 shadow position-absolute end-0 top-100 z-2 rounded-xl bg-white pointer text-start"
        >
          <p
            className="hover-layer my-1 mx-2 cursor-pointer"
            onClick={() => handleOptions("DELETE")}
          >
            Delete
          </p>
          <p
            className="hover-layer my-1 mx-2 cursor-pointer"
            onClick={() => handleOptions("DUPLICATE")}
          >
            Duplicate
          </p>
          <p
            onClick={() =>
              handleOptions(
                userShape?.comment ? "UPDATE_COMMENT" : "ADD_COMMENT"
              )
            }
            className="hover-layer my-1 mx-2 cursor-pointer"
          >
            {userShape?.comment ? "Update Comment" : "Add Comment"}
          </p>
          <p
            onClick={() => handleOptions("ADD_TITLE")}
            className="hover-layer my-1 mx-2 cursor-pointer"
          >
            {userShape?.title ? "Update Title" : "Add Title"}
          </p>
          <p
            onClick={() => handleOptions("ADD_ICON")}
            className="hover-layer my-1 mx-2 cursor-pointer"
          >
            {userShape?.icon ? "Update Icon" : "Add Icon"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Layer;
