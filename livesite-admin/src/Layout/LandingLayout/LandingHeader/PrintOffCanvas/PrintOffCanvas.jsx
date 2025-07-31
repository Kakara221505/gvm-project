import React, { useState, useContext, useEffect } from "react";
import {
  Offcanvas,
  Form,
  Button,
  ButtonGroup,
  Accordion,
} from "react-bootstrap";
import "./PrintOffcanvas.css";
import { ThemeContext } from "../../../../Theme/ThemeContext";
import portrait from "../../../../Assets/Images/portrait.png";
import landscape from "../../../../Assets/Images/landscape.png";

import portraitWhite from "../../../../Assets/Images/portraitWhite.png";
import landscapeWhite from "../../../../Assets/Images/landscapeWhite.png";
import { useShapeContext } from "../../../../contexts/shapeContext";
import CustomCalendar from "./CustomCalander";
import { RxPinBottom } from "react-icons/rx";
import { FaArrowDown } from "react-icons/fa";

const PrintOffcanvas = ({ showPrintOffcanvas, handleClosePrintOffcanvas, setShowPdfPreviewModal, handlePrint, handleHeader, setPrintDate, setPrintDateRange, dateRange, setDateRange, showTitle}) => {
  const [activeButton, setActiveButton] = useState("portrait"); // State to manage active button
  const [showPrintSettings, setShowPrintSettings] = useState(true); // State to manage which section to show
  const { theme } = useContext(ThemeContext);        
  const { state, actions } = useShapeContext();
  const { canvases } = state;
  const [selectedCanvasId, setSelectedCanvasId] = useState();
  const [scaleOption, setScaleOption] = useState('Normal');

  useEffect(() => {
    if (selectedCanvasId) {
      actions.currentPagePrintId(selectedCanvasId);
    }
    if (scaleOption) {
      actions.printScaling(scaleOption)
    }
  }, [selectedCanvasId, scaleOption]);

  useEffect(() => {
    if (canvases.length > 0) {
      // Set default to the ID of the first canvas
      setSelectedCanvasId(canvases[0].id);
    }
  }, [canvases]);

  const handleButtonClick = (buttonType) => {
    setActiveButton(buttonType);
  };

  const handleCancel = () => {
    handleClosePrintOffcanvas();
    setShowPdfPreviewModal(false);
  };

  const handleCanvasChange = (event) => {
    setSelectedCanvasId(event.target.value);
  };

  const handleScaling = (event) => {
    const selectedScale = event.target.value;
    setScaleOption(selectedScale);
  };

  const pageSize = [
    "A4", "A3", "Letter", "Tabloid", "Legal"
  ];
  const scale = [
    "Normal", "Fit to width", "Fit to height", "Fit to page"
  ];

  const [showCalander, setShowCalander] = useState(false)
  const handleCalander = () => {
    if (showCalander) {
      setShowCalander(false)
    } else {
      setShowCalander(true)
    }
  }

  const title = [
    "Header", "Footer"
  ]


  return (
    <Offcanvas
      className={`px-3 printCanvas ${theme}`}
      show={showPrintOffcanvas}
      onHide={handleClosePrintOffcanvas}
      placement="end"

      backdrop={false}
    >
      <Offcanvas.Header className="border-bottom px-0">
        {showPrintSettings ? (
          <div className="d-flex w-100 justify-content-between align-items-center">
            <Offcanvas.Title className="fw-semibold menuTextHeader">Print</Offcanvas.Title>
            <Offcanvas.Title className="fs-6">1 Sheet of paper</Offcanvas.Title>
          </div>
        ) : (
          <div className="d-flex w-100 justify-content-between align-items-center">
            <Offcanvas.Title className="yellowText fw-semibold">
              Print Settings
            </Offcanvas.Title>
            <Offcanvas.Title className="fs-6">Total: 1 Page</Offcanvas.Title>
          </div>
        )}
      </Offcanvas.Header>
      <Offcanvas.Body className="px-0">
        {showPrintSettings && (
          <>
            <div className="py-2">
              <Form.Label className="fw-semibold yellowText" htmlFor="basic-url">
                Print
              </Form.Label>
              <Form.Select
                className="selectPrint py-2"
                aria-label="Default select example"
                value={selectedCanvasId}
                onChange={handleCanvasChange}
              >
                {canvases.map((canvas, index) => (
                  <option key={canvas.id} value={canvas.id}>
                    Page {index + 1}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="py-2">
              <Form.Label className="fw-semibold yellowText" htmlFor="basic-url">
                Title Position
              </Form.Label>
              <Form.Select
                className="selectPrint py-2"
                aria-label="Default select example"
                onChange={handleHeader}
                value={showTitle}
              >
                {title.map((data) => (
                  <option value={data}>
                    {data}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className='py-2'>
              <div className="d-flex " onClick={() => handleCalander()}>
                <Form.Label className="py-2 d-flex me-auto fw-semibold yellowText" htmlFor="basic-url" >
                  Select Date
                </Form.Label>
                <div>
                  <FaArrowDown />
                </div>
              </div>
              {showCalander &&
                <CustomCalendar setPrintDate={setPrintDate} setPrintDateRange={setPrintDateRange} dateRange={dateRange}
                setDateRange={setDateRange} />
              }
            </div>
            {/* <div className="py-2">
              <Form.Label className="fw-semibold yellowText" htmlFor="basic-url">
                Watermark
              </Form.Label>
              <Form.Select
                className="selectPrint py-2"
                aria-label="Default select example"
                onChange={handleHeader}
              >
                {canvases.map((canvas, index) => (
                  <option key={canvas.id} value={canvas.id}>
                    Top Center
                  </option>
                ))}
              </Form.Select>
            </div> */}
            {/* <div className="py-2">
              <Form.Label className="fw-semibold yellowText" htmlFor="basic-url">
                Paper Size
              </Form.Label>
              <Form.Select
                className="selectPrint py-2"
                aria-label="Paper size select"
                id="paper-size-select"
              >
                {pageSize.map((size, index) => (
                  <option key={index} value={size}>
                    {size}
                  </option>
                ))}
              </Form.Select>
            </div> */}
            {/* <div className="py-2">
              <Form.Label className="fw-semibold yellowText" htmlFor="basic-url">
                Orientation
              </Form.Label>{" "}
              <br />
              <ButtonGroup aria-label="Basic example">
                <button
                  className={`rounded-end-0 selectPrint px-3 d-flex align-items-center ${activeButton === "portrait" ? "btn btn-primary loginBtn1" : ""
                    }`}
                  onClick={() => handleButtonClick("portrait")}
                >
                  <img
                    src={activeButton === "portrait" ? portraitWhite : portrait}
                    className={`img-fluid px-2 ${activeButton === "portrait" ? "filter-white fillImg1" : ""
                      }`}
                    alt="Portrait"
                  />
                  Portrait
                </button>
                <button
                  className={`rounded-start-0 selectPrint px-3 d-flex align-items-center btn ${activeButton === "landscape" ? "btn btn-primary" : ""
                    }`}
                  onClick={() => handleButtonClick("landscape")}
                >
                  <img
                    src={
                      activeButton === "landscape" ? landscapeWhite : landscape
                    }
                    className={`img-fluid px-2 ${activeButton === "landscape" ? "filter-white" : ""
                      }`}
                    alt="Landscape"
                  />
                  Landscape
                </button>
              </ButtonGroup>
            </div> */}
            {/* <div className="py-2">
              <Form.Label className="fw-semibold yellowText" htmlFor="basic-url">
                Scale
              </Form.Label>
              <Form.Select
                className="selectPrint py-2"
                aria-label="Default select example"
                onChange={handleScaling}
                value={scaleOption}
              >
                {scale.map((scale, index) => (
                  <option key={index} value={scale}>{scale}</option>
                ))}
              </Form.Select>
            </div> */}
            {/* <div className="py-2">
              <Form.Label className="fw-semibold yellowText" htmlFor="basic-url">
                Colour mode
              </Form.Label>
              <Form.Select
                className="selectPrint py-2"
                aria-label="Default select example"
              >
                <option>Wide</option>
                <option value="1">A4 (11”x 17”)</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
              </Form.Select>
            </div>
            <div className="py-1 pt-3">
              <Form.Label className="pageBreak" htmlFor="basic-url">
                SET CUSTOMER PAGE BREAKS
              </Form.Label>
            </div> */}
            {/* <Accordion className="custom-accordion" defaultActiveKey="0">
              <Accordion.Item eventKey="0" className="accordIt py-2">
                <Accordion.Header className="accordIt yellowText">More settings</Accordion.Header>
                <Accordion.Body className="menuTextHeader">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, sunt in culpa qui officia deserunt
                  mollit anim id est laborum.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1" className="accordIt py-2">
                <Accordion.Header>Headers & Footers</Accordion.Header>
                <Accordion.Body className="menuTextHeader">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, sunt in culpa qui officia deserunt
                  mollit anim id est laborum.
                </Accordion.Body>
              </Accordion.Item>
            </Accordion> */}
          </>
        )}
        {/* {!showPrintSettings && (
          <>
            <div className="py-2">
              <Form.Label className="fw-semibold yellowText" htmlFor="basic-url">
                Destination
              </Form.Label>
              <Form.Select
                className="selectPrint py-2"
                aria-label="Default select example"
              >
                <option>Current Sheet</option>
                <option value="1">One</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
              </Form.Select>
            </div>
            <div className="py-2">
              <Form.Label className="fw-semibold yellowText" htmlFor="basic-url">
                Pages
              </Form.Label>
              <Form.Select
                className="selectPrint py-2"
                aria-label="Default select example"
              >
                <option>All</option>
                <option value="1">A4 (11”x 17”)</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
              </Form.Select>
            </div>
            <div className="py-2">
              <Form.Label className="fw-semibold yellowText" htmlFor="basic-url">
                Color
              </Form.Label>
              <Form.Select
                className="selectPrint py-2"
                aria-label="Default select example"
              >
                <option>Black and White</option>
                <option value="1">A4 (11”x 17”)</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
              </Form.Select>
            </div>

            <Accordion className="custom-accordion my-3" defaultActiveKey="0">
              <Accordion.Item eventKey="0" className="py-2 accordIt">
                <Accordion.Header className="">More settings</Accordion.Header>
                <Accordion.Body className="menuTextHeader">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, sunt in culpa qui officia deserunt
                  mollit anim id est laborum.
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </>
        )} */}
      </Offcanvas.Body>
      <div className="py-3 d-flex justify-content-between border-top">
        <button
          className="me-2 border-0 px-5"
          onClick={handleCancel}
        >
          CANCEL
        </button>
        {/* {(showPrintSettings && ( */}
        <Button
          variant="primary"
          className="px-5 py-2 loginBtn1"
          onClick={handlePrint}
        >
          NEXT
        </Button>
        {/* )) || (
            <Button
              variant="primary"
              className="px-5 py-2 "
              onClick={handleNextClick}
            >
              PRINT
            </Button>
          )} */}
      </div>
    </Offcanvas>
  );
};

export default PrintOffcanvas;
