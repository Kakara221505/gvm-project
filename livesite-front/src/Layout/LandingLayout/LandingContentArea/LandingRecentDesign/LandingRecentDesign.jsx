import React, { useState, useContext, useEffect } from "react";
import { ThemeContext } from "../../../../Theme/ThemeContext";
import placeholderImage from "../../../../Assets/Images/pdfLarge.png";
import placeholderImageDark from "../../../../Assets/Images/pdfLargeDark.png";
import Cards from "../../../../Components/Cards/Cards";
import placeholderImage1 from "../../../../Assets/Images/pdfSmall.png";
import placeholderImageDark1 from "../../../../Assets/Images/pdfSmallDark.svg";
import NoProjectFound from "../../../../Assets/Images/noVec.svg";

import "./LandingRecentDesign.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
// import AddProjectModal from "./AddProjectModal/AddProjectModal";
export default function LandingProjects({ toggleProjectPage, darkMode }) {
  // State to track the current view mode
  const [viewMode, setViewMode] = useState("grid");
  const { theme } = useContext(ThemeContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    // Fetch project data from the API only if token is present
    const token = localStorage.getItem("AdminToken");
    if (token) {
      const fetchProjects = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_PUBLIC_BASE_URL}project/get_project_all_data`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setProjects(response.data.data);
        } catch (error) {
          console.error("Error fetching projects:", error);
          if (error.response && error.response.status === 401) {
            // Redirect to "/" if unauthorized
            navigate("/");
          }
        } finally {
          setLoading(false); // Set loading to false after API call completes
        }
      };

      fetchProjects();
    } else {
      // If token is not present, set loading to false
      setLoading(false);
    }
  }, []);

  function formatDate(inputDate) {
    const date = new Date(inputDate);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  const imageSource =
    theme === "light-theme" ? placeholderImage1 : placeholderImageDark1;

  // Generating an array of 30 elements for rendering 30 cards
  const cardData = Array.from({ length: 30 }, (_, index) => ({
    id: index,
    imageSrc: theme === "light-theme" ? placeholderImage : placeholderImageDark,
    imageAlt: `Card ${index + 1} image`,
    title: `Untitled Design ${index + 1}`,
    text: "2 Hours Ago",
  }));

  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => setShowModal(true);
  const handleHideModal = () => setShowModal(false);

  // Function to toggle between grid and list view
  const toggleView = (mode) => {
    setViewMode(mode);
  };
  return (
    <div className="recentDesignCards py-3 px-3">
        {loading && <div className="text-center menuTextHeader">Loading...</div>}
        {!loading && projects.length > 0 && (
      <div className="d-flex justify-content-between py-3 pt-0 align-items-center">
        <div className="d-flex align-items-center">
          <h5
            className={`text-start menuTextHeader mb-0  fw-bold ${darkMode ? "dark-mode" : ""
              }`}
            >
              Recent Design
            </h5>
          </div>
          <div className="d-flex justify-content-end mb-3">
            {/* <button className="btn btn-primary mx-3"  onClick={handleShowModal}><i className="fa fa-plus px-1 "/>Add Project</button> */}

            <div
              className={`px-2 cursor-pointer ${
                viewMode === "grid" ? "activeRecent" : ""
              }`}
              onClick={() => toggleView("grid")}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 18C2 16.4596 2 15.6893 2.34673 15.1235C2.54074 14.8069 2.80693 14.5407 3.12353 14.3467C3.68934 14 4.45956 14 6 14C7.54044 14 8.31066 14 8.87647 14.3467C9.19307 14.5407 9.45926 14.8069 9.65327 15.1235C10 15.6893 10 16.4596 10 18C10 19.5404 10 20.3107 9.65327 20.8765C9.45926 21.1931 9.19307 21.4593 8.87647 21.6533C8.31066 22 7.54044 22 6 22C4.45956 22 3.68934 22 3.12353 21.6533C2.80693 21.4593 2.54074 21.1931 2.34673 20.8765C2 20.3107 2 19.5404 2 18Z"
                  stroke={
                    viewMode === "grid"
                      ? "var(--primary-sidebar)"
                      : "var(--text-secondary)"
                  }
                />
                <path
                  d="M14 18C14 16.4596 14 15.6893 14.3467 15.1235C14.5407 14.8069 14.8069 14.5407 15.1235 14.3467C15.6893 14 16.4596 14 18 14C19.5404 14 20.3107 14 20.8765 14.3467C21.1931 14.5407 21.4593 14.8069 21.6533 15.1235C22 15.6893 22 16.4596 22 18C22 19.5404 22 20.3107 21.6533 20.8765C21.4593 21.1931 21.1931 21.4593 20.8765 21.6533C20.3107 22 19.5404 22 18 22C16.4596 22 15.6893 22 15.1235 21.6533C14.8069 21.4593 14.5407 21.1931 14.3467 20.8765C14 20.3107 14 19.5404 14 18Z"
                  stroke={
                    viewMode === "grid"
                      ? "var(--primary-sidebar)"
                      : "var(--text-secondary)"
                  }
                />
                <path
                  d="M2 6C2 4.45956 2 3.68934 2.34673 3.12353C2.54074 2.80693 2.80693 2.54074 3.12353 2.34673C3.68934 2 4.45956 2 6 2C7.54044 2 8.31066 2 8.87647 2.34673C9.19307 2.54074 9.45926 2.80693 9.65327 3.12353C10 3.68934 10 4.45956 10 6C10 7.54044 10 8.31066 9.65327 8.87647C9.45926 9.19307 9.19307 9.45926 8.87647 9.65327C8.31066 10 7.54044 10 6 10C4.45956 10 3.68934 10 3.12353 9.65327C2.80693 9.45926 2.54074 9.19307 2.34673 8.87647C2 8.31066 2 7.54044 2 6Z"
                  stroke={
                    viewMode === "grid"
                      ? "var(--primary-sidebar)"
                      : "var(--text-secondary)"
                  }
                />
                <path
                  d="M14 6C14 4.45956 14 3.68934 14.3467 3.12353C14.5407 2.80693 14.8069 2.54074 15.1235 2.34673C15.6893 2 16.4596 2 18 2C19.5404 2 20.3107 2 20.8765 2.34673C21.1931 2.54074 21.4593 2.80693 21.6533 3.12353C22 3.68934 22 4.45956 22 6C22 7.54044 22 8.31066 21.6533 8.87647C21.4593 9.19307 21.1931 9.45926 20.8765 9.65327C20.3107 10 19.5404 10 18 10C16.4596 10 15.6893 10 15.1235 9.65327C14.8069 9.45926 14.5407 9.19307 14.3467 8.87647C14 8.31066 14 7.54044 14 6Z"
                  stroke={
                    viewMode === "grid"
                      ? "var(--primary-sidebar)"
                      : "var(--text-secondary)"
                  }
                />
              </svg>
            </div>
            <div
              className={`px-2 cursor-pointer ${
                viewMode === "list" ? "activeRecent" : ""
              }`}
              onClick={() => toggleView("list")}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 5L20 5"
                  stroke={
                    viewMode === "list"
                      ? "var(--primary-sidebar)"
                      : "var(--text-secondary)"
                  }
                  strokeLinecap="round"
                />
                <path
                  d="M4 5H4.00898"
                  stroke={
                    viewMode === "list"
                      ? "var(--primary-sidebar)"
                      : "var(--text-secondary)"
                  }
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 12H4.00898"
                  stroke={
                    viewMode === "list"
                      ? "var(--primary-sidebar)"
                      : "var(--text-secondary)"
                  }
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 19H4.00898"
                  stroke={
                    viewMode === "list"
                      ? "var(--primary-sidebar)"
                      : "var(--text-secondary)"
                  }
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 12L20 12"
                  stroke={
                    viewMode === "list"
                      ? "var(--primary-sidebar)"
                      : "var(--text-secondary)"
                  }
                  strokeLinecap="round"
                />
                <path
                  d="M8 19L20 19"
                  stroke={
                    viewMode === "list"
                      ? "var(--primary-sidebar)"
                      : "var(--text-secondary)"
                  }
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      )}
      {/* Conditionally render grid view or list view section */}
      {viewMode === "grid" && (
        <div className="row py-4">
          {projects.map((project) => (
            <div key={project.ID} className="col-lg-2 my-3">
              <Link
                to={`/editor/${project.ID}`}
                className="home-link link-no-underline"
                onClick={() =>
                  localStorage.setItem("CalendarDate", project?.CalendarDate)
                }
              >
                <Cards
                  imageSrc={darkMode ? placeholderImageDark : placeholderImage}
                  imageAlt={project.Name}
                  title={project.Name}
                  text={`Created ${formatDate(project.Created_at)}`} // Format the created date
                  darkMode={darkMode}
                  transparent={true}
                />
              </Link>
            </div>
          ))}
        </div>
      )}
      {viewMode === "list" && (
        <div>
          <div className="row">
            <div className="col-lg-12">
              <table className="table table-image bg-transparent">
                <thead className="bg-transparent">
                  <tr className="border-0">
                    <th
                      className="lightText fw-bold text-start px-3 bg-transparent"
                      scope="col"
                    >
                      Name
                    </th>
                    <th
                      className="lightText fw-normal bg-transparent"
                      scope="col"
                    >
                      Recent
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.ID} className="border-0">
                      <td className="w-25 lightText text-start bg-transparent">
                        <Link
                          to={`/editor/${project.ID}`}
                          className="home-link link-no-underline"
                        >
                          <img
                            src={imageSource}
                            className="img-fluid bg-transparent img-thumbnail border-0"
                            alt={project.Name}
                          />
                          <span className="tdKLi  px-3 mb-0 pb-0">
                            {project.Name}
                          </span>
                        </Link>
                      </td>
                      <td className="tdKLi py-4 bg-transparent lightText">
                        <span className="tdKLi px-3 mb-0 pb-0">
                          Created {formatDate(project.Created_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* <AddProjectModal show={showModal} onHide={handleHideModal} /> */}
      {!loading && projects.length === 0 && (
        <div className="row">
          <div className="col-lg-12">
            <img
              className="d-flex NoProjectFound justify-content-center w-25 m-auto align-items-center mt-5 pt-5"
              src={NoProjectFound}
              alt="NoProjectFound"
            />
            <h2
              className={`pt-4 ${
                theme === "light-theme" ? "text-black" : "text-warning"
              }`}
            >
              No Projects Found
            </h2>
          </div>
        </div>
      )}
    </div>
  );
}
