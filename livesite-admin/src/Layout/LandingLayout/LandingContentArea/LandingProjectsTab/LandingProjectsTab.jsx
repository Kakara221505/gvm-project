import { useContext, useEffect, useState } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import "./LandingProjectsTab.css"; // Import the CSS file
import { useShapeContext } from "../../../../contexts/shapeContext";
import { Link, useNavigate } from "react-router-dom";
import { getApiCaller } from "../../../../Lib/apiCaller";
import { GlobalValues } from "../../../../Lib/GlobalValues";
import Cards from "../../../../Components/Cards/Cards";
import { ThemeContext } from "../../../../Theme/ThemeContext";
import placeholderImage from "../../../../Assets/Images/pdfLarge.png";
import placeholderImageDark from "../../../../Assets/Images/pdfLargeDark.png";

function LandingProjectsTab() {
  const { state } = useShapeContext();
  const [key, setKey] = useState(
    state.userType === "ORGANIZATION" ? "created" : "accessible"
  );
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { activeCanvas, headers, projectId, userID } = GlobalValues();
  const navigate = useNavigate();
  const darkMode = theme === "light-theme" ? false : true;

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setProjects([]);
    const token = localStorage.getItem("AdminToken");
    if (token) {
      const fetchProjects = async () => {
        const apiUrl = `organization/project/${
          key === "created"
            ? "getAllOwnProject"
            : key === "organization"
            ? "getAllOrganizationProject"
            : "getAllAccessableProject"
        }`;
        try {
          const response = await getApiCaller(apiUrl, headers);
          setProjects(response?.projects || []);
        } catch (error) {
          console.error("Error fetching projects:", error);
          if (error.response && error.response.status === 401) {
            navigate("/");
          }
        } finally {
          setLoading(false);
        }
      };

      fetchProjects();
    } else {
      setLoading(false);
    }
  }, [key]);

  function formatDate(inputDate) {
    const date = new Date(inputDate);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  return (
    <section className="px-3 py-2">
      <div className="d-flex justify-content-between align-items-center pb-4">
        <div className="d-flex flex-column">
          <h3 className="text-start menuTextHeader">Projects</h3>
          {/* <small className="text-secondary d-block text-start">
            Lorem ipsum dolor sit amet, consectetur.
          </small> */}
        </div>
      </div>
      <Tabs
        id="landing-projects-tabs"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-3 border-bottom-0"
      >
        {state.userType !== "External_User" && (
          <Tab eventKey="created" title="Created Projects">
            <div className="transparent-tab-content">
              {/* <h4 className="menuTextHeader">Created Projects</h4> */}
            </div>
          </Tab>
        )}
        {state.userType !== "External_User" &&
          state.userType !== "Basic_User" && (
            <Tab eventKey="organization" title="Organization Projects">
              <div className="transparent-tab-content">
                {/* <h4 className="menuTextHeader">Organization Projects</h4> */}
              </div>
            </Tab>
          )}
        {state.userType !== "ORGANIZATION" && <Tab eventKey="accessible" title="Accessible Projects">
          <div className="transparent-tab-content">
            {/* <h4 className="menuTextHeader">Accessible Projects</h4> */}
          </div>
        </Tab>}
      </Tabs>
      <hr></hr>
      <div>
        {loading && (
          <div className="text-center menuTextHeader">Loading...</div>
        )}
        {!loading && projects.length === 0 && (
          <div className="text-center menuTextHeader">No projects found</div>
        )}
        <div className="row py-4">
          {projects.map((project) => (
            <div key={project.ID} className="col-lg-2 my-3">
              {state.userType === "Basic_User" && key === "organization" ? (
                <div className="home-link-disabled">
                  <Cards
                    imageSrc={
                      darkMode ? placeholderImageDark : placeholderImage
                    }
                    imageAlt={project.Name}
                    title={project.Name}
                    darkMode={darkMode}
                    transparent={true}
                  />
                </div>
              ) : (
                <Link
                  to={`/editor/${project.ID}`}
                  className="home-link link-no-underline"
                  onClick={() => {
                    localStorage.setItem("CalendarDate", project?.Created_at);
                  }}
                >
                  <Cards
                    imageSrc={
                      darkMode ? placeholderImageDark : placeholderImage
                    }
                    imageAlt={project.Name}
                    title={project.Name}
                    text={`Created ${formatDate(project.Created_at)}`}
                    darkMode={darkMode}
                    transparent={true}
                  />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LandingProjectsTab;
