// AccessPeopleModal.jsx

import React, { useContext, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import backIco from "../../../../Assets/Images/backIcon.png";
import closeIco from "../../../../Assets/Images/cancel-01.png";
import attach from "../../../../Assets/Images/link-05.png";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import InputGroup from "react-bootstrap/InputGroup";
import { BsCaretdownFill } from "react-icons/bs"; // Import the caret down icon from react-icons library
import { ThemeContext } from "../../../../Theme/ThemeContext";
import { GlobalValues } from "../../../../Lib/GlobalValues";

import "../ShareModal/ShareModal.css";
import { postApiCaller } from "../../../../Lib/apiCaller";
import { toast } from "react-toastify";
const AccessPeopleModal = ({
  show,
  handleClose,
  handleBackToShareModal,
  selectedPerson,
  updatedUsers,
}) => {
  const { activeCanvas, headers, projectId, userID } = GlobalValues();
  const { theme } = useContext(ThemeContext);
  const [selectedType, setSelectedType] = useState("view");
  const [message, setMessage] = useState("");

  const handleSelect = (eventKey) => {
    setSelectedType(eventKey);
  };

  const handleSend = () => {
    const newUser_access = {
      UserID: selectedPerson?.ID,
      Type: selectedType,
      Is_Email: true,
      message: message,
      Email: selectedPerson.Email,
      Name: selectedPerson.First_name,
    };

    let userExists = updatedUsers.find(
      (user) => user.UserID === newUser_access.UserID
    );
    if (userExists) {
      userExists.message = message;
      userExists.Type === selectedType
        ? (userExists.Is_Email = false)
        : (userExists.Is_Email = true);
      userExists.Type = selectedType;
    } else {
      updatedUsers.push(newUser_access);
    }

    const payload = {
      UserID: userID,
      ProjectID: projectId,
      User_access: updatedUsers,
    };

    // Make the POST request to update the share settings
    postApiCaller("share/add_update-share", payload, headers)
      .then((response) => {
        // console.log("Share settings updated successfully:", response);
      })
      .catch((error) => {
        console.error("Error updating share settings:", error);
      });

    // // Close the modal
    handleClose();
  };

  const handleCopyLink = () => {
    // Get the current URL
    const currentUrl = window.location.href;

    // Copy the URL to the clipboard
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        toast.success("Link copied!");
      })
      .catch((err) => {
        toast.error("Failed to copy link");
      });
  };

  const getTitle = () => {
    switch (selectedType) {
      case "admin":
        return "Admin";
      case "user":
        return "User";
      case "view":
        return "View";
      case "edit":
        return "Edit";
      default:
        return "Select Type"; // Fallback title
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered dialogClassName={theme}>
      <Modal.Header className="commonModalBg" closeButton>
        <Modal.Title className=" fw-semibold menuTextHeader">
          <img
            src={backIco}
            onClick={handleBackToShareModal}
            className="img-fluid fillImg1 px-2 cursor-pointer"
            alt="f"
          />
          Share Live Site - PDF Editor
        </Modal.Title>
      </Modal.Header>
      {selectedPerson && (
        <Modal.Body className="commonModalBg">
          <div className="peoplewithaccess py-3 pt-0">
            <div className="py-2">
              <InputGroup className="mb-3">
                <div
                  className="w-75 shareText1 bodm py-3 px-3 border-1"
                  aria-label="Text input with dropdown button"
                >
                  {/* <div className="border chipTxt d-flex align-items-center border-black rounded-5 p-1 px-3"> */}
                  {selectedPerson.First_name}
                  {/* <img
                    className="cursor-pointer px-1"
                    width={27}
                    height={20}
                    src={closeIco}
                    alt="jd"
                  /> */}
                </div>
                {/* </div> */}
                <DropdownButton
                  className="rounded-start-0 px-5"
                  title={
                    <>
                      {/* {selectedType === "view" ? "Viewer" : "Editor"} */}
                      {getTitle()}
                      <i className="fa fa-angle-down ms-3" />
                    </>
                  }
                  id="input-group-dropdown-1"
                  onSelect={handleSelect}
                >
                  <Dropdown.Item eventKey="admin">Admin</Dropdown.Item>
                  <Dropdown.Item eventKey="user">User</Dropdown.Item>
                  <Dropdown.Item eventKey="view">Viewer</Dropdown.Item>
                  <Dropdown.Item eventKey="edit">Editor</Dropdown.Item>
                </DropdownButton>
              </InputGroup>
            </div>
            {/* <div className="py-2">
              <Form.Check // prettier-ignore
                className="yellowText"
                type="checkbox"
                id="1"
                label="Notify people"
              />
            </div> */}
            <div className="py-2">
              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlTextarea1"
              >
                <Form.Control
                  as="textarea"
                  className="border border-black"
                  placeholder="Lorem ipsum, graphic or web designs."
                  rows={3}
                  onChange={(e) => setMessage(e.target.value)}
                  value={message}
                />
              </Form.Group>
            </div>
          </div>

          <div className="d-flex justify-content-between">
            <div className="">
              <button
                className="btn btn-default fillImg1 border-0 rounded-5 text-primary px-4"
                onClick={handleCopyLink}
              >
                <img src={attach} className="img-fluid px-1 ps-0" alt="f" />
              </button>
            </div>
            <div className="">
              <button
                className="fs-6 btn btn-default px-4 py-2 rounded-2 yellowText"
                onClick={handleBackToShareModal}
              >
                CANCEL
              </button>
              <button
                className="fs-6 btn btn-primary px-4 py-2 rounded-2 loginBtn1"
                onClick={handleSend}
              >
                SEND
              </button>
            </div>
          </div>
        </Modal.Body>
      )}
    </Modal>
  );
};

export default AccessPeopleModal;
