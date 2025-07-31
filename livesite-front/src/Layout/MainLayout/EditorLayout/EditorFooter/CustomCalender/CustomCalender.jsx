import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "./CustomCalendar.css";
import "react-calendar/dist/Calendar.css";
import { useShapeContext } from "../../../../../contexts/shapeContext";
import dayjs from "dayjs";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { type } from "@testing-library/user-event/dist/type";
import createId from "../../../../../Common/Constants/CreateId";
import saveData from "../../../../../Components/SaveData/SaveEditorData";

const CustomCalendar = () => {
  const { state, actions } = useShapeContext();
  const { canvasData, activeCanvas, selectDate } = state;
  const { projectId } = useParams();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();
  let token;
  // console.log("state", state);
  const handleDateChange = (date) => {
    actions.selectedCalendarDate(date.toLocaleDateString());
    setCurrentDate(date);
    const id = createId();
    const newLayer = {
      id,
      user: "user 1",
      shapes: [],
      createdAt: date.toLocaleDateString(),
    };
    const UID = localStorage.getItem("UserID")
    const projectData = {
      projectID: projectId,
      UserID: UID,
      Name: "Yash Demo",
      Description: "Updated Demo1",
    };
    saveData(projectData, state);
    // const currCanvasData = pages.filter(
    //   (canvasShape) => canvasShape.canvasId === activeCanvas
    // );

    // const filterdata =
    //   currCanvasData &&
    //   currCanvasData[0].userShapes.filter(
    //     (res) => res.createdAt === date.toLocaleDateString()
    //   );

    // if (filterdata.length === 0) {
    //   actions.addLayer(newLayer);
    //   actions.updateCurrentUser(id);
    // }
    // fetchDateData(date);
  };

  const fetchDateData = async (date) => {
    console.log("formattedDate====>");
    try {
      token = localStorage.getItem("AdminToken");
      if (token) {
        const selectFormateDate = dayjs(date).format("YYYY-MM-DD");
        const apiUrl = `${process.env.REACT_APP_PUBLIC_BASE_URL}project/projectById`;
        const payload = {
          projectID: projectId,
          calendarDate: selectFormateDate,
        };
        const response = await axios.post(apiUrl, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
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

  const handleNextMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 3);
      return newDate;
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 3);
      return newDate;
    });
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
        const displayDate = new Date(currentDate);
        displayDate.setMonth(currentDate.getMonth() + offset);
        return (
          <Calendar
            key={offset}
            value={selectedDate}
            onChange={handleDateChange}
            activeStartDate={displayDate}
            nextLabel={null}
            prevLabel={null}
            prev2Label={null}
            next2Label={null}
          />
        );
      })}
      <button onClick={handleNextMonth} className="border-0 calBt">
        <i className="fs-1 fa fa-angle-right yellowText" />
      </button>
    </div>
  );
};

export default CustomCalendar;
