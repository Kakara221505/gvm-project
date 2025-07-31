import React, { useState, useEffect, useContext } from "react";
import prof from "../../../../Assets/Icons/UserProf.png";
import Edit from "../../../../Assets/Icons/Edit.png";
import DarkDelete from "../../../../Assets/Icons/DeleteTable.png";
import View from "../../../../Assets/Images/eye.png";
import { Modal, Button, Spinner } from "react-bootstrap";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ViewOrganization from "./ViewOrganization/ViewOrganization";
import { ThemeContext } from "../../../../Theme/ThemeContext";
import EditOrganization from "./EditOrganization/EditOrganization";

export default function OrganizationListPage() {
  const [showModal, setShowModal] = useState(false);
  const [deleteShowModal, setDeleteShowModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const token = localStorage.getItem("AdminToken");
  const [allOrganization, setAllOrganization] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [viewOrganizationProfile, setVieworganizationProfile] = useState({});
  const { theme } = useContext(ThemeContext);
  const [showOrganizationView, setShowOrganizationView] = useState(true); // New state for toggling view
  const [showOrganizationEdit, setEditOrganizationView] = useState(false); // New state for toggling view
  const [editFormData, setEditFormData] = useState({
    First_name: "",
    Last_name: "",
    Email: "",
    Gender: "",
    Date_of_birth: "",
    Password: "",
    Phone: "",
    User_type: "USER",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("AdminToken");
      const response = await axios.get(
        `${process.env.REACT_APP_PUBLIC_BASE_URL}organization/getAllOrganization?page=1&limit=2000`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAllOrganization(response.data.organizations);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // console.log("response", allOrganization);
  const handleAddUserClick = () => {
    setShowModal(true);
    setEditUserId(null);
    setEditFormData({});
  };
  const handleEditUserClick = (userId) => {
    setEditUserId(userId);
    fetchUserDataById(userId);
    setShowModal(true);
  };
  const fetchUserDataById = async (userId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_PUBLIC_BASE_URL}users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const userData = response.data.user;
      const { First_name, Last_name, Email, Gender, Date_of_birth, Phone } =
        userData;
      const dateOfBirth = Date_of_birth.split(" ")[0];
      setEditFormData({
        First_name,
        Last_name,
        Email,
        Gender,
        Date_of_birth: dateOfBirth,
        Phone,
      });
      formik.setValues({
        First_name,
        Last_name,
        Email,
        Gender,
        Date_of_birth: dateOfBirth,
        Phone,
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const toggleOrganizationView = (info) => {
    setVieworganizationProfile(info);
    setShowOrganizationView((prev) => !prev); // Toggle the visibility state
  };
  const toggleOrganizationEdit = (info) => {
    setVieworganizationProfile(info);
    setEditOrganizationView((prev) => !prev); // Toggle the visibility state
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setDeleteShowModal(false);
    setEditUserId(null); // Reset editUserId when closing the modal
    setEditFormData({});
    formik.resetForm();
  };

  const handleDeleteUserClick = (userId) => {
    setDeleteUserId(userId); // Set the ID of the user to be deleted
    setDeleteShowModal(true); // Display the modal dialog box
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_PUBLIC_BASE_URL}organization/${deleteUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        toast.success("User deleted Successfully");
        fetchUsers(); // Refresh the user list after deletion
        handleCloseModal(); // Close the modal after successful deletion
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const validationSchema = !editUserId
    ? Yup.object().shape({
        First_name: Yup.string().required("First Name is required"),
        Last_name: Yup.string().required("Last Name is required"),
        Email: Yup.string()
          .email("Invalid email")
          .required("Email is required"),
        Phone: Yup.string()
          .required("Phone is required")
          .matches(/^[0-9]+$/, "Phone number must contain only digits")
          .max(15, "Phone number cannot exceed 15 digit"),
        // Date_of_birth: Yup.date()
        //   .required("DOB is required")
        //   .max(
        //     new Date(Date.now() - 86400000),
        //     "Date of birth cannot be today or in the future"
        //   ),
        // Gender: Yup.string().required("Gender is required"),
        Password: Yup.string()
          .required("Password is required")
          .matches(
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=.*[^\w\d\s]).{8,}$/,
            "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character"
          ),
        // confirmPassword: Yup.string()
        //   .oneOf([Yup.ref("Password"), null], "Passwords must match")
        //   .required("Confirm Password is required"),
      })
    : Yup.object().shape({
        First_name: Yup.string().required("First Name is required"),
        Last_name: Yup.string().required("Last Name is required"),
        Email: Yup.string()
          .email("Invalid email")
          .required("Email is required"),
        Phone: Yup.string()
          .required("Phone is required")
          .matches(/^[0-9]+$/, "Phone number must contain only digits")
          .max(15, "Phone number should be 15 digit maximum"),
        Date_of_birth: Yup.date()
          .required("DOB is required")
          .max(
            new Date(Date.now() - 86400000),
            "Date of birth cannot be today or in the future"
          ),

        Gender: Yup.string().required("Gender is required"),
      });

  const formik = useFormik({
    initialValues: editUserId
      ? editFormData
      : {
          First_name: "",
          Last_name: "",
          Email: "",
          // Gender: "",
          // Date_of_birth: "",
          Password: "",
          Phone: "",
          // confirmPassword: "",
        },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      console.log("disabled", values);
      console.log("editUserId", editUserId);
      try {
        setLoading(true);
        const payload = {
          ...values,
          Gender: "",
        };
        const response = await axios.post(
          `${process.env.REACT_APP_PUBLIC_BASE_URL}organization/add-organization`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.status === 200) {
          setLoading(false);
          toast.success("Organization Added successfully");
          handleCloseModal();
          fetchUsers();
        }
      } catch (error) {
        console.error("Error adding or updating user:", error);
        if (error.response.status === 409) {
          setShowModal(false);
          toast.error(error.response.data.message);
        } else {
          setShowModal(false);
          toast.error(error.message);
        }
      } finally {
        setShowModal(false);
        setSubmitting(false); // Ensure to set submitting state to false
      }
    },
  });

  const handleConfirmPasswordChange = (e) => {
    const { value } = e.target;
    formik.setFieldValue("confirmPassword", value);
  };
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };
  return (
    <div className="LandingUserSettings py-3 px-3">
      {showOrganizationView ? (
        showOrganizationEdit ? (
          <>
            <EditOrganization
              onBack={toggleOrganizationEdit}
              viewOrganizationProfile={viewOrganizationProfile}
              fetchUsers={()=>fetchUsers()}
            />
          </>
        ) : (
          <>
            {isLoading && (
              <Spinner animation="border" variant="primary" size="md" />
            )}
            {!isLoading && (
              <>
                <div className="row py-4">
                  <div className="col-lg-4">
                    <div className="d-flex flex-column border-end border-2">
                      <h1 className="yellowText fs-1">
                        {allOrganization.length}
                      </h1>
                      <span className="menuTextHeader opacity-50 py-2">
                        Total Organization
                      </span>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="d-flex flex-column border-end border-2">
                      <h1 className="yellowText fs-1">33</h1>
                      <span className="menuTextHeader text-secondary opacity-50 py-2">
                        Total User
                      </span>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="d-flex flex-column">
                      <h1 className="yellowText fs-1">11</h1>
                      <span className="menuTextHeader text-secondary opacity-50 py-2">
                        Total Projects
                      </span>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex flex-column">
                        <h3 className="text-start menuTextHeader">
                          Organization
                        </h3>
                        <small className="text-secondary d-block text-start">
                          Lorem ipsum dolor sit amet, consectetur.
                        </small>
                      </div>
                      <div className="">
                        <button
                          className="btn btn-primary px-4 py-2 loginBtn1"
                          onClick={handleAddUserClick}
                        >
                          Add Organization
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12 py-5">
                    <table className="table rounded-3">
                      <thead>
                        <tr>
                          <th className="menuTextHeader orgBg text-start ps-5">
                            Name
                          </th>
                          <th className="menuTextHeader orgBg py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allOrganization.map((item) => (
                          <tr>
                            <th
                              className="menuTextHeader orgBg d-flex ps-5"
                              scope="row"
                            >
                              <div className="d-flex py-2">
                                <img
                                  src={`${process.env.REACT_APP_PUBLIC_BASE_URL}${item.Profile_image_url}`}
                                  alt="Profile"
                                  className="img-fluid rounded-circle"
                                  height="180"
                                  width="60"
                                />
                                <div className="d-flex flex-column justify-content-center ps-3">
                                  <h6 className="text-start mb-1">
                                    {item.First_name}
                                  </h6>
                                  <small>{item.Email}</small>
                                </div>
                              </div>
                            </th>
                            <td className="menuTextHeader orgBg">
                              <div className="mt-2">
                                <button className="btn btn-default px-1">
                                  <img
                                    src={View}
                                    alt="View"
                                    className="img-fluid"
                                    onClick={() => toggleOrganizationView(item)}
                                  />
                                </button>
                                <button
                                  className="btn btn-default px-1"
                                  onClick={() => toggleOrganizationEdit(item)}
                                >
                                  <img
                                    src={Edit}
                                    alt="Edit"
                                    className="img-fluid"
                                  />
                                </button>
                                <button
                                  className="btn btn-default px-0"
                                  onClick={() => handleDeleteUserClick(item.ID)}
                                >
                                  <img
                                    src={DarkDelete}
                                    alt="Delete"
                                    className="img-fluid"
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )
      ) : (
        <>
          {!showOrganizationView && (
            <ViewOrganization
              onBack={toggleOrganizationView}
              viewOrganizationProfile={viewOrganizationProfile}
            />
          )}
        </>
      )}

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="md"
        centered
        dialogClassName={theme}
      >
        <Modal.Header
          className="border-0 py-3 pb-0 commonModalBg"
          closeButton
        ></Modal.Header>
        <Modal.Body className="pt-0 commonModalBg">
          <h3 className="text-center menuTextHeader py-2">
            {editUserId ? "Edit Organization" : "Add Organization"}
          </h3>
          <form onSubmit={formik.handleSubmit}>
            <div className="row py-2">
              <div className="col-lg-6 form-group">
                <label className="my-1 yellowText" htmlFor="First_name">
                  First Name*
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="First_name"
                  name="First_name"
                  value={formik.values.First_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.First_name && formik.errors.First_name ? (
                  <div className="text-danger">{formik.errors.First_name}</div>
                ) : null}
              </div>
              <div className="col-lg-6  form-group">
                <label className="my-1 yellowText" htmlFor="Last_name">
                  Last Name*
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="Last_name"
                  name="Last_name"
                  value={formik.values.Last_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.Last_name && formik.errors.Last_name ? (
                  <div className="text-danger">{formik.errors.Last_name}</div>
                ) : null}
              </div>
            </div>
            <div className="row py-2">
              <div className="col-lg-6 form-group">
                <label className="my-1 yellowText" htmlFor="Email">
                  Email*
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="Email"
                  name="Email"
                  value={formik.values.Email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.Email && formik.errors.Email ? (
                  <div className="text-danger">{formik.errors.Email}</div>
                ) : null}
              </div>
              <div className="col-lg-6 form-group">
                <label className="my-1 yellowText" htmlFor="Password">
                  Password*
                </label>
                <div className="input-group">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    className="form-control"
                    id="Password"
                    name="Password"
                    value={formik.values.Password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <span
                    className="input-group-text"
                    onClick={togglePasswordVisibility}
                    style={{ cursor: "pointer" }}
                  >
                    {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                {formik.touched.Password && formik.errors.Password ? (
                  <div className="text-danger">{formik.errors.Password}</div>
                ) : null}
              </div>
            </div>
            <div className="row py-2">
              <div className="col">
                <label
                  className="py-2 fs-6 text-start menuTextHeader d-block"
                  htmlFor="Phone"
                >
                  Phone*
                </label>
                <input
                  type="tel"
                  className="form-control formLoginControl"
                  value={formik.values.Phone}
                  onChange={formik.handleChange}
                  name="Phone"
                />
                {formik.touched.Phone && formik.errors.Phone ? (
                  <div className="text-danger">{formik.errors.Phone}</div>
                ) : null}
              </div>
            </div>
            {/* Inside the form in the Modal.Body */}
            {/* {!editUserId && (
              <>
                <div className="row py-2">
                  <div className="col-lg-6 form-group">
                    <label className="my-1 yellowText" htmlFor="Password">
                      Password*
                    </label>
                    <div className="input-group">
                      <input
                        type={passwordVisible ? "text" : "password"}
                        className="form-control"
                        id="Password"
                        name="Password"
                        value={formik.values.Password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      <span
                        className="input-group-text"
                        onClick={togglePasswordVisibility}
                        style={{ cursor: "pointer" }}
                      >
                        {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                    {formik.touched.Password && formik.errors.Password ? (
                      <div className="text-danger">
                        {formik.errors.Password}
                      </div>
                    ) : null}
                  </div>
                  <div className="col-lg-6 form-group">
                    <label className="my-1 yellowText" htmlFor="confirmPassword">
                      Confirm Password*
                    </label>
                    <div className="input-group">
                      <input
                        type={confirmPasswordVisible ? "text" : "password"}
                        className="form-control"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formik.values.confirmPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      <span
                        className="input-group-text"
                        onClick={toggleConfirmPasswordVisibility}
                        style={{ cursor: "pointer" }}
                      >
                        {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                    {formik.touched.confirmPassword &&
                    formik.errors.confirmPassword ? (
                      <div className="text-danger">
                        {formik.errors.confirmPassword}
                      </div>
                    ) : null}
                  </div>
                </div>
              </>
            )} */}

            <button
              type="submit"
              className="loginBtn1 btn btn-primary w-100 my-4 py-2"
              disabled={formik.isSubmitting}
            >
              {loading ? (
                <Spinner animation="border" variant="white" size="sm" />
              ) : (
                "Submit"
              )}
            </button>
          </form>
        </Modal.Body>
      </Modal>

      {/* <
      className="modal show"
      style={{ display: 'block', position: 'initial' }}
    > */}
      <Modal
        show={deleteShowModal}
        onHide={handleCloseModal}
        centered
        dialogClassName={theme}
      >
        <Modal.Header className="commonModalBg" closeButton>
          <Modal.Title className="menuTextHeader">Delete User</Modal.Title>
        </Modal.Header>
        <Modal.Body className="commonModalBg">
          <p className="menuTextHeader">
            Are you sure want to delete this user?
          </p>
        </Modal.Body>
        <Modal.Footer className="commonModalBg">
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
