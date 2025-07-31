import { useParams } from "react-router-dom";
import { useShapeContext } from "../contexts/shapeContext";
import { useEffect } from "react";

export const GlobalValues = () => {
  const userID = localStorage.getItem("UserID");
  const token = localStorage.getItem("AdminToken");
  // const getDate = localStorage.getItem("CalendarDate");
  const { projectId } = useParams();
  const { state, actions } = useShapeContext();

  let {
    pages,
    currentUser,
    selectedObject,
    commentText,
    commentAddEditFlag,
    titleText,
    canvases,
    activeCanvas,
    currentOption,
    currentObj,
    showEmoji,
    properties,
    isCanvasDelete,
    selectedShapeFilter,
  } = state;


  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  return {
    userID,
    token,
    // getDate,
    headers,
    projectId,
    currentUser,
    activeCanvas,
  };
};
