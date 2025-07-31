import React, { useEffect, useState } from "react";
import toggleFooterBtn from "../../../../Assets/Icons/arrow-up-double-sharp.png";
import { Nav, Dropdown } from "react-bootstrap";
import { toast } from "react-toastify";

import "./EditorFooter.css";
import CustomCalendar from "./CustomCalender/CustomCalender";
import { useShapeContext } from "../../../../contexts/shapeContext";
import createId from "../../../../Common/Constants/CreateId";
import { postApiCaller } from "../../../../Lib/apiCaller";
import { GlobalValues } from "../../../../Lib/GlobalValues";
import { useParams } from "react-router-dom";

const EditorFooter = () => {
  const { projectId } = useParams();
  const { userID, token } = GlobalValues();

  const [isExpanded, setIsExpanded] = useState(false);
  const { state, actions } = useShapeContext();
  const { canvases, activeCanvas, pages } = state;
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [pageWindow, setPageWindow] = useState({ start: 0, end: 6 });
  const [maxPages, setMaxPages] = useState(6);

  useEffect(() => {
    function handleResize() {
      const screenWidth = window.innerWidth;
      if (screenWidth < 768) {
        setMaxPages(3); // Show 3 pages on smaller screens (mobile)
      } else if (screenWidth < 992) {
        setMaxPages(7); // Show 7 pages on medium screens (iPad)
      } else {
        setMaxPages(8); // Show 8 pages on larger screens (desktop)
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (canvases.length > 0 && !activeCanvas) {
      actions.updateActiveCanvas(canvases[0].id);
    }
  }, [canvases, activeCanvas, actions]);

  const toggleFooter = () => {
    setIsExpanded(!isExpanded);
  };

  const addCanvas = async () => {
    // const data = {
    //   UserID: userID,
    //   ProjectID: projectId,
    //   Name: "Page",
    //   Page_order: canvases.length + 1,
    // };
    // const headers = {
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    // };
    // try {
    //   const response = await postApiCaller("/page/add_page", data, headers);
    //   console.log(response);
    // } catch (error) {}
    const newCanvasId = `canvas-${createId()}`;
    actions.addCanvas(newCanvasId);
    actions.updateActiveCanvas(newCanvasId);
  };

  const handleCanvasSelect = (canvasId) => {
    actions.updateActiveCanvas(canvasId);
    setOpenDropdownIndex(null);
  };

  const deleteCanvas = (canvasId) => {
    if (canvases.length <= 1) {
      toast.warning("Sorry, at least one page is required.");
      return;
    } else {
      actions.removeCanvasID(canvasId);
      setOpenDropdownIndex(null);
    }
  };

  const navigatePages = (direction) => {
    setPageWindow((prev) => {
      let newStart, newEnd;
      if (direction === "next") {
        newStart = prev.end;
        newEnd = Math.min(prev.end + maxPages, canvases.length);
      } else {
        newStart = Math.max(prev.start - maxPages, 0);
        newEnd = prev.start;
      }
      return { start: newStart, end: newEnd };
    });
  };

  const toggleDropdown = (e, index) => {
    e.stopPropagation();
    setOpenDropdownIndex(openDropdownIndex === index ? null : index);
  };

  return (
    <div id="footer" style={{ height: isExpanded ? "400px" : "40px" }}>
      <div className="row justify-content-between">
        {!isExpanded && (
          <>
            <div className="col-lg-12 ps-5">
              <Nav
                className="ps-5 rounded-0"
                variant="tabs"
                defaultActiveKey="link-1"
              >
                <Nav.Item>
                  <Nav.Link onClick={addCanvas}>
                    <svg
                      enableBackground="new 0 0 50 50"
                      height="25px"
                      id="Layer_1"
                      version="1.1"
                      viewBox="0 0 50 50"
                      width="25px"
                    >
                      <rect fill="none" height="50" width="50" />
                      <line
                        fill="none"
                        stroke="var(--text-secondary)"
                        strokeMiterlimit="10"
                        strokeWidth="4"
                        x1="9"
                        x2="41"
                        y1="25"
                        y2="25"
                      />
                      <line
                        fill="none"
                        stroke="var(--text-secondary)"
                        strokeMiterlimit="10"
                        strokeWidth="4"
                        x1="25"
                        x2="25"
                        y1="9"
                        y2="41"
                      />
                    </svg>{" "}
                  </Nav.Link>
                </Nav.Item>
                {pageWindow.start > 0 && (
                  <Nav.Item>
                    <Nav.Link onClick={() => navigatePages("prev")}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-arrow-left"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="#2c3e50"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12l14 0" />
                        <path d="M5 12l6 6" />
                        <path d="M5 12l6 -6" />
                      </svg>
                    </Nav.Link>
                  </Nav.Item>
                )}
                {canvases
                  .slice(pageWindow.start, pageWindow.end)
                  .map((canvas, index) => (
                    <Nav.Item key={index}>
                      <Dropdown show={openDropdownIndex === index} align="end">
                        <Dropdown.Toggle
                          as={Nav.Link}
                          id={`dropdown-link-${index + 1}`}
                          onClick={() => handleCanvasSelect(canvas.id)}
                          active={activeCanvas === canvas.id}
                        >
                          Page {pageWindow.start + index + 1}
                          <i
                            className="fa fa-angle-down ps-2"
                            onClick={(e) => toggleDropdown(e, index)}
                          />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() => deleteCanvas(canvas.id)}
                          >
                            Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </Nav.Item>
                  ))}
                {pageWindow.end < canvases.length && (
                  <Nav.Item>
                    <Nav.Link onClick={() => navigatePages("next")}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-arrow-right"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="#2c3e50"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12l14 0" />
                        <path d="M13 18l6 -6" />
                        <path d="M13 6l6 6" />
                      </svg>
                    </Nav.Link>
                  </Nav.Item>
                )}
              </Nav>
            </div>
          </>
        )}
      </div>
      <div
        id="footerbuttondown"
        style={{ visibility: isExpanded ? "visible" : "hidden" }}
        onClick={toggleFooter}
      >
        <img src={toggleFooterBtn} height={20} width={20} alt="ss" />
      </div>
      <div
        id="footerbuttonup"
        style={{ visibility: isExpanded ? "hidden" : "visible" }}
        onClick={toggleFooter}
      >
        <img src={toggleFooterBtn} height={20} width={20} alt="ss" />
      </div>
      <div
        id="footercont"
        style={{
          opacity: isExpanded ? 1 : 0,
          visibility: isExpanded ? "visible" : "hidden",
        }}
      >
        <div className="container-fluid">
          <div className="row px-5">
            <div className="col-lg-12 px-5">
              <CustomCalendar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorFooter;
