import React, { useState,useContext } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from "../../../../Theme/ThemeContext";

export default function AddProjectModal({ show, onHide }) {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const handleProjectNameChange = (e) => {
    setProjectName(e.target.value);
    // Reset name error message when user starts typing
    setNameError("");
  };

  const handleProjectDescriptionChange = (e) => {
    setProjectDescription(e.target.value);
  };

  const handleAddProject = async () => {
    if (!projectName) {
      setNameError("Project name is required.");
      return;
    }

    try {
      const token = localStorage.getItem("AdminToken");
      const userId = localStorage.getItem("UserID"); // Get UserID from localStorage
      const response = await axios.post(
        `${process.env.REACT_APP_PUBLIC_BASE_URL}project/add_project`,
        {
          UserID: userId,
          Name: projectName,
          Description: projectDescription,
          BackGroundColor: "Red", // Set default background color
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { projectID } = response.data;
      // Handle success
      toast.success('Project added successfully')
      // Close the modal
      onHide();
      navigate(`/editor/${projectID}`);
  
    } catch (error) {
      // Handle errors (e.g., display toast error message)
      console.error("Error adding project:", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred while adding the project.");
      }
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName={theme}>
      <Modal.Header      className='commonModalBg px-4' closeButton >
        <Modal.Title className='menuTextHeader'>Create Project</Modal.Title>
      </Modal.Header>
      <Modal.Body className='commonModalBg px-4'>
        <div className="form-group py-2 pt-0">
          <label htmlFor="formGroupExampleInput" className="my-1 yellowText">
            Project Name
          </label>
          <input
            type="text"
            className={`form-control ${nameError ? 'is-invalid' : ''}`}
            id="formGroupExampleInput"
            placeholder="Project Name"
            value={projectName}
            onChange={handleProjectNameChange}
          />
          {nameError && <div className="invalid-feedback">{nameError}</div>}
        </div>
        <div className="form-group py-2">
          <label htmlFor="exampleFormControlTextarea1" className="yellowText my-1">
            Project Description
          </label>
          <textarea
            className="form-control"
            id="exampleFormControlTextarea1"
            rows="3"
            value={projectDescription}
            onChange={handleProjectDescriptionChange}
          ></textarea>
        </div>
      </Modal.Body>
      <Modal.Footer className='commonModalBg '>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" className='loginBtn1' onClick={handleAddProject}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
