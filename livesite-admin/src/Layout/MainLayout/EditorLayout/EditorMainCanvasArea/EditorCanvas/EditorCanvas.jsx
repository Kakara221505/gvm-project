import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import { fabric } from "fabric";
import "./EditorCanvas.css";
import { pdfjs } from "react-pdf";
import { useShapeContext } from "../../../../../contexts/shapeContext";
import EmojiPicker from "emoji-picker-react";
import { ControlledMenu, MenuItem } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import PDFFileFilterModal from "./Modals/PDFFileFilterModal";
import createId from "../../../../../Common/Constants/CreateId";
import { getUserId } from "../../../../../Common/Common";
import { deleteApiCaller, postApiCaller } from "../../../../../Lib/apiCaller";
import { GlobalValues } from "../../../../../Lib/GlobalValues";
import {
  assignBg,
  assignBgDefault,
  getHeaderFile,
  unAssignBg,
} from "../../../../../Lib/headerMenuApi";
import { useApiContext } from "../../../../../contexts/apiContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import UseSaveData from "../../../../../Components/SaveData/SaveEditorData";
import _, { cloneDeep } from "lodash";
import FindPopup from "../../../../../Common/FindPopup/FindPopup";
import PasteSpecial from "./Modals/PasteSpecial";
import SelectSpecial from "./Modals/SelectSpecial";
import * as pdfjsLib from "pdfjs-dist";
import io from "socket.io-client";
import Bob from "./Bob";
import Annotation from "./Annotation";

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
const socket = io.connect(process.env.REACT_APP_PUBLIC_SOCKET_IO_URL);

function Editor({
  filesPreviewShape,
  filePreview,
  shapeToDraw,
  setShapeToDraw,
  backgroundColor,
  canvasBackgroundColor,
  selectSpecialFields,
  setSelectSpecialFields,
}) {
  const saveData = UseSaveData();

  const [isOpen, setOpen] = useState(false);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [shapes, setShapes] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [bgImgsData, setBgImgsData] = useState([]);
  const [selectSpecialDates, setSelectSpecialDates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const canvasRefs = useRef({});
  const [showContext, setShowContext] = useState(false);
  const { state, actions, undoStack, redoStack } = useShapeContext();

  const [chosenEmoji, setChosenEmoji] = useState(null);
  const [arrayIndex, setArrayIndex] = useState(0);
  const [bgID, setBgID] = useState();
  const [modalShowPDF, setModalShowPDF] = React.useState(false);
  const [modalShowPasteSpecial, setModalShowPasteSpecial] =
    React.useState(false);
  const [modalOpenSelectSpecial, setModalOpenSelectSpecial] =
    React.useState(false);
  const navigate = useNavigate();
  // shape's right cliick options on canvas
  const options = [
    { label: "Duplicate" },
    { label: "Delete" },
    { label: "Add Comment" },
    { label: "Add Icon" },
    { label: "Add Title" },
    { label: "Cut" },
    { label: "Copy" },
    { label: "Paste" },
    { label: "Paste Special" },
    { label: "Select Special" },
  ];

  const [users, setUsers] = useState([]);
  const { headers, getDate, projectId } = GlobalValues();
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
  const [ISCanvasData, setISCanvasData] = useState();
  const usersRef = useRef(users);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);
  // global state
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
    isAnyChanges,
    isCanvasDelete,
    selectedShapeFilter,
    selectedLayerFilter,
    selectedOrganizationFilter,
    selectedUserFilter,
    selectedAllUserFilter,
    selectedCategoryFilter,
    selectedSubCategoryFilter,
    selectedTextFilter,
    selectDate,
    saveAs,
    projectDetails,
    openProject,
    currentCategory,
    currentSubCategory,
    bgAssign,
    pdfModalType,
    isSelectSpeacial,
    currentObjHeight,
    currentObjWidth,
    currentObjLeft,
    currentObjTop,
  } = state;

  const [currentBgImg, setCurrentBgImg] = useState(null);
  const activeObjects = canvasRefs.current[activeCanvas]?.getActiveObjects();
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
    underline,
    linethrough,
  } = properties;

  const [shapeFillColor, setShapeFillColor] = useState("#ffffff");
  const [shapeStrokeColor, setShapeStrokeColor] = useState("#000000");
  const [findArrayLength, setFindArrayLength] = useState();
  const { importData, setImportData } = useApiContext();
  const shapeFillColorRef = useRef(shapeFillColor);
  const shapeStrokeColorRef = useRef(shapeStrokeColor);
  const clipboardRef = useRef([]);
  const clipboardOption = useRef(null);
  const contextMenuEvent = useRef(null);
  let clonedState = _.cloneDeep(state);
  const currentUserID = Number(getUserId());

  const pagesRef = useRef(pages); // To hold the latest 'pages' state

  useEffect(() => {
    pagesRef.current = pages;
  }, [state]);

  useEffect(() => {
    updatecanvas();
  }, [state.changesThings]);

  useEffect(() => {
    shapeFillColorRef.current = shapeFillColor;
  }, [shapeFillColor]);

  useEffect(() => {
    shapeStrokeColorRef.current = shapeStrokeColor;
  }, [shapeStrokeColor]);

  useLayoutEffect(() => {
    if (openProject.isOpen) {
      // for fetch canvas's shape data
      fetchCanvasData(openProject?.name);
    } else {
      fetchCanvasData();
    }
  }, [openProject.isOpen, selectDate]);

  const activeCanvasRef = useRef(activeCanvas);

  // Keep the ref updated with the latest activeCanvas whenever it changes
  useEffect(() => {
    activeCanvasRef.current = activeCanvas;
  }, [activeCanvas]);

  useEffect(() => {
    // for realtime changes
    socket.on("example", async (data) => {
      console.log("exaMPLE1",data)
      const newData = await parseApiResponse(data);

      const currentUrl = window.location.href;
      const projectIdFromUrl = currentUrl?.split("/")?.pop();
      const canvasDate = localStorage.getItem("selecteDate");
      if (
        Number(projectIdFromUrl) === data?.project?.ID &&
        currentUserID !== data?.UserID &&
        canvasDate === data?.date &&
        activeCanvasRef.current === data?.activeCanvasId
      ) {
        actions.initialData(newData);
        setISCanvasData(newData);
      }
    });
  }, [socket]);

  useEffect(() => {
    // after select special apply properties
    if (isSelectSpeacial && Object.entries(selectSpecialFields).length > 0) {
      selectSpecialShape();
    }
  }, [selectSpecialFields]);
  // for select special api calling
  const selectSpecialShape = async () => {
    const payload = {
      annotationId: selectedObject?.ID,
      AssignDate: selectSpecialDates,
      properties: selectSpecialFields,
    };
    const apiUrl = `annotation/select_paste_annotation`;
    await postApiCaller(apiUrl, payload, headers);
  };
  // for canvas real time updates
  const updatecanvas = async () => {
    const canvasDate = localStorage.getItem("selecteDate");
    let convertedData = await convertData();
    const payload = {
      pages: convertedData?.projectData?.pages,
      project: {
        ...convertedData.projectData?.project,
        ID: convertedData?.projectID,
      },
      UserID: currentUserID,
      date: canvasDate,
      activeCanvasId: activeCanvas,
    };
    socket.emit("example", payload);
  };

  const convertData = useCallback(async () => {
    const pagesInfo = pages.map((page) => {
      const pageID = page.ID.split("-");
      const pageData = page?.calendar?.layers?.map((layer) => {
        // Create a new array to hold the annotations including comments, titles, and icons
        const newAnnotations = [];
        const ShapeData = layer?.annotations?.map((shape) => {
          const UserID = shape.UserID;
          const LayerID = shape.LayerID;
          const ID = shape.ID;
          const Type = shape.type;
          const AssignDate = shape?.AssignDate;
          const CategoryID = shape?.CategoryID || 1;
          const SubCategoryID = shape?.SubCategoryID || 1;
          const parentSelectSpecialId = shape?.parentSelectSpecialId || null;
          const isPasteSpecialParent = shape?.isPasteSpecialParent || false;
          const ParentAnnotationID = shape?.ParentAnnotationID || null;
          const bob_no_id = shape?.bob_no_id;
          let updatedShape;
          let commentShapeObj = null;
          let titleShapeobj = null;
          let iconShapeobj = null;

          if (shape?.comment !== null) {
            let commentId = shape.comment.ID;
            let label = shape.comment.label;
            let commnetShape = shape.comment?.toObject();
            // Create the new comment object with ParentAnnotationID
            const newComment = {
              ...commnetShape,
              ParentAnnotationID: ID,
              PageID: shape.PageID,
              LayerID: shape?.LayerID,
              UserID: shape?.UserID,
              label: label,
              ID: commentId,
              bob_no_id,
              AssignDate: AssignDate,
              CategoryID: CategoryID,
              SubCategoryID: SubCategoryID,
              parentSelectSpecialId: null,
              isPasteSpecialParent: false,
            };

            // Push the new comment into the newAnnotations array
            newAnnotations.push({
              ID: commentId,
              UserID: shape?.UserID,
              LayerID: shape?.LayerID,
              ParentAnnotationID: ID,
              bob_no_id,
              properties: newComment,
              AssignDate: AssignDate,
              CategoryID: CategoryID,
              SubCategoryID: SubCategoryID,
              parentSelectSpecialId: null,
              isPasteSpecialParent: false,
            });

            shape?.toObject();

            updatedShape = {
              ID: shape.ID,
              UserID: shape?.UserID,
              LayerID: shape?.LayerID,
              Type: shape?.type,
              properties: {
                ...shape,
                comment: newComment,
              },
              bob_no_id,
              AssignDate: AssignDate,
              CategoryID: CategoryID,
              SubCategoryID: SubCategoryID,
              parentSelectSpecialId: null,
              isPasteSpecialParent: false,
            };
            commentShapeObj = newComment;
          }

          if (shape?.title !== null) {
            let titleId = shape.title.ID;
            let titleLabel = shape.title.label;
            let titleShape = shape.title?.toObject();
            // Create the new title object
            const newTitle = {
              ...titleShape,
              ID: titleId,
              ParentAnnotationID: ID,
              bob_no_id,
              PageID: shape.PageID,
              LayerID: shape?.LayerID,
              UserID: shape?.UserID,
              label: titleLabel,
              AssignDate: AssignDate,
              CategoryID: CategoryID,
              SubCategoryID: SubCategoryID,
              parentSelectSpecialId: null,
              isPasteSpecialParent: false,
            };
            // Push the new title into the newAnnotations array
            newAnnotations.push({
              ID: titleId,
              UserID: shape?.UserID,
              LayerID: shape?.LayerID,
              ParentAnnotationID: ID,
              bob_no_id,
              properties: newTitle,
              AssignDate: AssignDate,
              CategoryID: CategoryID,
              SubCategoryID: SubCategoryID,
              parentSelectSpecialId: null,
              isPasteSpecialParent: false,
            });

            updatedShape = {
              ID: shape.ID,
              UserID: shape?.UserID,
              LayerID: shape?.LayerID,
              Type: shape?.type,
              properties: {
                ...shape,
                title: newTitle, // Use the newly created title object here
              },
              AssignDate: AssignDate,
              bob_no_id,
              CategoryID: CategoryID,
              SubCategoryID: SubCategoryID,
              parentSelectSpecialId: null,
              isPasteSpecialParent: false,
            };
            titleShapeobj = newTitle;
          }

          if (shape?.icon !== null) {
            // const { canvas, ShapeID, ...icon } = shape?.icon; // Remove canvas property
            let iconId = shape.icon.ID;
            let iconLabel = shape.icon.label;
            let iconShape = shape.icon?.toObject();
            // Create the new icon object
            const newIcon = {
              ...iconShape,
              ID: iconId,
              ParentAnnotationID: ID,
              bob_no_id,
              PageID: shape.PageID,
              LayerID: shape?.LayerID,
              UserID: shape?.UserID,
              label: iconLabel,
              AssignDate: AssignDate,
              CategoryID: CategoryID,
              SubCategoryID: SubCategoryID,
              parentSelectSpecialId: null,
              isPasteSpecialParent: false,
            };
            // Push the new icon into the newAnnotations array
            newAnnotations.push({
              ID: iconId,
              UserID: shape?.UserID,
              LayerID: shape?.LayerID,
              ParentAnnotationID: ID,
              bob_no_id,
              properties: newIcon,
              AssignDate: AssignDate,
              CategoryID: CategoryID,
              SubCategoryID: SubCategoryID,
              parentSelectSpecialId: null,
              isPasteSpecialParent: false,
            });

            updatedShape = {
              ID: shape.ID,
              UserID: shape?.UserID,
              LayerID: shape?.LayerID,
              Type: shape?.type,
              properties: {
                ...shape,
                icon: newIcon, // Use the newly created icon object here
              },
              AssignDate: AssignDate,
              CategoryID: CategoryID,
              SubCategoryID: SubCategoryID,
              bob_no_id,
            };
            iconShapeobj = newIcon;
          }
          let pattern = null;
          if (shape?.fill?.repeat) {
            pattern = shape.pattern;
          }
          let strokeType = shape?.strokeType || "Solid";
          shape = shape?.toObject();
          // const { canvas, ...restProperties } = shape;
          updatedShape = {
            ID: ID,
            UserID: UserID,
            LayerID: LayerID,
            Type: Type,
            AssignDate: AssignDate,
            CategoryID: CategoryID,
            SubCategoryID: SubCategoryID,
            parentSelectSpecialId: parentSelectSpecialId,
            isPasteSpecialParent: isPasteSpecialParent,
            ParentAnnotationID: ParentAnnotationID,
            bob_no_id,
            properties: {
              ...shape,
              comment: commentShapeObj,
              title: titleShapeobj,
              icon: iconShapeobj,
              pattern: pattern,
              strokeType,
              parentSelectSpecialId: parentSelectSpecialId,
              isPasteSpecialParent: isPasteSpecialParent,
            },
          };
          return updatedShape;
        });
        // Combine the original annotations with the new comments, titles, and icons
        const combinedAnnotations = [...ShapeData, ...newAnnotations];
        const formatDateTime = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          const seconds = String(date.getSeconds()).padStart(2, "0");
          return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        };
        const selectedDate =
          localStorage.getItem("selecteDate") || formatDateTime(new Date());
        return {
          ...layer,
          Collapsed: true,
          AssignDate: selectedDate,
          annotations: combinedAnnotations,
        };
      });

      return {
        ...page,
        ID: parseInt(pageID[1]),
        calendar: {
          ...page.calendar,
          layers: pageData,
        },
      };
    });

    const payload = {
      projectID: projectDetails?.ID,
      projectData: {
        project: {
          UserID: projectDetails?.UserID || null,
          Name: projectDetails?.Name || null,
          Description: projectDetails?.Description || null,
        },
        pages: pagesInfo,
      },
    };

    return payload;
  }, [state, pages]);

  // for refresh page
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ""; // For modern browsers
      return ""; // For older browsers
    };
    if (isAnyChanges) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isAnyChanges]);

  useEffect(() => {
    if (canvases) {
      canvases.forEach((canvas) => {
        if (!canvasRefs.current[canvas.id]) {
          canvasRefs.current[canvas.id] = initializeFabricCanvas(
            canvas.id,
            backgroundColor
          );
          canvasRefs.current[canvas.id].on("after:render", () => {
            canvasRefs.current[canvas.id].calcOffset();
            canvasRefs.current[canvas.id].forEachObject((obj) =>
              obj.setCoords()
            );
          });
        }
      });
    }
  }, [canvases, backgroundColor, currentUser, selectDate]);

  useEffect(() => {
    clipboardRef.current = [];
    clipboardOption.current = null;
  }, [selectDate, activeCanvas]);

  const applyTextStyles = (textObject, styles) => {
    if (textObject && styles) {
      styles.forEach((styleRange) => {
        const { start, end, style } = styleRange;
        for (let i = start; i < end; i++) {
          textObject.setSelectionStyles(style, i, i + 1);
        }
      });
    }
  };

  const parseApiResponse = async (response) => {
    const canvasObjects = [];
    const pages = await Promise.all(
      response.pages.map(async (page) => {
        const layers = await Promise.all(
          page.calendar?.layers?.map(async (layer) => {
            const annotations = await Promise.all(
              layer?.annotations
                ?.filter((res) => res?.ParentAnnotationID === null)
                .map(async (annotation) => {
                  let properties = annotation.properties;
                  const iconProperties = properties?.icon;
                  // Initialize comment and title objects if they exist
                  let commentObject = properties?.comment
                    ? new fabric.Textbox(
                        properties?.comment?.text,
                        properties?.comment
                      )
                    : null;
                  let titleObject = properties?.title
                    ? new fabric.Textbox(
                        properties?.title?.text,
                        properties?.title
                      )
                    : null;

                  applyTextStyles(commentObject, properties?.comment?.styles);
                  applyTextStyles(titleObject, properties?.title?.styles);

                  let iconObject = null;
                  if (iconProperties && iconProperties.src) {
                    iconObject = await new Promise((resolve) => {
                      fabric.Image.fromURL(iconProperties.src, (img) => {
                        img.set({
                          ...iconProperties,
                          left: iconProperties?.left,
                          top: iconProperties?.top,
                          width: iconProperties?.width,
                          height: iconProperties?.height,
                          selectable: true,
                          lockMovementX: false,
                          lockMovementY: false,
                          visible: true,
                          label: "icon",
                          ID: iconProperties?.ID,
                          ShapeID: iconProperties?.ParentAnnotationID,
                          LayerID: iconProperties?.LayerID,
                          PageID: iconProperties?.PageID,
                          AssignDate: iconProperties?.AssignDate,
                          CategoryID: iconProperties?.CategoryID || 1,
                          SubCategoryID: iconProperties?.SubCategoryID || 1,
                          parentSelectSpecialId:
                            iconProperties?.parentSelectSpecialId || null,
                          isPasteSpecialParent:
                            iconProperties?.isPasteSpecialParent || false,
                        });
                        resolve(img);
                      });
                    });
                  }
                  properties = {
                    ...annotation.properties,
                    ID: annotation?.ID,
                    LayerID: annotation?.LayerID,
                    UserID: annotation?.UserID,
                    PageID: annotation?.PageID,
                    AssignDate: annotation?.AssignDate,
                    CategoryID: annotation?.CategoryID || 1,
                    SubCategoryID: annotation?.SubCategoryID || 1,
                    bob_no_id: annotation?.bob_no_id,
                    icon: iconObject || null,
                    comment: commentObject || null,
                    title: titleObject || null,
                    strokeDashArray:
                      annotation.properties.strokeType === "Dashed"
                        ? [5, 5]
                        : annotation.properties.strokeType === "Dotted"
                        ? [1, 5]
                        : null,
                    strokeUniform: true,
                    visible: true,
                    isEditable: annotation.isEditable || false,
                    selectable: annotation.isEditable || false, // depends on backend value
                    IsLocked: annotation.isEditable
                      ? false
                      : true, // depends on backend value
                    evented: annotation.isEditable || false, // depends on backend value
                    IsVisible: true,
                    perPixelTargetFind: true,
                    type: properties?.type || annotation?.Type,
                    parentSelectSpecialId:
                      annotation?.parentSelectSpecialId || null,
                    isPasteSpecialParent:
                      annotation?.isPasteSpecialParent || false,
                  };

                  let fabricObject;
                  switch (properties.type) {
                    case "rect":
                      fabricObject = new fabric.Rect(properties);
                      break;
                    case "ellipse":
                      fabricObject = new fabric.Ellipse(properties);
                      break;
                    case "line":
                      fabricObject = new fabric.Line(
                        [
                          properties.x1,
                          properties.y1,
                          properties.x2,
                          properties.y2,
                        ],
                        properties
                      );
                      break;
                    case "textbox":
                      fabricObject = new fabric.Textbox(
                        properties.text,
                        properties
                      );
                      applyTextStyles(fabricObject, properties?.styles);
                      break;
                    case "triangle":
                      fabricObject = new fabric.Triangle(properties);
                      break;
                    case "polygon":
                      fabricObject = new fabric.Polygon(
                        [
                          {
                            x: properties.left + properties.width / 2,
                            y: properties.top,
                          }, // top
                          {
                            x: properties.left + properties.width,
                            y: properties.top + properties.height / 4,
                          }, // top right
                          {
                            x: properties.left + properties.width,
                            y: properties.top + (properties.height * 3) / 4,
                          }, // bottom right
                          {
                            x: properties.left + properties.width / 2,
                            y: properties.top + properties.height,
                          }, // bottom
                          {
                            x: properties.left,
                            y: properties.top + (properties.height * 3) / 4,
                          }, // bottom left
                          {
                            x: properties.left,
                            y: properties.top + properties.height / 4,
                          }, // top left
                        ],
                        properties
                      );
                      break;
                    default:
                      fabricObject = null;
                      break;
                  }

                  if (fabricObject) {
                    canvasObjects.push(fabricObject);
                  }
                  annotation = fabricObject;

                  return annotation;
                })
            );

            return {
              ...layer,
              annotations,
            };
          })
        );

        return {
          ...page,
          ID: `canvas-${page?.ID}`,
          calendar: {
            ...page.calendar,
            layers,
          },
        };
      })
    );

    return {
      ...response,
      pages,
    };
  };

  // const parseApiResponse = (response) => {
  //   const canvasObjects = [];
  //   const pages = response.pages.map((page) => ({
  //     ...page,
  //     ID: `canvas-${page?.ID}`,
  //     calendar: {
  //       ...page.calendar,
  //       layers: page.calendar?.layers?.map((layer) => ({
  //         ...layer,
  //         annotations: layer?.annotations
  //           ?.filter((res) => res?.ParentAnnotationID === null)
  //           .map((annotation) => {
  //             let properties = annotation.properties;
  //             const iconProperties = properties?.icon;
  //             // Initialize comment and title objects if they exist
  //             let commentObject = properties?.comment
  //               ? new fabric.Textbox(
  //                   properties?.comment?.text,
  //                   properties?.comment
  //                 )
  //               : null;
  //             let titleObject = properties?.title
  //               ? new fabric.Textbox(properties?.title?.text, properties?.title)
  //               : null;
  //             let iconObject
  //             let iconData = iconProperties && iconProperties
  //               ? fabric.Image.fromURL(iconProperties.src, function (img) {
  //                   img.set({
  //                     ...iconProperties,
  //                     left: iconProperties?.left,
  //                     top: iconProperties?.top,
  //                     width: iconProperties?.width,
  //                     height: iconProperties?.height,
  //                     selectable: true,
  //                     lockMovementX: true,
  //                     lockMovementY: true,
  //                     visible: true,
  //                     label: "icon",
  //                     ID: iconProperties?.ID,
  //                     ShapeID: iconProperties?.ParentAnnotationID,
  //                     LayerID: iconProperties?.LayerID,
  //                     PageID: iconProperties?.PageID,
  //                     AssignDate: iconProperties?.AssignDate,
  //                     CategoryID: iconProperties?.CategoryID || 1,
  //                     SubCategoryID: iconProperties?.SubCategoryID || 1,
  //                     parentSelectSpecialId: null,
  //                     isPasteSpecialParent: false,
  //                   });
  //                   iconObject = img
  //                   // canvasRefs.current[activeCanvas].add(img);
  //                 })
  //               : null;
  //             properties = {
  //               ...annotation.properties,
  //               ID: annotation?.ID,
  //               LayerID: annotation?.LayerID,
  //               UserID: annotation?.UserID,
  //               PageID: annotation?.PageID,
  //               AssignDate: annotation?.AssignDate,
  //               CategoryID: annotation?.CategoryID || 1,
  //               SubCategoryID: annotation?.SubCategoryID || 1,
  //               icon: titleObject || null,
  //               comment: commentObject || null,
  //               title: titleObject || null,
  //               strokeUniform: true,
  //               visible: true,
  //               selectable: true,
  //               IsLocked: false,
  //               IsVisible: true,
  //               perPixelTargetFind: true,
  //               type: properties?.type || annotation?.Type,
  //             };
  //             let fabricObject;
  //             switch (properties.type) {
  //               case "rect":
  //                 fabricObject = new fabric.Rect(properties);
  //                 break;
  //               case "ellipse":
  //                 fabricObject = new fabric.Ellipse(properties);
  //                 break;
  //               case "line":
  //                 fabricObject = new fabric.Line(
  //                   [
  //                     properties.x1,
  //                     properties.y1,
  //                     properties.x2,
  //                     properties.y2,
  //                   ],
  //                   properties
  //                 );
  //                 break;
  //               case "textbox":
  //                 fabricObject = new fabric.Textbox(
  //                   properties.text,
  //                   properties
  //                 );
  //                 break;
  //               case "triangle":
  //                 fabricObject = new fabric.Triangle(properties);
  //                 break;
  //               case "polygon":
  //                 fabricObject = new fabric.Polygon(
  //                   [
  //                     {
  //                       x: properties.left + properties.width / 2,
  //                       y: properties.top,
  //                     }, // top
  //                     {
  //                       x: properties.left + properties.width,
  //                       y: properties.top + properties.height / 4,
  //                     }, // top right
  //                     {
  //                       x: properties.left + properties.width,
  //                       y: properties.top + (properties.height * 3) / 4,
  //                     }, // bottom right
  //                     {
  //                       x: properties.left + properties.width / 2,
  //                       y: properties.top + properties.height,
  //                     }, // bottom
  //                     {
  //                       x: properties.left,
  //                       y: properties.top + (properties.height * 3) / 4,
  //                     }, // bottom left
  //                     {
  //                       x: properties.left,
  //                       y: properties.top + properties.height / 4,
  //                     }, // top left
  //                   ],
  //                   properties
  //                 );
  //                 break;

  //               default:
  //                 fabricObject = null;
  //                 break;
  //             }

  //             if (fabricObject) {
  //               canvasObjects.push(fabricObject);
  //             }

  //             annotation = fabricObject;

  //             return annotation;
  //           }),
  //       })),
  //     },
  //   }));
  //   return {
  //     ...response,
  //     pages,
  //   };
  // };

  function getFormattedDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const updateCanvasState = (apiResponse, currentState, parsedData) => {
    const updatedCanvas = apiResponse
      .map((apiCanvas) => {
        // Find the corresponding canvas in the current state
        const currentCanvas = currentState.find(
          (canvas) => canvas.ID === apiCanvas.ID
        );

        // If the canvas doesn't exist, we skip it
        if (!currentCanvas) {
          return null;
        }

        // Compare calendars (layers)
        const updatedCalendar = apiCanvas.calendar.layers
          .map((apiLayer) => {
            const currentLayer = currentCanvas.calendar.layers.find(
              (layer) => layer.ID === apiLayer.ID
            );

            // If the current layer exists, check annotations
            const updatedAnnotations = apiLayer.annotations.map(
              (apiAnnotation) => {
                // Find the matching annotation from the current layer
                const currentAnnotation = currentLayer?.annotations.find(
                  (annotation) => annotation.ID === apiAnnotation.ID
                );

                // If the current annotation exists and is unsaved, keep the unsaved version
                if (currentAnnotation?.unsavedAnnotations) {
                  return currentAnnotation;
                }

                // Otherwise, keep the API annotation
                return apiAnnotation;
              }
            );

            // Get any additional unsaved annotations from the current layer
            const unsavedAnnotations = currentLayer
              ? currentLayer.annotations.filter(
                  (annotation) =>
                    annotation.unsavedAnnotations &&
                    !updatedAnnotations.some((a) => a.ID === annotation.ID)
                )
              : [];

            // Merge unsaved annotations with the updated annotations from the API
            const finalAnnotations = [
              ...updatedAnnotations,
              ...unsavedAnnotations,
            ];
            // Return the updated layer with the combined annotations
            return {
              ...apiLayer,
              annotations: finalAnnotations,
            };
          })
          .filter(Boolean); // Remove null layers

        // Return the updated canvas with layers
        return {
          ...apiCanvas,
          calendar: {
            layers: updatedCalendar,
          },
        };
      })
      .filter(Boolean); // Remove null canvases
    return {
      ...parsedData,
      pages: updatedCanvas,
    };
  };

  const fetchCanvasData = async (info) => {
    try {
      let apiUrl;
      let payload;
      if (info) {
        const proID = info.split("-")[1]?.split(".")[0];
        apiUrl = `project/openProjectById`;
        payload = {
          projectID: proID,
        };
      } else {
        const calendarDate =
          localStorage.getItem("selecteDate") || getFormattedDate();
        apiUrl = `project/projectById`;
        payload = {
          projectID: projectId,
          calendarDate: calendarDate,
        };
      }
      const response = await postApiCaller(apiUrl, payload, headers);
      actions.isProjecteEditable(response.project.IsEditable)
      const parsedData = await parseApiResponse(response);
      let ans = updateCanvasState(
        parsedData.pages,
        pagesRef.current,
        parsedData
      );
      if (
        pagesRef.current?.[0]?.ID ===
        "canvas-0d09fda1-221e-42a0-bb2e-dc30006a652e"
      ) {
        actions.initialData(parsedData);
        setISCanvasData(parsedData);
      } else if (
        pagesRef.current?.[0]?.ID !==
        "canvas-0d09fda1-221e-42a0-bb2e-dc30006a652e"
      ) {
        actions.initialData(ans);
        setISCanvasData(ans);
      } else {
        actions.initialData(parsedData);
        setISCanvasData(parsedData);
      }
      return parsedData;
    } catch (error) {
      if (error.response) {
        console.error("Error Response:", error.response);
        if (error.response.status === 401) {
          navigate("/");
        } else if (error.response.status === 404) {
          toast.error(error.response.data.message);
        } else {
          toast.error(`Server error: ${error.response.status}`);
        }
      } else {
        console.error("Error Message:", error.message);
        // toast.error("Network error or server is not responding");
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "f") {
        event.preventDefault(); // Prevent the default browser find behavior
        setShowModal(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "z" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        actions.undo();
      } else if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        (event.key === "z" || event.key === "Z")
      ) {
        event.preventDefault();
        actions.redo();
      } else {
        // console.log(event.metaKey, event.shiftKey, event.key,event.ctrlKey);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undoStack, redoStack]);

  const handleFindModalclose = () => {
    canvasRefs.current[activeCanvas].getObjects("textbox").forEach((obj) => {
      // Reset styles for all text objects
      if (
        searchText &&
        obj.text.toLowerCase().includes(searchText.toLowerCase())
      ) {
        obj.set({ shadow: null });
      } else {
        obj.set({ shadow: null });
      }
    });
    setSearchText("");
    setReplaceText("");
    canvasRefs.current[activeCanvas].renderAll();
    setShowModal(false);
    setFindArrayLength();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchText) return;

    const currentCanvas = canvasRefs.current[activeCanvas];
    let foundObjects = []; // Temporary array to store found objects

    currentCanvas.getObjects("textbox").forEach((obj) => {
      // Search and store objects containing the searchText
      if (obj.text.toLowerCase().includes(searchText.toLowerCase())) {
        foundObjects.push(obj);

        if (replaceText) {
          // Replace text if replaceText is provided
          const newText = obj.text.replace(
            new RegExp(searchText, "gi"),
            replaceText
          );
          obj.set({ text: newText });
          actions.isAnyDataChanges(true);
        } else {
          // Highlight found text
          obj.set({
            shadow: {
              color: "rgba(0, 0, 255, 0.9)", // Blueish shadow color
              blur: 5,
              offsetX: 5,
              offsetY: 5,
            },
          });
        }
      }
    });

    setFindArrayLength(foundObjects);
    if (foundObjects.length > 0) {
      currentCanvas.setActiveObject(foundObjects[arrayIndex]); // Set the first found object as active
    }
    currentCanvas.renderAll();
  };

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
    if (ISCanvasData) {
      const intervalId = setInterval(() => {
        saveData();
      }, 50000);
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [ISCanvasData, pages]);

  useEffect(() => {
    if (!currentOption || !currentObj) {
      return;
    }
    switch (currentOption) {
      case 1:
        actions.updateState(clonedState);
        duplicateShape(currentObj);
        break;

      case 2:
        actions.updateState(clonedState);
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
        handleSelection();
      case 8:
        copyShape(selectedObject);
        break;
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

  useEffect(() => {
    handleSelection();
  }, [properties, state.fieldProperty]);

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
    // const [month, day, year] = date2?.split("/");
    // const day2 = day;
    // const month2 = month;
    // const year2 = year;

    // return day1 === day2 && month1 === month2 && year1 === year2;
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
    const currCanvasData = pages?.find(
      (canvasShape) => canvasShape?.ID === activeCanvas
    );
    if (currCanvasData.calendar.layers.length === 0) {
      clipboardRef.current = [];
      clipboardOption.current = null;
    }
    if (currCanvasData) {
      const shapeData = currCanvasData.calendar?.layers?.flatMap(
        (layer) => layer?.annotations || []
      );
      setShapes(shapeData);
      setBgImgsData(currCanvasData.background);
      setUsers(currCanvasData.calendar.layers);
    }
    // setShowContext(false);
  }, [activeCanvas, pages, shapeToDraw]);

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

    // loadImage();
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

  const renderPdfUrlAsImage = async (pdfUrl) => {
    try {
      // Load the PDF
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;

      // Get the first page (you can modify this for other pages)
      const page = await pdf.getPage(1);

      // Set scale for rendering
      const viewport = page.getViewport({ scale: 1.5 });

      // Create a canvas element for rendering
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render the PDF page into the canvas context
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      await page.render(renderContext).promise;

      // Convert canvas to image data URL (PNG format)
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Error rendering PDF:", error);
      return null;
    }
  };

  const loadImageAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const [showBackground, setShowBackground] = useState(false);

  const handleDoubleClick = (event) => {
    const { e } = event;
    const { clientX: x, clientY: y, type } = e;

    if (type === "dblclick") {
      setShowBackground(true);
      setOpen(true);
      setShowContext(false);
      setAnchorPoint({ x, y });
    }
  };

  // const setBackgroundImage = (imageUrl) => {
  //   const canvas = canvasRefs.current[activeCanvas];

  //   // Remove any existing background image
  //   canvas.backgroundImage = null;

  //   fabric.Image.fromURL(imageUrl, (img) => {
  //     if (!img) {
  //       console.error("Image failed to load");
  //       return;
  //     }

  //     // Set the desired width and height for the image
  //     const desiredWidth = 400; // Adjust as needed
  //     const desiredHeight = 400; // Adjust as needed

  //     img.scaleToWidth(desiredWidth);
  //     img.scaleToHeight(desiredHeight);
  //     img.setCoords();

  //     // Prevent selection and events
  //     img.set({
  //       left: (canvas.width - desiredWidth) / 2,
  //       top: (canvas.height - desiredHeight) / 2,
  //       selectable: false,
  //       evented: false,
  //       hasControls: false,
  //       hasBorders: false,
  //       lockMovementX: true,
  //       lockMovementY: true,
  //       lockRotation: true,
  //     });

  //     // Add the image to the canvas
  //     canvas.add(img);
  //     canvas.sendToBack(img); // Ensure it stays in the background

  //     // canvas.on("mouse:dblclick", handleDoubleClick);
  //     // Prevent the default context menu from appearing on right-click
  //     canvas.upperCanvasEl.oncontextmenu = (e) => {
  //       e.preventDefault();
  //     };

  //     // Clean up event listeners on component unmount
  //     canvas.renderAll();
  //   });
  // };

  const setBackgroundImage = (imageUrl) => {
    const canvas = canvasRefs.current[activeCanvas];

    // Remove any existing background image
    canvas.backgroundImage = null;

    // Create and add loading text to the canvas
    const loadingText = new fabric.Text("Image is loading...", {
      left: canvas.width / 2,
      top: canvas.height / 2,
      fontSize: 20,
      fill: "black", // Change the color as needed
      originX: "center",
      originY: "center",
      selectable: false,
    });
    canvas.add(loadingText);
    canvas.renderAll();

    fabric.Image.fromURL(imageUrl, (img) => {
      if (!img) {
        console.error("Image failed to load");
        canvas.remove(loadingText); // Remove loading text on error
        return;
      }

      // Desired padding
      const horizontalPadding = 0; // 100px from left and right
      const verticalPadding = 90; // 90px from top and bottom

      // Get canvas dimensions
      const canvasWidth = canvas.width - 2 * horizontalPadding;
      const canvasHeight = canvas.height - 2 * verticalPadding;

      // Get image's original dimensions
      const imgOriginalWidth = img.width;
      const imgOriginalHeight = img.height;

      // Calculate scaling to fit the image entirely within the canvas, with padding
      const widthRatio = canvasWidth / imgOriginalWidth;
      const heightRatio = canvasHeight / imgOriginalHeight;
      const scaleFactor = Math.min(widthRatio, heightRatio); // Ensures image fits within both dimensions with padding

      // Scale the image while maintaining aspect ratio
      img.scale(scaleFactor);
      img.setCoords();

      // Center the image with padding applied
      img.set({
        left: horizontalPadding + (canvasWidth - img.getScaledWidth()) / 3, // Center horizontally with padding
        top: verticalPadding + (canvasHeight - img.getScaledHeight()) / 2, // Center vertically with padding
        selectable: false,
        evented: false,
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
      });

      // Add the image to the canvas
      canvas.add(img);
      canvas.sendToBack(img); // Ensure it stays in the background

      // Remove the loading text after image loads
      canvas.remove(loadingText);

      // Prevent the default context menu from appearing on right-click
      canvas.upperCanvasEl.oncontextmenu = (e) => {
        e.preventDefault();
      };

      // Render the canvas to apply the changes
      canvas.renderAll();
    });
  };

  //   const setBackgroundImage = (imageUrl) => {
  //     const canvas = canvasRefs.current[activeCanvas];

  //     // Remove any existing background image
  //     canvas.backgroundImage = null;

  //     fabric.Image.fromURL(imageUrl, (img) => {
  //       if (!img) {
  //         console.error("Image failed to load");
  //         return;
  //       }

  //       // Desired padding
  //       const horizontalPadding = 0; // 0px from left and right
  //       const verticalPadding = 90; // 90px from top and bottom

  //       // Get canvas dimensions
  //       const canvasWidth = canvas.width - 2 * horizontalPadding;
  //       const canvasHeight = canvas.height - 2 * verticalPadding;

  //       // Get image's original dimensions
  //       const imgOriginalWidth = img.width ;
  //       const imgOriginalHeight = img.height;

  //       // Determine scaling factors
  //       const widthScale = canvasWidth / imgOriginalWidth;
  //       const heightScale = canvasHeight / imgOriginalHeight;

  //       let scaleFactor;

  //       // Scale the image to fit within the canvas width and height
  //       if (imgOriginalWidth > canvasWidth && imgOriginalHeight > canvasHeight) {
  //         // If both dimensions exceed the canvas, use the smaller scale
  //         scaleFactor = Math.min(widthScale, heightScale);
  //       } else if (imgOriginalWidth > canvasWidth) {
  //         // If only the width exceeds the canvas
  //         scaleFactor = widthScale;
  //       } else if (imgOriginalHeight > canvasHeight) {
  //         // If only the height exceeds the canvas
  //         scaleFactor = heightScale;
  //       } else {
  //         scaleFactor = 1; // No scaling needed
  //       }

  //       // Scale the image while maintaining aspect ratio
  //       img.scale(scaleFactor);
  //       img.setCoords();

  //       // Center the image with padding applied
  //       img.set({
  //         left: horizontalPadding + (canvasWidth - img.getScaledWidth()) / 2,   // Center horizontally with padding
  //         top: verticalPadding + (canvasHeight - img.getScaledHeight()) / 2,    // Center vertically with padding
  //         selectable: false,
  //         evented: false,
  //         hasControls: false,
  //         hasBorders: false,
  //         lockMovementX: true,
  //         lockMovementY: true,
  //         lockRotation: true,
  //       });

  //       // Add the image to the canvas
  //       canvas.add(img);
  //       canvas.sendToBack(img); // Ensure it stays in the background

  //       // Prevent the default context menu from appearing on right-click
  //       canvas.upperCanvasEl.oncontextmenu = (e) => {
  //         e.preventDefault();
  //       };

  //       // Render the canvas to apply the changes
  //       canvas.renderAll();
  //     });
  // };

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

    // to show assign, unassign things on double click
    canvas.on("mouse:dblclick", handleDoubleClick);
    // Adding an event listener for right-click and disable to show background dropdown values
    canvas.upperCanvasEl.addEventListener("contextmenu", function (event) {
      event.preventDefault(); // Prevent the default context menu from showing
      setShowBackground(false);
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
        preventDefaultContextMenu(e, activeObject);
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
    canvasRefs.current[activeCanvas].renderAll();
  };

  // const addPoint = (options) => {
  //   const pointer = canvasRefs.current[activeCanvas].getPointer(options.e);
  //   const pointOption = {
  //     id: new Date().getTime(),
  //     radius: 5,
  //     fill: "#ffffff",
  //     stroke: "#333333",
  //     strokeWidth: 0.5,
  //     left: pointer.x,
  //     top: pointer.y,
  //     selectable: false,
  //     hasBorders: false,
  //     hasControls: false,
  //     originX: "center",
  //     originY: "center",
  //     objectCaching: false,
  //   };
  //   const point = new fabric.Circle(pointOption);

  //   if (pointArray.length === 0) {
  //     point.set({
  //       fill: "red",
  //     });
  //   }
  //   const linePoints = [pointer.x, pointer.y, pointer.x, pointer.y];
  //   const lineOption = {
  //     strokeWidth: 2,
  //     fill: "#999999",
  //     stroke: "#999999",
  //     originX: "center",
  //     originY: "center",
  //     selectable: false,
  //     hasBorders: false,
  //     hasControls: false,
  //     evented: false,
  //     objectCaching: false,
  //   };
  //   const line = new fabric.Line(linePoints, lineOption);
  //   line.class = "line";
  //   if (activeShape) {
  //     const points = activeShape.get("points");
  //     points.push({
  //       x: pointer.x,
  //       y: pointer.y,
  //     });
  //     const polygon = new fabric.Polygon(points, {
  //       stroke: "#333333",
  //       strokeWidth: 1,
  //       fill: "#cccccc",
  //       opacity: 0.3,
  //       selectable: false,
  //       hasBorders: false,
  //       hasControls: false,
  //       evented: false,
  //       objectCaching: false,
  //     });
  //     setIsActiveShape(polygon);
  //     canvasRefs.current[activeCanvas].remove(activeShape);
  //     canvasRefs.current[activeCanvas].add(polygon);
  //     activeShape = polygon;
  //     canvasRefs.current[activeCanvas].renderAll();
  //   } else {
  //     const polyPoint = [{ x: pointer.x, y: pointer.y }];
  //     const polygon = new fabric.Polygon(polyPoint, {
  //       stroke: "#333333",
  //       strokeWidth: 1,
  //       fill: "#cccccc",
  //       opacity: 0.3,
  //       selectable: false,
  //       hasBorders: false,
  //       hasControls: false,
  //       evented: false,
  //       objectCaching: false,
  //     });
  //     activeShape = polygon;
  //     setIsActiveShape(polygon);
  //     canvasRefs.current[activeCanvas].add(polygon);
  //   }

  //   activeLine = line;
  //   pointArray.push(point);
  //   lineArray.push(line);

  //   canvasRefs.current[activeCanvas].add(line);
  //   canvasRefs.current[activeCanvas].add(point);
  // };
  const generatePolygon = async (pointArray) => {
    // ... (keep the existing code)
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
    if (points.length === 0) {
      return;
    }

    let polygon = new fabric.Polygon(points, {
      ID: createId(),
      UserID: getUserId(),
      PageID: activeCanvas,
      LayerID: currentUser,
      AssignDate: selectedDate,
      CategoryID: currentCategory || 1,
      SubCategoryID: currentSubCategory || 1,
      bob_no_id: createId(),
      parentSelectSpecialId: null,
      isPasteSpecialParent: false,
      fill: fillColor || "#ffffff",
      stroke: strokeColor || "#000000",
      strokeWidth: strokeWidth || 2,
      strokeDashArray:
        strokeType === "Dashed"
          ? [5, 5]
          : strokeType === "Dotted"
          ? [1, 5]
          : null,
      strokeType: strokeType,
      objectCaching: false,
      moveable: false,
      originX: "center",
      originY: "center",
      comment: null,
      title: null,
      icon: null,
      selectable: false,
      isEditable: true,
    });
    // polygon = await callAddShape(polygon);
    canvasRefs.current[activeCanvas].add(polygon);
    actions.updateState(clonedState);
    actions.addShape(polygon);
    actions.isAnyDataChanges(true);
    // Reset polygon drawing state
    initializePolygonDrawing();
  };

  // const generatePolygon = async (pointArray) => {
  //   if (!canvasRefs) {
  //     return;
  //   }
  //   const points = [];
  //   for (const point of pointArray) {
  //     points.push({
  //       x: point.left,
  //       y: point.top,
  //     });
  //     canvasRefs.current[activeCanvas].remove(point);
  //   }

  //   for (const line of lineArray) {
  //     canvasRefs.current[activeCanvas].remove(line);
  //   }

  //   canvasRefs.current[activeCanvas].remove(activeShape).remove(activeLine);

  //   let polygon = new fabric.Polygon(points, {
  //     ID: createId(),
  //     UserID: getUserId(),
  //     PageID: activeCanvas,
  //     LayerID: currentUser,
  //     fill: fillColor || "#ffffff",
  //     stroke: strokeColor || "#000000",
  //     strokeWidth: strokeWidth || 2,
  //     strokeDashArray:
  //       strokeType === "Dashed"
  //         ? [5, 5]
  //         : strokeType === "Dotted"
  //         ? [1, 5]
  //         : null,
  //     objectCaching: false,
  //     moveable: false,
  //     originX: "center",
  //     originY: "center",
  //     comment: null,
  //     title: null,
  //     icon: null,
  //     selectable: false,
  //   });
  //   // polygon = await callAddShape(polygon);
  //   canvasRefs.current[activeCanvas].add(polygon);
  //   toggleDrawPolygon();
  //   actions.selectShapeType(false);
  //   actions.addShape(polygon);
  // };

  const initializePolygonDrawing = () => {
    activeLine = null;
    activeShape = null;
    lineArray = [];
    pointArray = [];
  };

  const toggleDrawPolygon = () => {
    clearCanvasEvents(canvasRefs.current[activeCanvas]);
    if (drawMode) {
      // stop draw mode
      initializePolygonDrawing();
      canvasRefs.current[activeCanvas].selection = true;
      setDrawMode(false);
      setShapeToDraw("");
    } else {
      // start draw mode
      clearCanvasEvents(canvasRefs.current[activeCanvas]);
      canvasRefs.current[activeCanvas].selection = false;
      initializePolygonDrawing();
      setDrawMode(true);
      setShapeToDraw("FreeForm");
    }
  };

  // const toggleDrawPolygon = () => {
  //   const canvas = canvasRefs.current[activeCanvas];

  //   clearCanvasEvents(canvas);
  //   if (drawMode) {
  //     // Stop draw mode
  //     exitDrawMode();
  //   } else {
  //     // Start draw mode
  //     canvas.selection = false;
  //     initializePolygonDrawing();
  //     setDrawMode(true);
  //     setShapeToDraw("FreeForm");

  //     // Add Escape key functionality to cancel draw mode
  //     document.addEventListener("keydown", handleEscKey);
  //   }

  //   function handleEscKey(event) {
  //     if (event.key === "Escape") {
  //       exitDrawMode();
  //     }
  //   }

  //   function exitDrawMode() {
  //     initializePolygonDrawing(); // Resets any current drawing
  //     canvas.selection = true;
  //     setDrawMode(false);
  //     setShapeToDraw("select");
  //     // clearCanvasEvents(canvas);
  //     // setShapeToDraw("FreeForm");

  //     // Remove the Escape key event listener when done
  //     document.removeEventListener("keydown", handleEscKey);
  //   }
  // };

  // const toggleDrawPolygon = (event) => {
  //   clearCanvasEvents(canvasRefs.current[activeCanvas]);
  //   if (drawMode) {
  //     // stop draw mode
  //     activeLine = null;
  //     activeShape = null;
  //     lineArray = [];
  //     pointArray = [];
  //     canvasRefs.current[activeCanvas].selection = true;
  //     setDrawMode(false);
  //     setShapeToDraw("");
  //   } else {
  //     // start draw mode
  //     clearCanvasEvents(canvasRefs.current[activeCanvas]);
  //     canvasRefs.current[activeCanvas].selection = false;
  //     setDrawMode(true);
  //   }
  // };

  useEffect(() => {
    if (canvasRefs.current[activeCanvas]) {
      // Update background color when state changes
      canvasRefs.current[activeCanvas].backgroundColor = backgroundColor;
      canvasRefs.current[activeCanvas].renderAll();
      if (bgID) {
        actions.updateShapeBackground({
          id: bgID,
          canvasId5: activeCanvas,
          newColor: backgroundColor,
        });
      }
    }
  }, [backgroundColor, activeCanvas, bgID]);

  useEffect(() => {
    if (canvasRefs && canvasRefs.current[activeCanvas]) {
      const canvasWidth = canvasRefs.current[activeCanvas].originalWidth;
      const canvasHeight = canvasRefs.current[activeCanvas].originalHeight;
      // Update canvas size
      canvasRefs.current[activeCanvas].setWidth(canvasWidth);
      canvasRefs.current[activeCanvas].setHeight(canvasHeight);
      createShape("select");
      setDrawMode(false);
    }
  }, [activeCanvas, currentUser]);

  useEffect(() => {
    if (canvasRefs && canvasRefs.current[activeCanvas]) {
      if (shapeToDraw !== "") {
        createShape(shapeToDraw);
        if (shapeToDraw !== "FreeForm") {
          clearIncompletePolygon();
        }
      }
    }
  }, [shapeToDraw, properties, currentCategory, currentSubCategory]);

  useEffect(() => {
    // setShapeToDraw("select");
    resetValues();
  }, [currentUser]);

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

  async function addTitle() {
    targetedObj = targetedObj || selectedObject;
    canvasRefs.current[activeCanvas].setActiveObject(targetedObj);
    const newTitleText = titleText || "Add Your Title...";
    if (newTitleText !== "") {
      const isExistingTitle = isExistingProp("title", targetedObj);
      if (isExistingTitle !== null && isExistingTitle !== undefined) {
        isExistingTitle.set({
          text: titleText,
        });
        actions.isAnyDataChanges(true);
        canvasRefs.current[activeCanvas].setActiveObject(isExistingTitle);
        actions.updateTitleText("");
      } else {
        actions.updateState(clonedState);
        let title = new fabric.Textbox(newTitleText, {
          ID: createId(),
          left: targetedObj.left - 70,
          top: targetedObj.top - 30,
          fontSize: fontSize,
          fill: "#333",
          width: 170,
          height: "auto",
          padding: 10,
          selectable: true,
          fontFamily: fontFamily || "Arial",
          // fontWeight: "bold",
          // fontStyle: "Normal",
          textAlign: "left",
          visible: true,
          label: "title",
          lockMovementX: false,
          lockMovementY: false,
          PageID: activeCanvas,
          ShapeID: targetedObj.ID,
          LayerID: targetedObj.LayerID,
          UserID: targetedObj.UserID,
          AssignDate: selectedDate,
          CategoryID: currentCategory || 1,
          SubCategoryID: currentSubCategory || 1,
          parentSelectSpecialId: null,
          isPasteSpecialParent: false,
          bob_no_id: targetedObj.bob_no_id || null,
        });
        // title = await callAddShape(title);

        const currentRelativePosition = targetedObj.relativePosition || {};
        currentRelativePosition.title = {
          left: title.left - targetedObj.left,
          top: title.top - targetedObj.top,
        };
        targetedObj.set({
          title: title,
          PageID: activeCanvas,
          relativePosition: currentRelativePosition,
        });
        actions.isAnyDataChanges(true);
        canvasRefs.current[activeCanvas].add(title);
        actions.updateShape(targetedObj);
      }

      actions.updateCommentAddEditFlag(false);
      setShapeToDraw("select");
    }
    actions.updateTitleText("");
  }

  useEffect(() => {
    if (saveAs) {
      const pdf = new jsPDF();
      canvases &&
        canvases.forEach((item, index) => {
          const canvas = canvasRefs.current[item?.id];
          if (canvas) {
            const imgData = canvas.toDataURL("image/png");

            if (index > 0) {
              pdf.addPage();
            }

            const width = pdf.internal.pageSize.getWidth();
            const height = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, "PNG", 0, 0, width, height);
            actions.saveAsModal(false);
          }
        });

      // Use File System Access API if available, otherwise fall back to FileSaver
      if ("showSaveFilePicker" in window) {
        window
          .showSaveFilePicker({
            suggestedName: `${projectDetails.Name}.pdf`,
            types: [
              {
                description: "PDF File",
                accept: { "application/pdf": [".pdf"] },
              },
            ],
          })
          .then(async (fileHandle) => {
            const writable = await fileHandle.createWritable();
            await writable.write(pdf.output("blob"));
            await writable.close();

            // Rename the file to include the ID after the user-edited name
            const newFileName = `${fileHandle.name.replace(".pdf", "")}-${
              projectDetails.ID
            }.pdf`;
            await fileHandle.move(newFileName);
          })
          .catch(console.error);
      } else {
        // Fallback for browsers that don't support File System Access API
        pdf.save(`${projectDetails.Name}-${projectDetails.ID}.pdf`);
      }
    }
  }, [saveAs, canvases]);

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
        const x = options.clientX || options?.touches?.[0]?.clientX;
        const y = options.clientY || options?.touches?.[0]?.clientY;
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
        let zoom = canvasRefs.current[activeCanvas]?.getZoom();
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

    const handleKeyDown = (event) => {
      if (event.key === "Delete") {
        const activeObjects =
          canvasRefs.current[activeCanvas]?.getActiveObjects();
        if (activeObjects?.length >= 1) {
          actions.updateState();
          activeObjects?.map((obj) => {
            removeShape(obj);
          });
          canvasRefs.current[activeCanvas]?.discardActiveObject();
          canvasRefs.current[activeCanvas]?.requestRenderAll();
        }
      }
    };

    document.addEventListener("mousedown", onMouseMoveCanvas);
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousemove", onCanvasMove);
    document.addEventListener("mouseup", onMouseUp);
    canvasRefs.current[activeCanvas]?.on("mouse:wheel", onMouseWheel);

    return () => {
      document.removeEventListener("mousedown", onMouseMoveCanvas);
      window.removeEventListener("keydown", handleKeyDown);
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
          activeLine?.set({
            x2: pointer.x,
            y2: pointer.y,
          });
          if (activeShape) {
            const points = activeShape.get("points");
            points[pointArray.length] = {
              x: pointer.x,
              y: pointer.y,
            };
            activeShape.set({
              points,
            });
          }
        }
        canvasRefs.current[activeCanvas].renderAll();
      }
    };

    const onMouseRotate = (options) => {
      if (options.e.shiftKey) {
        var step = options.e.shiftKey ? 15 : 1;
        options.target.rotate(Math.round(options.target.angle / step) * step);
      }
      options.target.set({
        left: options.target.left,
        top: options.target.top,
      });
      options.target.setCoords();
    };
    const onObjectModified = (options) => {
      const obj = options.target;
      // Update comment position
      // actions.updateState();
      if (obj.comment) {
        const comment = obj.comment;
        comment.set({
          left: obj.left + (obj.relativePosition?.comment?.left || 80),
          top: obj.top + (obj.relativePosition?.comment?.top || -30),
        });
        canvasRefs.current[activeCanvas].requestRenderAll();
      }

      // Update title position
      if (obj.title) {
        const title = obj.title;
        title.set({
          left: obj.left + (obj.relativePosition?.title?.left || -20),
          top: obj.top + (obj.relativePosition?.title?.top || -30),
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
        actions.isAnyDataChanges(true);
        canvasRefs.current[activeCanvas].requestRenderAll();
      }
    };

    canvasRefs.current[activeCanvas]?.on("object:rotating", onMouseRotate);
    canvasRefs.current[activeCanvas]?.on("mouse:down", onMouseDown);
    canvasRefs.current[activeCanvas]?.on("mouse:move", onMouseMove);
    canvasRefs.current[activeCanvas]?.on("object:moving", onObjectModified);
    canvasRefs.current[activeCanvas]?.on("object:scaling", onObjectModified);
    canvasRefs.current[activeCanvas]?.on("object:rotating", onObjectModified);
    canvasRefs.current[activeCanvas]?.on("after:render", () => {
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
  }, [
    canvasRefs,
    drawMode,
    activeCanvas,
    properties,
    currentCategory,
    currentSubCategory,
  ]);

  async function addComments() {
    targetedObj = targetedObj || selectedObject;
    canvasRefs.current[activeCanvas].setActiveObject(targetedObj);
    const newCommentText = commentText || "Add Your Comment...";
    if (newCommentText !== "") {
      const isExistingComment = isExistingProp("comment", targetedObj);
      if (isExistingComment !== null && isExistingComment !== undefined) {
        isExistingComment.set({
          text: commentText,
        });
        actions.isAnyDataChanges(true);
        // canvasRefs.current[activeCanvas].setActiveObject(isExistingComment);
        actions.updateCommentText("");
      } else {
        actions.updateState(clonedState);
        let comment = new fabric.Textbox(newCommentText, {
          top: targetedObj.top - 30,
          fontSize: fontSize,
          fill: "#333",
          width: 210,
          height: "auto",
          padding: 10,
          selectable: true,
          fontFamily: fontFamily || "Arial",
          fontWeight: "Normal",
          // fontStyle: "Normal",
          textBackgroundColor: "transparent",
          textAlign: "left",
          visible: true,
          label: "comment",
          PageID: activeCanvas,
          lockMovementX: false,
          lockMovementY: false,
          ShapeID: targetedObj.ID,
          LayerID: targetedObj.LayerID,
          UserID: targetedObj.UserID,
          AssignDate: selectedDate,
          CategoryID: currentCategory || 1,
          SubCategoryID: currentSubCategory || 1,
          parentSelectSpecialId: null,
          isPasteSpecialParent: false,
          ID: createId(),
          left: targetedObj.left + 150,
          bob_no_id: targetedObj.bob_no_id || null,
        });
        // comment = await callAddShape(comment);
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
        if (isSelectSpeacial) {
          let commnetShape = comment?.toObject();
          const UserID = comment.UserID;
          const LayerID = comment.LayerID;
          const PageID = comment.PageID;
          const ShapeID = comment.ShapeID;
          const commentId = comment.ID;
          const label = comment.label;
          const AssignDate = comment?.AssignDate;
          const CategoryID = comment?.CategoryID || 1;
          const SubCategoryID = comment?.SubCategoryID || 1;
          const bob_no_id = comment?.bob_no_id;
          const parentSelectSpecialId = comment?.parentSelectSpecialId || null;
          const isPasteSpecialParent = comment?.isPasteSpecialParent || false;
          setSelectSpecialFields((prevState) => ({
            ...prevState,
            comment: {
              ...commnetShape,
              ShapeID: ShapeID,
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
            },
          }));
        }
        actions.isAnyDataChanges(true);
        canvasRefs.current[activeCanvas].add(comment);
        canvasRefs.current[activeCanvas].setActiveObject(selectedObject);

        targetedObj.PageID = `canvas-${targetedObj.PageID}`;
        actions.updateShape(targetedObj);
      }
      actions.updateCommentAddEditFlag("");
      setShapeToDraw("select");
    }
    actions.updateCommentText("");
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
          (shape) => shape?.ID === targetedObj?.ID
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
    const currCanvasData = pages?.filter(
      (canvasShape) => canvasShape?.ID === activeCanvas
    );
    let existingUser;
    if (currCanvasData[0]?.calendar?.layers?.length > 0) {
      existingUser = currCanvasData[0].calendar.layers.find(
        (layer) => layer.ID === currentUser
      );
    }
    setShapeFillColor(existingUser?.fillColor || "#ffffff");
    setShapeStrokeColor(existingUser?.strokeColor || "#000000");
  }, [pages, currentUser]);

  function createShape(shape) {
    setSelectSpecialFields({});
    actions.isSelectSpecialChanges(false);
    if (shape !== "select") {
      canvasRefs.current[activeCanvas].discardActiveObject();
      canvasRefs.current[activeCanvas].getObjects().forEach((obj) => {
        obj.set({
          selectable: false,
        });
      });
    }
    switch (shape) {
      case "Rectangle":
        addShape("rectangle");
        setDrawMode(false);
        break;
      case "circle":
        addShape("circle");
        setDrawMode(false);
        break;
      case "square":
        addShape("square");
        setDrawMode(false);
        break;
      case "line":
        addShape("line");
        setDrawMode(false);
        break;
      case "text":
        addShape("text");
        setDrawMode(false);
        break;
      case "Triangle":
        addShape("triangle");
        setDrawMode(false);
        break;
      case "Star":
        addShape("star");
        setDrawMode(false);
        break;
      case "Hexagon":
        addShape("hexagon");
        setDrawMode(false);
        break;
      case "select":
        addShape("select");
        setDrawMode(false);
        break;
      case "FreeForm":
        if (!drawMode) {
          toggleDrawPolygon();
        }
        break;

      default:
        break;
    }
  }

  function clearCanvasEvents(canvas) {
    actions.multipleSelection(false);
    canvas.off("mouse:down");
    canvas.off("mouse:move");
    canvas.off("mouse:up");
  }

  const selectedDate =
    localStorage.getItem("selecteDate") || getFormattedDate();

  // function addShapess(shapeType) {
  //   // Check if canvasRefs is available
  //   if (!canvasRefs || !canvasRefs.current[activeCanvas]) return;
  //   if (drawMode) {
  //     clearIncompletePolygon();
  //   }
  //   canvasRefs.current[activeCanvas].selection = false;

  //   // Check if drawing mode is active
  //   if (canvasRefs.isDrawingMode) {
  //     canvasRefs.isDrawingMode = false;
  //   }
  //   // Get the canvas reference
  //   const canvas = canvasRefs.current[activeCanvas];
  //   clearCanvasEvents(canvas);

  //   let isDrawing = false;
  //   let shape = null; // Track the current shape being drawn
  //   let startX, startY; // Define startX and startY here
  //   const minDistance = 5; // Minimum distance to start drawing
  //   let hasMoved = false;

  //   function getCommonOptions() {
  //     return {
  //       ID: createId(),
  //       icon: null,
  //       comment: null,
  //       title: null,
  //       UserID: getUserId(),
  //       PageID: activeCanvas,
  //       LayerID: currentUser,
  //       AssignDate: selectedDate,
  //       CategoryID: currentCategory || 1,
  //       SubCategoryID: currentSubCategory || 1,
  //       fill: fillColor || "#ffffff",
  //       stroke: strokeColor || "#000000",
  //       strokeWidth: strokeWidth || 2,
  //       strokeDashArray:
  //         strokeType === "Dashed"
  //           ? [5, 5]
  //           : strokeType === "Dotted"
  //           ? [1, 5]
  //           : null,
  //       strokeType: strokeType,
  //       strokeUniform: true,
  //       visible: true,
  //       selectable: false,
  //       IsLocked: false,
  //       IsVisible: true,
  //       parentSelectSpecialId: null,
  //       isPasteSpecialParent: false,
  //       unsavedAnnotations: true,
  //       isEditable: true,
  //     };
  //   }

  //   function getDefaultTextValue() {
  //     return {
  //       ID: createId(),
  //       comment: null,
  //       title: null,
  //       icon: null,
  //       UserID: getUserId(),
  //       PageID: activeCanvas,
  //       LayerID: currentUser,
  //       AssignDate: selectedDate,
  //       CategoryID: currentCategory || 1,
  //       SubCategoryID: currentSubCategory || 1,
  //       fontSize: fontSize || 20,
  //       fontFamily: fontFamily || "Arial",
  //       fontWeight: fontWeight || "Normal",
  //       underline: underline,
  //       linethrough: linethrough,
  //       fontStyle: fontStyle || "normal",
  //       // textBackgroundColor: "#eaed50",
  //       textAlign: "left",
  //       strokeWidth: 0,
  //       fill: fillColor || "#000000",
  //       width: 150,
  //       strokeDashArray: null,
  //       strokeUniform: true,
  //       originX: "center",
  //       originY: "center",
  //       visible: true,
  //       selectable: false,
  //       IsLocked: false,
  //       IsVisible: true,
  //       parentSelectSpecialId: null,
  //       isPasteSpecialParent: false,
  //       isEditable: true,
  //     };
  //   }

  //   function createPolygon(points) {
  //     return new fabric.Polygon(points, getCommonOptions());
  //   }
  //   // Mouse down event: start drawing the shape
  //   canvas.on("mouse:down", function (event) {
  //     actions.multipleSelection(false);
  //     const pointer = canvas.getPointer(event.e);
  //     startX = pointer.x;
  //     startY = pointer.y;

  //     const currentCanvas = canvasRefs.current[activeCanvas];
  //     const userLayers = usersRef.current;

  //     if (shapeType === "select") {
  //       handleSelectionMode(currentCanvas, userLayers, event);
  //       actions.multipleSelection(false);
  //     } else {
  //       handleDrawingMode(currentCanvas, pointer);
  //     }

  //     currentCanvas.requestRenderAll();
  //   });

  //   function handleSelectionMode(canvas, userLayers, event) {
  //     canvas.selection = true;
  //     canvas.getObjects().forEach((obj) => {
  //       const userLayer = userLayers.find((user) => user.ID === obj.LayerID);
  //       if (obj.type !== "image") {
  //         obj.set({
  //           selectable: userLayer && !userLayer.IsLocked && !obj.IsLocked,
  //           perPixelTargetFind: true,
  //         });
  //       }
  //     });

  //     const clickedObject = canvas.findTarget(event.e);
  //     if (clickedObject) {
  //       canvas.setActiveObject(clickedObject);
  //     } else {
  //       setSelectSpecialFields({});
  //       actions.isSelectSpecialChanges(false);
  //       canvas.discardActiveObject();
  //     }
  //   }

  //   async function handleDrawingMode(canvas, pointer) {
  //     canvas.getObjects().forEach((obj) => obj.set({ selectable: false }));

  //     if (shapeType === "text") {
  //       let shape = new fabric.Textbox("Enter text", {
  //         left: pointer.x,
  //         top: pointer.y,
  //         ...getDefaultTextValue(),
  //       });
  //       // shape = await callAddShape(shape);
  //       canvas.add(shape);
  //       // actions.updateState(clonedState);
  //       actions.addShape(shape);
  //       actions.isAnyDataChanges(true);
  //       return;
  //     }

  //     isDrawing = true;
  //     hasMoved = false;
  //   }

  //   // Mouse move event: update the shape's size and position
  //   canvas.on("mouse:move", async function (event) {
  //     if (!isDrawing) return;
  //     const pointer = canvas.getPointer(event.e);

  //     if (!hasMoved) {
  //       hasMoved = true;
  //       switch (shapeType) {
  //         case "rectangle":
  //           shape = new fabric.Rect({
  //             left: startX,
  //             top: startY,
  //             width: 0,
  //             height: 0,
  //             ...getCommonOptions(),
  //           });
  //           break;
  //         case "circle":
  //           shape = new fabric.Ellipse({
  //             left: startX,
  //             top: startY,
  //             rx: 0,
  //             ry: 0,
  //             ...getCommonOptions(),
  //           });
  //           break;
  //         case "square":
  //           shape = new fabric.Rect({
  //             left: startX,
  //             top: startY,
  //             width: 0,
  //             height: 0,
  //             ...getCommonOptions(),
  //           });
  //           break;
  //         case "triangle":
  //           shape = new fabric.Triangle({
  //             left: startX,
  //             top: startY,
  //             width: 0,
  //             height: 0,
  //             ...getCommonOptions(),
  //           });
  //           break;
  //         case "hexagon":
  //           const hexPoints = [];
  //           for (let i = 0; i < 6; i++) {
  //             hexPoints.push({
  //               x: startX + 50 * Math.cos((i * Math.PI) / 3),
  //               y: startY + 50 * Math.sin((i * Math.PI) / 3),
  //             });
  //           }
  //           shape = createPolygon(hexPoints);
  //           break;
  //         case "star":
  //           const starPoints = [];
  //           for (let i = 0; i < 10; i++) {
  //             const angle = (i * 2 * Math.PI) / 10 - Math.PI / 2;
  //             const radius = i % 2 === 0 ? 50 : 25; // Alternating outer and inner radius
  //             starPoints.push({
  //               x: startX + radius * Math.cos(angle),
  //               y: startY + radius * Math.sin(angle),
  //             });
  //           }
  //           shape = createPolygon(starPoints);
  //           break;
  //         case "line":
  //           shape = new fabric.Line([startX, startY, startX, startY], {
  //             fill: "black",
  //             stroke: "black",
  //             strokeWidth: 2,
  //             ...getCommonOptions(),
  //           });
  //           break;
  //       }
  //       if (shape) {
  //         canvas.add(shape);
  //         actions.isAnyDataChanges(true);
  //       }
  //     }

  //     let options = {};

  //     switch (shapeType) {
  //       case "rectangle":
  //         const width = Math.abs(pointer.x - startX);
  //         const height = Math.abs(pointer.y - startY);
  //         let left = Math.min(pointer.x, startX);
  //         let top = Math.min(pointer.y, startY);

  //         // Check if Shift key is pressed for square drawing
  //         if (event.e.shiftKey) {
  //           const size = Math.max(width, height);
  //           if (pointer.x < startX) left = startX - size;
  //           if (pointer.y < startY) top = startY - size;
  //           shape.set({
  //             width: size,
  //             height: size,
  //             left,
  //             top,
  //           });
  //         } else {
  //           shape?.set({
  //             width,
  //             height,
  //             left,
  //             top,
  //           });
  //         }
  //         break;
  //       case "circle":
  //         const rx = Math.abs(pointer.x - startX) / 2;
  //         const ry = event.e.shiftKey ? rx : Math.abs(pointer.y - startY) / 2;
  //         shape.set({
  //           rx,
  //           ry,
  //           left: startX < pointer.x ? startX : pointer.x,
  //           top: startY < pointer.y ? startY : pointer.y,
  //         });
  //         break;
  //       case "square":
  //         const size = Math.max(
  //           Math.abs(pointer.x - startX),
  //           Math.abs(pointer.y - startY)
  //         );
  //         shape.set({
  //           width: size,
  //           height: size,
  //           left: pointer.x < startX ? startX - size : startX,
  //           top: pointer.y < startY ? startY - size : startY,
  //         });
  //         break;
  //       case "triangle":
  //         shape.set({
  //           width: Math.abs(pointer.x - startX),
  //           height: Math.abs(pointer.y - startY),
  //           left: Math.min(pointer.x, startX),
  //           top: Math.min(pointer.y, startY),
  //         });
  //         break;
  //       case "hexagon":
  //         const hexPoints = [];
  //         for (let i = 0; i < 6; i++) {
  //           hexPoints.push({
  //             x: startX + 50 * Math.cos((i * Math.PI) / 3),
  //             y: startY + 50 * Math.sin((i * Math.PI) / 3),
  //           });
  //         }
  //         shape.set({ points: hexPoints });
  //         break;
  //       case "star":
  //         const starPoints = [];
  //         for (let i = 0; i < 10; i++) {
  //           const angle = (i * 2 * Math.PI) / 10 - Math.PI / 2;
  //           const radius = i % 2 === 0 ? 50 : 25; // Alternating outer and inner radius
  //           starPoints.push({
  //             x: startX + radius * Math.cos(angle),
  //             y: startY + radius * Math.sin(angle),
  //           });
  //         }
  //         shape.set({ points: starPoints });
  //         break;
  //       case "line":
  //         options = { x2: pointer.x, y2: pointer.y };
  //         if (event.e.shiftKey) {
  //           // Constrain to 45-degree angles when Shift key is pressed
  //           const deltaX = Math.abs(pointer.x - startX);
  //           const deltaY = Math.abs(pointer.y - startY);

  //           if (deltaX > deltaY) {
  //             options = { x2: pointer.x, y2: startY };
  //           } else {
  //             options = { x2: startX, y2: pointer.y };
  //           }
  //         }
  //         break;
  //     }
  //     if (shape) {
  //       shape.set(options);
  //       shape.setCoords();
  //       actions.isAnyDataChanges(true);
  //     }
  //     canvas.renderAll();
  //   });

  //   // Mouse up event: finalize the shape
  //   canvas.on("mouse:up", async function () {
  //     isDrawing = false;
  //     if (shape && hasMoved) {
  //       // shape = await callAddShape(shape);
  //       actions.updateState(clonedState);
  //       actions.addShape(shape);
  //       // updatecanvas();
  //     }
  //     shape = null; // Reset the shape variable
  //   });
  // }

  // function addShape(shapeType) {
  //   const canvas = canvasRefs.current[activeCanvas];
  //   if (!canvas) return;

  //   let isDrawing = false;
  //   let shape = null;
  //   let startX, startY;
  //   let hasMoved = false;
  //   canvas.selection = false;

  //   clearCanvasEvents(canvas);

  //   // Initialize Bob class without geometrical properties
  //   const bobInstance = new Bob(
  //     getUserId(),
  //     // activeCanvas,
  //     // currentUser,
  //     currentCategory,
  //     currentSubCategory,
  //     selectedDate,
  //     shapeType
  //   );

  //   // Initialize Annotation class with geometrical properties
  //   const annotation = new Annotation({
  //     fill: shapeType === "text" ? "#000000" : fillColor,
  //     fontSize: fontSize,
  //     fontWeight: fontWeight,
  //     fontStyle: fontStyle,
  //     textAlign: textDecoration || "left",
  //     fontFamily: fontFamily || "Arial",
  //     stroke: shapeType !== "text" && strokeColor,
  //     strokeWidth: strokeWidth,
  //     currentUser,
  //     canvasId: activeCanvas,
  //     bob_no_id: bobInstance?.commonProps?.ID,
  //     strokeDashArray:
  //       strokeType === "Dashed"
  //         ? [5, 5]
  //         : strokeType === "Dotted"
  //         ? [1, 5]
  //         : null,
  //   });

  //   // Mouse down event: start drawing
  //   canvas.on("mouse:down", function (event) {
  //     const pointer = canvas.getPointer(event.e);
  //     startX = pointer.x;
  //     startY = pointer.y;

  //     if (shapeType === "text") {
  //       // For text, directly add it on mouse click
  //       shape = annotation.createShape(
  //         shapeType,
  //         startX,
  //         startY,
  //         bobInstance.commonProps
  //       );
  //       if (shape) {
  //         shape.set({ ID: createId(), bob_no_id: createId() });
  //         canvas.add(shape);
  //         actions.updateState(clonedState);
  //         actions.isAnyDataChanges(true);
  //         canvas.renderAll();
  //       }
  //       return; // No need to continue with drawing logic for text
  //     }

  //     isDrawing = true;
  //     hasMoved = false;
  //     const currentCanvas = canvasRefs.current[activeCanvas];
  //     const userLayers = usersRef.current;

  //     if (shapeType === "select") {
  //       handleSelectionMode(currentCanvas, userLayers, event);
  //       actions.multipleSelection(false);
  //     }
  //   });

  //   function handleSelectionMode(canvas, userLayers, event) {
  //     canvas.selection = true;
  //     canvas.getObjects().forEach((obj) => {
  //       const userLayer = userLayers.find((user) => user.ID === obj.LayerID);
  //       if (obj.type !== "image") {
  //         obj.set({
  //           selectable: userLayer && !userLayer.IsLocked && !obj.IsLocked,
  //           perPixelTargetFind: true,
  //         });
  //       }
  //     });

  //     const clickedObject = canvas.findTarget(event.e);
  //     if (clickedObject) {
  //       canvas.setActiveObject(clickedObject);
  //     } else {
  //       setSelectSpecialFields({});
  //       actions.isSelectSpecialChanges(false);
  //       canvas.discardActiveObject();
  //     }
  //   }

  //   // Mouse move event: dynamically adjust the shape as it is drawn
  //   canvas.on("mouse:move", function (event) {
  //     if (!isDrawing) return;

  //     window.addEventListener("keydown", function handleKeyDown(event) {
  //       if (event.key === "Escape") {
  //         if (shape) {
  //           canvas.remove(shape); // Remove the shape if drawing is in progress
  //         }
  //         shape = null;
  //         canvas.renderAll();
  //         window.removeEventListener("keydown", handleKeyDown); // Clean up event listener
  //       }
  //     });

  //     const pointer = canvas.getPointer(event.e);

  //     if (!hasMoved) {
  //       shape = annotation.createShape(
  //         shapeType,
  //         startX,
  //         startY,
  //         bobInstance.commonProps
  //       );
  //       shape && canvas.add(shape);
  //       hasMoved = true;
  //     }
  //     if (shape && shapeType && pointer) {
  //       shape.set({ ID: createId(), bob_no_id: createId() });
  //       updateShapeDimensions(shape, shapeType, pointer, event);
  //     }
  //     canvas.renderAll();
  //   });

  //   // Mouse up event: finalize the shape
  //   canvas.on("mouse:up", function () {
  //     isDrawing = false;
  //     if (shape) {
  //       actions.updateState();
  //       actions.isAnyDataChanges(true);
  //       actions.addShape(shape);
  //     }
  //     shape = null;
  //   });

  //   function updateShapeDimensions(shape, shapeType, pointer, event) {
  //     const width = Math.abs(pointer.x - startX);
  //     const height = Math.abs(pointer.y - startY);

  //     switch (shapeType) {
  //       case "rectangle":
  //       case "square":
  //         let left = Math.min(pointer.x, startX);
  //         let top = Math.min(pointer.y, startY);

  //         if (event.e.shiftKey) {
  //           const size = Math.max(width, height); // Make it a square
  //           shape.set({
  //             width: size,
  //             height: size,
  //             left,
  //             top,
  //           });
  //         } else {
  //           shape.set({
  //             width,
  //             height,
  //             left,
  //             top,
  //           });
  //         }
  //         break;

  //       case "circle":
  //       case "ellipse":
  //         let rx = width / 2;
  //         let ry = height / 2;

  //         if (event.e.shiftKey) {
  //           // Make it a proper circle
  //           ry = rx;
  //         }

  //         shape.set({
  //           rx,
  //           ry,
  //           left: Math.min(pointer.x, startX),
  //           top: Math.min(pointer.y, startY),
  //         });
  //         break;

  //       case "line":
  //         let options = { x2: pointer.x, y2: pointer.y };

  //         if (event.e.shiftKey) {
  //           const deltaX = Math.abs(pointer.x - startX);
  //           const deltaY = Math.abs(pointer.y - startY);

  //           // Constrain to 45-degree angles
  //           if (deltaX > deltaY) {
  //             options = { x2: pointer.x, y2: startY };
  //           } else {
  //             options = { x2: startX, y2: pointer.y };
  //           }
  //         }

  //         shape.set(options);
  //         break;

  //       case "triangle":
  //         shape.set({
  //           width,
  //           height,
  //           left: Math.min(pointer.x, startX),
  //           top: Math.min(pointer.y, startY),
  //         });
  //         break;
  //     }
  //     shape.setCoords();
  //   }
  // }

  function addShape(shapeType) {
    const canvas = canvasRefs.current[activeCanvas];
    if (!canvas) return;

    let isDrawing = false;
    let shape = null;
    let startX, startY;
    let hasMoved = false;
    canvas.selection = false;

    clearCanvasEvents(canvas);

    // Initialize Bob class without geometrical properties
    const bobInstance = new Bob(
      getUserId(),
      currentCategory,
      currentSubCategory,
      selectedDate,
      shapeType
    );

    // Initialize Annotation class with geometrical properties
    const annotation = new Annotation({
      fill: shapeType === "text" ? "#000000" : fillColor,
      fontSize: fontSize,
      fontWeight: fontWeight,
      fontStyle: fontStyle,
      textAlign: textDecoration || "left",
      fontFamily: fontFamily || "Arial",
      stroke: shapeType !== "text" && strokeColor,
      strokeWidth: strokeWidth,
      currentUser,
      canvasId: activeCanvas,
      bob_no_id: bobInstance?.commonProps?.ID,
      strokeDashArray:
        strokeType === "Dashed"
          ? [5, 5]
          : strokeType === "Dotted"
          ? [1, 5]
          : null,
    });

    // Mouse down event: start drawing or toggle selection
    canvas.on("mouse:down", function (event) {
      const pointer = canvas.getPointer(event.e);

      if (shapeType === "select") {
        handleSelectionMode(event);
        return;
      }

      if (
        shapeType === "hexagon" ||
        shapeType === "star" ||
        shapeType === "text"
      ) {
        shape = annotation.createShape(
          shapeType,
          pointer.x,
          pointer.y,
          bobInstance.commonProps
        );

        shape.set({
          ID: createId(),
          bob_no_id: createId(),
          angle: 0, // Set angle to 0 for no tilt
          originX: "center",
          originY: "center",
          perPixelTargetFind: true, // Ensure precise selection
        });

        canvas.add(shape);
        actions.updateState();
        actions.isAnyDataChanges(true);
        actions.addShape(shape);
        canvas.renderAll();
        return;
      }

      if (isDrawing) {
        finalizeShape(pointer);
      } else {
        startX = pointer.x;
        startY = pointer.y;
        isDrawing = true;

        shape = annotation.createShape(
          shapeType,
          startX,
          startY,
          bobInstance.commonProps
        );
        shape.set({ ID: createId(), bob_no_id: createId() });
        canvas.add(shape);
      }

      canvas.renderAll();
    });

    function handleSelectionMode(event) {
      const userLayers = usersRef.current;

      canvas.selection = true;
      canvas.getObjects().forEach((obj) => {
        const userLayer = userLayers.find((user) => user.ID === obj.LayerID);
        if (obj.type !== "image") {
          obj.set({
            selectable: userLayer && !userLayer.IsLocked && !obj.IsLocked,
            perPixelTargetFind: true,
          });
        }
      });

      const clickedObject = canvas.findTarget(event.e);
      if (clickedObject) {
        canvas.setActiveObject(clickedObject);
      } else {
        setSelectSpecialFields({});
        actions.isSelectSpecialChanges(false);
        canvas.discardActiveObject();
      }
    }

    // Mouse move event: dynamically adjust the shape as it is drawn
    canvas.on("mouse:move", function (event) {
      if (!isDrawing) return;
      window.addEventListener("keydown", function handleKeyDown(event) {
        if (event.key === "Escape") {
          if (shape) {
            canvas.remove(shape); // Remove the shape if drawing is in progress
          }
          shape = null;
          canvas.renderAll();
          window.removeEventListener("keydown", handleKeyDown); // Clean up event listener
        }
      });

      const pointer = canvas.getPointer(event.e);
      if (!hasMoved) {
        hasMoved = true;
      }

      if (shape) {
        updateShapeDimensions(shape, shapeType, pointer, event);
      }
      canvas.renderAll();
    });

    function finalizeShape(pointer) {
      if (shape) {
        actions.updateState();
        actions.isAnyDataChanges(true);
        actions.addShape(shape);
      }
      shape = null;
      isDrawing = false;
    }

    function updateShapeDimensions(shape, shapeType, pointer, event) {
      const width = Math.abs(pointer.x - startX);
      const height = Math.abs(pointer.y - startY);

      switch (shapeType) {
        case "rectangle":
        case "square":
          let left = Math.min(pointer.x, startX);
          let top = Math.min(pointer.y, startY);

          if (event.e.shiftKey) {
            const size = Math.max(width, height);
            shape.set({ width: size, height: size, left, top });
          } else {
            shape.set({ width, height, left, top });
          }
          break;

        case "circle":
        case "ellipse":
          let rx = width / 2;
          let ry = height / 2;

          if (event.e.shiftKey) ry = rx;
          shape.set({
            rx,
            ry,
            left: Math.min(pointer.x, startX),
            top: Math.min(pointer.y, startY),
          });
          break;

        case "line":
          let options = { x2: pointer.x, y2: pointer.y };

          if (event.e.shiftKey) {
            const deltaX = Math.abs(pointer.x - startX);
            const deltaY = Math.abs(pointer.y - startY);

            if (deltaX > deltaY) {
              options = { x2: pointer.x, y2: startY };
            } else {
              options = { x2: startX, y2: pointer.y };
            }
          }

          shape.set(options);
          break;

        case "triangle":
          shape.set({
            width,
            height,
            left: Math.min(pointer.x, startX),
            top: Math.min(pointer.y, startY),
          });
          break;
      }
      shape.setCoords();
    }
  }

  const handleObjectModified = (e) => {
    actions.updateState(clonedState);
    actions.isAnyDataChanges(true);
    const modifiedObject = e?.target;
    const modifiedObjectIndex = shapes.findIndex(
      (shape) => shape === modifiedObject
    );
    const scalePayload = {
      ht: modifiedObject?.height * modifiedObject?.scaleY,
      wd: modifiedObject?.width * modifiedObject?.scaleX,
      currentObjLeft: modifiedObject.left,
      currentObjTop: modifiedObject.top,
    };
    if (isSelectSpeacial) {
      if (modifiedObject.comment !== null) {
        setSelectSpecialFields((prevState) => ({
          ...prevState,
          comment: {
            left: modifiedObject?.comment?.left,
            top: modifiedObject?.comment?.top,
          },
          relativePosition: modifiedObject.relativePosition,
        }));
      }
      if (modifiedObject.title !== null) {
        setSelectSpecialFields((prevState) => ({
          ...prevState,
          title: {
            left: modifiedObject?.title?.left,
            top: modifiedObject?.title?.top,
          },
          relativePosition: modifiedObject.relativePosition,
        }));
      }
      if (modifiedObject.icon !== null) {
        setSelectSpecialFields((prevState) => ({
          ...prevState,
          icon: {
            left: modifiedObject?.icon?.left,
            top: modifiedObject?.icon?.top,
          },
          relativePosition: modifiedObject.relativePosition,
        }));
      }
      setSelectSpecialFields((prevState) => ({
        ...prevState,
        left: modifiedObject.left,
        top: modifiedObject.top,
        height: modifiedObject?.height * modifiedObject?.scaleY,
        width: modifiedObject?.width * modifiedObject?.scaleX,
      }));
    }

    actions.updateObjWidHeight(scalePayload);
    const index = shapes.findIndex((shape) => shape.ID === e?.target.ID);
    const payload = {
      selectedObj: modifiedObject,
      selectedObjIdx: index,
    };
    actions.updateCurrentObj(payload);
    updatecanvas();
    if (modifiedObjectIndex !== -1) {
      // actions.updateState();
      actions.updateCanvasPosition({
        x: modifiedObject.left,
        y: modifiedObject.top,
      });
      updatecanvas();
      // if (shapes[modifiedObjectIndex].comment !== null) {
      //   shapes[modifiedObjectIndex].comment.set({
      //     top: modifiedObject.top - 30,
      //     left: modifiedObject.left + 80,
      //   });
      // }
      // if (shapes[modifiedObjectIndex].title !== null) {
      //   shapes[modifiedObjectIndex].title.set({
      //     top: modifiedObject.top - 30,
      //     left: modifiedObject.left - 20,
      //   });
      //   // canvas.current.requestRenderAll()
      // }
      // if (shapes[modifiedObjectIndex].icon !== null) {
      //   shapes[modifiedObjectIndex].icon.set({
      //     top: modifiedObject.top + 100,
      //     left: modifiedObject.left + 100,
      //   });
      //   // canvas.current.requestRenderAll()
      // }
    }
  };

  useEffect(() => {
    if (canvasRefs) {
      // Event listener for selection creation
      canvasRefs.current[activeCanvas]?.on(
        "selection:created",
        handleSelection
      );
      // Event listener for selection update (e.g., when selecting a different shape)
      canvasRefs.current[activeCanvas]?.on(
        "selection:updated",
        handleSelection
      );
      // Event listener for selection clear
      canvasRefs.current[activeCanvas]?.on(
        "selection:cleared",
        handleSelectionClear
      );
      // canvas.on("mouse:down", handleRightClickOnShape);
      canvasRefs.current[activeCanvas]?.on(
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
        // canvas.off("mouse:down", onMouseDown);
        canvasRefs.current[activeCanvas].off(
          "object:modified",
          handleObjectModified
        );
      }
    };
  }, [canvasRefs, shapes, state]);

  const handleSelection = (e) => {
    let selectedObjectCurrent = e?.selected;
    const activeObjects = canvasRefs.current[activeCanvas]?.getActiveObjects();
    actions.updateActiveObjs(activeObjects);
    if (selectedObjectCurrent?.length === 1) {
      const cornerSize = window.innerWidth >= 1600 ? 14 : 8;
      selectedObjectCurrent[0].set({ cornerSize: cornerSize });
      const index = shapes.findIndex(
        (shape) => shape.ID === selectedObjectCurrent[0].ID
      );
      const payload = {
        selectedObj: selectedObjectCurrent[0] || selectedObjectCurrent,
        selectedObjIdx: index,
      };

      actions.updateCurrentObj(payload);
      // highlightRelatedShapes(selectedObjectCurrent[0]);
    } else if (activeObjects?.length > 1 && state.multipleSelection) {
      // actions.resetShape();
      activeObjects.forEach((obj) => {
        if (obj.type === "textbox") {
          obj.set({
            fontFamily: fontFamily,
            fontSize: fontSize,
            fontStyle: fontStyle,
            fontWeight: fontWeight,
            underline: underline,
            linethrough: linethrough,
            fill: fillColor === "#ffffff" ? "#000000" : fillColor,
          });
          actions.isAnyDataChanges(true);
        } else if (obj.type === "image") {
          return;
        } else {
          const { property, value } = state.fieldProperty;
          switch (property) {
            case "fillColor":
              obj.set({
                fill: value,
              });
              break;

            case "strokeColor":
              obj.set({
                stroke: value,
              });
              break;

            case "strokeWidth":
              obj.set({
                strokeWidth: value,
              });
              break;

            case "strokeType":
              if (value === "Dashed") {
                obj.set("strokeDashArray", [5, 5]);
              } else if (value === "Dotted") {
                obj.set("strokeDashArray", [1, 3]);
              } else {
                obj.set("strokeDashArray", null);
              }
              break;

            default:
              break;
          }
          actions.isAnyDataChanges(true);
        }
      });
      // canvasRefs.current[activeCanvas].requestRenderAll();
    }
  };

  const handleSelectionClear = () => {
    setShowContext(false);
    setShowBackground(false);
    if (selectedObject) {
      removeHighlight(selectedObject);
    }
    actions.updateCurrentObj(null);
    actions.updateActiveObjs([]);
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
    }

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
    }
  }

  const handleContextMenu = (obj, idx, x, y, event) => {
    if (obj) {
      event.preventDefault();
      const windowX = event.clientX + window.pageXOffset;
      const windowY = event.clientY + window.pageYOffset;
      setContextMenuPosition({ x: windowX, y: windowY });
      setShowContext(true);
    } else if (clipboardRef.current.length >= 1) {
      setContextMenuPosition({ x, y });
      setShowContext(true);
    } else {
      setShowContext(false);
    }
    contextMenuEvent.current = { x, y };
  };

  const preventDefaultContextMenu = (event, obj) => {
    if (event.button === 2) {
      handleContextMenu(obj, 0, event.x, event.y, event);
    }
  };

  const handleOption = (option) => {
    targetedObj = selectedObject;
    const activeObjects = canvasRefs.current[activeCanvas]?.getActiveObjects();
    switch (option) {
      case "Duplicate":
        actions.updateState(clonedState);
        duplicateShape(selectedObject);
        break;
      case "Delete":
        actions.updateState(clonedState);
        activeObjects.length >= 1 && updatecanvas();
        activeObjects?.forEach((obj) => {
          removeShape(obj);
        });
        break;
      case "Add Comment":
      case "Update Comment":
        if (selectedObject.comment) {
          canvasRefs.current[activeCanvas].setActiveObject(
            selectedObject.comment
          );
        } else {
          actions.updateState(clonedState);
          actions.updateCommentText("Add Your Comment...");
          addComments();
        }
        break;
      case "Add Icon":
      case "Update Icon":
        actions.updateState(clonedState);
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
      case "Cut":
        cutShape(activeObjects);
        break;
      case "Copy":
        copyShape(activeObjects);
        break;
      case "Paste":
        const canvas = canvasRefs.current[activeCanvas];
        pasteShape(canvas);
        break;
      case "Paste Special":
        handlePasteSpecialModal("Paste Special");
        break;
      case "Select Special":
        saveData();
        modalShowSelectSpecial("Select Special");
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
    fabric.util.enlivenObjects([shape.toObject()], async (objects) => {
      let clonedShape = objects[0];
      if (!clonedShape) return;
      clonedShape.set({
        ID: createId(),
        LayerID: shape.LayerID,
        PageID: shape.PageID,
        UserID: shape.UserID,
        left: shape.left + 20,
        top: shape.top + 20,
        selectable: true,
        icon: null,
        comment: null,
        title: null,
        AssignDate: selectedDate,
        CategoryID: shape?.CategoryID,
        SubCategoryID: shape?.SubCategoryID,
      });
      // clonedShape = await callAddShape(clonedShape);

      canvasRefs.current[activeCanvas].add(clonedShape);
      actions.isAnyDataChanges(true);
      actions.addShape(clonedShape);
      canvasRefs.current[activeCanvas].renderAll();
    });
  };

  const cutShape = (shapes) => {
    clipboardOption.current = "cut";
    const setOpacity = (shape, value) => {
      shape.originalOpacity = shape.opacity;
      shape.opacity = value;
      if (shape.comment) {
        shape.comment.originalOpacity = shape.comment.opacity;
        shape.comment.opacity = value;
      }
      if (shape.icon) {
        shape.icon.originalOpacity = shape.icon.opacity;
        shape.icon.opacity = value;
      }
      if (shape.title) {
        shape.title.originalOpacity = shape.title.opacity;
        shape.title.opacity = value;
      }
    };

    if (Array.isArray(shapes)) {
      // Restore opacity if clipboardRef.current is already populated
      if (clipboardRef.current.length >= 1) {
        clipboardRef.current.forEach((shape) => {
          shape.opacity = shape.originalOpacity;
          if (shape.comment) {
            shape.comment.opacity = shape.comment.originalOpacity;
          }
          if (shape.icon) {
            shape.icon.opacity = shape.icon.originalOpacity;
          }
          if (shape.title) {
            shape.title.opacity = shape.title.originalOpacity;
          }
        });
      }

      // Cut the shapes
      clipboardRef.current = shapes.map((shape) => {
        const newShape = shape;
        return newShape;
      });

      // shapes.forEach((shape) => {
      //   setOpacity(shape, 0.1);
      // });
      canvasRefs.current[activeCanvas]?.discardActiveObject();
    }
  };

  const copyShape = (shapes) => {
    clipboardOption.current = "copy";
    if (Array.isArray(shapes)) {
      clipboardRef.current = shapes.map((shape) => shape);
      canvasRefs.current[activeCanvas]?.discardActiveObject();
    } else {
      clipboardRef.current = [shapes];
    }
  };

  const pasteShape = (canvas) => {
    actions.updateState(clonedState);
    const pointer = contextMenuEvent.current;
    if (!clipboardRef.current.length) return;
    // Get the bounding box of all clipboard shapes to calculate the offset
    const boundingBox = clipboardRef.current.reduce(
      (acc, shape) => {
        const { left, top, width, height } = shape;
        acc.minX = Math.min(acc.minX, left);
        acc.minY = Math.min(acc.minY, top);
        acc.maxX = Math.max(acc.maxX, left + width);
        acc.maxY = Math.max(acc.maxY, top + height);
        return acc;
      },
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );
    const offsetX = pointer.x - boundingBox.minX;
    const offsetY = pointer.y - boundingBox.minY;

    const shapesToPaste = clipboardRef.current
      .filter(
        (shape) =>
          shape.label !== "comment" &&
          shape.label !== "title" &&
          shape.label !== "icon"
      )
      .map((shape) => {
        const clonedShape = {
          ...shape.toObject([
            "LayerID",
            "PageID",
            "UserID",
            "icon",
            "comment",
            "title",
            "opacity",
            "originalOpacity",
            "AssignDate",
            "CategoryID",
            "SubCategoryID",
            "bob_no_id",
            "parentSelectSpecialId",
            "isPasteSpecialParent",
            "relativePosition",
          ]),
          left: shape.left + offsetX,
          top: shape.top + offsetY,
        };
        return clonedShape;
      });
    shapesToPaste.forEach((shapeData) => {
      // Convert shape data back into Fabric.js objects
      fabric.util.enlivenObjects([shapeData], (objects) => {
        const copiedShape = objects[0];
        if (!copiedShape) return;
        const newShapeID = createId();
        const newCommentID = createId();
        const newIconID = createId();
        const newTitleID = createId();
        let icon = null;
        let comment = null;
        let title = null;
        // Set additional properties if needed
        copiedShape.set({
          ID: newShapeID,
          LayerID: currentUser,
          PageID: parseInt(activeCanvas.split("-")[1]),
          UserID: shapeData.UserID,
          left: copiedShape.left,
          top: copiedShape.top,
          selectable: true,
          icon: shapeData.icon || null,
          comment: shapeData.comment || null,
          title: shapeData.title || null,
          opacity: shapeData.originalOpacity || 1,
          AssignDate: selectedDate,
          CategoryID: shapeData?.CategoryID,
          SubCategoryID: shapeData?.SubCategoryID,
          bob_no_id: shapeData?.bob_no_id,
          parentSelectSpecialId: shapeData?.parentSelectSpecialId || null,
          isPasteSpecialParent: shapeData?.isPasteSpecialParent || false,
          isEditable: shapeData?.isEditable || true,
          relativePosition: shapeData.relativePosition || {},
        });
        if (shapeData.comment) {
          comment = fabric.util.object.clone(shapeData.comment);
          comment.set({
            ID: newCommentID,
            ShapeID: newShapeID,
            left: copiedShape.left + copiedShape.relativePosition.comment.left,
            top: copiedShape.top + copiedShape.relativePosition.comment.top,
            opacity: shapeData.originalOpacity || 1,
            AssignDate: selectedDate,
            CategoryID: shapeData?.CategoryID,
            SubCategoryID: shapeData?.SubCategoryID,
            bob_no_id: shapeData?.bob_no_id,
            parentSelectSpecialId: shapeData?.parentSelectSpecialId || null,
            isPasteSpecialParent: shapeData?.isPasteSpecialParent || false,
            isEditable: shapeData?.isEditable || true,
          });
          copiedShape.comment = comment;
        }
        if (shapeData.icon) {
          icon = fabric.util.object.clone(shapeData.icon);
          icon.set({
            ID: newIconID,
            ShapeID: newShapeID,
            left: copiedShape.left + copiedShape.relativePosition.icon.left,
            top: copiedShape.top + copiedShape.relativePosition.icon.top,
            opacity: shapeData.originalOpacity || 1,
            AssignDate: selectedDate,
            CategoryID: shapeData?.CategoryID,
            SubCategoryID: shapeData?.SubCategoryID,
            bob_no_id: shapeData?.bob_no_id,
            parentSelectSpecialId: shapeData?.parentSelectSpecialId || null,
            isPasteSpecialParent: shapeData?.isPasteSpecialParent || false,
            isEditable: shapeData?.isEditable || true,
          });
          copiedShape.icon = icon;
        }

        if (shapeData.title) {
          title = fabric.util.object.clone(shapeData.title);
          title.set({
            ID: newTitleID,
            ShapeID: newShapeID,
            left: copiedShape.left + copiedShape.relativePosition.title.left,
            top: copiedShape.top + copiedShape.relativePosition.title.top,
            opacity: shapeData.originalOpacity || 1,
            AssignDate: selectedDate,
            CategoryID: shapeData?.CategoryID,
            SubCategoryID: shapeData?.SubCategoryID,
            bob_no_id: shapeData?.bob_no_id,
            parentSelectSpecialId: shapeData?.parentSelectSpecialId || null,
            isPasteSpecialParent: shapeData?.isPasteSpecialParent || false,
            isEditable: shapeData?.isEditable || true,
          });
          copiedShape.title = title;
        }

        canvas.add(copiedShape);
        comment && canvas.add(comment);
        title && canvas.add(title);
        icon && canvas.add(icon);
        canvas.renderAll();

        // Call any additional actions if needed
        actions.addShape(copiedShape);
      });
    });
    updatecanvas();
    clipboardOption.current === "cut" && removeCutShape();

    // Ensure canvas view is updated correctly after pasting
    // clipboardRef.current = [];
    // clipboardOption.current = null;
    // actions.isAnyDataChanges(true);
    canvas.calcOffset();
    canvas.renderAll();
  };

  const removeCutShape = () => {
    clipboardRef.current?.forEach((shape) => {
      removeShape(shape);
    });
    clipboardRef.current = [];
    clipboardOption.current = null;
    canvasRefs.current[activeCanvas].calcOffset();
    canvasRefs.current[activeCanvas].renderAll();
  };

  const removeShape = async (shape) => {
    // actions.updateState(clonedState);
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
    };
    // actions.removeUserShape(userShapePayload);
    if (!isAnyChanges) {
      const conformDelete = await removeShapeFromDB(shape.ID);
      if (conformDelete?.status === "success") {
        actions.isAnyDataChanges(true);
      }
    }
    canvasRefs.current[activeCanvas]?.discardActiveObject();
    canvasRefs.current[activeCanvas]?.requestRenderAll();
  };
  const removeShapeFromDB = async (id) => {
    try {
      const apiUrl = `annotation/${id}`;
      return await deleteApiCaller(apiUrl, headers);
    } catch (error) {
      console.error("Error delete Shape:", error);
    }
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
      shapes[alreadyExistIndex]?.set({ icon: null });
    }
    // else {
    //   const removeShapeProperty = (property) => {
    //     // const annotationObject = pages
    //     //   .find((res) => res?.ID === shapeSel?.PageID)
    //     //   .calendar.layers.find((res) => res?.ID === shapeSel?.LayerID)
    //     //   .annotations.find((res) => res?.ID === shapeSel?.ShapeID);
    //     // annotationObject.set({ [property]: null })
    //     const alreadyExistIndex = pages.findIndex(
    //       (shape) =>
    //         shape?.ID === `canvas-${shapeSel?.PageID}` || shapeSel?.PageID
    //     );
    //     const findLayer = pages[alreadyExistIndex]?.calendar?.layers.find(
    //       (res) => res?.ID === shapeSel?.LayerID
    //     );
    //     const shapeProperty = findLayer?.annotations.find(
    //       (res) => res.ID === shapeSel.ParentAnnotationID || shapeSel.ShapeID
    //     );
    //     shapeProperty.set({ [property]: null });
    //   };
    //   if (shapeSel?.label === "comment") {
    //     removeShapeProperty("comment");
    //   } else if (shapeSel?.label === "title") {
    //     removeShapeProperty("title");
    //   }
    // }
  }

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
          left: targetedObj?.left,
          top: targetedObj?.top,
          width: 60,
          height: 60,
          selectable: true,
          lockMovementX: true,
          lockMovementY: true,
          visible: true,
          label: "icon",
          ShapeID: targetedObj?.ID,
          LayerID: targetedObj?.LayerID,
          PageID: targetedObj?.PageID,
          AssignDate: selectedDate,
          CategoryID: currentCategory || 1,
          SubCategoryID: currentSubCategory || 1,
          parentSelectSpecialId: targetedObj?.parentSelectSpecialId || null,
          isPasteSpecialParent: targetedObj?.isPasteSpecialParent || false,
          bob_no_id: targetedObj.bob_no_id || null,
        });
        // Replace the existing image element with the new one
        existingIcons.setElement(newImg.getElement());
        actions.isAnyDataChanges(true);
      });
    } else {
      fabric.Image.fromURL(emojiUrl, async function (img) {
        img.set({
          ID: createId(),
          left: targetedObj?.left + 100, // Adjust the left position as needed
          top: targetedObj?.top + 100, // Adjust the top position as needed
          width: 60,
          height: 60,
          selectable: true,
          lockMovementX: false,
          lockMovementY: false,
          visible: true,
          label: "icon",
          AssignDate: selectedDate,
          ShapeID: targetedObj?.ID,
          LayerID: targetedObj?.LayerID,
          PageID: targetedObj?.PageID,
          UserID: targetedObj?.UserID,
          CategoryID: currentCategory || 1,
          SubCategoryID: currentSubCategory || 1,
          parentSelectSpecialId: null,
          isPasteSpecialParent: false,
          bob_no_id: targetedObj?.bob_no_id || null,
        });
        canvasRefs.current[activeCanvas].add(img);
        targetedObj?.set({ icon: img });
        if (isSelectSpeacial) {
          let IconShape = img?.toObject();
          const UserID = img.UserID;
          const LayerID = img.LayerID;
          const PageID = img.PageID;
          const ShapeID = img.ShapeID;
          const iconId = img.ID;
          const label = img.label;
          const AssignDate = img?.AssignDate;
          const CategoryID = img?.CategoryID || 1;
          const SubCategoryID = img?.SubCategoryID || 1;
          const bob_no_id = img?.bob_no_id;
          const parentSelectSpecialId = img?.parentSelectSpecialId || null;
          const isPasteSpecialParent = img?.isPasteSpecialParent || false;
          setSelectSpecialFields((prevState) => ({
            ...prevState,
            icon: {
              ...IconShape,
              ShapeID: ShapeID,
              PageID: PageID,
              LayerID: LayerID,
              UserID: UserID,
              label: label,
              ID: iconId,
              AssignDate: AssignDate,
              CategoryID: CategoryID,
              SubCategoryID: SubCategoryID,
              bob_no_id: bob_no_id,
              parentSelectSpecialId: parentSelectSpecialId,
              isPasteSpecialParent: isPasteSpecialParent,
            },
          }));
        }
        if (img) {
          img.url = emojiUrl;
          const payload = {
            label: "icon",
            pageId: activeCanvas,
            selectedShape: targetedObj,
            item: img,
          };
          // actions.updateShape(payload);
        }
      });
      actions.isAnyDataChanges(true);
    }
  }, [chosenEmoji, canvasRefs]);

  function removeHighlight(selectedShape) {
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

  async function closePDFModal(payload) {
    // const imgFile= canvasRefs.current[activeCanvas].backgroundImage._element.currentSrc;
    const canvas = canvasRefs.current[activeCanvas];
    const {
      dateEnd,
      dateStart,
      dateRange,
      selectedBackground,
      assignedDate,
      // currentBgImg,
    } = payload;

    const changeBackgroundPayload = {
      canvasId7: activeCanvas.split("-")[1],
      id3: selectedBackground?.ID,
      endDate2: dateEnd,
      startDate2: dateStart,
      assignedDate: assignedDate,
      dateRange: dateRange,
      fileType: "SOLID", // define as per api requirement
    };

    try {
      let response = await assignBg(projectId, changeBackgroundPayload);
      if (response?.status === "success") {
        toast("Background added successfully.");
        window.location.reload();
        setModalShowPDF(false);
        actions.bgLoading(false);
        actions.bgAssign(false);
        fetchImportImages();
      } else {
        toast(response?.message);
      }
    } catch (error) {}
  }

  const fetchImportImages = async () => {
    let response = await getHeaderFile(projectId);
    setImportData(response?.data);
  };

  function closeModal() {
    setModalShowPDF(false);
  }

  function closePasteSpecialModal() {
    setModalShowPasteSpecial(false);
  }

  const isSpecialObject = ["comment", "icon", "title"].includes(
    selectedObject?.label
  );
  const isSpecialType =
    selectedObject?.type === "textbox" &&
    (selectedObject?.comment === null ||
      selectedObject?.title === null ||
      selectedObject?.icon === null);

  const hasComment = selectedObject?.comment !== null;
  const hasIcon = selectedObject?.icon !== null;
  const hasTitle = selectedObject?.title !== null;

  const imageActive = Array.isArray(activeObjects) && activeObjects[0]?.type;
  let filteredOptions;

  if (isSpecialObject) {
    filteredOptions = contextMenuOptions.filter(
      (option) => option.label === "Delete"
    );
  } else if (activeObjects?.length > 1) {
    filteredOptions = contextMenuOptions.filter(
      (option) =>
        option.label === "Delete" ||
        option.label === "Cut" ||
        option.label === "Copy"
    );
  } else if (activeObjects?.length === 1 && !isSpecialType) {
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
  } else if (isSpecialType) {
    filteredOptions = contextMenuOptions.filter(
      (option) =>
        option.label !== "Add Comment" &&
        option.label !== "Add Icon" &&
        option.label !== "Add Title"
    );
  } else {
    if (clipboardOption.current === "cut") {
      filteredOptions = contextMenuOptions.filter(
        (option) => option.label === "Paste"
      );
    } else {
      filteredOptions =
        clipboardRef.current &&
        contextMenuOptions.filter(
          (option) =>
            option.label === "Paste" || option.label === "Paste Special"
        );
    }
  }

  if (activeObjects?.length === 1) {
    filteredOptions = filteredOptions.filter(
      (option) => option.label !== "Paste" && option.label !== "Paste Special"
    );
  }

  // if (imageActive === "image") {
  //   filteredOptions = contextImageOptions.map((option) => {
  //     return option;
  //   });
  // }

  // function for reset all the valuse
  const resetValues = () => {
    // setShapeToDraw("select");
    actions.selectFilterShape([]);
  };

  const isColor = (colorString) => {
    // Regex to check if string is a valid CSS color
    const regex = /^(#([0-9a-f]{3}){1,2}|(rgb|hsl)a?\([\d.%, ]+\))$/i;
    return regex.test(colorString);
  };

  let filterActive =
    selectedShapeFilter?.length !== 0 ||
    selectedCategoryFilter?.length !== 0 ||
    selectedSubCategoryFilter?.length !== 0 ||
    selectedOrganizationFilter?.length !== 0 ||
    selectedUserFilter?.length !== 0 ||
    false;
  useEffect(() => {
    const currentCanvas = canvasRefs.current[activeCanvas];
    if (currentCanvas) {
      currentCanvas.clear(); // This clears the canvas content, you can remove this line if you don't want to clear the canvas entirely when background updates

      // api integration for showing background image or color
      let selecteDate =
        localStorage.getItem("selecteDate") ||
        new Date().toISOString().split("T")[0]; // Default to current date if not found
      let newDate = selecteDate.split(" ")[0]; // Extracting date in yyyy-mm-dd format
      let pageId = activeCanvas.split("-")[1]; // Extract page id as a number

      // Filter data according to PageID and Date
      let bgAssign = importData?.filter((data) => {
        const pageIdMatches = data?.PageID === parseInt(pageId);
        const dateMatches = data?.DateRanges.some((dateRange) => {
          const dataDate = dateRange?.split(" ")[0];
          return dataDate === newDate;
        });
        return pageIdMatches && dateMatches;
      });

      // Filter for default background
      let defaultBg = importData?.filter((data) => {
        const isDefault = data?.Is_default === true;
        return isDefault;
      });

      const setPdfBackground = async (pdfUrl) => {
        try {
          const imageUrl = await renderPdfUrlAsImage(pdfUrl);
          if (imageUrl) {
            changeCanvasBackgroundColor(activeCanvas, "#f7f7fa"); // Default background color
            setBackgroundImage(imageUrl); // Set background image
          }
        } catch (error) {
          console.error("Error rendering PDF as image:", error);
        }
      };

      // Set the background based on filters
      if (bgAssign?.length > 0) {
        localStorage.setItem("bgImageId", bgAssign[0]?.ID); // Set bgId to local storage
        if (isColor(bgAssign[0]?.BackGroundColor)) {
          changeCanvasBackgroundColor(
            activeCanvas,
            bgAssign[0]?.BackGroundColor
          );
        } else if (bgAssign[0]?.BackGroundColor.endsWith(".pdf")) {
          setPdfBackground(bgAssign[0]?.BackGroundColor);
          changeCanvasBackgroundColor(activeCanvas, "#f7f7fa"); // Default background color
        } else {
          changeCanvasBackgroundColor(activeCanvas, "#f7f7fa"); // Default background color
          setBackgroundImage(bgAssign[0]?.BackGroundColor);
        }
        setModalShowPDF(false);
      } else if (defaultBg?.length > 0) {
        localStorage.setItem("bgImageId", defaultBg[0]?.ID); // Set bgId to local storage
        if (isColor(defaultBg[0]?.BackGroundColor)) {
          changeCanvasBackgroundColor(
            activeCanvas,
            defaultBg[0]?.BackGroundColor
          );
        } else if (defaultBg[0]?.BackGroundColor.endsWith(".pdf")) {
          setPdfBackground(defaultBg[0]?.BackGroundColor);
          changeCanvasBackgroundColor(activeCanvas, "#f7f7fa"); // Default background color
        } else {
          changeCanvasBackgroundColor(activeCanvas, "#f7f7fa");
          setBackgroundImage(defaultBg[0]?.BackGroundColor);
        }
      } else {
        changeCanvasBackgroundColor(activeCanvas, "#f7f7fa");
      }
    }
  }, [activeCanvas, importData, selectDate]); // Only run when these values change

  useEffect(() => {
    const currentCanvas = canvasRefs.current[activeCanvas];
    if (currentCanvas) {
      const currentCanvasObjects = currentCanvas.getObjects();
      currentCanvasObjects.forEach((obj, index) => {
        if (index === 0 && obj.ID === undefined) {
        } else if (index === 0 && obj.ID !== undefined) {
          currentCanvas.remove(obj);
        } else {
          currentCanvas.remove(obj);
        }
      });
      shapes?.forEach((shape) => {
        const isLayerSelected =
          selectedLayerFilter?.length > 0
            ? selectedLayerFilter?.some(
                (layer) => layer.value === shape.LayerID || layer.value === 0
              )
            : true;

        const isShapeSelected =
          selectedShapeFilter?.length > 0
            ? selectedShapeFilter?.includes(shape.type)
            : true;

        const isTextSelected =
          selectedTextFilter?.length > 0
            ? shape.text &&
              shape.text
                .toLowerCase()
                .replace(/\s+/g, "")
                .includes(selectedTextFilter.toLowerCase().replace(/\s+/g, ""))
            : true;

        const isCategorySelected =
          selectedCategoryFilter?.length > 0
            ? selectedCategoryFilter?.some(
                (filter) => filter.value === shape.CategoryID
              )
            : true;

        const isSubCategorySelected =
          selectedSubCategoryFilter?.length > 0
            ? selectedSubCategoryFilter?.some(
                (filter) => filter.value === shape.SubCategoryID
              )
            : true;

        const isUserSelected =
          selectedUserFilter.length > 0
            ? selectedUserFilter?.some(
                (filter) => filter.value === shape.UserID
              ) ||
              selectedOrganizationFilter?.some(
                (filter) => filter.value === shape.UserID
              )
            : true;

        const isOrganizationSelected =
          selectedUserFilter.length > 0
            ? true
            : selectedOrganizationFilter?.length > 0
            ? selectedOrganizationFilter?.some(
                (filter) => filter.value === shape.UserID
              )
            : true;

        if (
          isLayerSelected &&
          isShapeSelected &&
          isTextSelected &&
          isCategorySelected &&
          isSubCategorySelected &&
          isUserSelected &&
          isOrganizationSelected &&
          (!filterActive ||
            (isShapeSelected &&
              isTextSelected &&
              isCategorySelected &&
              isSubCategorySelected))
        ) {
          if (shape) {
            currentCanvas.add(shape);
            if (shape.comment) currentCanvas.add(shape.comment);
            if (shape.icon) currentCanvas.add(shape.icon);
            if (shape.title) currentCanvas.add(shape.title);
          }
        }
      });
    }
  }, [
    filterActive,
    selectedShapeFilter,
    selectedLayerFilter,
    selectedTextFilter,
    selectedCategoryFilter,
    selectedSubCategoryFilter,
    selectedOrganizationFilter,
    selectedUserFilter,
  ]); // Trigger when shape filters or shape data changes

  const handlePasteSpecialModal = () => {
    setModalShowPasteSpecial(true);
  };

  const modalShowSelectSpecial = () => {
    setModalOpenSelectSpecial(true);
  };

  const closeSelectSpecialModal = () => {
    setModalOpenSelectSpecial(false);
  };

  // forword and backword logic for find and replace text
  const forward = () => {
    setArrayIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % findArrayLength.length;
      canvasRefs.current[activeCanvas].setActiveObject(
        findArrayLength[newIndex]
      );
      canvasRefs.current[activeCanvas].renderAll();
      return newIndex;
    });
  };

  const backword = () => {
    setArrayIndex((prevIndex) => {
      const newIndex =
        (prevIndex - 1 + findArrayLength.length) % findArrayLength.length;
      canvasRefs.current[activeCanvas].setActiveObject(
        findArrayLength[newIndex]
      );
      canvasRefs.current[activeCanvas].renderAll();
      return newIndex;
    });
  };

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
        </div>
      ))}

      {showContext && filteredOptions.length > 0 && (
        <>
          <ControlledMenu
            anchorPoint={contextMenuPosition}
            state={showContext ? "open" : "closed"}
            direction="right"
            onClose={() => setShowContext(false)}
          >
            {filteredOptions.map((option, index) => (
              <MenuItem key={index} onClick={() => handleOption(option.label)}>
                {option.label}
              </MenuItem>
            ))}
          </ControlledMenu>
        </>
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
        show={bgAssign}
        onHide={closeModal}
        onApply={closePDFModal}
        activeCanvas={activeCanvas}
        currentBgImg={currentBgImg}
        pdfModalType={pdfModalType}
      />
      <PasteSpecial
        show={modalShowPasteSpecial}
        onHide={closePasteSpecialModal}
        selectedShapes={clipboardRef.current}
        fetchCanvasData={() => fetchCanvasData()}
        ShapePasteType={clipboardOption.current}
        removeCutShape={() => removeCutShape()}
      />
      <SelectSpecial
        show={modalOpenSelectSpecial}
        onHide={closeSelectSpecialModal}
        selectedShapes={activeObjects}
        setSelectSpecialDates={setSelectSpecialDates}
      />
      <FindPopup
        show={showModal}
        onClose={handleFindModalclose}
        handleSubmit={handleSubmit}
        searchText={searchText}
        setSearchText={setSearchText}
        replaceText={replaceText}
        setReplaceText={setReplaceText}
        findArrayLength={findArrayLength}
        arrayIndex={arrayIndex}
        forward={() => forward()}
        backword={() => backword()}
      />
    </div>
  );
}

export default Editor;
