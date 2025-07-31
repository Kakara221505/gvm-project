import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useShapeContext } from "../../../../contexts/shapeContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GlobalValues } from "../../../../Lib/GlobalValues";
import { postApiCaller } from "../../../../Lib/apiCaller";
import { fabric } from "fabric";
import {

  Form,

} from "react-bootstrap";
import { useApiContext } from "../../../../contexts/apiContext";
const CustomCalendar = ({setPrintDate, setPrintDateRange, dateRange, setDateRange}) => {
  const selectedCurrentDate = localStorage.getItem("selecteDate");
  const { state, actions } = useShapeContext();
  const { canvasData, activeCanvas, selectDate } = state;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState();
  const [getDataDate, setGetDataDate] = useState([]);
  const navigate = useNavigate();
  const { headers, getDate, projectId } = GlobalValues();
  const [customRangeStart, setCustomRangeStart] = useState(new Date());
  const [customRangeEnd, setCustomRangeEnd] = useState(new Date());

  useEffect(() => {
    fetchDate();
  }, []);

  const fetchDate = async () => {
    try {
      let apiUrl = `project/get_calender_annotation_data`;
      let payload = {
        projectId: projectId,
      };
      const response = await postApiCaller(apiUrl, payload, headers);
      setGetDataDate(response);
    } catch (error) {
      console.log("error==>", error);
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
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    // return `${day}/${month}/${year}`;
  };
  const formatDateTimeForPrint = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}${month}${year}`;
    // return `${day}/${month}/${year}`;
  };

  const handleDateChange = (date) => {
    const formattedDate = formatDateTime(date);
    const formattedDatePrint = formatDateTimeForPrint(date);
    setPrintDate(formattedDatePrint)
    // localStorage.setItem("selecteDate", formattedDate);
    actions.selectedCalendarDate(formattedDate);
    setCurrentDate(date);
    fetchCanvasData(formattedDate);
  };

  const handleCustomRangeChange = (dates) => {
    const [start, end] = dates;
    setCustomRangeStart(start);
    setCustomRangeEnd(end);
    const formateStart = formatDateTimeForPrint(start);
    const formateEnd = formatDateTimeForPrint(end);
    const date = [formateStart, formateEnd].join('-');
    setPrintDateRange(date)

    let startDate = new Date(
      Date.UTC(start?.getFullYear(), start?.getMonth(), start?.getDate())
    );
    let endDate = new Date(
      Date.UTC(end?.getFullYear(), end?.getMonth(), end?.getDate())
    );

    // get all dates from date range picker
    const getDatesBetween = (currentDate, endDates) => {
      let dates = [];
      while (currentDate <= endDates) {
        // Convert date to YYYY-MM-DD format
        let formattedDate = currentDate?.toISOString()?.split("T")[0];
        dates?.push(formattedDate);
        currentDate?.setUTCDate(currentDate?.getUTCDate() + 1);
      }
      return dates;
    };
    const datesBetween = getDatesBetween(startDate, endDate);
    fetchCanvasData(datesBetween)
  }

  const fetchCanvasData = async (getDate) => {
    try {
      const apiUrl = `project/annotationsByPageId`;
      const payload = {
        projectID: projectId,
        calendarDate: getDate,
      };
      const response = await postApiCaller(apiUrl, payload, headers);
      // Pass the entire pages array to parseApiResponse
      const parsedData = parseApiResponse(response.pages);
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
 
  const parseApiResponse = (pages) => {
    const canvasObjects = [];

    const updatedPages = pages.map((page) => ({
      ...page,
      ID: `canvas-${page?.ID}`,
      calendar: {
        ...page.calendar,
        layers: page.calendar?.layers?.map((layer) => ({
          ...layer,
          annotations: layer?.annotations
            ?.filter((res) => res?.ParentAnnotationID === null)
            .map((annotation) => {
              let properties = annotation?.properties;
  
              // Initialize comment and title objects if they exist
              let commentObject = properties?.comment
                ? new fabric.Textbox(
                  properties?.comment?.text,
                  properties?.comment
                )
                : null;
              let titleObject = properties?.title
                ? new fabric.Textbox(properties.title.text, properties.title)
                : null;
              properties = {
                ...annotation.properties,
                ID: annotation?.ID,
                LayerID: annotation?.LayerID,
                UserID: annotation?.UserID,
                PageID: annotation?.PageID,
                icon: null,
                comment: commentObject || null,
                title: titleObject || null,
                strokeUniform: true,
                visible: true,
                selectable: true,
                IsLocked: false,
                IsVisible: true,
                type: properties?.type || annotation?.Type,
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
            }),
        })),
      },
    }));
    
    return {
      pages: updatedPages,
    };
  };
  

  const getTileClassName = ({ date }) => {
    const formattedDate = formatDate(date);
    const todayDate = formatDate(new Date());
    if (formattedDate === todayDate) {
      return;
    }
    const matchingResponse = getDataDate && getDataDate?.find(
      (item) => item.AssignDate === formattedDate
    );
    return matchingResponse && matchingResponse.Is_Calender_data
      ? "bg-success text-white rounded"
      : "";
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };
  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value)
  }

  useEffect(() => {
    actions.updateCurrentOpt({ currentOption: 6, currentObj: currentDate });
  }, [currentDate]);

  return (
    <div
      style={{ display: "flex", flexDirection: 'column', overflowX: "auto" }}
      className="align-items-center"
    >

      <div className="col-lg-12">
        <div className="d-flex justify-content-evenly">
          <div>
            <input
              type="radio"
              id="single"
              name="dateRange"
              value="single"
              onChange={handleDateRangeChange}
              checked={dateRange === "single"} // Set checked based on state
            />
            <label htmlFor="single" className="px-2 yellowText">
              Single
            </label>
          </div>
          <div>
            <input
              type="radio"
              id="custom"
              name="dateRange"
              value="custom"
              onChange={handleDateRangeChange}
              checked={dateRange === "custom"} // Set checked based on state
            />
            <label htmlFor="custom" className="px-2 yellowText">
              Custom range
            </label>
          </div>
        </div>
      </div>

      {dateRange === "single" ?
        <Calendar
          width="100%"
          value={selectedDate}
          onChange={handleDateChange}
          activeStartDate={currentDate}
          nextLabel={null}
          prevLabel={null}
          prev2Label={null}
          next2Label={null}
          tileClassName={getTileClassName}
        />
        :
        <Calendar
          width="100%"
          onChange={handleCustomRangeChange}
          selectRange={true}
          value={[customRangeStart, customRangeEnd]}
          nextLabel={null}
          prevLabel={null}
          prev2Label={null}
          next2Label={null}
          tileClassName={getTileClassName}
        />
      }
    </div>
  );
};

export default CustomCalendar;
