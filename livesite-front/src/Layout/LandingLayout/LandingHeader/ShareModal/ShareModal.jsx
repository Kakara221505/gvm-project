import React, { useState,useContext } from "react";
import { Modal, Form } from "react-bootstrap";
import AccessPeopleModal from "../AccessPeopleModal/AccessPeopleModal";
import "./ShareModal.css";
import defaultAvatar from "../../../../Assets/Images/_userShare.png";
import attach from "../../../../Assets/Images/link-05.png";
import { ThemeContext } from "../../../../Theme/ThemeContext";

const ShareModal = ({ show, handleClose, handleShowAccessModal }) => {
    const { theme } = useContext(ThemeContext);

  const handleDone = () => {
    handleClose(); // Close ShareModal
    handleShowAccessModal(); // Open AccessPeopleModal
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered dialogClassName={theme}>
        <Modal.Header closeButton     className='commonModalBg'>
          <Modal.Title className="px-2 fw-semibold menuTextHeader">
            Share Live Site - PDF Editor
          </Modal.Title>
        </Modal.Header>
        <Modal.Body     className='commonModalBg'>
          <div className="py-2">
            <Form.Control
              className="shareText  py-3 px-3"
              placeholder="Add People..."
              type="text"
              id="inputPeople"
              aria-describedby="peopleHelpBlock"
            />
          </div>

          {/* People with access */}
          <div className="peoplewithaccess py-3 pt-0">
            <div className="py-3">
              <span className="fw-semibold yellowText">People with access</span>
            </div>
            {/* Example entry */}
            <div className="py-2">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <img
                    src={defaultAvatar}
                    className="img-fluid px-2"
                    alt="Avatar"
                  />
                  <div className="">
                    <div className="fw-semibold yellowText">UI August</div>
                    <div className="yellowText ">username@gmail.com</div>
                  </div>
                </div>
                <div className="fw-semibold yellowText">Owner</div>
              </div>
            </div>
          </div>

          {/* General access */}
          <div className="peoplewithaccess py-3 pt-0">
            <div className="py-3 pt-2">
              <span className="fw-semibold yellowText">General access</span>
            </div>
            {/* Example entry */}
            <div className="py-2">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <img
                    src={defaultAvatar}
                    className="img-fluid px-2"
                    alt="Avatar"
                  />
                  <div className="">
                    <div className="fw-semibold yellowText">UI August</div>
                    <div className="yellowText">username@gmail.com</div>
                  </div>
                </div>
                <Form.Select
               
                  className="w-auto border-0 fw-semibold"
                  aria-label="Default select example"
                >
                  <option className="fw-semibold">Editor</option>
                  <option className="fw-semibold" value="1">
                    One
                  </option>
                  <option className="fw-semibold" value="2">
                    Two
                  </option>
                  <option className="fw-semibold" value="3">
                    Three
                  </option>
                </Form.Select>
              </div>
            </div>
          </div>

          {/* Copy Link and Done button */}
          <div className="d-flex justify-content-between py-3">
            <div className="">
              <button className="fs-6 bg-transparent copyTextBrder rounded-5 py-1 px-3">
                <img
                  src={attach}
                  className="img-fluid px-1 ps-0 fillImg1"
                  alt="Attachment"
                />
                Copy Link
              </button>
            </div>
            <div className="">
              <button
                className="fs-6 loginBtn1 btn btn-primary px-4 py-2 rounded-2"
                onClick={handleDone} // Ensure this onClick handler is correctly set
              >
                DONE
              </button>
            </div>
          </div>
        </Modal.Body>

        {/* AccessPeopleModal */}
        {/* AccessPeopleModal */}
      </Modal>
    </>
  );
};

export default ShareModal;
