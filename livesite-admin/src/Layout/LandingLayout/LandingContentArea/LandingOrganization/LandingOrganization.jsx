import React, { useState, useEffect,useContext } from "react";
import "./LandingOrganization.css";
import prof from "../../../../Assets/Icons/UserProf.png";
import Edit from "../../../../Assets/Icons/Edit.png";
import avtarSec from "../../../../Assets/Images/image.png";
import axios from 'axios';
import * as Yup from 'yup';
import { Modal, Button } from "react-bootstrap";
import { useFormik } from 'formik';
import { toast } from "react-toastify";
import { ThemeContext } from "../../../../Theme/ThemeContext";

export default function LandingOrganization() {
  const [showModal, setShowModal] = useState(false);
  const token = localStorage.getItem("AdminToken");
  const userId = localStorage.getItem("UserID");
  const [profileImageUrl, setProfileImageUrl] = useState(avtarSec);
  const { theme } = useContext(ThemeContext);

  const formik = useFormik({
    initialValues: {
      First_name: "",
      Last_name: "",
      Email:"",
      Phone: "",
      Key_name: "",
      Contact_person_name: "",
      Address: "",
      City: "",
      ProfileMedia: "",
      Website: "",
      Postal_code: "",
      Country: "",
      Date_of_birth: "",
      State: "",
      Organization_name: ""
      // Add other fields as needed
    },
    validationSchema: Yup.object({
      First_name: Yup.string().required('First name is required'),
      Last_name: Yup.string().required('Last name is required'),
      Email: Yup.string().email('Invalid email address').required('Email is required'),
      Key_name: Yup.string().required('Key name is required'),
      Phone: Yup.string().required('Phone number is required')
      .matches(/^\d+$/, 'Invalid phone number'),
      Date_of_birth: Yup.date()
      .max(new Date(Date.now() - 86400000), "Date of birth cannot be today or in the future") 
      
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
          if (key !== "ProfileMedia" && key !== "ProfileMediaPreview" && key !== "") {
            formData.append(key, values[key]);
          }
        });
        if (values.ProfileMedia) {
          formData.append("ProfileMedia", values.ProfileMedia);
        }
        await axios.put(
          `${process.env.REACT_APP_PUBLIC_BASE_URL}organization/${userId}`,
          formData, { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Profile Updated')
        this.fetchOrganizationData();
      } catch (error) {
        console.error("Error updating organization data:", error);
        if (error.response && error.response.status === 409) {
          toast.error(error.response.data.message);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    fetchOrganizationData();
  }, []);

  const fetchOrganizationData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_PUBLIC_BASE_URL}organization/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      const { user, organization } = response.data;
      const imageUrl = organization.Profile_image_url || avtarSec; // If Profile_image_url is empty or null, fallback to default image
      setProfileImageUrl(imageUrl);
      formik.setValues({
        First_name: user.First_name,
        Last_name: user.Last_name,
        Email: user.Email,
        Phone: user.Phone,
        Key_name: organization.Key_name,
        Contact_person_name: organization.Contact_person_name,
        Address: organization.Address,
        City: organization.City,
        State: organization.State,
        Country: organization.Country,
        Website: organization.Website,
        Organization_name: organization.Organization_name,
        Date_of_birth: user.Date_of_birth ? formatDateOfBirth(user.Date_of_birth) : "", 
        Postal_code: organization.Postal_code,
        ProfileMedia: `${process.env.REACT_APP_PUBLIC_BASE_URL}${organization.Profile_image_url}`,
        // Add other fields as needed
      });
    } catch (error) {
      console.error("Error fetching organization data:", error);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.currentTarget.files[0];
    formik.setFieldValue('ProfileMedia', file);
    formik.setFieldValue('ProfileMediaPreview', URL.createObjectURL(file));
  };


  const formatDateOfBirth = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="LandingUserSettings py-3 px-3">
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex flex-column">
              <h3 className="text-start menuTextHeader fw-bold" >Organization</h3>
              <small className="text-secondary d-block text-start">
                Lorem ipsum dolor sit amet, consectetur.
              </small>
            </div>
          </div>
        </div>
        <div className="col-lg-12 py-4">
          <div className="orgBg rounded-4">
            <div className="row py-4">
              <div className="col-lg-4 d-flex justify-content-center align-items-center border-end">
                <div className="avtarSec">
                  <div className="py-1">
                    {formik.values.ProfileMediaPreview ? (
                      <div className="circle">
                        <img
                          src={formik.values.ProfileMediaPreview}
                          className="rounded-circle"
                          height="150" width="150"
                          alt="Selected Image"
                        />
                      </div>
                    ) : (
                      <img
                        src={profileImageUrl}
                        className="rounded-circle menuTextHeader"
                        height="150" width="150"
                        alt="Profile Image"
                      />
                    )}

                  </div>
                  <div className="py-2">
                    <h3 className="py-1 menuTextHeader">{formik.values.First_name} {formik.values.Last_name}</h3>
                    {/* <span className="fw-lighter">Web-designer</span> */}
                  </div>
                  <div className="py-3">
                    <label htmlFor="avatarUpload" className="btn btn-primary px-4 py-2 loginBtn1">
                      Upload New Avatar
                    </label>
                    <input
                    className=""
                      type="file"
                      id="avatarUpload"
                      style={{ display: "none" }} // Hide the input field
                      onChange={handleAvatarChange}
                    />
                  </div>

                </div>
              </div>
              <div className="col-lg-8 px-4">
                <div className="orgHeading  py-3 border-bottom">
                  <h5 className="text-start  menuTextHeader fw-bold">Organization Info</h5>
                </div>
                <div className="formStart py-3 pb-0 px-3">
                  <form onSubmit={formik.handleSubmit}>
                    <div className="row">
                      <div className="col">
                        <label className="py-2 fs-6 text-start menuTextHeader d-block" htmlFor="First name">First Name *</label>
                        <input
                          type="text"
                          className="form-control formLoginControl"
                          value={formik.values.First_name}
                          onChange={formik.handleChange}
                          name="First_name"
                        />
                        {formik.touched.First_name && formik.errors.First_name ? (
                          <div className="text-danger">{formik.errors.First_name}</div>
                        ) : null}
                      </div>
                      <div className="col">
                        <label className="py-2 fs-6 text-start menuTextHeader d-block" htmlFor="Last name">Last Name *</label>
                        <input
                          type="text"
                          className="form-control formLoginControl"
                          value={formik.values.Last_name}
                          onChange={formik.handleChange}
                          name="Last_name"
                        />
                        {formik.touched.Last_name && formik.errors.Last_name ? (
                          <div className="text-danger">{formik.errors.Last_name}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className="row py-2">
                      <div className="col">
                        <label className="py-2 fs-6 text-start menuTextHeader d-block" htmlFor="Phone">Phone*</label>
                        <input
                          type="text"
                          className="form-control formLoginControl"
                          value={formik.values.Phone}
                          onChange={formik.handleChange}
                          name="Phone"
                        />
                        {formik.touched.Phone && formik.errors.Phone ? (
                          <div className="text-danger">{formik.errors.Phone}</div>
                        ) : null}
                      </div>
                      <div className="col">
                        <label className="py-2 fs-6 text-start menuTextHeader d-block" htmlFor="Date_of_birth">Date of Birth</label>
                        <input
                          type="date"
                          className="form-control formLoginControl"
                          value={formik.values.Date_of_birth}
                          onChange={formik.handleChange}
                          name="Date_of_birth"
                          max={new Date(Date.now() - 86400000).toISOString().split("T")[0]}
                        />
                          {formik.touched.Date_of_birth && formik.errors.Date_of_birth ? (
                          <div className="text-danger">{formik.errors.Date_of_birth}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className="row py-2">
                      <div className="col">
                        <label className="py-2 fs-6 text-start menuTextHeader d-block" htmlFor="Address">Address</label>
                        <input
                          type="text"
                          className="form-control formLoginControl"
                          value={formik.values.Address}
                          onChange={formik.handleChange}
                          name="Address"
                        />
                        {formik.touched.Address && formik.errors.Address ? (
                          <div className="text-danger">{formik.errors.Address}</div>
                        ) : null}
                      </div>
                      <div className="col">
                        <label className="py-2 fs-6 text-start menuTextHeader d-block" htmlFor="City">City</label>
                        <input
                          type="text"
                          className="form-control formLoginControl"
                          value={formik.values.City}
                          onChange={formik.handleChange}
                          name="City"
                        />
                        {formik.touched.City && formik.errors.City ? (
                          <div className="text-danger">{formik.errors.City}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className="row py-2">
                      <div className="col">
                        <label className="py-2 fs-6 text-start menuTextHeader d-block" htmlFor="State">State</label>
                        <input
                          type="text"
                          className="form-control formLoginControl"
                          value={formik.values.State}
                          onChange={formik.handleChange}
                          name="State"
                        />
                        {formik.touched.State && formik.errors.State ? (
                          <div className="text-danger">{formik.errors.State}</div>
                        ) : null}
                      </div>
                      <div className="col">
                        <label className="py-2 fs-6 text-start menuTextHeader d-block" htmlFor="Postal_code">Postal Code</label>
                        <input
                          type="text"
                          className="form-control formLoginControl"
                          value={formik.values.Postal_code}
                          onChange={formik.handleChange}
                          name="Postal_code"
                        />
                        {formik.touched.Postal_code && formik.errors.Postal_code ? (
                          <div className="text-danger">{formik.errors.Postal_code}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className="row py-2">
                      <div className="col">
                        <label className="py-2 fs-6 text-start menuTextHeader d-block" htmlFor="Country">Country</label>
                        <input
                          type="text"
                          className="form-control formLoginControl"
                          value={formik.values.Country}
                          onChange={formik.handleChange}
                          name="Country"
                        />
                        {formik.touched.Country && formik.errors.Country ? (
                          <div className="text-danger">{formik.errors.Country}</div>
                        ) : null}
                      </div>
                      <div className="col">
                        <label className="py-2 fs-6 text-start menuTextHeader d-block" htmlFor="Key_name">Key Name *</label>
                        <input
                          type="text"
                          className="form-control formLoginControl"
                          value={formik.values.Key_name}
                          onChange={formik.handleChange}
                          name="Key_name"
                        />
                        {formik.touched.Key_name && formik.errors.Key_name ? (
                          <div className="text-danger">{formik.errors.Key_name}</div>
                        ) : null}
                      </div>
                    </div>

                    <div className="row py-2">
                      <div className="col">
                        <label className="py-2 fs-6 text-start menuTextHeader d-block" htmlFor="State">Organization Name</label>
                        <input
                          type="text"
                          className="form-control formLoginControl"
                          value={formik.values.Organization_name}
                          onChange={formik.handleChange}
                          name="Organization_name"
                        />

                      </div>
                      <div className="col">
                        <label className="py-2 fs-6 text-start menuTextHeader d-block" htmlFor="Postal_code">Contact Person Name</label>
                        <input
                          type="text"
                          className="form-control formLoginControl"
                          value={formik.values.Contact_person_name}
                          onChange={formik.handleChange}
                          name="Contact_person_name"
                        />

                      </div>
                    </div>

                    <div className="row py-2">
                      <div className="col">
                        <label className="py-2 fs-6 text-start menuTextHeader d-block" htmlFor="Website">Website</label>
                        <input
                          type="text"
                          className="form-control formLoginControl"
                          value={formik.values.Website}
                          onChange={formik.handleChange}
                          name="Website"
                        />
                        {formik.touched.Website && formik.errors.Website ? (
                          <div className="text-danger">{formik.errors.Website}</div>
                        ) : null}
                      </div>

                      <div className="col">
                        <label className="py-2 fs-6 text-start d-block menuTextHeader" htmlFor="Website">Email *</label>
                        <input
                          type="text"
                          className="form-control formLoginControl"
                          value={formik.values.Email}
                          onChange={formik.handleChange}
                          name="Email"
                        />
                        {formik.touched.Email && formik.errors.Email ? (
                          <div className="text-danger">{formik.errors.Email}</div>
                        ) : null}
                      </div>

                    </div>

                    <div className="row py-4 pb-0 mt-3 ">
                      <div className="col ">
                        <button type="submit" className="px-4 d-block ms-auto btn btn-primary loginBtn1">Save</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal show={showModal} onHide={handleCloseModal} centered dialogClassName={theme}>
        <Modal.Header className="border-0 py-3 pb-0 commonModalBg" closeButton></Modal.Header>
        <Modal.Body className="commonModalBg">
          <h3 className="text-center py-2 menuTextHeader">Add User</h3>
          <form className="px-5">
            <div className="form-group">
              <label className="py-2 yellowText" for="exampleInputEmail1">
                First Name
              </label>
              <input
                type="text"
                className="form-control formLoginControl"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
                placeholder="First Name"
              />
            </div>
            <div className="form-group">
              <label className="py-2 yellowText" for="exampleInputPassword1">
                Last Name
              </label>
              <input
                type="text"
                className="form-control formLoginControl"
                id="exampleInputPassword1"
                placeholder="Last Name"
              />
            </div>
            <div className="form-group">
              <label className="py-2 yellowText" for="exampleInputEmail1">
                Email
              </label>
              <input
                type="email"
                className="form-control formLoginControl"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
                placeholder="Enter email"
              />
            </div>

            <button type="submit" className="btn btn-primary loginBtn1 w-100 my-4 py-2">
              Submit
            </button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
