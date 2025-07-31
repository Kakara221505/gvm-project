import { fabric } from "fabric";
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GlobalValues } from "../../../../../Lib/GlobalValues";
import { postApiCaller } from "../../../../../Lib/apiCaller";
import { useShapeContext } from "../../../../../contexts/shapeContext";
import "./CustomCalendar.css";
import UseSaveData from "../../../../../Components/SaveData/SaveEditorData";

const CustomCalendar = () => {
  const selectedCurrentDate = localStorage.getItem("selecteDate");
  const { state, actions } = useShapeContext();
  const { selectDate, isAnyChanges, isPasteSpecial } = state;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState();
  const [getDataDate, setGetDataDate] = useState([]);
  const navigate = useNavigate();
  const { headers, getDate, projectId } = GlobalValues();
  const saveData = UseSaveData(false, true);

  useEffect(() => {
    fetchDate();
  }, [isAnyChanges, isPasteSpecial]);

  const fetchDate = async () => {
    try {
      let apiUrl = `project/get_calender_annotation_data`;
      let payload = {
        projectId: projectId,
      };
      const response = await postApiCaller(apiUrl, payload, headers);
      setGetDataDate(response);
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Network error or server is not responding");
      }
    }
  };

  useEffect(() => {
    selectedCurrentDate === null
      ? setSelectedDate(new Date())
      : setSelectedDate(selectedCurrentDate);
  }, [selectDate]);

  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    // return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = async (date) => {
    actions.isPasteSpecialChanges(false);
    await saveData();
    actions.clearUndoRedo();
    const formattedDate = formatDateTime(date);
    localStorage.setItem("selecteDate", formattedDate);
    actions.selectedCalendarDate(formattedDate);
    setSelectedDate(date);
    setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1)); // Set to first day of the selected month
    fetchCanvasData(formattedDate);
  };

  const fetchCanvasData = async (getDate) => {
    try {
      const apiUrl = `project/projectById`;
      const payload = {
        projectID: projectId,
        calendarDate: getDate,
      };
      const response = await postApiCaller(apiUrl, payload, headers);
      const parsedData = await parseApiResponse(response);
      actions.initialData(parsedData); // Pass the parsed data to actions
      return parsedData;
    } catch (error) {
      console.error("Error fetching projects:", error);
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
        toast.error("Network error or server is not responding");
      }
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
                          bob_no_id: iconProperties?.bob_no_id,
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
                    selectable: true,
                    IsLocked: false,
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

  const handleNextMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(
        prevDate.getFullYear(),
        prevDate.getMonth() + 1,
        1
      );
      return newDate;
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(
        prevDate.getFullYear(),
        prevDate.getMonth() - 1,
        1
      );
      return newDate;
    });
  };

  const getTileClassName = ({ date }) => {
    const formattedDate = formatDate(date);
    const todayDate = formatDate(new Date());
    const selectedFormattedDate = selectedDate
      ? formatDate(selectedDate)
      : todayDate;
    if (formattedDate === todayDate) {
      return;
    }
    if (formattedDate === selectedFormattedDate) {
      return "bg-primary text-white rounded"; // for selected date
    }

    const matchingResponse = getDataDate && getDataDate?.find(
      (item) => item.AssignDate === formattedDate
    );
    return matchingResponse && matchingResponse.Is_Calender_data
      ? "bg-success text-white rounded" // for check any annotaion exist or not
      : "";
  };

  const formatDate = (date) => {
    // Check if the input is already a Date object
    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    if (isNaN(date)) {
      return ""; // If the date is invalid, return an empty string
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    actions.updateCurrentOpt({ currentOption: 6, currentObj: currentDate });
  }, [currentDate]);

  return (
    <div
      style={{ display: "flex", overflowX: "auto" }}
      className="justify-content-evenly"
    >
      <button onClick={handlePrevMonth} className="border-0 calBt">
        <i className="fs-1 fa fa-angle-left yellowText" />
      </button>
      {[0, 1, 2].map((offset) => {
        const displayDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + offset,
          1
        );
        return (
          <div key={offset}>
            <Calendar
              value={selectedDate}
              onChange={handleDateChange}
              activeStartDate={displayDate}
              nextLabel={null}
              prevLabel={null}
              prev2Label={null}
              next2Label={null}
              tileClassName={getTileClassName}
            />
          </div>
        );
      })}
      <button onClick={handleNextMonth} className="border-0 calBt">
        <i className="fs-1 fa fa-angle-right yellowText" />
      </button>
    </div>
  );
};

export default CustomCalendar;
