// AccessPeopleModal.jsx

import React,{useContext} from "react";
import { Modal,  Button, Form } from "react-bootstrap";
import backIco from "../../../../Assets/Images/backIcon.png";
import closeIco from "../../../../Assets/Images/cancel-01.png";
import attach from "../../../../Assets/Images/link-05.png";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import InputGroup from "react-bootstrap/InputGroup";
import { BsCaretdownFill } from "react-icons/bs"; // Import the caret down icon from react-icons library
import { ThemeContext } from "../../../../Theme/ThemeContext";

import "../ShareModal/ShareModal.css";
const AccessPeopleModal = ({ show, handleClose, handleBackToShareModal }) => {

  const { theme } = useContext(ThemeContext);

    
  return (
    <Modal show={show} onHide={handleClose} centered dialogClassName={theme}>
      <Modal.Header className='commonModalBg' closeButton>
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
      <Modal.Body className='commonModalBg'>
        <div className="peoplewithaccess py-3 pt-0">
          <div className="py-2">
            <InputGroup className="mb-3">
              <div
                className="w-75 shareText1 bodm py-3 px-3 border-1"
                aria-label="Text input with dropdown button"
              >
                <div className="border chipTxt d-flex align-items-center border-black rounded-5 p-1 px-3">
                  John Doe
                  <img
                    className="cursor-pointer px-1"
                    width={27}
                    height={20}
                    src={closeIco}
                    alt="jd"
                  />
                </div>
              </div>
              <DropdownButton
                className="rounded-start-0 px-5"
                title={
                  <>
                    Editor <i className="	fa fa-angle-down ms-3" />{" "}
                    {/* Adding the caret down icon */}
                  </>
                }
                id="input-group-dropdown-1"
              >
                <Dropdown.Item href="#">Action</Dropdown.Item>
                <Dropdown.Item href="#">Another action</Dropdown.Item>
                <Dropdown.Item href="#">Something else here</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item href="#">Separated link</Dropdown.Item>
              </DropdownButton>
            </InputGroup>
          </div>
          <div className="py-2">
            <Form.Check // prettier-ignore
              className="yellowText"
              type="checkbox"
              id="1"
              label="Notify people"
            />
          </div>
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
              />
            </Form.Group>
          </div>
        </div>

        <div className="d-flex justify-content-between">
          <div className="">
            <button className="btn btn-default fillImg1 border-0 rounded-5 text-primary px-4">
              <img src={attach} className="img-fluid px-1 ps-0" alt="f" />
            </button>
          </div>
          <div className="">
            <button className="fs-6 btn btn-default px-4 py-2 rounded-2 yellowText">
              CANCEL
            </button>
            <button className="fs-6 btn btn-primary px-4 py-2 rounded-2 loginBtn1">
              SEND
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AccessPeopleModal;
