import React, { useState, useEffect, useRef } from "react";
import { fabric } from "fabric";
import "./EditorCanvas.css";
import { pdfjs } from "react-pdf";
import { useShapeContext } from "../../../../../contexts/shapeContext";
import EmojiPicker from "emoji-picker-react";
import { ControlledMenu, MenuItem } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import PDFFileFilterModal from "./PDFFileFilterModal/PDFFileFilterModal";
import createId from "../../../../../Common/Constants/CreateId";
import { getUserId } from "../../../../../Common/Common";
import { postApiCaller } from "../../../../../Lib/apiCaller";
import { GlobalValues } from "../../../../../Lib/GlobalValues";
import dayjs from "dayjs";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const svgRotateIcon = encodeURIComponent(`
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g filter="url(#filter0_d)">
    <circle cx="9" cy="9" r="5" fill="white"/>
    <circle cx="9" cy="9" r="4.75" stroke="black" stroke-opacity="0.3" stroke-width="0.5"/>
  </g>
    <path d="M10.8047 11.1242L9.49934 11.1242L9.49934 9.81885" stroke="black" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6.94856 6.72607L8.25391 6.72607L8.25391 8.03142" stroke="black" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9.69517 6.92267C10.007 7.03301 10.2858 7.22054 10.5055 7.46776C10.7252 7.71497 10.8787 8.01382 10.9517 8.33642C11.0247 8.65902 11.0148 8.99485 10.9229 9.31258C10.831 9.63031 10.6601 9.91958 10.4262 10.1534L9.49701 11.0421M8.25792 6.72607L7.30937 7.73554C7.07543 7.96936 6.90454 8.25863 6.81264 8.57636C6.72073 8.89408 6.71081 9.22992 6.78381 9.55251C6.8568 9.87511 7.01032 10.174 7.23005 10.4212C7.44978 10.6684 7.72855 10.8559 8.04036 10.9663" stroke="black" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
  <defs>
  <filter id="filter0_d" x="0" y="0" width="18" height="18" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
    <feOffset/>
    <feGaussianBlur stdDeviation="2"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0.137674 0 0 0 0 0.190937 0 0 0 0 0.270833 0 0 0 0.15 0"/>
    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
  </filter>
  </defs>
</svg>
`);
const rotateIcon = `data:image/svg+xml;utf8,${svgRotateIcon}`;
const imgIcon = document.createElement("img");
imgIcon.src = rotateIcon;

function Editor({
  filePreview,
  shapeToDraw,
  setShapeToDraw,
  backgroundColor,
  filesPreviewShape,
}) {
  const [selectedIdx, setSelectedIdx] = useState();
  const [isOpen, setOpen] = useState(false);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [shapes, setShapes] = useState([]);
  const [bgImgsData, setBgImgsData] = useState([]);
  const canvasRefs = useRef({});
  const [showContext, setShowContext] = useState(false);
  const { state, actions } = useShapeContext();
  const [chosenEmoji, setChosenEmoji] = useState(null);
  const [modalShowPDF, setModalShowPDF] = React.useState(false);
  const options = [
    { label: "Duplicate" },
    { label: "Delete" },
    { label: "Add Comment" },
    { label: "Add Icon" },
    { label: "Add Title" },
  ];
  const [users, setUsers] = useState([]);
  const { headers, getDate, token, projectId } = GlobalValues();
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  // free form shape states
  let activeLine;
  let activeShape;
  let lineArray = [];
  let pointArray = [];
  let isDragging = false;
  let isCanvasZoomed = false;
  let lastPosX = 0;
  let lastPosY = 0;
  let targetedObj = null;
  const isPanning = useRef(false);
  const [drawMode, setDrawMode] = useState(false);
  const [contextMenuOptions, setContextMenuOptions] = useState(options || []);
  const [isPointArray, setIsPointArray] = useState([]);
  const [isLineArray, setIsLineArray] = useState([]);
  const [isActiveShape, setIsActiveShape] = useState();

  const usersRef = useRef(users);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

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
  const [currentBgImg, setCurrentBgImg] = useState(null);

  const {
    fillColor,
    strokeColor,
    strokeWidth,
    fillType,
    strokeType,
    color1,
    color2,
    fontFamily,
    fontSize,
    fontWeight,
    fontStyle,
    textDecoration,
  } = properties;

  const [shapeFillColor, setShapeFillColor] = useState("#ffffff");
  const [shapeStrokeColor, setShapeStrokeColor] = useState("#000000");

  const shapeFillColorRef = useRef(shapeFillColor);
  const shapeStrokeColorRef = useRef(shapeStrokeColor);

  useEffect(() => {
    shapeFillColorRef.current = shapeFillColor;
  }, [shapeFillColor]);

  useEffect(() => {
    shapeStrokeColorRef.current = shapeStrokeColor;
  }, [shapeStrokeColor]);

  // Function to render the uploaded image on canvas and fill the selected shape
  const renderUploadedImage = () => {
    if (filesPreviewShape instanceof File) {
      // Check if filesPreviewShape is a File object
      const canvas = canvasRefs.current[activeCanvas];
      const reader = new FileReader();

      // Read the uploaded image file as a data URL
      reader.onload = function (event) {
        const imageUrl = event.target.result;

        fabric.Image.fromURL(imageUrl, (img) => {
          // Resize the image to fit the canvas if needed
          img.scaleToWidth(canvas.width);
          img.scaleToHeight(canvas.height);

          // Set the uploaded image as a pattern fill for the selected shape
          const selectedObject = canvas.getActiveObject();
          if (selectedObject) {
            if (selectedObject.isEditing) {
              selectedObject.setSelectionStyles({
                fill: new fabric.Pattern({
                  source: img.getElement(),
                  repeat: "no-repeat",
                }),
              });
            } else {
              selectedObject.set({
                fill: new fabric.Pattern({
                  source: img.getElement(),
                  repeat: "no-repeat",
                }),
              });
            }
            canvas.renderAll();
          }
        });
      };

      // Read the image file as a data URL
      reader.readAsDataURL(filesPreviewShape);
    }
  };

  // Call renderUploadedImage function whenever filesPreviewShape changes
  useEffect(() => {
    renderUploadedImage();
  }, [filesPreviewShape]);
  useEffect(() => {
    if (!currentOption || !currentObj) {
      return;
    }

    switch (currentOption) {
      case 1:
        duplicateShape(currentObj);
        break;

      case 2:
        removeShape(currentObj);
        break;

      case 3:
        if (currentObj?.comment) {
          canvasRefs.current[activeCanvas].setActiveObject(currentObj.comment);
        } else {
          actions.updateCommentText("Add Your Comment...");
          actions.updateCommentAddEditFlag("comment");
          // setTargetedObj(currentObj)
          targetedObj = currentObj;
          selectShape(currentObj);
          addComments();
        }
        break;

      case 4:
        if (currentObj?.title) {
          canvasRefs.current[activeCanvas].setActiveObject(currentObj.title);
        } else {
          actions.updateTitleText("Add Your Title...");
          actions.updateCommentAddEditFlag("title");
          targetedObj = currentObj;
          selectShape(currentObj);
          addTitle();
        }
        break;

      case 5:
        targetedObj = currentObj;
        selectShape(currentObj);
        addEmoji();
        break;

      case 6:
        addBackground(currentObj);
        break;
      case 7:
        setShapeToDraw("select");
        canvasRefs.current[activeCanvas].setActiveObject(currentObj);
      default:
        break;
    }

    actions.updateCurrentOpt({ currentOption: null, currentObj: null });
  }, [currentOption]);

  useEffect(() => {
    if (state?.deletedlayer && state?.deletedlayer.length > 0) {
      if (state?.deletedlayer[0]?.annotations.length === 0) return;
      state?.deletedlayer &&
        state?.deletedlayer[0]?.annotations.map((item) => {
          removeShape(item);
        });
      state.deletedlayer = [];
    }
  }, [state?.deletedlayer]);

  useEffect(() => {
    if (canvasRefs.current[isCanvasDelete]) {
      canvasRefs.current[isCanvasDelete].clear();
      canvasRefs.current[isCanvasDelete].dispose();
      canvasRefs.current[isCanvasDelete] = null;
      actions.removeCanvasID("");
      actions.removeCanvas(isCanvasDelete);
    }
  }, [isCanvasDelete]);

  function selectShape(targetedObj) {
    handleSelection({ selected: [targetedObj] });
  }

  function areDatesSame(date1, date2) {
    if (!date1 || !date2) {
      return false;
    }
    const day1 = date1.getDate();
    const month1 = date1.getMonth();
    const year1 = date1.getFullYear();
    const [month, day, year] = date2?.split("/");
    const day2 = day;
    const month2 = month;
    const year2 = year;

    return day1 === day2 && month1 === month2 && year1 === year2;
  }

  // Function to check if a date lies within a range of two other dates
  function isDateInRange(date, startDate, endDate) {
    if (!startDate || !endDate || !date) {
      return false;
    }
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const startDay = startDate.getDate();
    const startMonth = startDate.getMonth();
    const startYear = startDate.getFullYear();

    const endDay = endDate.getDate();
    const endMonth = endDate.getMonth();
    const endYear = endDate.getFullYear();

    return (
      (year > startYear ||
        (year === startYear && month > startMonth) ||
        (year === startYear && month === startMonth && day >= startDay)) &&
      (year < endYear ||
        (year === endYear && month < endMonth) ||
        (year === endYear && month === endMonth && day <= endDay))
    );
  }

  function addBackground(currnetObj) {
    let foundBg = [];
    for (let i = 0; i < bgImgsData.length; i++) {
      let currentBgObj = bgImgsData[i];
      if (currentBgObj.assignType === "single") {
        if (areDatesSame(currnetObj, currentBgObj?.assignedDate)) {
          foundBg.push(currentBgObj);
        }
      } else if (currentBgObj.assignType === "custom") {
        if (
          isDateInRange(
            currnetObj,
            currentBgObj?.startDate,
            currentBgObj?.endDate
          )
        ) {
          foundBg.push(currentBgObj);
        }
      } else if (currentBgObj.assignType === "all") {
        // do something else
      }
    }
    if (foundBg.length > 0) {
      setBackgroundImage(foundBg[0]?.value);
      setCurrentBgImg(foundBg[0]);
    } else {
      const canvas = canvasRefs.current[activeCanvas];
      const backgroundImage = canvas.backgroundImage;

      canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
      setCurrentBgImg(null);
      canvas.remove(backgroundImage);
    }
  }

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
      setBgImgsData(currCanvasData[0].background);
    }
    setUsers(currCanvasData[0].calendar.layers);
    setShowContext(false);
  }, [activeCanvas, pages, state, shapeToDraw]);

  useEffect(() => {
    if (!canvasRefs) {
      return;
    }
    canvasRefs.current[activeCanvas]?.requestRenderAll();
  }, [state]);

  useEffect(() => {
    const loadImage = async () => {
      try {
        if (!filePreview) return;
        if (filePreview.type.startsWith("image/")) {
          const imageUrl = await loadImageAsDataURL(filePreview);

          setBackgroundImage(imageUrl);

          const payload = {
            id2: new Date().getTime(),
            data: imageUrl,
            type: "image",
            startDate: new Date(),
            endDate: new Date(),
            canvasId6: activeCanvas,
          };
          actions.addBackgroundToCanvas(payload);
          setCurrentBgImg(payload);
        } else if (filePreview.type === "application/pdf") {
          const imageUrl = await renderPdfAsImage(filePreview);

          setBackgroundImage(imageUrl);
          const payload = {
            id2: new Date().getTime(),
            data: imageUrl,
            type: "pdf",
            startDate: new Date(),
            endDate: new Date(),
            canvasId6: activeCanvas,
          };
          setCurrentBgImg(payload);
          actions.addBackgroundToCanvas(payload);
        }
      } catch (error) {
        console.error("Error handling image upload:", error);
      }
    };

    loadImage();
  }, [filePreview]);

  const renderPdfAsImage = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const typedArray = new Uint8Array(event.target.result);
          const pdfData = typedArray.buffer;

          const pdfDoc = await pdfjs.getDocument({ data: pdfData }).promise;
          const pdfPage = await pdfDoc.getPage(1);

          const viewport = pdfPage.getViewport({ scale: 1 });
          const canvasElement = document.createElement("canvas");
          const context = canvasElement.getContext("2d");
          canvasElement.width = viewport.width;
          canvasElement.height = viewport.height;

          await pdfPage.render({ canvasContext: context, viewport }).promise;

          const imageUrl = canvasElement.toDataURL("image/jpeg");
          resolve(imageUrl);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const loadImageAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const setBackgroundImage = (imageUrl) => {
    const canvas = canvasRefs.current[activeCanvas];
    fabric.Image.fromURL(imageUrl, (img) => {
      // Adjust the initial position and scale to fit the canvas
      img.scaleToWidth(canvas.width);
      img.scaleToHeight(canvas.height);
      img.setCoords();
      img.selectable = false; // Prevent selection of the background image
      canvas.add(img);

      // Add the image to the canvas as the background
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
        scaleX: canvas.width / img.width,
        scaleY: canvas.height / img.height,
        originX: "left",
        originY: "top",
        top: 0,
        left: 0,
        crossOrigin: "anonymous",
        backgroundImageStretch: true, // ensure the image covers the whole canvas
      });
    });
  };

  const initializeFabricCanvas = (canvasId, bgColor) => {
    const canvas = new fabric.Canvas(canvasId, {
      backgroundColor: bgColor,
    });
    canvas.originalWidth = window.innerWidth;
    canvas.originalHeight = window.innerHeight;

    canvas.on("after:render", () => {
      canvas.calcOffset();
      canvas.forEachObject((obj) => obj.setCoords());
    });

    const canvasElement = canvas.upperCanvasEl; // Use upperCanvasEl for Fabric.js version 2+

    canvasElement.addEventListener("contextmenu", function (e) {
      e.preventDefault(); // Prevent the browser's context menu from appearing
      const pointer = canvas.getPointer(e);
      // Check if there is an active object selected
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        preventDefaultContextMenu(e, activeObject);
        // The right-click occurred on an object
        // let activeIdx = 0;
        // const currCanvasData = pages.filter(
        //   (canvasShape) => canvasShape.ID === activeCanvas
        // );
        // if (currCanvasData.length > 0) {
        //   const LayerIndx = currCanvasData[0].calendar.layers.findIndex(
        //     (res) => res.ID === currentUser
        //   );
        //   activeIdx = currCanvasData[0].calendar.layers[
        //     LayerIndx
        //   ]?.annotations?.findIndex((shape) => shape.ID === activeObject.ID);
        // }
        // if (activeIdx >= -1) {
        //   preventDefaultContextMenu(e, activeObject);
        // }
      } else {
        // preventDefaultContextMenu(e, activeObject);
        console.log("Else nothing", activeObject);
      }
    });

    return canvas;
  };

  // Function to clear incomplete polygon
  const clearIncompletePolygon = () => {
    if (isPointArray?.length > 0) {
      isPointArray?.forEach((point) =>
        canvasRefs.current[activeCanvas].remove(point)
      );
      isLineArray?.forEach((line) =>
        canvasRefs.current[activeCanvas].remove(line)
      );
      if (isActiveShape) {
        canvasRefs.current[activeCanvas].remove(isActiveShape);
      }
      setIsPointArray([]);
      setIsLineArray([]);
      setIsActiveShape({});
      canvasRefs.current[activeCanvas].renderAll();
    }
  };

  const addPoint = (options) => {
    const pointer = canvasRefs.current[activeCanvas].getPointer(options.e);
    const pointOption = {
      id: new Date().getTime(),
      radius: 5,
      fill: "#ffffff",
      stroke: "#333333",
      strokeWidth: 0.5,
      left: pointer.x,
      top: pointer.y,
      selectable: false,
      hasBorders: false,
      hasControls: false,
      originX: "center",
      originY: "center",
      objectCaching: false,
    };
    const point = new fabric.Circle(pointOption);

    if (pointArray.length === 0) {
      point.set({
        fill: "red",
      });
    }
    const linePoints = [pointer.x, pointer.y, pointer.x, pointer.y];
    const lineOption = {
      strokeWidth: 2,
      fill: "#999999",
      stroke: "#999999",
      originX: "center",
      originY: "center",
      selectable: false,
      hasBorders: false,
      hasControls: false,
      evented: false,
      objectCaching: false,
    };
    const line = new fabric.Line(linePoints, lineOption);
    line.class = "line";
    if (activeShape) {
      const points = activeShape.get("points");
      points.push({
        x: pointer.x,
        y: pointer.y,
      });
      const polygon = new fabric.Polygon(points, {
        stroke: "#333333",
        strokeWidth: 1,
        fill: "#cccccc",
        opacity: 0.3,
        selectable: false,
        hasBorders: false,
        hasControls: false,
        evented: false,
        objectCaching: false,
      });
      setIsActiveShape(polygon);
      canvasRefs.current[activeCanvas].remove(activeShape);
      canvasRefs.current[activeCanvas].add(polygon);
      activeShape = polygon;
      canvasRefs.current[activeCanvas].renderAll();
    } else {
      const polyPoint = [{ x: pointer.x, y: pointer.y }];
      const polygon = new fabric.Polygon(polyPoint, {
        stroke: "#333333",
        strokeWidth: 1,
        fill: "#cccccc",
        opacity: 0.3,
        selectable: false,
        hasBorders: false,
        hasControls: false,
        evented: false,
        objectCaching: false,
      });
      activeShape = polygon;
      setIsActiveShape(polygon);
      canvasRefs.current[activeCanvas].add(polygon);
    }

    activeLine = line;
    pointArray.push(point);
    lineArray.push(line);

    canvasRefs.current[activeCanvas].add(line);
    canvasRefs.current[activeCanvas].add(point);
  };

  const generatePolygon = (pointArray) => {
    if (!canvasRefs) {
      return;
    }
    const points = [];
    for (const point of pointArray) {
      points.push({
        x: point.left,
        y: point.top,
      });
      canvasRefs.current[activeCanvas].remove(point);
    }

    for (const line of lineArray) {
      canvasRefs.current[activeCanvas].remove(line);
    }

    canvasRefs.current[activeCanvas].remove(activeShape).remove(activeLine);

    const polygon = new fabric.Polygon(points, {
      ID: createId(),
      UserID: getUserId(),
      PageID: activeCanvas,
      LayerID: currentUser,
      stroke: "#000",
      fill: "#fff",
      strokeDashArray:
        strokeType === "Dashed"
          ? [5, 5]
          : strokeType === "Dotted"
          ? [1, 5]
          : null,
      objectCaching: false,
      moveable: false,
      originX: "center",
      originY: "center",
      comment: null,
      title: null,
      icon: null,
    });
    canvasRefs.current[activeCanvas].add(polygon);
    toggleDrawPolygon();
    actions.selectShapeType(false);
    actions.addShape(polygon);
  };

  const toggleDrawPolygon = (event) => {
    clearCanvasEvents(canvasRefs.current[activeCanvas]);
    if (drawMode) {
      // stop draw mode
      activeLine = null;
      activeShape = null;
      lineArray = [];
      pointArray = [];
      canvasRefs.current[activeCanvas].selection = true;
      setDrawMode(false);
    } else {
      // start draw mode
      clearCanvasEvents(canvasRefs.current[activeCanvas]);
      canvasRefs.current[activeCanvas].selection = false;
      setDrawMode(true);
    }
  };

  useEffect(() => {
    if (canvasRefs.current[activeCanvas]) {
      // Update background color when state changes
      canvasRefs.current[activeCanvas].backgroundColor = backgroundColor;
      canvasRefs.current[activeCanvas].renderAll();
      actions.updateShapeBackground({
        id: new Date().getTime(),
        canvasId5: activeCanvas,
        newColor: backgroundColor,
      });
    }
  }, [backgroundColor, activeCanvas]);

  useEffect(() => {
    fetchCanvasData()
    canvases.forEach((canvas) => {
      if (!canvasRefs.current[canvas.id]) {
        canvasRefs.current[canvas.id] = initializeFabricCanvas(
          canvas.id,
          backgroundColor
        );
        canvasRefs.current[canvas.id].on("after:render", () => {
          canvasRefs.current[canvas.id].calcOffset();
          canvasRefs.current[canvas.id].forEachObject((obj) => obj.setCoords());
        });
      }
    });
  }, [canvases, backgroundColor, currentUser]);

  const fetchCanvasData = async () => {
    try {
      const calendarDate = dayjs(getDate).format("YYYY-MM-DD");
      const apiUrl = `project/projectById`;
      const payload = {
        projectID: projectId,
        calendarDate: calendarDate,
      };
      const response = await postApiCaller(apiUrl, payload, headers);
      // console.log("response",response);
      return response
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }

  useEffect(() => {
    if (canvasRefs && canvasRefs.current[activeCanvas]) {
      const canvasWidth = canvasRefs.current[activeCanvas].originalWidth;
      const canvasHeight = canvasRefs.current[activeCanvas].originalHeight;
      // Update canvas size
      canvasRefs.current[activeCanvas].setWidth(canvasWidth);
      canvasRefs.current[activeCanvas].setHeight(canvasHeight);
    }
  }, [activeCanvas]);

  useEffect(() => {
    if (canvasRefs && canvasRefs.current[activeCanvas]) {
      if (shapeToDraw !== "") {
        createShape(shapeToDraw);
        clearIncompletePolygon();
      }
    }
  }, [shapeToDraw]);

  useEffect(() => {
    setShapeToDraw("select");
  }, [activeCanvas]);

  useEffect(() => {
    if (!canvasRefs) {
      return;
    }
    if (commentAddEditFlag === "") {
      return;
    }

    if (commentAddEditFlag === "comment") {
      addComments();
    } else if (commentAddEditFlag === "title") {
      addTitle();
    }
  }, [commentAddEditFlag]);

  function addTitle() {
    targetedObj = targetedObj || selectedObject;
    canvasRefs.current[activeCanvas].setActiveObject(targetedObj);
    if (titleText !== "") {
      const isExistingTitle = isExistingProp("title", targetedObj);
      if (isExistingTitle !== null && isExistingTitle !== undefined) {
        isExistingTitle.set({
          text: titleText,
        });
        canvasRefs.current[activeCanvas].setActiveObject(isExistingTitle);
      } else {
        const title = new fabric.Textbox(titleText, {
          left: targetedObj.left - 20,
          top: targetedObj.top - 30,
          fontSize: fontSize,
          fill: "#333",
          width: 150,
          height: "auto",
          padding: 10,
          selectable: true,
          fontFamily: fontFamily || "Arial",
          // fontWeight: "bold",
          fontStyle: "normal",
          textAlign: "left",
          visible: true,
          label: "title",
          ID: createId(),
          PageID: activeCanvas,
          ShapeID: targetedObj.ID,
          LayerID: targetedObj.LayerID,
        });
        const currentRelativePosition = targetedObj.relativePosition || {};
        currentRelativePosition.title = {
          left: title.left - targetedObj.left,
          top: title.top - targetedObj.top,
        };
        targetedObj.set({
          title: title,
          relativePosition: currentRelativePosition,
        });

        canvasRefs.current[activeCanvas].add(title);
        actions.updateShape(targetedObj);
      }

      actions.updateCommentAddEditFlag(false);
      setShapeToDraw("select");
    }
  }

  useEffect(() => {
    if (!canvasRefs) {
      return;
    }

    const onMouseMoveCanvas = (options) => {
      if (options.button === 1 && isCanvasZoomed) {
        isPanning.current = true;
        isDragging = true;
        lastPosX = options.clientX || options.touches[0].clientX;
        lastPosY = options.clientY || options.touches[0].clientY;
        canvasRefs.current[activeCanvas].selection = false;
        canvasRefs.current[activeCanvas].allowTouchScrolling = true;
      }
    };

    const onCanvasMove = (options) => {
      if (isDragging || isPanning.current) {
        const x = options.clientX || options.touches[0].clientX;
        const y = options.clientY || options.touches[0].clientY;
        const vpt = canvasRefs.current[activeCanvas].viewportTransform;
        vpt[4] += x - lastPosX;
        vpt[5] += y - lastPosY;
        canvasRefs.current[activeCanvas].requestRenderAll();
        lastPosX = x;
        lastPosY = y;
      }
    };

    const onMouseUp = () => {
      if (isDragging) {
        isPanning.current = false;
        isDragging = false;
        canvasRefs.current[activeCanvas].selection = true;
      }
    };

    const onMouseWheel = (opt) => {
      const event = opt.e;
      if (event.ctrlKey) {
        // Zoom functionality
        let zoom = canvasRefs.current[activeCanvas].getZoom();
        zoom *= 0.999 ** event.deltaY;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        canvasRefs.current[activeCanvas].zoomToPoint(
          { x: event.offsetX, y: event.offsetY },
          zoom
        );
      } else {
        // Panning functionality
        const delta = new fabric.Point(-event.deltaX, -event.deltaY);
        canvasRefs.current[activeCanvas].relativePan(delta);
      }

      event.preventDefault();
      event.stopPropagation();
    };

    document.addEventListener("mousedown", onMouseMoveCanvas);
    document.addEventListener("mousemove", onCanvasMove);
    document.addEventListener("mouseup", onMouseUp);
    canvasRefs.current[activeCanvas].on("mouse:wheel", onMouseWheel);

    return () => {
      document.removeEventListener("mousedown", onMouseMoveCanvas);
      document.removeEventListener("mousemove", onCanvasMove);
      document.removeEventListener("mouseup", onMouseUp);
      canvasRefs.current[activeCanvas]?.off("mouse:wheel", onMouseWheel);
    };
  }, [activeCanvas]);

  useEffect(() => {
    if (!canvasRefs) {
      return;
    }

    const onMouseDown = (options) => {
      if (drawMode) {
        if (options?.target && options?.target?.id === pointArray[0]?.id) {
          generatePolygon(pointArray);
        } else {
          setIsPointArray(pointArray);
          setIsLineArray(lineArray);
          addPoint(options);
        }
      }
    };

    const onMouseMove = (options) => {
      if (drawMode) {
        if (activeLine && activeLine.class === "line") {
          const pointer = canvasRefs.current[activeCanvas].getPointer(
            options.e
          );
          activeLine.set({
            x2: pointer.x,
            y2: pointer.y,
          });
          const points = activeShape.get("points");
          points[pointArray.length] = {
            x: pointer.x,
            y: pointer.y,
          };
          activeShape.set({
            points,
          });
        }
        canvasRefs.current[activeCanvas].renderAll();
      }
    };

    const onMouseRotate = (options) => {
      var step = options.e.shiftKey ? 15 : 1;
      options.target.angle = Math.round(options.target.angle / step) * step;
    };

    const onObjectModified = (options) => {
      const obj = options.target;
      // Update comment position
      if (obj.comment) {
        const comment = obj.comment;
        comment.set({
          left: obj.left + (obj.relativePosition.comment.left || 80),
          top: obj.top + (obj.relativePosition.comment.top || -30),
        });
        canvasRefs.current[activeCanvas].requestRenderAll();
      }

      // Update title position
      if (obj.title) {
        const title = obj.title;
        title.set({
          left: obj.left + (obj.relativePosition.title.left || -20),
          top: obj.top + (obj.relativePosition.title.top || -30),
        });
        canvasRefs.current[activeCanvas].requestRenderAll();
      }

      // Update icon position
      if (obj.icon) {
        const icon = obj.icon;
        icon.set({
          left: obj.left + (obj.relativePosition?.icon?.left || 100),
          top: obj.top + (obj.relativePosition?.icon?.top || 100),
        });
        canvasRefs.current[activeCanvas].requestRenderAll();
      }
    };

    canvasRefs.current[activeCanvas].on("object:rotating", onMouseRotate);
    canvasRefs.current[activeCanvas].on("mouse:down", onMouseDown);
    canvasRefs.current[activeCanvas].on("mouse:move", onMouseMove);
    canvasRefs.current[activeCanvas].on("object:moving", onObjectModified);
    canvasRefs.current[activeCanvas].on("object:scaling", onObjectModified);
    canvasRefs.current[activeCanvas].on("object:rotating", onObjectModified);
    canvasRefs.current[activeCanvas].on("after:render", () => {
      isCanvasZoomed = true;
    });

    return () => {
      if (canvasRefs.current[activeCanvas]) {
        canvasRefs.current[activeCanvas].off("object:rotating", onMouseRotate);
        canvasRefs.current[activeCanvas].off("mouse:down", onMouseDown);
        canvasRefs.current[activeCanvas].off("mouse:move", onMouseMove);
        canvasRefs.current[activeCanvas].off("object:moving", onObjectModified);
        canvasRefs.current[activeCanvas].off(
          "object:scaling",
          onObjectModified
        );
        canvasRefs.current[activeCanvas].off(
          "object:rotating",
          onObjectModified
        );
        canvasRefs.current[activeCanvas].off("after:render");
      }
    };
  }, [canvasRefs, drawMode, activeCanvas]);

  function addComments() {
    targetedObj = targetedObj || selectedObject;
    canvasRefs.current[activeCanvas].setActiveObject(targetedObj);
    if (commentText !== "") {
      const isExistingComment = isExistingProp("comment", targetedObj);
      if (isExistingComment !== null && isExistingComment !== undefined) {
        isExistingComment.set({
          text: commentText,
        });
        canvasRefs.current[activeCanvas].setActiveObject(isExistingComment);
      } else {
        const comment = new fabric.Textbox(commentText, {
          left: targetedObj.left + 80,
          top: targetedObj.top - 30,
          fontSize: fontSize,
          fill: "#333",
          width: 150,
          height: "auto",
          padding: 10,
          selectable: true,
          fontFamily: fontFamily || "Arial",
          fontWeight: "normal",
          fontStyle: "normal",
          textBackgroundColor: "transparent",
          textAlign: "left",
          visible: true,
          label: "comment",
          PageID: activeCanvas,
          ID: createId(),
          lockMovementX: false,
          lockMovementY: false,
          ShapeID: targetedObj.ID,
          LayerID: targetedObj.LayerID,
        });

        // Initialize or update relative positions
        const currentRelativePosition = targetedObj.relativePosition || {};
        currentRelativePosition.comment = {
          left: comment.left - targetedObj.left,
          top: comment.top - targetedObj.top,
        };

        targetedObj.set({
          comment: comment,
          relativePosition: currentRelativePosition,
        });

        canvasRefs.current[activeCanvas].add(comment);
        actions.updateShape(targetedObj);
      }
      actions.updateCommentAddEditFlag("");
      setShapeToDraw("select");
    }
    actions.updateCommentText("Add Your Comment...");
  }

  selectedObject &&
    canvasRefs.current[activeCanvas]?.on("object:moving", function (e) {
      const obj = e.target;
      const labels = ["comment", "title", "icon"];
      if (obj && labels.includes(obj.label)) {
        const shape = canvasRefs.current[activeCanvas]
          .getObjects()
          .find((shape) => shape[obj.label] && shape[obj.label].ID === obj.ID);

        if (shape) {
          const newRelativeLeft = obj.left - shape.left;
          const newRelativeTop = obj.top - shape.top;
          const currentRelativePosition = shape.relativePosition || {};
          shape.set({
            relativePosition: {
              ...currentRelativePosition,
              [obj.label]: {
                left: newRelativeLeft,
                top: newRelativeTop,
              },
            },
          });
          canvasRefs.current[activeCanvas].requestRenderAll();
        }
      }
    });

  function isExistingProp(label, targetedObj) {
    switch (label) {
      case "comment":
        const alreadyExistIndex = shapes.findIndex(
          (shape) => shape.ID === targetedObj.ID
        );
        if (alreadyExistIndex !== -1) {
          return shapes[alreadyExistIndex].comment;
        } else {
          return null;
        }
        break;

      case "title":
        const alreadyExistIndexTitle = shapes.findIndex(
          (shape) => shape.ID === targetedObj.ID
        );
        if (alreadyExistIndexTitle !== -1) {
          return shapes[alreadyExistIndexTitle].title;
        } else {
          return null;
        }
        break;

      case "icon":
        const alreadyExistIndexIcon = shapes.findIndex(
          (shape) => shape.ID === targetedObj.ID
        );
        if (alreadyExistIndexIcon !== -1) {
          return shapes[alreadyExistIndexIcon].icon;
        } else {
          return null;
        }
        break;

      default:
        break;
    }
  }

  useEffect(() => {
    const currCanvasData = pages.filter(
      (canvasShape) => canvasShape.ID === activeCanvas
    );
    let existingUser;
    if (currCanvasData[0].calendar.layers.length > 0) {
      existingUser = currCanvasData[0].calendar.layers.find(
        (layer) => layer.ID === currentUser
      );
    }
    setShapeFillColor(existingUser?.fillColor || "#ffffff");
    setShapeStrokeColor(existingUser?.strokeColor || "#000000");
  }, [pages, currentUser]);

  useEffect(() => {
    resetValues();
  }, [currentUser]);

  function createShape(shape) {
    switch (shape) {
      case "Rectangle":
        addShape("rectangle");
        break;
      case "circle":
        addShape("circle");
        break;
      case "square":
        addShape("square");
        break;
      case "line":
        addShape("line");
        break;
      case "text":
        addShape("text");
        break;
      case "Triangle":
        addShape("triangle");
        break;
      case "Star":
        addShape("star");
        break;
      case "Hexagon":
        addShape("hexagon");
        break;
      case "select":
        addShape("select");
        break;
      case "FreeForm":
        toggleDrawPolygon();
        break;

      default:
        break;
    }
    setShapeToDraw("");
  }

  function clearCanvasEvents(canvas) {
    canvas.off("mouse:down");
    canvas.off("mouse:move");
    canvas.off("mouse:up");
  }

  function addShape(shapeType) {
    // Check if canvasRefs is available
    if (!canvasRefs || !canvasRefs.current[activeCanvas]) return;
    if (drawMode) {
      clearIncompletePolygon();
    }
    canvasRefs.current[activeCanvas].selection = false;
    // Check if drawing mode is active
    if (canvasRefs.isDrawingMode) {
      canvasRefs.isDrawingMode = false;
    }
    // Get the canvas reference
    const canvas = canvasRefs.current[activeCanvas];
    clearCanvasEvents(canvas);

    let isDrawing = false;
    let shape = null; // Track the current shape being drawn
    let startX, startY; // Define startX and startY here
    const minDistance = 5; // Minimum distance to start drawing
    let hasMoved = false;

    function getCommonOptions() {
      return {
        ID: createId(),
        icon: null,
        comment: null,
        title: null,
        UserID: getUserId(),
        PageID: activeCanvas,
        LayerID: currentUser,
        // fill: getFillValue("fillType", fillType),
        fill: shapeFillColorRef.current || "#ffffff",
        stroke: shapeStrokeColorRef.current || "#000000",
        strokeWidth: strokeWidth || 2,
        strokeDashArray:
          strokeType === "Dashed"
            ? [5, 5]
            : strokeType === "Dotted"
            ? [1, 5]
            : null,
        strokeUniform: true,
        visible: true,
        selectable: false,
        IsLocked: false,
        IsVisible: true,
      };
    }

    function getDefaultTextValue() {
      return {
        ID: createId(),
        comment: null,
        title: null,
        icon: null,
        UserID: getUserId(),
        PageID: activeCanvas,
        LayerID: currentUser,
        fontSize: 20,
        fontSize: fontSize || 20,
        fontFamily: fontFamily || "Arial",
        fontWeight: fontWeight || "Normal",
        fontStyle: fontStyle === "italic" ? "italic" : "normal",
        underline : textDecoration === "underline" ? true : false,
        linethrough : textDecoration === "line-through" ? true : false,
        strokeWidth: 0,
        fill: "#000000",
        width: 150,
        strokeDashArray: null,
        strokeUniform: true,
        originX: "center",
        originY: "center",
        visible: true,
        selectable: false,
        IsLocked: false,
        IsVisible: true,
      };
    }

    function createPolygon(points) {
      return new fabric.Polygon(points, getCommonOptions());
    }

    // Mouse down event: start drawing the shape
    canvas.on("mouse:down", function (event) {
      const pointer = canvas.getPointer(event.e);
      startX = pointer.x; // Set startX and startY based on initial mouse pointer
      startY = pointer.y;
      if (shapeType === "select") {
        canvasRefs.current[activeCanvas].selection = true;
        canvasRefs.current[activeCanvas].getObjects().forEach((obj) => {
          const userLayer = usersRef.current.find(
            (user) => user.ID === obj.LayerID
          );
          if (userLayer && !userLayer.IsLocked && !obj.IsLocked) {
            obj.set({
              selectable: true,
            });
          } else {
            obj.set({
              selectable: false,
            });
          }
        });
      } else {
        canvasRefs.current[activeCanvas].getObjects().forEach((obj) => {
          obj.set({
            selectable: false,
          });
        });

        if (shapeType === "text") {
          shape = new fabric.Textbox("Enter text", {
            left: startX,
            top: startY,
            ...getDefaultTextValue(),
          });
          canvas.add(shape);
          actions.addShape(shape);
          shape = null;
          return;
        }

        isDrawing = true;
        hasMoved = false;
      }
    });

    // Mouse move event: update the shape's size and position
    canvas.on("mouse:move", function (event) {
      if (!isDrawing) return;
      const pointer = canvas.getPointer(event.e);

      if (!hasMoved) {
        hasMoved = true;
        switch (shapeType) {
          case "rectangle":
            shape = new fabric.Rect({
              left: startX,
              top: startY,
              width: 0,
              height: 0,
              ...getCommonOptions(),
            });
            break;
          case "circle":
            shape = new fabric.Ellipse({
              left: startX,
              top: startY,
              rx: 0,
              ry: 0,
              ...getCommonOptions(),
            });
            break;
          case "square":
            shape = new fabric.Rect({
              left: startX,
              top: startY,
              width: 0,
              height: 0,
              ...getCommonOptions(),
            });
            break;
          case "triangle":
            shape = new fabric.Triangle({
              left: startX,
              top: startY,
              width: 0,
              height: 0,
              ...getCommonOptions(),
            });
            break;
          case "hexagon":
            const hexPoints = [];
            for (let i = 0; i < 6; i++) {
              hexPoints.push({
                x: startX + 50 * Math.cos((i * Math.PI) / 3),
                y: startY + 50 * Math.sin((i * Math.PI) / 3),
              });
            }
            shape = createPolygon(hexPoints);
            break;
          case "star":
            const starPoints = [];
            for (let i = 0; i < 10; i++) {
              const angle = (i * 2 * Math.PI) / 10 - Math.PI / 2;
              const radius = i % 2 === 0 ? 50 : 25; // Alternating outer and inner radius
              starPoints.push({
                x: startX + radius * Math.cos(angle),
                y: startY + radius * Math.sin(angle),
              });
            }
            shape = createPolygon(starPoints);
            break;
          case "line":
            shape = new fabric.Line([startX, startY, startX, startY], {
              fill: "black",
              stroke: "black",
              strokeWidth: 2,
              ...getCommonOptions(),
            });
            break;
        }
        if (shape) {
          canvas.add(shape);
        }
      }

      let options = {};

      switch (shapeType) {
        case "rectangle":
          const width = Math.abs(pointer.x - startX);
          const height = Math.abs(pointer.y - startY);
          let left = Math.min(pointer.x, startX);
          let top = Math.min(pointer.y, startY);

          // Check if Shift key is pressed for square drawing
          if (event.e.shiftKey) {
            const size = Math.max(width, height);
            if (pointer.x < startX) left = startX - size;
            if (pointer.y < startY) top = startY - size;
            shape.set({
              width: size,
              height: size,
              left,
              top,
            });
          } else {
            shape.set({
              width,
              height,
              left,
              top,
            });
          }
          break;
        case "circle":
          const rx = Math.abs(pointer.x - startX) / 2;
          const ry = event.e.shiftKey ? rx : Math.abs(pointer.y - startY) / 2;
          shape.set({
            rx,
            ry,
            left: startX < pointer.x ? startX : pointer.x,
            top: startY < pointer.y ? startY : pointer.y,
          });
          break;
        case "square":
          const size = Math.max(
            Math.abs(pointer.x - startX),
            Math.abs(pointer.y - startY)
          );
          shape.set({
            width: size,
            height: size,
            left: pointer.x < startX ? startX - size : startX,
            top: pointer.y < startY ? startY - size : startY,
          });
          break;
        case "triangle":
          shape.set({
            width: Math.abs(pointer.x - startX),
            height: Math.abs(pointer.y - startY),
            left: Math.min(pointer.x, startX),
            top: Math.min(pointer.y, startY),
          });
          break;
        case "hexagon":
          const hexPoints = [];
          for (let i = 0; i < 6; i++) {
            hexPoints.push({
              x: startX + 50 * Math.cos((i * Math.PI) / 3),
              y: startY + 50 * Math.sin((i * Math.PI) / 3),
            });
          }
          shape.set({ points: hexPoints });
          break;
        case "star":
          const starPoints = [];
          for (let i = 0; i < 10; i++) {
            const angle = (i * 2 * Math.PI) / 10 - Math.PI / 2;
            const radius = i % 2 === 0 ? 50 : 25; // Alternating outer and inner radius
            starPoints.push({
              x: startX + radius * Math.cos(angle),
              y: startY + radius * Math.sin(angle),
            });
          }
          shape.set({ points: starPoints });
          break;
        case "line":
          options = { x2: pointer.x, y2: pointer.y };
          if (event.e.shiftKey) {
            // Constrain to 45-degree angles when Shift key is pressed
            const deltaX = Math.abs(pointer.x - startX);
            const deltaY = Math.abs(pointer.y - startY);

            if (deltaX > deltaY) {
              options = { x2: pointer.x, y2: startY };
            } else {
              options = { x2: startX, y2: pointer.y };
            }
          }
          break;
      }
      if (shape) {
        shape.set(options);
        shape.setCoords();
      }
      canvas.renderAll();
    });

    // Mouse up event: finalize the shape
    canvas.on("mouse:up", function () {
      isDrawing = false;
      if (shape && hasMoved) {
        actions.addShape(shape);
      }
      shape = null; // Reset the shape variable
    });
  }

  const handleObjectModified = (e) => {
    const modifiedObject = e?.target;
    const modifiedObjectIndex = shapes.findIndex(
      (shape) => shape.shape === modifiedObject
    );
    const scalePayload = {
      ht: modifiedObject?.height * modifiedObject?.scaleY,
      wd: modifiedObject?.width * modifiedObject?.scaleX,
    };

    actions.updateObjWidHeight(scalePayload);

    if (modifiedObjectIndex !== -1) {
      actions.updateCanvasPosition({
        x: modifiedObject.left,
        y: modifiedObject.top,
      });
      if (shapes[modifiedObjectIndex].comment !== null) {
        shapes[modifiedObjectIndex].comment.set({
          top: modifiedObject.top - 30,
          left: modifiedObject.left + 80,
        });
      }
      if (shapes[modifiedObjectIndex].title !== null) {
        shapes[modifiedObjectIndex].title.set({
          top: modifiedObject.top - 30,
          left: modifiedObject.left - 20,
        });
        // canvas.current.requestRenderAll()
      }
      if (shapes[modifiedObjectIndex].icon !== null) {
        shapes[modifiedObjectIndex].icon.set({
          top: modifiedObject.top + 100,
          left: modifiedObject.left + 100,
        });
        // canvas.current.requestRenderAll()
      }
    }
  };

  useEffect(() => {
    if (canvasRefs) {
      // Event listener for selection creation
      canvasRefs.current[activeCanvas].on("selection:created", handleSelection);
      // Event listener for selection update (e.g., when selecting a different shape)
      canvasRefs.current[activeCanvas].on("selection:updated", handleSelection);
      // Event listener for selection clear
      canvasRefs.current[activeCanvas].on(
        "selection:cleared",
        handleSelectionClear
      );
      // canvas.on("mouse:down", handleRightClickOnShape);
      canvasRefs.current[activeCanvas].on(
        "object:modified",
        handleObjectModified
      );
    }

    return () => {
      if (canvasRefs.current[activeCanvas]) {
        canvasRefs.current[activeCanvas].off(
          "selection:created",
          handleSelection
        );
        canvasRefs.current[activeCanvas].off(
          "selection:updated",
          handleSelection
        );
        canvasRefs.current[activeCanvas].off(
          "selection:cleared",
          handleSelectionClear
        );
        // canvas.off("mouse:down" , onMouseDown);
        canvasRefs.current[activeCanvas].off(
          "object:modified",
          handleObjectModified
        );
      }
    };
  }, [canvasRefs, shapes]);

  const handleSelection = (e) => {
    const selectedObjectCurrent = e.selected;
    if (selectedObjectCurrent.length === 1) {
      const cornerSize = window.innerWidth >= 1600 ? 14 : 8;
      selectedObjectCurrent[0].set({ cornerSize: cornerSize });
      const index = shapes.findIndex(
        (shape) => shape.ID === selectedObjectCurrent[0].ID
      );
      setSelectedIdx(index);
      const payload = {
        selectedObj: selectedObjectCurrent[0],
        selectedObjIdx: index,
      };

      actions.updateCurrentObj(payload);
      highlightRelatedShapes(selectedObjectCurrent[0]);
    }
  };

  const handleSelectionClear = () => {
    setShowContext(false);
    if (selectedObject) {
      removeHighlight(selectedObject);
    }
    actions.updateCurrentObj(null);
  };

  function getRelatedShapes(shapeSel) {
    const alreadyExistIndex = shapes.findIndex(
      (shape) => shape.ID === shapeSel.ID
    );
    if (alreadyExistIndex !== -1) {
      return shapes[alreadyExistIndex];
    } else {
      return null;
    }
  }

  function highlightRelatedShapes(selectedShape) {
    const relatedShapes = getRelatedShapes(selectedShape);
    // const {comment,title,icon, shape} = relatedShapes;
    const comment = relatedShapes?.comment;
    const title = relatedShapes?.title;
    const icon = relatedShapes?.icon;
    const shape = relatedShapes?.shape;

    if (title) {
      title.set({
        // Set the stroke color to red
        shadow: {
          color: "rgba(0, 0, 255, 0.9)", // Blueish shadow color
          blur: 10,
          offsetX: 5,
          offsetY: 5,
        },
        selectable: true,
        hasBorders: true,
      });
      // existingTitle.titleText.canvas.requestRenderAll()
    }

    if (icon) {
      icon.set({
        // Set the stroke color to red
        shadow: {
          color: "rgba(0, 0, 255, 0.9)", // Blueish shadow color
          blur: 10,
          offsetX: 5,
          offsetY: 5,
        },
      });
      // existingIcons.image.canvas.requestRenderAll()
    }

    // const existingComment = commentAlreadyExist(rightClickSelected);

    if (comment) {
      comment.set({
        selectable: true,
        // Set the stroke color to red
        shadow: {
          color: "rgba(0, 0, 255, 0.9)", // Blueish shadow color
          blur: 10,
          offsetX: 5,
          offsetY: 5,
        },
      });
      // canvasRefs.current[activeCanvas].setActiveObject(comment);
      // canvasRefs.current[activeCanvas].requestRenderAll();
      // existingComment.commentText.canvas.requestRenderAll()
    }
  }

  const handleContextMenu = (obj, idx, x, y, event) => {
    if (obj) {
      event.preventDefault();
      // const rr=   isShape()
      // setCurrentContextObj(obj)
      // setRightClickSelected(obj);
      // setRightClickSelectedIdx(idx);
      // const pointer = canvas.getPointer(event.e, false);

      const windowX = event.clientX + window.pageXOffset;
      const windowY = event.clientY + window.pageYOffset;
      setContextMenuPosition({ x: windowX, y: windowY });
      obj.ID !== undefined && setShowContext(true);
    } else {
      setShowContext(false);
    }
  };

  const preventDefaultContextMenu = (event, obj) => {
    if (event.button === 2) {
      handleContextMenu(obj, 0, event.x, event.y, event);
    }
  };

  const handleContextMenu2 = (e) => {
    e.preventDefault();
  };

  const handleOption = (option) => {
    targetedObj = selectedObject;
    switch (option) {
      case "Duplicate":
        duplicateShape(selectedObject);
        break;
      case "Delete":
        removeShape(selectedObject);
        break;
      case "Add Comment":
      case "Update Comment":
        if (selectedObject.comment) {
          canvasRefs.current[activeCanvas].setActiveObject(
            selectedObject.comment
          );
        } else {
          actions.updateCommentText("Add Your Comment...");
          actions.updateCommentAddEditFlag("comment");
          addComments();
        }
        break;
      case "Add Icon":
      case "Update Icon":
        addEmoji();
        break;
      case "Add Title":
      case "Update Title":
        if (selectedObject.title) {
          canvasRefs.current[activeCanvas].setActiveObject(
            selectedObject.title
          );
        } else {
          actions.updateTitleText("Add Your Title...");
          actions.updateCommentAddEditFlag("title");
          addTitle();
        }
        break;

      // Add more cases as needed
      default:
        break;
    }
    setShowContext(false);
  };

  // ADD DUPLICATE SHAPES
  const duplicateShape = (shape) => {
    if (!canvasRefs) return;
    if (canvasRefs.isDrawingMode) {
      canvasRefs.isDrawingMode = false;
    }

    fabric.util.enlivenObjects([shape.toObject()], (objects) => {
      const clonedShape = objects[0];
      if (!clonedShape) return;

      clonedShape.set({
        ID: createId(),
        LayerID: shape.LayerID,
        PageID: shape.PageID,
        UserID: shape.UserID,
        left: shape.left + 20,
        top: shape.top + 20,
        selectable: false,
        icon: null,
        comment: null,
        title: null,
      });
      canvasRefs.current[activeCanvas].add(clonedShape);
      actions.addShape(clonedShape);
      canvasRefs.current[activeCanvas].renderAll();
    });
  };

  const removeShape = (shape) => {
    if (!canvasRefs) return;
    removeShapeRelated(shape);
    canvasRefs.current[activeCanvas].remove(shape);
    const payload = {
      shapeId: shape,
      canvasId2: activeCanvas,
    };
    actions.removeShape(payload);
    const userShapePayload = {
      shapeId2: shape,
      canvasId4: activeCanvas,
      userId: currentUser,
    };

    actions.removeUserShape(userShapePayload);
    canvasRefs.current[activeCanvas].renderAll();
  };

  function removeShapeRelated(shapeSel) {
    if (!canvasRefs) {
      return;
    }

    if (
      (shapeSel?.type !== "textbox" && shapeSel.type !== "image") ||
      (shapeSel?.type === "textbox" && shapeSel?.label === undefined)
    ) {
      const alreadyExistIndex = shapes.findIndex(
        (shape) => shape?.ID === shapeSel?.ID
      );
      if (alreadyExistIndex !== -1) {
        const commentt = shapes[alreadyExistIndex]?.comment;
        const iconn = shapes[alreadyExistIndex]?.icon;
        const titlee = shapes[alreadyExistIndex]?.title;

        if (commentt) {
          canvasRefs.current[activeCanvas].remove(commentt);
        }
        if (iconn) {
          canvasRefs.current[activeCanvas].remove(iconn);
          shapes[alreadyExistIndex].set({ icon: null });
        }
        if (titlee) {
          canvasRefs.current[activeCanvas].remove(titlee);
        }
      } else {
        return null;
      }
    } else if (shapeSel.type === "image") {
      const alreadyExistIndex = shapes.findIndex(
        (shape) => shape?.ID === shapeSel?.ShapeID
      );
      const shapeProperty = shapes[alreadyExistIndex]?.icon;
      canvasRefs.current[activeCanvas].remove(shapeProperty);
      shapes[alreadyExistIndex].set({ icon: null });
    } else {
      const removeShapeProperty = (property) => {
        const alreadyExistIndex = shapes.findIndex(
          (shape) => shape?.ID === shapeSel?.ShapeID
        );
        const shapeProperty = shapes[alreadyExistIndex]?.[property];
        canvasRefs.current[activeCanvas].remove(shapeProperty);
        shapes[alreadyExistIndex].set({ [property]: null });
      };
      if (shapeSel?.label === "comment") {
        removeShapeProperty("comment");
      } else if (shapeSel?.label === "title") {
        removeShapeProperty("title");
      }
    }
  }

  const getFillValue = (field, value) => {
    if (field === "fillType") {
      switch (value) {
        case "Solid":
          return fillColor || "#ffffff";
        case "Gradient":
          return createGradientFill();
        case "Image":
          return createImageFill();
        case "Pattern":
          return createHatchFill(value);
        default:
          return "";
      }
    } else {
      switch (fillType) {
        case "Solid":
          return value || "#ffffff";
        case "Gradient":
          return createGradientFill();
        case "image":
          return createImageFill();
        case "Pattern":
          return createHatchFill(value);
        default:
          return "";
      }
    }
  };

  const createGradientFill = () => {
    const gradient = new fabric.Gradient({
      type: "linear",
      gradientUnits: "pixels",
      coords: { x1: 0, y1: 0, x2: 0, y2: 200 },
      colorStops: [
        { offset: 0, color: color1 },
        { offset: 1, color: color2 },
      ],
    });
    return gradient;
  };

  const createImageFill = () => {
    // return imageURL;
  };

  const createHatchFill = (pattern) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 20;
    canvas.height = 20;

    switch (pattern) {
      case "Diagonal":
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(20, 20);
        ctx.stroke();
        break;
      case "Horizontal":
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;

        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(20, 10);
        ctx.stroke();
        break;
      case "Vertical":
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;

        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(10, 20);
        ctx.stroke();
        break;
      default:
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(20, 20);
        ctx.stroke();
    }

    const patternType = new fabric.Pattern({
      source: canvas,
      repeat: "repeat",
    });

    return patternType;
  };

  // Ensure the selected points contrast with the background color
  fabric.Object.prototype.transparentCorners = false;
  fabric.Object.prototype.cornerColor = "blue";
  fabric.Object.prototype.cornerStyle = "circle";
  function setContrastCornerColor(canvasBackgroundColor) {
    const isLightBackground = isColorLight(canvasBackgroundColor);
    const contrastColor = isLightBackground ? "blue" : "white";

    fabric.Object.prototype.cornerColor = contrastColor;
    fabric.Object.prototype.cornerStyle = "circle";

    // Update existing objects on the canvas
    canvasRefs.current[activeCanvas].getObjects().forEach((obj) => {
      obj.set({
        cornerColor: contrastColor,
      });
    });

    canvasRefs.current[activeCanvas].renderAll();
  }

  // Helper function to determine if a color is light
  function isColorLight(color) {
    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  }

  // Example function to change the background color of the canvas
  function changeCanvasBackgroundColor(canvasId, color) {
    const canvas = canvasRefs.current[canvasId];
    if (!canvas) {
      return;
    }

    // Check if canvas.backgroundColor is supported
    if (!canvas.hasOwnProperty("backgroundColor")) {
      console.error("Canvas backgroundColor property not supported.");
      return;
    }

    canvas.setBackgroundColor(color, canvas.renderAll.bind(canvas));
  }

  // Example usage
  changeCanvasBackgroundColor("#0000ff"); // Change the canvas background color to blue and update corner color dynamically

  // Changing rotation control properties
  fabric.Object.prototype.controls.mtr = new fabric.Control({
    x: 0,
    y: -0.5,
    offsetX: 0,
    offsetY: -40,
    cursorStyle: "crosshair",
    actionHandler: fabric.controlsUtils.rotationWithSnapping,
    actionName: "rotate",
    render: renderIcon,
    cornerSize: 38,
    withConnection: true,
  });

  // Define how the rendering action will be
  function renderIcon(ctx, left, top, styleOverride, fabricObject) {
    var size = this.cornerSize;
    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
    ctx.drawImage(imgIcon, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  // EMOJI RELATED CODE
  function addEmoji() {
    actions.toggleShowEmoji(true);
    setShowContext(false);
    setShapeToDraw("select");
    targetedObj = targetedObj || selectedObject;
    canvasRefs.current[activeCanvas].setActiveObject(targetedObj);
  }

  useEffect(() => {
    !selectedObject && actions.toggleShowEmoji(false);
  }, [selectedObject]);

  const handleEmojiClick = (event, emojiObject) => {
    setChosenEmoji(emojiObject);
    actions.toggleShowEmoji(false);
  };

  useEffect(() => {
    if (!canvasRefs || !chosenEmoji) {
      return;
    }
    const emojiUrl = chosenEmoji?.target.src;

    targetedObj = targetedObj || selectedObject;
    const existingIcons = isExistingProp("icon", targetedObj);

    if (existingIcons) {
      fabric.Image.fromURL(emojiUrl, function (newImg) {
        newImg.set({
          left: targetedObj.left, // Maintain the current position
          top: targetedObj.top,
          width: 60,
          height: 60,
          selectable: true,
          lockMovementX: true,
          lockMovementY: true,
          visible: true,
          label: "icon",
          ShapeID: targetedObj.ID,
          LayerID: targetedObj.LayerID,
        });
        // Replace the existing image element with the new one
        existingIcons.setElement(newImg.getElement());
      });
    } else {
      fabric.Image.fromURL(emojiUrl, function (img) {
        img.set({
          ID: createId(),
          left: targetedObj.left + 100, // Adjust the left position as needed
          top: targetedObj.top + 100, // Adjust the top position as needed
          width: 60,
          height: 60,
          selectable: true,
          lockMovementX: false,
          lockMovementY: false,
          visible: true,
          label: "icon",
          ShapeID: targetedObj.ID,
          LayerID: targetedObj.LayerID,
        });

        //     img.on("selected", function () {
        //       // Apply selected style
        //       highlightRelatedShapes(selectedObject)
        //     });

        // //     // // Update style when shape is deselected
        //     img.on("deselected", function () {
        //       // Reset to default style
        //       removeHighlight(selectedObject)

        //     });

        canvasRefs.current[activeCanvas].add(img);
        targetedObj.set({ icon: img });

        if (img) {
          img.url = emojiUrl;
          const payload = {
            label: "icon",
            pageId: activeCanvas,
            selectedShape: targetedObj,
            item: img,
          };
          actions.updateShape(payload);
        }
      });
    }
  }, [chosenEmoji, canvasRefs]);

  function removeHighlight(selectedShape) {
    // if(selectedShape){
    //   selectedShape.set({
    //               // Set the stroke color to red
    //     shadow: null

    //   })
    //   // selectedShape.canvas.requestRenderAll()
    // }

    const relatedShapes = getRelatedShapes(selectedShape);
    // const {comment,title,icon, shape} = relatedShapes;
    const comment = relatedShapes?.comment;
    const title = relatedShapes?.title;
    const icon = relatedShapes?.icon;
    const shape = relatedShapes?.shape;

    if (title) {
      title.set({
        // Set the stroke color to red
        shadow: null,
      });
    }

    if (icon) {
      icon.set({
        // Set the stroke color to red
        shadow: null,
      });
      // existingIcons.image.canvas.requestRenderAll()
    }

    if (comment) {
      comment.set({
        // Set the stroke color to red
        shadow: null,
      });
    }
  }

  function closePDFModal(payload) {
    // const imgFile= canvasRefs.current[activeCanvas].backgroundImage._element.currentSrc;
    const canvas = canvasRefs.current[activeCanvas];
    const { dateEnd, dateStart, dateRange, selectedBackground, assignedDate } =
      payload;
    const changeBackgroundPayload = {
      canvasId7: activeCanvas,
      id3: JSON.parse(selectedBackground)?.id,
      endDate2: dateEnd,
      startDate2: dateStart,
      type2: dateRange,
      assignedDate: assignedDate,
      // data2: JSON.parse(selectedBackground),
      dateRange: dateRange,
    };
    actions.updateBGdata(changeBackgroundPayload);
    setModalShowPDF(false);
    const backgroundImage = canvasRefs.current[activeCanvas].backgroundImage;

    canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
    canvas.remove(backgroundImage);
    setCurrentBgImg(null);
  }

  function closeModal() {
    setModalShowPDF(false);
  }

  function handleUnAssign() {
    const payloadToUnassign = {
      canvasId7: activeCanvas,
      id3: currentBgImg?.id,
      assignedDate: null,
      startDate2: null,
      endDate2: null,
      type2: currentBgImg?.assignType,
    };
    actions.updateBGdata(payloadToUnassign);
    const canvas = canvasRefs.current[activeCanvas];
    const backgroundImage = canvasRefs.current[activeCanvas].backgroundImage;

    canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));

    canvas.remove(backgroundImage);
    setCurrentBgImg(null);
  }

  const isSpecialObject = ["comment", "icon", "title"].includes(
    selectedObject?.label
  );
  const hasComment = selectedObject?.comment !== null;
  const hasIcon = selectedObject?.icon !== null;
  const hasTitle = selectedObject?.title !== null;

  let filteredOptions;
  if (isSpecialObject) {
    filteredOptions = contextMenuOptions.filter(
      (option) => option.label === "Delete"
    );
  } else {
    filteredOptions = contextMenuOptions.map((option) => {
      if (option.label === "Add Comment" && hasComment) {
        return { ...option, label: "Update Comment" };
      }
      if (option.label === "Add Icon" && hasIcon) {
        return { ...option, label: "Update Icon" };
      }
      if (option.label === "Add Title" && hasTitle) {
        return { ...option, label: "Update Title" };
      }
      return option;
    });
  }

  // function for reset all the valuse
  const resetValues = () => {
    setShapeToDraw("select");
    actions.selectFilterShape([]);
  };

  let filterActive = selectedShapeFilter.length !== 0 || false;
  useEffect(() => {
    const currentCanvas = canvasRefs.current[activeCanvas];
    if (currentCanvas) {
      currentCanvas.clear();
      currentCanvas.backgroundColor = backgroundColor;
      shapes.forEach((shape) => {
        if (!filterActive || selectedShapeFilter.includes(shape.type)) {
          currentCanvas.add(shape);
          shape.comment && currentCanvas.add(shape.comment);
          shape.icon && currentCanvas.add(shape.icon);
          shape.title && currentCanvas.add(shape.title);
        }
      });
    }
  }, [filterActive, selectedShapeFilter]);

  return (
    <div>
      {canvases.map((canvas) => (
        <div
          key={canvas.id}
          style={{ display: canvas.id === activeCanvas ? "flex" : "none" }}
          className="editor-canvas-container"
          onContextMenu={(e) => {
            if (typeof document.hasFocus === "function" && !document.hasFocus())
              return;
            e.preventDefault();
            setAnchorPoint({ x: e.clientX, y: e.clientY });
            setOpen(true);
          }}
        >
          <canvas id={canvas.id} width={400} height={400}></canvas>
          {filePreview && filePreview.type === "application/pdf" && (
            <ControlledMenu
              anchorPoint={anchorPoint}
              state={isOpen ? "open" : "closed"}
              direction="right"
              onClose={() => setOpen(false)}
            >
              <MenuItem onClick={() => setModalShowPDF(true)}>Assign</MenuItem>
              <MenuItem onClick={handleUnAssign}>Unassign</MenuItem>
              <MenuItem>Replace</MenuItem>
              <MenuItem>Unload</MenuItem>
              <MenuItem>Set default</MenuItem>
            </ControlledMenu>
          )}
        </div>
      ))}

      {showContext && filteredOptions.length > 0 && (
        <div
          onContextMenu={handleContextMenu2}
          style={{
            position: "absolute",
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            padding: "5px",
            zIndex: 1000,
            borderRadius: "6px",
          }}
        >
          {filteredOptions.map((option, index) => (
            <div
              key={index}
              onClick={() => handleOption(option.label)}
              style={{
                cursor: "pointer",
                fontSize: "1rem",
                padding: "0.25rem 0.5rem",
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}

      {showEmoji && (
        <div
          className="emoji-container"
          style={{
            position: "absolute",
            // transform: translateY(10%);
            top: "30%",
            left: "22%",
            zIndex: 999,
            // backgroundColor: "red",
          }}
        >
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      <PDFFileFilterModal
        show={modalShowPDF}
        onHide={closeModal}
        onApply={closePDFModal}
        activeCanvas={activeCanvas}
        currentBgImg={currentBgImg}
      />
    </div>
  );
}

export default Editor;
