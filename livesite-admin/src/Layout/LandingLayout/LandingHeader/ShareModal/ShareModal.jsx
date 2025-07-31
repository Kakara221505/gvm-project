import React, { useState, useContext, useEffect } from "react";
import { Modal, Form } from "react-bootstrap";
import AccessPeopleModal from "../AccessPeopleModal/AccessPeopleModal";
import "./ShareModal.css";
import defaultAvatar from "../../../../Assets/Images/_userShare.png";
import attach from "../../../../Assets/Images/link-05.png";
import { ThemeContext } from "../../../../Theme/ThemeContext";
import { getApiCaller, postApiCaller } from "../../../../Lib/apiCaller";
import { GlobalValues } from "../../../../Lib/GlobalValues";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ShareModal = ({ show, handleClose, handleShowAccessModal }) => {
  const { activeCanvas, headers, projectId, userID } = GlobalValues();
  const { theme } = useContext(ThemeContext);
  const [people, setPeople] = useState([]);
  const [authorizedUsers, setAuthorizedUsers] = useState([]);
  const [ownerDetails, setOwnerDetails] = useState();
  const [updatedUsers, setUpdatedUsers] = useState([]);

  useEffect(() => {
    // Fetch all authorized users when the modal is opened
    if (show) {
      getApiCaller(`share/get_share_all_data?ProjectID=${projectId}`, headers)
        .then((data) => {
          setAuthorizedUsers(data?.shares?.[0]?.User_access || []);
          setUpdatedUsers(data?.shares?.[0]?.User_access || []);
        })
        .catch((error) => {
          console.error("Error fetching authorized users:", error);
        });

      getApiCaller(`users/${userID}`, headers)
        .then((data) => {
          setOwnerDetails(data?.user);
        })
        .catch((error) => {
          console.error("Error fetching authorized users:", error);
        });
    }
    setPeople([]);
  }, [show]);

  const handleASearchPeople = (e) => {
    const searchQuery = e.target.value;
    if (searchQuery !== "") {
      getApiCaller(`users/getAllUserListShare?search=${searchQuery}`, headers)
        .then((data) => {
          setPeople(data?.users || []);
        })
        .catch((error) => {
          console.error("Error fetching users:", error);
        });
    } else {
      setPeople([]);
    }
  };

  const handleCopyLink = () => {
    const linkToCopy = `${window.location.origin}/project/${projectId}/share`;

    navigator.clipboard
      .writeText(linkToCopy)
      .then(() => {
        toast.success("Link copied!");
      })
      .catch((err) => {
        toast.error("Failed to copy link");
        console.error("Error copying link:", err);
      });
  };

  const handleAddPeople = (person) => {
    handleShowAccessModal(person, authorizedUsers);
  };

  const handleChangePermission = (userId, newType) => {
    const updatedList = updatedUsers.map((user) => {
      if (user.UserID === userId && user.Type !== newType) {
        return { ...user, Type: newType, Is_Email: true };
      } else if (user.UserID === userId) {
        return { ...user, Type: newType, Is_Email: false };
      } else {
        return { ...user };
      }
      // return user;
    });
    setUpdatedUsers(updatedList);
  };

  const handleDone = () => {
    const payload = {
      UserID: userID,
      ProjectID: projectId,
      User_access: updatedUsers,
    };

    // Make the POST request to update the share settings
    postApiCaller("share/add_update-share", payload, headers)
      .then((response) => {
        // console.log("Share settings updated successfully:", response);
        setAuthorizedUsers(updatedUsers);
      })
      .catch((error) => {
        console.error("Error updating share settings:", error);
      });

    // Close the modal
    handleClose();
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered dialogClassName={theme}>
        <Modal.Header closeButton className="commonModalBg">
          <Modal.Title className="px-2 fw-semibold menuTextHeader">
            Share Live Site - PDF Editor
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="commonModalBg">
          <div className="py-2">
            <Form.Control
              className="shareText py-3 px-3"
              placeholder="Add People..."
              type="text"
              id="inputPeople"
              aria-describedby="peopleHelpBlock"
              onChange={handleASearchPeople}
            />
          </div>

          {/* Container for searched people with scrolling */}
          {people.length > 0 && (
            <div className="search-results-container py-3 pt-0">
              <div className="py-3">
                <span className="fw-semibold yellowText">Search Results</span>
              </div>
              <div className="search-results-scroll">
                {people.map((person) => (
                  <div className="py-2" key={person.id}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <img
                          src={defaultAvatar}
                          className="img-fluid px-2"
                          alt="Avatar"
                        />
                        {/* <Avatar
                          name={person.First_name}
                          className="img-fluid px-2"
                          alt="Avatar"
                        /> */}
                        <div>
                          <div className="fw-semibold yellowText">
                            {person.First_name}(
                            {person.User_type === 2 ? "Organization" : "User"})
                          </div>
                          <div className="yellowText ">{person.Email}</div>
                        </div>
                      </div>
                      <button
                        className="fw-semibold yellowText"
                        onClick={() => handleAddPeople(person)}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Display people with access */}
          <div className="peoplewithaccess py-3 pt-0">
            <div className="py-3">
              <span className="fw-semibold yellowText">People with access</span>
            </div>
            <div className="py-2">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <img
                    src={defaultAvatar}
                    className="img-fluid px-2"
                    alt="Avatar"
                  />
                  <div>
                    <div className="fw-semibold yellowText">
                      {ownerDetails?.First_name}
                    </div>
                    <div className="yellowText">{ownerDetails?.Email}</div>
                  </div>
                </div>
                <div className="fw-semibold yellowText">Owner</div>
              </div>
            </div>
            {authorizedUsers.map((user) => (
              <div className="py-2" key={user.id}>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <img
                      src={defaultAvatar}
                      className="img-fluid px-2"
                      alt="Avatar"
                    />
                    <div>
                      <div className="fw-semibold yellowText">{user.Name}</div>
                      <div className="yellowText">{user.Email}</div>
                    </div>
                  </div>
                  <Form.Select
                    className="w-auto border-0 fw-semibold"
                    aria-label="Default select example"
                    defaultValue={user.Type}
                    onChange={(e) =>
                      handleChangePermission(user.UserID, e.target.value)
                    }
                  >
                   <option className="fw-semibold" value="admin">
                      Admin
                    </option>
                    <option className="fw-semibold" value="user">
                      User
                    </option>
                    <option className="fw-semibold" value="view">
                      Viewer
                    </option>
                    <option className="fw-semibold" value="edit">
                      Editor
                    </option>
                    <option className="fw-semibold" value="remove">
                      Remove access
                    </option>
                  </Form.Select>
                </div>
              </div>
            ))}
          </div>

          {/* Copy Link and Done button */}
          <div className="d-flex justify-content-between py-3">
            <div>
              <button
                className="fs-6 bg-transparent copyTextBrder rounded-5 py-1 px-3"
                onClick={handleCopyLink}
              >
                <img
                  src={attach}
                  className="img-fluid px-1 ps-0 fillImg1"
                  alt="Attachment"
                />
                Copy Link
              </button>
            </div>
            <div>
              <button
                className="fs-6 loginBtn1 btn btn-primary px-4 py-2 rounded-2"
                onClick={handleDone}
              >
                DONE
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ShareModal;
