import React, { useState, useRef, useContext, useEffect } from "react";
import "../LandingLayout.css";
import defaultAvatar from "../../../Assets/Images/defaultAvatar.png";
import Notification from "../../../Assets/Icons/Notification.png";
import Settings from "../../../Assets/Icons/Setting.png";
import Login from "../../../Auth/Login/Login";
import Signup from "../../../Auth/Signup/Signup";
import Dark from "../../../Assets/Icons/Light.png";
import Light from "../../../Assets/Icons/Dark.png";
import Logo from "../../../Assets/Images/Logo.png";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../../Theme/ThemeContext";
import { Dropdown, Offcanvas } from "react-bootstrap";
import AddProjectModal from "./AddProjectModal/AddProjectModal";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ShareModal from "./ShareModal/ShareModal";
import AccessPeopleModal from "./AccessPeopleModal/AccessPeopleModal";
import PrintOffcanvas from "./PrintOffCanvas/PrintOffCanvas";
import { importFileType } from "../../../Common/enum";
import {
  getHeaderFile,
  headerFileImport,
  unAssignBg,
} from "../../../Lib/headerMenuApi";
import { useApiContext } from "../../../contexts/apiContext";
import { useShapeContext } from "../../../contexts/shapeContext";
import UseSaveData from "../../../Components/SaveData/SaveEditorData";
import PdfPreviewModal from "./PdfPreviewModal/PdfPreviewModal";
import html2canvas from "html2canvas";
import printJS from "print-js";
import SaveConfirmModal from "../../../Common/SaveConfirmModal/SaveConfirmModal";
import { GlobalValues } from "../../../Lib/GlobalValues";
import { postApiCaller } from "../../../Lib/apiCaller";
import { fabric } from "fabric";

export default function LandingHeader({
  toggleSidebar,
  darkMode,
  toggleTheme,
  filesPreview,
}) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const fileInputRef = useRef(null); // Define fileInputRef
  const [file, setFile] = useState({});
  const { theme } = useContext(ThemeContext);
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  let { projectId } = useParams();
  const { importData, setImportData } = useApiContext();

  const [showShareModal, setShowShareModal] = useState(false); // State for share modal
  const [showAccessModal, setShowAccessModal] = useState(false); // State for access modal
  const [showPrintOffcanvas, setShowPrintOffcanvas] = useState(false); // State for Print Offcanvas
  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState(false); // State for PDF preview modal
  const [selectedPerson, setSelectedPerson] = useState();
  const [updatedUsers, setUpdatedUsers] = useState([]);
  const [isShowSaveConfirmModal, setIsShowSaveConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { state, actions } = useShapeContext();
  const { activeCanvas, isAnyChanges, currentUser, bgAssign, pdfModalType } =
    state;

  const currentUrl = location.pathname + location.search;
  const saveData = UseSaveData(true, true);
  const navigate = useNavigate(true);

  const handleShowModal = () => setShowModal(true);
  const handleHideModal = () => setShowModal(false);

  const handleCloseModal = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
  };

  const handleShowLoginModal = () => {
    setShowLoginModal(true);
    setShowSignupModal(false); // Close signup modal if it's open
  };

  const handleShowSignupModal = () => {
    setShowSignupModal(true);
    setShowLoginModal(false); // Close login modal if it's open
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setFile(file);
    filesPreview(file);
    if (file) {
      fileUpload(file);
    } else {
      return;
    }
  };

  // calling api for import to store images in database
  const fileUpload = async (fileData) => {
    let fileType = importFileType(fileData.type);
    let defaultType = "false";
    let PageID = activeCanvas.split("-")[1];
    let response = await headerFileImport(
      projectId,
      fileType,
      fileData,
      defaultType,
      PageID
    );
    if (response?.status === "success") {
      fetchImportImages();
      toast.success("Image imported successfully!");
      window.location.reload();
    }
  };

  const fetchImportImages = async () => {
    let response = await getHeaderFile(projectId);
    setImportData(response?.data);
  };

  useEffect(() => {
    fetchImportImages();
  }, [projectId]);

  const handleConfirmSave = async () => {
    try {
      setIsLoading(true);
      await saveData();
      handleLogoutFun(); //common logout function

      // Update the state to close the modal and stop loading
      setIsLoading(false);
      setIsShowSaveConfirmModal(false);
    } catch (error) {
      setIsLoading(false);
      toast.error("Failed to save data.");
    }
  };

  const handleSaveConfirmMOdalClose = () => {
    setIsShowSaveConfirmModal(false);
    handleLogoutFun();
  };

  const handleLogout = () => {
    // if any changes to save canvas
    if (isAnyChanges) {
      setIsShowSaveConfirmModal(true);
    } else if (!isAnyChanges) {
      handleLogoutFun();
    }
  };

  const handleLogoutFun = () => {
    localStorage.removeItem("AdminToken");
    localStorage.removeItem("UserId");
    toast.success("Logout successfully");
    navigate("/");
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
  };

  const handleShowShareModal = () => {
    setShowShareModal(true);
  };

  const handleShowAccessModal = (person, updatedUsers) => {
    setUpdatedUsers(updatedUsers);
    setSelectedPerson(person);
    setShowAccessModal(true);
    setShowShareModal(false); // Close ShareModal when opening AccessPeopleModal
  };

  const handleCloseAccessModal = () => {
    setShowAccessModal(false);
  };

  const handleBackToShareModal = () => {
    setShowAccessModal(false);
    setShowShareModal(true); // Show ShareModal when going back from AccessPeopleModal
  };

  const handleOpenPrintOffcanvas = () => {
    setShowPrintOffcanvas(true);
    setShowPdfPreviewModal(true);
  };
  // use open print modal on ctrl+p key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        ((event.ctrlKey && event.key === "p") ||
          (event.ctrlKey && event.key === "P")) &&
        !event.shiftKey
      ) {
        event.preventDefault(); // Prevent the default print dialog
        handleOpenPrintOffcanvas();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleClosePrintOffcanvas = () => {
    setShowPrintOffcanvas(false);
  };

  const handleSaveAs = () => {
    actions.saveAsModal(true);
  };

  const handleOpenProject = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf"; // Accept only PDF files

    // Add event listener for when a file is selected
    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file && file.type === "application/pdf") {
        actions.openProjectFromPDF({ isOpen: true, name: file.name });
      } else {
        console.log("Please select a valid PDF file.");
      }
    });

    // Trigger the file input click
    fileInput.click();
  };

  const [showTitle, setShowTitle] = useState("Header");
  const [dateRange, setDateRange] = useState("single");
  const [printDate, setPrintDate] = useState(
    localStorage.getItem("selecteDate")
  );
  const [printDateRange, setPrintDateRange] = useState([]);
  const handleHeader = (value) => {
    setShowTitle(value.target.value);
  };

  const canvasRef = useRef(null);

  const handlePrint = () => {
    handleClosePrintOffcanvas();
    setShowPdfPreviewModal(false);

    const canvas = canvasRef.current;
    if (canvas) {
      // Create a temporary container to hold the content to print
      const printContainer = document.createElement("div");
      printContainer.style.position = "absolute";
      printContainer.style.top = "-9999px"; // Move off-screen to prevent flicker
      printContainer.style.width = "210mm"; // Set to A4 width
      printContainer.style.height = "273mm"; // Set to A4 height
      printContainer.style.overflow = "hidden"; // Ensure no scrollbars

      // Create and style the header
      const header = document.createElement("div");
      header.style.position = "absolute";
      header.style.top = "1mm"; // Positioning from the top
      header.style.left = "0";
      header.style.width = "100%";
      header.style.textAlign = "center";
      header.style.zIndex = "10"; // Ensure it overlays the canvas
      if (showTitle === "Header") {
        header.innerHTML = `<p>${
          dateRange === "single" ? printDate : printDateRange
        }</p>`;
        printContainer.appendChild(header); // Append the header
      }

      // Create and style the footer
      const footer = document.createElement("div");
      footer.style.position = "absolute";
      footer.style.bottom = "1mm"; // Positioning from the bottom
      footer.style.left = "0";
      footer.style.width = "100%";
      footer.style.textAlign = "center";
      footer.style.zIndex = "10"; // Ensure it overlays the canvas
      if (showTitle === "Footer") {
        footer.innerHTML = `<p>${
          dateRange === "single" ? printDate : printDateRange
        }</p>`;
        printContainer.appendChild(footer); // Append the header
      }

      // Create an image element from the canvas
      const canvasImage = new Image();
      canvasImage.src = canvas.toDataURL("image/png"); // Convert canvas to image source
      canvasImage.style.maxWidth = "100%"; // Adjust width to fit container
      canvasImage.style.maxHeight = "100%"; // Adjust height to fit container
      canvasImage.style.position = "absolute";
      canvasImage.style.top = "0";
      canvasImage.style.left = "0";
      canvasImage.style.zIndex = "5"; // Ensure it is behind the header and footer

      // Append the canvas image, header, and footer to the container
      printContainer.appendChild(canvasImage); // Append the canvas image
      printContainer.appendChild(header); // Append the header
      printContainer.appendChild(footer); // Append the footer

      // Append the container to the body temporarily
      document.body.appendChild(printContainer);

      // Use html2canvas on the entire container
      html2canvas(printContainer)
        .then((canvasImage) => {
          const imageDataURL = canvasImage.toDataURL("image/png");
          printJS({
            printable: imageDataURL,
            type: "image",
            style: ".print { width: 100%; height: 100%; }",
            showModal: true,
          });

          // re-set canvas data for selected date
          let formattedDate = localStorage.getItem("selecteDate");
          actions.selectedCalendarDate(formattedDate);
          fetchCanvasData(formattedDate);

          // Remove the temporary container after printing
          document.body.removeChild(printContainer);
        })
        .catch((error) => {
          console.error("Error generating print content:", error);
          // Clean up in case of error
          document.body.removeChild(printContainer);
        });
    }
  };

  const { headers } = GlobalValues();

  const fetchCanvasData = async (getDate) => {
    try {
      const apiUrl = `project/projectById`;
      const payload = {
        projectID: projectId,
        calendarDate: getDate,
      };
      const response = await postApiCaller(apiUrl, payload, headers);
      const parsedData = parseApiResponse(response);
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

  const parseApiResponse = (response) => {
    const canvasObjects = [];
    const pages = response.pages.map((page) => ({
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
      ...response,
      pages,
    };
  };

  useEffect(() => {
    actions.bgAssign(false);
    actions.pdfModalType("");
  }, []);

  const handlePdfModal = (type) => {
    actions.bgAssign(true);
    actions.pdfModalType(type);
  };

  const getTodayDate = () => {
    const dates = new Date();
    const year = dates.getFullYear();
    const month = String(dates.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
    const date = String(dates.getDate()).padStart(2, "0"); // Pad single-digit dates
    return `${year}-${month}-${date}`;
  };

  const handleDefault = async () => {
    let bgId = localStorage.getItem("bgImageId");
    const pageId = activeCanvas.split("-")[1];
    let date = getTodayDate();
    let response = await unAssignBg(projectId, [date], pageId, bgId);
    if (response?.status === "success") {
      toast("Background set default successfully");
      fetchImportImages();
      actions.bgLoading(false);
      actions.bgAssign(false);
    }
  };

  return (
    <>
      <div className={`header py-0 sticky-top ${darkMode ? "dark-mode" : ""}`}>
        <div className="d-flex align-items-center px-3">
          <div className="d-flex align-items-center">
            <button
              className="hamburger bg-transparent border-0 ps-0"
              onClick={toggleSidebar}
            >
              <svg
                width="30"
                height="35"
                className=""
                viewBox="0 0 23 28"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 16H24.5"
                  stroke="var(--text-secondary)"
                  strokeLinecap="round"
                />
                <path
                  d="M7.5 20H24.5"
                  stroke="var(--text-secondary)"
                  strokeLinecap="round"
                />
                <path
                  d="M7.5 12H24.5"
                  stroke="var(--text-secondary)"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div className="brand-logo px-4 ms-2 d-flex align-items-center">
              <h1 className={`logoText mb-0 ${darkMode ? "dark-mode" : ""}`}>
                <img src={Logo} className="w-75 img-fluid" />
              </h1>
            </div>
          </div>
          <div className="col  d-flex align-items-center justify-content-between">
            {
              <div
                className={`d-flex  align-items-center mt-2}  `}
                style={{
                  visibility: !localStorage.getItem("AdminToken")
                    ? "hidden"
                    : "visible",
                }}
              >
                <Link to="/dashboard" className="home-link link-no-underline">
                  <h6
                    className={`mb-0 px-3 ps-0 menuTextHeader ${
                      darkMode ? "dark-mode" : ""
                    }`}
                  >
                    Home
                  </h6>
                </Link>

                <Dropdown
                  style={{ backgroundColor: "transparent", display: "flex" }}
                >
                  <Dropdown.Toggle
                    className={`menuTextHeader setFileBackGround py-0 ${
                      darkMode ? "dark-mode" : ""
                    }`}
                  >
                    File
                  </Dropdown.Toggle>

                  <Dropdown.Menu id="file-drp-menu">
                    <Dropdown.Item
                      className="ItemFile menuTextHeader"
                      onClick={handleShowModal}
                    >
                      New Project
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="ItemFile menuTextHeader"
                      onClick={() => handleOpenProject()}
                    >
                      Open Project
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="ItemFile menuTextHeader"
                      onClick={() => {
                        saveData();
                        actions.clearUndoRedo();
                      }}
                    >
                      Save
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="ItemFile menuTextHeader"
                      onClick={() => handleSaveAs()}
                    >
                      Save As
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="ItemFile menuTextHeader"
                      onClick={() => navigate("/dashboard")}
                    >
                      Close
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="ItemFile menuTextHeader"
                      onClick={handleOpenPrintOffcanvas}
                    >
                      Print
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="ItemFile menuTextHeader"
                      href="#/action-3"
                    >
                      Share
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="ItemFile menuTextHeader"
                      href="#/action-3"
                    >
                      Account
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="ItemFile menuTextHeader"
                      href="#/action-3"
                    >
                      Option
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown
                  style={{ backgroundColor: "transparent", display: "flex" }}
                >
                  <Dropdown.Toggle
                    className={`menuTextHeader setFileBackGround py-0 ${
                      darkMode ? "dark-mode" : ""
                    }`}
                  >
                    Background
                  </Dropdown.Toggle>

                  <Dropdown.Menu id="file-drp-menu">
                    <Dropdown.Item className="ItemFile menuTextHeader">
                      <div
                        style={{
                          display:
                            currentUrl !== `/editor/${projectId}`
                              ? "none"
                              : "block",
                        }}
                      >
                        <h6
                          className={`mb-0 menuTextHeader cursor-pointer ${
                            darkMode ? "dark-mode" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current.click();
                          }}
                        >
                          Import
                        </h6>
                      </div>
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="ItemFile menuTextHeader"
                      onClick={() => handlePdfModal("Assign Background")}
                    >
                      Assign
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="ItemFile menuTextHeader"
                      onClick={() => handlePdfModal("Unassign Background")}
                    >
                      Unassign
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="ItemFile menuTextHeader"
                      onClick={() => handlePdfModal("Replace Background")}
                    >
                      Replace
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="ItemFile menuTextHeader"
                      onClick={() => handleDefault()}
                    >
                      Set default
                    </Dropdown.Item>
                  </Dropdown.Menu>

                  <input
                    type="file"
                    accept="image/*, .pdf"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />
                </Dropdown>
                <h6
                  className={`mb-0 px-3 menuTextHeader ${
                    darkMode ? "dark-mode" : ""
                  }`}
                >
                  Edit
                </h6>

                <Dropdown
                  style={{ backgroundColor: "transparent", display: "flex" }}
                >
                  <Dropdown.Toggle
                    className={`menuTextHeader setFileBackGround py-0 ${
                      darkMode ? "dark-mode" : ""
                    }`}
                  >
                    View
                  </Dropdown.Toggle>

                  <Dropdown.Menu id="file-drp-menu">
                    <Dropdown.Item className="ItemFile menuTextHeader">
                      Zoom In
                    </Dropdown.Item>
                    <Dropdown.Item className="ItemFile menuTextHeader">
                      Zoom Out
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="ItemFile menuTextHeader"
                      onClick={() => {
                        saveData();
                        actions.clearUndoRedo();
                      }}
                    >
                      Rotate 90
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="ItemFile menuTextHeader"
                      onClick={() => handleSaveAs()}
                    >
                      Rotate 180
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown
                  style={{ backgroundColor: "transparent", display: "flex" }}
                >
                  <Dropdown.Toggle
                    className={`menuTextHeader setFileBackGround py-0 ${
                      darkMode ? "dark-mode" : ""
                    }`}
                  >
                    Help
                  </Dropdown.Toggle>

                  <Dropdown.Menu id="file-drp-menu">
                    <Dropdown.Item
                      className="ItemFile menuTextHeader"
                      onClick={() => navigate("/dashboard/privacypolicy")}
                    >
                      Privacy Policy
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="ItemFile menuTextHeader"
                      onClick={() => navigate("/dashboard/termsconditions")}
                    >
                      Terms Conditions
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="ItemFile menuTextHeader"
                      onClick={() => navigate("/dashboard/contactus")}
                    >
                      Contact Us
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            }

            <div className="avatarSection d-flex align-items-center">
              <div className="notificationSection d-flex align-items-center">
                {currentUser !== "1111111111" && (
                  <button
                    className="d-flex align-items-center justify-content-center btn btn-primary loginBtn1   mx-1 px-3"
                    onClick={handleShowShareModal}
                  >
                    Share
                  </button>
                )}{" "}
                <button
                  onClick={toggleTheme}
                  className="d-flex align-items-center justify-content-center btn btn-default notificationSectionIcon mx-1"
                >
                  {darkMode ? (
                    <img src={Dark} alt="defaultAvatar" />
                  ) : (
                    <img src={Light} alt="defaultAvatar" />
                  )}
                </button>
                {/* <button className="d-flex align-items-center justify-content-center btn btn-default notificationSectionIcon mx-1">
                  <img src={Notification} alt="defaultAvatar" />
                </button>{" "} */}
                <button className="d-flex align-items-center justify-content-center btn btn-default notificationSectionIcon mx-1">
                  <img src={Settings} alt="defaultAvatar" />
                </button>
                <button className="d-flex align-items-center justify-content-center btn btn-default notificationSectionIcon mx-1">
                  <img src={Notification} alt="defaultAvatar" />
                </button>{" "}
              </div>
              <div className="authSection d-flex">
                {!localStorage.getItem("AdminToken") && (
                  <button
                    className="btn btn-primary loginBtn1 mx-1 me-0"
                    onClick={handleShowLoginModal}
                  >
                    Login
                  </button>
                )}
                {localStorage.getItem("AdminToken") && (
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="default"
                      id="dropdown-basic"
                      className="btn btn-default bg-transparent avtButton"
                    >
                      <img
                        className="borderAvatar"
                        src={defaultAvatar}
                        height={40}
                        width={40}
                        alt="defaultAvatar"
                      />
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="w-auto">
                      <Dropdown.Item
                        href="/dashboard/profile"
                        className="px-4 text-start"
                      >
                        My Profile
                      </Dropdown.Item>
                      <Dropdown.Item
                        className="px-4 text-start"
                        onClick={handleLogout}
                      >
                        Logout
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddProjectModal show={showModal} onHide={handleHideModal} />

      <ShareModal
        show={showShareModal}
        handleClose={handleCloseShareModal}
        handleShowAccessModal={handleShowAccessModal}
      />
      <SaveConfirmModal
        show={isShowSaveConfirmModal}
        isLoading={isLoading}
        handleSave={handleConfirmSave}
        handleDontSave={handleSaveConfirmMOdalClose}
        handleClose={() => setIsShowSaveConfirmModal(false)}
      />
      <AccessPeopleModal
        show={showAccessModal}
        handleClose={handleCloseAccessModal}
        handleBackToShareModal={handleBackToShareModal}
        selectedPerson={selectedPerson}
        updatedUsers={updatedUsers}
      />
      <Login
        handleShowSignupModal={handleShowSignupModal}
        show={showLoginModal}
        handleClose={handleCloseModal}
        title="Modal heading"
        body="Woohoo, you are reading this text in a modal!"
        onClose={handleCloseModal}
        darkMode={darkMode}
      />

      <Signup
        show={showSignupModal}
        handleShowLoginModal={handleShowLoginModal}
        handleClose={handleCloseModal}
        title="Modal heading"
        body="Woohoo, you are reading this text in a modal!"
        onClose={handleCloseModal}
        darkMode={darkMode}
      />

      <PrintOffcanvas
        showPrintOffcanvas={showPrintOffcanvas}
        className="offcanvas-custom"
        handleClosePrintOffcanvas={handleClosePrintOffcanvas}
        setShowPdfPreviewModal={setShowPdfPreviewModal}
        handlePrint={handlePrint}
        handleHeader={handleHeader}
        setPrintDate={setPrintDate}
        setPrintDateRange={setPrintDateRange}
        dateRange={dateRange}
        setDateRange={setDateRange}
        showTitle={showTitle}
      />
      <PdfPreviewModal
        className="modal-custom"
        show={showPdfPreviewModal}
        canvasRef={canvasRef}
        showTitle={showTitle}
        onClose={() => setShowPdfPreviewModal(false)} // Handle closing of the PDF preview modal
      />
    </>
  );
}
