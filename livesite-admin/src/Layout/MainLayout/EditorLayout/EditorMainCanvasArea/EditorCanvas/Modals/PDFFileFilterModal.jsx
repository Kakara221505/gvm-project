import React, { useState, useContext, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import noImage from "../../../../../../Assets/Images/noImage.avif";
import { useShapeContext } from "../../../../../../contexts/shapeContext";
import { ThemeContext } from "../../../../../../Theme/ThemeContext";
import { pdfjs } from "react-pdf";
import { useApiContext } from "../../../../../../contexts/apiContext";
import { getHeaderFile, unAssignBg } from "../../../../../../Lib/headerMenuApi";
import { toast } from "react-toastify";
import { GlobalValues } from "../../../../../../Lib/GlobalValues";
import { Spinner } from "react-bootstrap";

export default function PDFFileFilterModal(props) {
  const [selectedItem, setSelectedItem] = useState("");
  const [dateRange, setDateRange] = useState("single"); // Set default to "single"
  const [customRangeStart, setCustomRangeStart] = useState(new Date());
  const [customRangeEnd, setCustomRangeEnd] = useState(new Date());
  const [singleDate, setSingleDate] = useState(new Date());
  const { state, actions } = useShapeContext();
  const [backgroundData, setBackgrounData] = useState([]);
  const [bgToUnassign, setBgToUnassign] = useState([]);
  const { activeCanvas, pages, bgLoading } = state;
  const { theme } = useContext(ThemeContext);
  const { importData, setImportData } = useApiContext();
  const { headers, getDate, token, projectId } = GlobalValues();

  useEffect(() => {
    actions.bgLoading(false);
  }, []);

  useEffect(() => {
    const currCanvasData = pages.filter(
      (canvasShape) => canvasShape.ID === activeCanvas
    );
    if (currCanvasData.length > 0) {
      setBackgrounData(currCanvasData[0].background);
    }

    // // for assigning 0 index image for first time preview
    // if (importData && Array.isArray(importData) && importData.length > 0) {
    //   let bg = importData[0];
    //   setSelectedItem(JSON.stringify(bg));
    // } else {
    //   console.error('importData is not valid or empty');
    // }
  }, [activeCanvas, pages, dateRange]);

  // const [backgroundList,setBackgroundList] = useState([])

  const [loading, setLoading] = useState(false);
  const handleDropdownChange = async (event) => {
    setLoading(true);
    const selectedID = event.target.value; // Get the selected ID from the event
    const selectedBackground = importData.find(
      (bg) => bg.ID === parseInt(selectedID)
    ); // Find the full object using the ID
    if (selectedBackground.Type === "2") {
      const value = await renderPDF(selectedBackground.BackGroundColor); // Render PDF and update background color
      const newBackground = { ...selectedBackground, BackGroundColor: value };
      // You can store the updated object directly, or use a state for complex operations
      setSelectedItem(newBackground);
      setLoading(false);
    } else {
      setSelectedItem(selectedBackground); // For non-PDF types, just store the background
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const renderPDF = async (pdfUrl) => {
    const loadingTask = pdfjs.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    // Convert the canvas to a data URL
    const imgData = canvas.toDataURL("image/png");
    return imgData;
  };

  const handleDateRangeChange = (event) => {
    setDateRange(event.target.value);
  };

  const handleCustomRangeChange = (dates) => {
    const [start, end] = dates;
    setCustomRangeStart(start);
    setCustomRangeEnd(end);

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
    let pageId = parseInt(activeCanvas?.split("-")[1]); // getting page id

    let matchedDates = [];
    importData.forEach((data) => {
      if (data.PageID === pageId) {
        datesBetween.forEach((date) => {
          data.DateRanges.forEach((dateRange) => {
            const dataDate = dateRange.split(" ")[0];
            if (dataDate === date) {
              matchedDates.push(date);
            }
          });
        });
      }
    });

    if (matchedDates?.length > 0) {
      const confirmMessage = `Background already exists for the following dates: ${matchedDates.join(
        ", "
      )}. Do you want to change the existing Backgrounds?`;
      // Prompt the user
      if (window.confirm(confirmMessage)) {
        const payload = {
          dateRange: datesBetween,
          dateStart: startDate,
          dateEnd: endDate,
          selectedBackground: selectedItem,
          assignedDate: startDate,
          // currentBgImg: (selectedItem),
        };
        // props.onApply(payload);
      } else {
        alert("Existing Backgrounds retained.");
      }
    } else {
      // No data exists for the provided dates
    }
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
          foundBg.push(currentBgObj);
          setBgToUnassign((prev) => [...prev, currentBgObj?.id]);

          return true;
        }
      } else if (currentBgObj.assignType === "All") {
        // do something else
      }
    }
    return false;
  }

  function areDatesSame(date1, date2) {
    if (!date1 || !date2) {
      return false;
    }

    const day1 = date1.getDate();
    const month1 = date1.getMonth();
    const year1 = date1.getFullYear();

    const day2 = date2.getDate();
    const month2 = date2.getMonth();
    const year2 = date2.getFullYear();

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
    setSingleDate(assignedDate);
    const selectedDate = new Date(
      Date.UTC(
        assignedDate?.getFullYear(),
        assignedDate?.getMonth(),
        assignedDate?.getDate()
      )
    )
      ?.toISOString()
      .split("T")[0];
    let pageId = parseInt(activeCanvas?.split("-")[1]); // getting page id
    let existingDate = importData.filter((data) => {
      const pageIdMatches = data.PageID === pageId;
      // Check if any date in the DateRanges array matches the newDate
      const dateMatches = data.DateRanges.some((dateRange) => {
        const dataDate = dateRange.split(" ")[0];
        return dataDate === selectedDate;
      });
      return pageIdMatches && dateMatches;
    });

    if (existingDate.length > 0 && existingDate[0].PageID === pageId) {
      // Data exists for the provided date
      const confirmMessage = `Background already exists for ${selectedDate}. Do you want to change the existing Background?`;
      // Prompt the user
      if (window.confirm(confirmMessage)) {
        const payload = {
          dateRange,
          dateStart: selectedDate,
          dateEnd: selectedDate,
          selectedBackground: selectedItem,
          assignedDate: selectedDate,
          currentBgImg: selectedItem,
        };
        // props.onApply(payload);
      } else {
        alert("Existing Background retained.");
      }
    } else {
      // No data exists for the provided date
    }
  };

  function resetVals() {
    setSingleDate(new Date());
    setCustomRangeStart(new Date());
    setCustomRangeEnd(new Date());
    // setSelectedItem("");
    setDateRange("single");
    setBgToUnassign([]);
  }

  useEffect(() => {
    if (!props?.currentBgImg) {
      return;
    }

    const currCanvasData = props?.currentBgImg?.id2;
    if (currCanvasData?.length > 0) {
      setSelectedItem(JSON.stringify(currCanvasData[0]));
      setDateRange(currCanvasData[0]?.assignType || "All");
      setSingleDate(currCanvasData[0]?.assignedDate);
      setCustomRangeEnd(currCanvasData[0]?.endDate);
      setCustomRangeStart(currCanvasData[0]?.startDate);
    }
  }, [props?.currentBgImg, backgroundData]);

  function handleApply() {
    if (!selectedItem) {
      return;
    }
    actions.bgLoading(true);

    if (
      (dateRange && singleDate) ||
      customRangeStart ||
      customRangeEnd ||
      dateRange === "All"
    ) {
      let singleDateUTC;
      let customRangeStartUTC;
      let customRangeEndUTC;
      if (dateRange !== "All") {
        singleDateUTC = new Date(
          Date.UTC(
            singleDate?.getFullYear(),
            singleDate?.getMonth(),
            singleDate?.getDate()
          )
        );
        customRangeStartUTC = new Date(
          Date.UTC(
            customRangeStart?.getFullYear(),
            customRangeStart?.getMonth(),
            customRangeStart?.getDate()
          )
        );
        customRangeEndUTC = new Date(
          Date.UTC(
            customRangeEnd?.getFullYear(),
            customRangeEnd?.getMonth(),
            customRangeEnd?.getDate()
          )
        );
      }

      const payload = {
        dateRange,
        dateStart:
          dateRange == "custom"
            ? customRangeStartUTC?.toISOString()
            : dateRange == "single"
            ? singleDateUTC?.toISOString()
            : "All",
        dateEnd:
          dateRange == "custom"
            ? customRangeEndUTC?.toISOString()
            : dateRange == "single"
            ? singleDateUTC?.toISOString()
            : "All",
        selectedBackground: selectedItem,
        assignedDate:
          dateRange == "single"
            ? singleDateUTC?.toISOString()
            : dateRange == "custom"
            ? customRangeStartUTC?.toISOString()
            : "All",
        currentBgImg: selectedItem,
      };
      props.onApply(payload);
    } else if (!dateRange) {
      toast.error("Please select date type");
      actions.bgLoading(false);
    } else if (!singleDate || !customRangeStart || !customRangeEnd) {
      toast.error("Please select date");
      actions.bgLoading(false);
    }
  }

  function getName(backgroundDat) {
    switch (backgroundDat?.Type) {
      case "2":
        return `background-pdf-${backgroundDat?.ID}`;
        break;
      case "1":
        return `background-image-${backgroundDat?.ID}`;
        break;
      case "0":
        return `background-color-${backgroundDat?.ID}`;
        break;

      default:
        break;
    }
  }

  useEffect(() => {
    if (selectedItem === "") {
      return;
    }
    setCustomRangeEnd(selectedItem?.endDate);
    setCustomRangeStart(selectedItem?.startDate);
    setDateRange(selectedItem?.assignType);
    setSingleDate(selectedItem?.assignedDate);
  }, [selectedItem]);

  const getPdfModalTypeText = (pdfModalType) => {
    if (pdfModalType === "Assign Background") {
      return "Assign Background";
    } else if (pdfModalType === "Replace Background") {
      return "Replace Background";
    } else if (pdfModalType === "Unassign Background") {
      return "Unassign Background";
    } else if (pdfModalType === "Unload Background") {
      return "Unload Background";
    } else if (pdfModalType === "Set default") {
      return "Set default";
    } else {
      return "";
    }
  };

  // for showing selected date range for unassign and replace module
  const [uniqueDates, setUniqueDates] = useState([]);
  const [selectedDates, setSelectedDates] = useState(new Set());

  useEffect(() => {
    if (selectedItem) {
      // Extract unique dates from the selectedItem.DateRanges
      const dates = selectedItem?.DateRanges || [];
      const uniqueDatesSet = new Set(
        dates.map((date) => new Date(date).toDateString())
      );
      setUniqueDates([...uniqueDatesSet]);
    }
  }, [selectedItem]);

  // handle unselect dates from selected date range
  const handleTileClick = (date) => {
    const dateString = date.toDateString();
    setSelectedDates((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(dateString)) {
        newSelection.delete(dateString);
      } else {
        newSelection.add(dateString);
      }
      return newSelection;
    });
  };

  // show date color according for selected and unselected
  const tileClassName = ({ date, view }) => {
    const dateString = date.toDateString();
    if (view === "month") {
      if (selectedDates.has(dateString)) {
        return "selected";
      }
      if (uniqueDates.includes(dateString)) {
        return "highlight";
      }
    }
    return null;
  };

  // disable other dates which are not in our dateRange
  const tileDisabled = ({ date, view }) => {
    if (view === "month" && !uniqueDates.includes(date.toDateString())) {
      return true;
    }
    return false;
  };

  const dateArray = Array.from(selectedDates);
  const formattedDates = dateArray.map((dateStr) => {
    const dates = new Date(dateStr);
    const year = dates.getFullYear();
    const month = String(dates.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
    const date = String(dates.getDate()).padStart(2, "0"); // Pad single-digit dates
    return `${year}-${month}-${date}`;
  });

  const fetchImportImages = async () => {
    let response = await getHeaderFile(projectId);
    setImportData(response?.data);
  };

  const handleUnAssign = async () => {
    if (!selectedItem || formattedDates.length === 0 ) {
      return
    }
    actions.bgLoading(true);
    const pageId = activeCanvas.split("-")[1];
    let response = await unAssignBg(
      projectId,
      formattedDates,
      pageId,
      selectedItem?.ID
    );
    if (response?.status === "success") {
      toast("Background Unassign Successfully");
      window.location.reload();
      actions.bgLoading(false);
      fetchImportImages();
      props.onHide();
      actions.bgAssign(false);
    } else {
      toast(response.message);
    }
  };

  useEffect(() => {
    setDateRange("single");
  }, [selectedItem]);

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      dialogClassName={theme}
    >
      <Modal.Header
        closeButton
        onClick={() => actions.bgAssign(false)}
        className="commonModalBg"
      >
        <Modal.Title
          id="contained-modal-title-vcenter"
          className="menuTextHeader"
        >
          {getPdfModalTypeText(props?.pdfModalType)}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="commonModalBg">
        <div className="row mx-0">
          <div className="col-lg-6 ps-0 border-end">
            <div className="row mx-0 align-items-center">
              <div className="col-lg-12 ps-0">
                <select
                  className="form-select px-2 fs-6"
                  onChange={handleDropdownChange}
                  value={selectedItem.ID}
                >
                  {importData &&
                    importData.map((background, idx) => (
                      <option value={background.ID} key={idx}>
                        {getName(background)}
                      </option>
                    ))}
                </select>
                <div className="mt-5">
                  <div className="text-center">
                    {loading && <span>Loading...</span>}
                  </div>
                  {selectedItem && !loading ? (
                    selectedItem.Type === "1" || selectedItem.Type === "2" ? (
                      <img
                        className="d-block w-75 h-75 m-auto border rounded-2"
                        src={selectedItem.BackGroundColor} // The rendered PDF or image URL
                        alt="selectedItem"
                      />
                    ) : (
                      <div
                        className="d-block w-75 h-75 m-auto border rounded-2"
                        style={{
                          backgroundColor: selectedItem.BackGroundColor, // The color background
                          minHeight: "10rem",
                          minWidth: "4rem",
                        }}
                      ></div>
                    )
                  ) : (
                    !loading && (
                      <img
                        className="d-block w-75 h-75 m-auto border rounded-2"
                        src={noImage} // Replace with actual path
                        alt="noImage"
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
          {getPdfModalTypeText(props?.pdfModalType) !== "Unassign Background" &&
            getPdfModalTypeText(props?.pdfModalType) !== "Set default" && (
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
                      id="All"
                      name="dateRange"
                      value="All"
                      onChange={handleDateRangeChange}
                      checked={dateRange === "All"} // Set checked based on state
                    />
                    <label htmlFor="All" className="px-2 yellowText">
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
              dateRange === "All" ||
              dateRange === "custom") && (
              <div className="d-flex justify-content-center my-4 mb-2">
                <Calendar
                  onChange={handleCustomRangeChange}
                  selectRange={true}
                  value={[customRangeStart, customRangeEnd]}
                />
              </div>
            )} */}

                {dateRange === "All" ? (
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
            )}

          {getPdfModalTypeText(props?.pdfModalType) ===
            "Unassign Background" && (
            <div className="col-lg-6">
              <div className="d-flex justify-content-center my-4 mb-2">
                <Calendar
                  tileClassName={tileClassName}
                  tileDisabled={tileDisabled}
                  onClickDay={handleTileClick}
                />
              </div>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="px-4"
          onClick={
            getPdfModalTypeText(props?.pdfModalType) === "Unassign Background"
              ? handleUnAssign
              : handleApply
          }
        >
          {bgLoading ? (
            <Spinner animation="border" variant="white" size="sm" />
          ) : (
            "Apply"
          )}
        </Button>

        <Button
          variant="default"
          className="border-secondary-subtle btn btn-default border border-gray px-4"
          onClick={() => {
            resetVals();
            props.onHide();
            actions.bgAssign(false);
          }}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
