import React, { useState,useContext, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import noImage from "../../../../../../Assets/Images/noImage.avif";
import { useShapeContext } from "../../../../../../contexts/shapeContext";
import { ThemeContext } from "../../../../../../Theme/ThemeContext";

export default function PDFFileFilterModal(props) {
  const [selectedItem, setSelectedItem] = useState("");
  const [dateRange, setDateRange] = useState("single"); // Set default to "single"
  const [customRangeStart, setCustomRangeStart] = useState(new Date());
  const [customRangeEnd, setCustomRangeEnd] = useState(new Date());
  const [singleDate, setSingleDate] = useState(new Date());
  const { state, actions } = useShapeContext();
  const [backgroundData, setBackgrounData] = useState([]);
  const [bgToUnassign, setBgToUnassign] = useState([]);
  const { activeCanvas, pages } = state;
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const currCanvasData = pages.filter(
      (canvasShape) => canvasShape.id === activeCanvas
    );
    if (currCanvasData.length > 0) {
      setBackgrounData(currCanvasData[0].background);
    }
  }, [activeCanvas]);

  // const [backgroundList,setBackgroundList] = useState([])

  const handleDropdownChange = (event) => {
    setSelectedItem(event.target.value);
  };

  const handleDateRangeChange = (event) => {
    setDateRange(event.target.value);
  };

  const handleCustomRangeChange = (dates) => {
    const [start, end] = dates;
    setCustomRangeStart(start);
    setCustomRangeEnd(end);
  };

  function existingData(date) {
    let foundBg = [];
    for (let i = 0; i < backgroundData.length; i++) {
      let currentBgObj = backgroundData[i];
      if (currentBgObj.assignType === "single") {
        // do something
        if (areDatesSame(date, currentBgObj?.assignedDate)) {
          foundBg.push(currentBgObj);
          setBgToUnassign((prev) => [...prev, currentBgObj]);
          return true;
        }
      } else if (currentBgObj.assignType === "custom") {
        if (
          isDateInRange(date, currentBgObj?.startDate, currentBgObj?.endDate)
        ) {
          // console.log("Range true");
          foundBg.push(currentBgObj);
          setBgToUnassign((prev) => [...prev, currentBgObj?.id]);

          return true;
        }
      } else if (currentBgObj.assignType === "all") {
        // do something else
      }
    }
    return false;
  }

  function areDatesSame(date1, date2) {
    if (!date1 || !date2) {
      return false;
    }

    // console.log("Getting dates", date1,date2);
    const day1 = date1.getDate();
    const month1 = date1.getMonth();
    const year1 = date1.getFullYear();

    const day2 = date2.getDate();
    const month2 = date2.getMonth();
    const year2 = date2.getFullYear();
    // console.log("Compairing ", day1,day2,month1,month2,year1,year2);

    return day1 === day2 && month1 === month2 && year1 === year2;
  }

  // Function to check if a date lies within a range of two other dates
  function isDateInRange(date, startDate, endDate) {
    if (!date || !startDate || !endDate) {
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
    // console.log("Range compare:", startDate, startMonth, startYear, endDay,endMonth,endYear, day,month,year);

    return (
      (year > startYear ||
        (year === startYear && month > startMonth) ||
        (year === startYear && month === startMonth && day >= startDay)) &&
      (year < endYear ||
        (year === endYear && month < endMonth) ||
        (year === endYear && month === endMonth && day <= endDay))
    );
  }

  const handleSingleDateChange = (dates) => {
    const assignedDate = dates;

    if (existingData(dates)) {
      // Data exists for the provided date
      const confirmMessage = `Background already exists for ${dates}. Do you want to change the existing Background?`;

      // Prompt the user
      if (window.confirm(confirmMessage)) {
        setSingleDate(assignedDate);
        alert("Background updated successfully.");
      } else {
        // User clicked No, keep the existing data
        alert("Existing Background retained.");
      }
    } else {
      // No data exists for the provided date
      // alert("No Background found for the provided date.");
      setSingleDate(assignedDate);
    }
  };

  function resetVals() {
    setSingleDate(new Date());
    setCustomRangeStart(new Date());
    setCustomRangeEnd(new Date());
    // setSelectedItem("");
    // setDateRange("single");
    setBgToUnassign([]);
  }

  useEffect(() => {
    if (!props?.currentBgImg) {
      return;
    }
    //  console.log("Coming here", backgroundData, props?.currentBgImg);
    //  const idd=  backgroundData?.filter(b=> b?.id === props?.currentBgImg?.id);
    const currCanvasData = backgroundData.filter(
      (canvasShape) => canvasShape.id === props?.currentBgImg?.id2
    );

    // const currentBgImg = props?.currentBgImg;
    // console.log("CCc", currCanvasData[0]);
    if (currCanvasData?.length > 0) {
      setSelectedItem(JSON.stringify(currCanvasData[0]));
      setDateRange(currCanvasData[0]?.assignType || "all");
      setSingleDate(currCanvasData[0]?.assignedDate);
      setCustomRangeEnd(currCanvasData[0]?.endDate);
      setCustomRangeStart(currCanvasData[0]?.startDate);
    }
  }, [props?.currentBgImg, backgroundData]);

  function handleApply() {
    // console.log("PDF XXXX related data",selectedItem, dateRange, customRangeEnd, customRangeStart);
    if (bgToUnassign.length > 0) {
      for (let i = 0; i < bgToUnassign.length; i++) {
        const currentBgObj = bgToUnassign[i];

        const payloadToUnassign = {
          canvasId7: activeCanvas,
          id3: currentBgObj?.id,
          assignedDate: null,
          startDate2: null,
          endDate2: null,
          type2: currentBgObj?.assignType,
        };
        actions.updateBGdata(payloadToUnassign);
        setBgToUnassign([]);
      }
    }

    const payload = {
      dateRange,
      dateStart: customRangeStart,
      dateEnd: customRangeEnd,
      selectedBackground: selectedItem,
      assignedDate: singleDate,
    };

    props.onApply(payload);
  }

  function getName(backgroundDat, idx) {
    //  console.log("Bak", backgroundDat);
    switch (backgroundDat?.type) {
      case "pdf":
        return `background-pdf-${idx}`;
        break;
      case "image":
        return `background-image-${idx}`;
        break;
      case "solid":
        return `background-color-${backgroundDat?.value}`;
        break;

      default:
        break;
    }
  }

  useEffect(() => {
    // console.log("Executed tjis");
    if (selectedItem === "") {
      return;
    }

    setCustomRangeEnd(JSON.parse(selectedItem)?.endDate);
    setCustomRangeStart(JSON.parse(selectedItem)?.startDate);
    setDateRange(JSON.parse(selectedItem)?.assignType);
    setSingleDate(JSON.parse(selectedItem)?.assignedDate);
  }, [selectedItem]);

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered dialogClassName={theme}
    >
      <Modal.Header closeButton className='commonModalBg'>
        <Modal.Title id="contained-modal-title-vcenter" className="menuTextHeader">
          Assign Background
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className='commonModalBg'>
        <div className="row mx-0">
          <div className="col-lg-6 ps-0 border-end">
            <div className="row mx-0 align-items-center">
              <div className="col-lg-12 ps-0">
                <select
                  className="form-select px-2 fs-6"
                  onChange={handleDropdownChange}
                  value={selectedItem}
                >
                  {/* <option value="" className="fs-6">
                    Select Background
                  </option> */}

                  {/* <option value="Item 1">Item 1</option>

                  <option value="Item 2">Item 2</option>
                  <option value="Item 3">Item 3</option> */}
                  {/* Add more options as needed */}

                  {backgroundData &&
                    backgroundData?.map((background, idx) => (
                      <option value={JSON.stringify(background)} key={idx}>
                        {getName(background, idx)}
                      </option>
                    ))}
                </select>
                <div className="mt-5">
                  {selectedItem ? (
                    JSON.parse(selectedItem)?.type === "image" ||
                    JSON.parse(selectedItem)?.type === "pdf" ? (
                      <img
                        className="d-block w-75 h-75 m-auto border rounded-2"
                        src={JSON.parse(selectedItem)?.value} // Replace with actual path
                        alt={"selectedItem"}
                      />
                    ) : (
                      <div
                        className={`d-block w-75 h-75 m-auto border rounded-2`}
                        style={{
                          backgroundColor: `${JSON.parse(selectedItem)?.value}`,
                          minHeight: "10rem",
                          minWidth: "4rem",
                        }}
                      ></div>
                    )
                  ) : (
                    // <img
                    //   className="d-block w-75 h-75 m-auto border rounded-2"
                    //   src={`path/to/${selectedItem}.jpg`} // Replace with actual path
                    //   alt={selectedItem}
                    // />
                    <img
                      className="d-block w-75 h-75 m-auto border rounded-2"
                      src={noImage} // Replace with actual path
                      alt={selectedItem}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
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
                  id="all"
                  name="dateRange"
                  value="all"
                  onChange={handleDateRangeChange}
                  checked={dateRange === "all"} // Set checked based on state
                />
                <label htmlFor="all" className="px-2 yellowText">
                  All
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
            {/* {(dateRange === "single" ||
              dateRange === "all" ||
              dateRange === "custom") && (
              <div className="d-flex justify-content-center my-4 mb-2">
                <Calendar
                  onChange={handleCustomRangeChange}
                  selectRange={true}
                  value={[customRangeStart, customRangeEnd]}
                />
              </div>
            )} */}

            {dateRange === "all" ? (
              <div className="d-flex justify-content-center my-4 mb-2">
                <span>Valid for all the dates.</span>
              </div>
            ) : dateRange === "single" ? (
              <div className="d-flex justify-content-center my-4 mb-2">
                <Calendar
                  onChange={handleSingleDateChange}
                  selectRange={false}
                  value={singleDate}
                />
              </div>
            ) : (
              <div className="d-flex justify-content-center my-4 mb-2">
                <Calendar
                  onChange={handleCustomRangeChange}
                  selectRange={true}
                  value={[customRangeStart, customRangeEnd]}
                />
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button className="px-4" onClick={handleApply}>
          Apply
        </Button>
        <Button
          variant="default"
          className="border-secondary-subtle btn btn-default border border-gray px-4"
          onClick={() => {
            resetVals();
            props.onHide();
          }}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

/*!SECTION
feature to work on: 
-- unassigen is done, just write the code - remove the dates  
-- show filled calender vals (left side )
-- implement feature of all
-- discuss replace - another bgImg is put at this place
-- unload will change the bg image and remove its date
--  set default -- make the date to all and assignTypeToAll - 
-- automate the bgColor thisng to all to automate
-- enable all bg-imags to be visible on all canvas 
-- test all features 



*/
