import { FC, useEffect, useState } from 'react';
import { toAbsoluteUrl } from '../../../../../_metronic/helpers';
import { useAuth } from '../../../../modules/auth';
import { ProfileDetailsSectionStyles } from './ProfileDetailsSectionStyles';
import * as authHelper from '../../../../modules/auth/core/AuthHelpers';
import axios from 'axios';
import { bloodGroupOptions } from '../../../../constants/common';
import { useFormik } from 'formik';
import Select from 'react-select';

import * as Yup from 'yup';
import Swal from 'sweetalert2';
import {
  defaultFormErrorConfig, defaultFormUpdateConfig,defaultByDefaultPhoneExistConfig
} from '../../../../config/sweetAlertConfig'
import Flatpickr from 'react-flatpickr'
import '../../../../../../node_modules/flatpickr/dist/flatpickr.css'

const ProfileDetailsSection: FC = () => {
  const [isProfileSectionVisible, setIsProfileSectionVisible] = useState(true);
  const [isEditSectionVisible, setIsEditSectionVisible] = useState(false);
  const TOKEN = authHelper.getAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>({});
  const [userImage, setUserImage] = useState<any>({});
  const [selectedOption, setSelectedOption] = useState<string>('');
  const { currentUser } = useAuth();
  const [formateDate, setFormattedDate] = useState<any>(null);
  const [originalUserDetails, setOriginalUserDetails] = useState<any>({});

  const validationSchema = Yup.object().shape({
    Name: Yup.string()
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('Name is required'),
    Email: Yup.string()
      .test('is-valid-email', 'Invalid email format', function (value: string | undefined) {
        if (!value) { return false; }
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
        return emailRegex.test(value);
      }).required('Email is required'),
    Phone: Yup.string()
      .test('Invalid phone format', 'Invalid phone number format', function (value) {
        if (!value) { return false; }
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(value);
      }).required('Phone is required'),
    Date_of_birth: Yup.string()
      .required('Date of birth is required')
      .test('is-over-18', 'You must be at least 18 years old', function (value) {
        const currentDate = new Date();
        const selectedDate = new Date(value);
        // Calculate age difference in milliseconds
        const ageDifference = currentDate.getTime() - selectedDate.getTime();
        // Calculate age in years
        const ageInYears = ageDifference / (365.25 * 24 * 60 * 60 * 1000);
        // If age is less than 18, return false (validation fails)
        return ageInYears >= 18;
      }),
    Gender: Yup.string().required('Gender is required'),
  });

  const formik = useFormik({
    initialValues: {
      UserID: '',
      Name: '',
      Email: '',
      Phone: '',
      Gender: '',
      Date_of_birth: '',
      UserMedia: '',
      Image_url: '',
      Date_of_anniversary: '',
      Blood_group: ''
    },

    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const trimmedBrandName = values.Name.trim();
        const formData = new FormData();
        formData.append('Name', trimmedBrandName);
        formData.append('Email', values.Email);
        formData.append('Phone', values.Phone);
        formData.append('Date_of_birth', values.Date_of_birth);
        formData.append('Gender', values.Gender);
        formData.append('Date_of_anniversary', values.Date_of_anniversary);
        formData.append('Blood_group', values.Blood_group);
        if (currentUser) {
          const userId = currentUser.ID;
          formData.append('UserID', userId.toString());
        }
        if (values.UserMedia !== '') {
          formData.append('UserMedia', values.UserMedia);
        }

        try {
          const res = await axios.post(`${process.env.REACT_APP_SERVER_URL}/userdetail/update_userdetail`, formData, {
            headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken },
          });
          if (res.status === 200 && res.data.message) {
            console.log(res.data.data.UserMedia.Media_url)
            getProfile()
            formik.setValues({
              ...formik.values,
              Image_url: res.data.data.UserMedia.Media_url,
            });
            const confirmAdd = await Swal.fire(defaultFormUpdateConfig)
            if (confirmAdd.isConfirmed) {
              setIsProfileSectionVisible(true)
              setIsEditSectionVisible(false)
            }

          } else {
            Swal.fire(defaultFormErrorConfig);

            if (res.status === 400) {
              console.log('Bad Request: ', res.data.error);
            } else if (res.status === 401) {
              console.log('Unauthorized: ', res.data.error);
            } 
            else if (res.status === 401) {
              console.log('Unauthorized: ', res.data.error);
            }
            else {
              console.log('Error: ', res.data.error);
            }
          }
        } catch (err) {
          if (axios.isAxiosError(err) && err.response && err.response.status === 409 && err.response.data && err.response.data.message === 'Phone number already exists.') {
            Swal.fire(defaultByDefaultPhoneExistConfig);
          } else {
            Swal.fire(defaultFormErrorConfig);
          }
        }
      } catch (err) {
        console.error("API call failed: ", err);
        Swal.fire(defaultFormErrorConfig);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleImageChange = async (e: any, setFieldValue: any) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFieldValue('UserMedia', file);
      setFieldValue('Image_url', URL.createObjectURL(file)); // Update Image_url with the selected image URL
    }
  };

  useEffect(() => {
    getProfile()
  }, [TOKEN?.AccessToken, currentUser]);

  // Add a helper function to format the date
  const formatDate = (date: any) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleButtonClick = (option: string) => {
    setSelectedOption(option);
    formik.setFieldValue('Gender', option);
    formik.setFieldTouched('Gender', true);
  };

  const getProfile = () => {
    setLoading(true);
    if (currentUser) {
      const userId = currentUser.ID;
      setLoading(true);
      axios
        .get(`${process.env.REACT_APP_SERVER_URL}/userdetail/${userId}`, { headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken } })
        .then((res: any) => {
          const data = res.data;
          if (data.status === 'success') {
            const user = data.data

            const dateOfBirth = user.UserDetails?.Date_of_birth;
            const dateOfAnniversary = user.UserDetails?.Date_of_anniversary;
            const formattedDateAnniversary = dateOfAnniversary
              ? new Date(dateOfAnniversary).toISOString().split('T')[0]
              : '';
            const formattedDate = dateOfBirth
              ? new Date(dateOfBirth).toISOString().split('T')[0]
              : '';

            // const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            formik.setValues({
              UserID: user.UserID,
              Name: user.User.Name,
              Email: user.User.Email,
              Phone: user.User.Phone,
              Gender: user.UserDetails?.Gender || '',
              Date_of_birth: formattedDate,
              UserMedia: user.UserMedia?.Media_url || '',
              Image_url: user.UserMedia?.Image_url || '',
              Date_of_anniversary: formattedDateAnniversary,
              Blood_group: user.UserDetails?.Blood_group || ''
            });
            setSelectedOption(user.UserDetails?.Gender || '');
            setLoading(false);
            if (user.User) {
              setUserData(user.User);
            }
            if (user.UserMedia) {
              setUserImage(user.UserMedia.Media_url);
            }
            if (user.UserDetails) {
              setFormattedDate(formattedDate);
            }
          }
        })
        .catch((err) => {
       
          setLoading(false);
          console.error(err);
        });
    }
  }
  const handleEdit = () => {
    // Store the original user details when entering edit mode
    setOriginalUserDetails({ ...formik.values });
    // Toggle the visibility of the profile and edit sections
    setIsProfileSectionVisible(false);
    setIsEditSectionVisible(true);
  };
  const handleDiscard = () => {
    // Reset form values to the original user details
    formik.setValues({ ...originalUserDetails });
    // Toggle the visibility of the profile and edit sections
    setIsProfileSectionVisible(true);
    setIsEditSectionVisible(false);
  };

  return (
    <ProfileDetailsSectionStyles>
      <div className='container'>
        <div className=''>
        {loading && (
            <div className='text-center'>
              <p>Loading...</p>
            </div>
          )}
        {!loading && isProfileSectionVisible && (
            <div className='row'>
              <div className='col-lg-12 mobilePaddingNone '>
                <div className='card boxNavPills'>
                  <div className='card-header d-flex justify-content-between align-items-center border-bottom-0'>
                    <h1 className='primaryTextMediumBold mb-0 '>PROFILE DETAILS</h1>
                    <div
                      className=''
                      onClick={handleEdit}
                    >
                      <img
                        src={toAbsoluteUrl('/media/vectors/Edit.png')}
                        className='img-fluid cursor-pointer'
                        alt='Logout'
                      />{' '}
                    </div>
                  </div>
                  {Object.keys(userData).length === 0 ? (
                    <div className='card-body'>
                      <p>No records found.</p>
                    </div>
                  ) : (
                    <div className='card-body d-flex justify-content-around pt-2 mobileFlexColumn'>
                      <div className='contentCenter avatarSection'>
                        <img
                          height={140}
                          width={140}
                          src={userImage}
                          className='rounded-circle cursor-pointer'
                          alt=''
                        />{' '}
                      </div>

                      <div className='innerContactDetails d-flex flex-column justify-content-evenly'>
                        <div className='d-flex mobileFlexColumn my-2 mobilePaddingNone '>
                          <div className='d-flex my-1 align-items-center'>
                            <img
                              height={30}
                              width={30}
                              className=''
                              src={toAbsoluteUrl('/media/vectors/nameIconCustom.png')}
                              alt='Name'
                            />
                            <h4 className='fontCall2  text-black fw-normal mb-0 ps-2 fw-normal'>
                              {userData.Name ? `${userData.Name}` : '-'}
                            </h4>
                          </div>
                          <div className='d-flex my-1 align-items-center  ps-8  mobilePaddingNone'>
                            <img
                              height={30}
                              width={30}
                              src={toAbsoluteUrl('/media/vectors/mailIconCustom.png')}
                              alt='Email'
                            />
                            <h4 className='fontCall2  text-black fw-normal mb-0 ps-2'>
                              {userData.Email ? `${userData.Email}` : '-'}
                            </h4>
                          </div>
                        </div>

                        <div className='d-flex mobileFlexColumn mobilePaddingNone '>
                          <div className='d-flex my-1 align-items-center'>
                            <img
                              height={30}
                              width={30}
                              src={toAbsoluteUrl('/media/vectors/DateOfBirthIco.png')}
                              alt='DOB'
                            />
                            <h4 className='fontCall2  text-black fw-normal mb-0 ps-2'>{formateDate ? `${formateDate}` : '-'}</h4>
                          </div>
                          <div className='d-flex my-1 align-items-center ps-10 mobilePaddingNone'>
                            <img
                              height={30}
                              width={30}
                              src={toAbsoluteUrl('/media/vectors/dialIconCustom.png')}
                              alt='Phone'
                            />
                            <h4 className='fontCall2  text-black fw-normal mb-0 ps-2'> {+userData.Phone ? `+${userData.Phone}` : '-'}</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
          {isEditSectionVisible && (

            <div className='row editSection marginPageMYMobile'>
              <div className='col-lg-12  mobilePaddingNone'>
                <form onSubmit={formik.handleSubmit}>
                  <div className='card boxNavPills'>
                    <div className='card-header d-flex align-items-center border-bottom-2'>
                      <h1 className='primaryTextMediumBold mb-0'>PROFILE DETAILS</h1>
                    </div>
                    <div className='card-body pb-0'>
                      <div className='d-flex flex-column align-items-center'>
                        <div className='image-input image-input-empty' data-kt-image-input='true'>
                          <div
                            className='position-relative image-input-wrapper w-150px h-150px rounded-circle shadow-sm'
                            style={{
                              backgroundImage: `url(${formik.values.Image_url || userImage})`
                            }}
                          ></div>
                          <label
                            className='mainImageEditUpload primaryBG rounded-1 btn btn-icon btn-circle btn-color-muted btn-active-color-primary w-30px h-30px bg-body shadow'
                            data-kt-image-input-action='change'
                            data-bs-toggle='tooltip'
                            data-bs-dismiss='click'
                            title='Change avatar'
                          >
                            <img
                              src={toAbsoluteUrl('/media/vectors/Edit.png')}
                              className="filteredImg img-fluid cursor-pointer w-50"
                              alt="Edit"
                            />
                            {/* {selectedImage && (
                              <img
                                src={imagePreview}
                                className="filteredImg img-fluid cursor-pointer w-50"
                                alt="Edit"
                              />
                            )} */}
                            <input
                              type="file"
                              name="avatar"
                              accept=".png, .jpg, .jpeg"
                              style={{ display: 'none' }} // Hide the file input
                              onChange={(e) => handleImageChange(e, formik.setFieldValue)}
                            />
                            <input type='hidden' name='avatar_remove' />
                          </label>
                          <span
                            className='btn btn-icon btn-circle btn-color-muted btn-active-color-primary w-25px h-25px bg-body shadow'
                            data-kt-image-input-action='cancel'
                            data-bs-toggle='tooltip'
                            data-bs-dismiss='click'
                            title='Cancel avatar'
                          >
                            <i className='ki-outline ki-cross fs-3'></i>
                          </span>

                          <span
                            className='btn btn-icon btn-circle btn-color-muted btn-active-color-primary w-25px h-25px bg-body shadow'
                            data-kt-image-input-action='remove'
                            data-bs-toggle='tooltip'
                            data-bs-dismiss='click'
                            title='Remove avatar'
                          >
                            <i className='ki-outline ki-cross fs-3'></i>
                          </span>
                        </div>
                        <h6 className='card-subtitle mb-2 text-black my-5'>
                          Allowed file types: png, jpg, jpeg.
                        </h6> {formik.touched.Image_url && formik.errors.Image_url && (
                          <div className='fv-plugins-message-container'>
                            <div className='fv-help-block'>{String(formik.errors.Image_url)}</div>
                          </div>
                        )}
                      </div>
                      <div className='mt-6'>
                        <div className='fv-row  paddingPagePXMobile d-block input-group '>
                          <div className='row'>
                            <div className='col-lg-6'>
                              <div className='form-group'>
                                <input
                                  id='Name'
                                  placeholder=''
                                  className={`form-control bg-transparent shadow-none  customInput ${formik.touched.Name && formik.errors.Name ? 'is-invalid' : ''
                                    }`}
                                  value={formik.values.Name}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  type='name'
                                  name='Name'
                                  autoComplete='off'
                                />
                                <label className='form-label fs-6 fw-bolder ' htmlFor='Name'>
                                  Name
                                </label>
                                {formik.touched.Name && formik.errors.Name && (
                                  <div className='invalid-feedback'>{formik.errors.Name}</div>
                                )}
                              </div>
                            </div>
                            <div className='col-lg-6'>
                              <div className='form-group'>
                                <input
                                  id='Email'
                                  placeholder=''
                                  className={`form-control bg-transparent shadow-none  customInput ${formik.touched.Email && formik.errors.Email ? 'is-invalid' : ''
                                    }`}
                                  type='text'
                                  value={formik.values.Email}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  name='Email'
                                  autoComplete='off'
                                />
                                <label
                                  className='form-label fs-6 fw-bolder '
                                  htmlFor='Email'
                                >
                                  Email ID
                                </label>
                                {formik.touched.Email && formik.errors.Email && (
                                  <div className='invalid-feedback'>{formik.errors.Email}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className='fv-row  paddingPagePXMobile d-block input-group  '>
                          <div className='row '>
                            <div className='col-lg-6 profileMarginBottom'>
                              <div className='d-flex justify-content-between mobileFlexColumnProfile align-items-center form-group mb-0'>
                                <button
                                  type='button'
                                  className={`navbarMarginForSearch mobileMarginNone me-5  d-flex align-items-center justify-content-center py-5 btn btn-default btn-sm ${selectedOption === 'male'
                                    ? 'navbarMarginForSearch mobileMarginNone selected-button-male'
                                    : 'navbarMarginForSearch mobileMarginNone unselected-button-male'
                                    }${formik.touched.Gender && formik.errors.Gender ? ' is-invalid' : ''}`}
                                  onClick={() => handleButtonClick('male')}
                                >
                                  <img
                                    src={toAbsoluteUrl('/media/vectors/maleSign.png')}
                                    className={`img-fluid ${selectedOption === 'male' ? 'selected-button-Image' : ''
                                      }`}
                                    alt='Male'
                                  />{' '}
                                  Male
                                </button>
                                <button
                                  type='button'
                                  id='femaleOutlineBtn'
                                  className={`navbarMarginForSearch mobileMarginNone me-5  d-flex align-items-center justify-content-center py-5 btn btn-default btn-sm ${selectedOption === 'female'
                                    ? 'navbarMarginForSearch mobileMarginNone selected-button-female'
                                    : 'navbarMarginForSearch mobileMarginNone unselected-button-female'
                                    }${formik.touched.Gender && formik.errors.Gender ? ' is-invalid' : ''}`}
                                  onClick={() => handleButtonClick('female')}
                                >
                                  <img
                                    src={toAbsoluteUrl('/media/vectors/femaleSign.png')}
                                    className={`img-fluid ${selectedOption === 'female' ? 'selected-button-Image' : ''
                                      }`}
                                    alt='Female'
                                  />{' '}
                                  Female
                                </button>
                                <button
                                  type='button'
                                  id='otherOutlineBtn'
                                  className={` navbarMarginForSearch  d-flex align-items-center justify-content-center py-5 btn btn-default btn-sm ${selectedOption === 'other'
                                    ? 'navbarMarginForSearch mobileMarginNone selected-button-other'
                                    : 'navbarMarginForSearch   mobileMarginNone unselected-button-other'
                                    }${formik.touched.Gender && formik.errors.Gender ? ' is-invalid' : ''}`}
                                  onClick={() => handleButtonClick('other')}
                                >
                                  <img
                                    src={toAbsoluteUrl('/media/vectors/otherSign.png')}
                                    className={`img-fluid ${selectedOption === 'other' ? 'selected-button-Image' : ''
                                      }`}
                                    alt='Other'
                                  />{' '}
                                  Other
                                </button>
                            </div>   
                                {formik.touched.Gender && formik.errors.Gender && (
    <div className='invalid-feedback-gender'>{formik.errors.Gender}</div>
  )}
                            </div>
                            <div className='col-lg-6 '>
                              <div className='form-group mb-0'>
                                {/* <input
                                  id='Date_of_birth'
                                  placeholder=''
                                  className={`form-control bg-transparent shadow-none customInput ${formik.touched.Date_of_birth && formik.errors.Date_of_birth
                                    ? 'is-invalid'
                                    : ''
                                    }`}
                                  type='date'
                                  value={formik.values.Date_of_birth}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  name='Date_of_birth'
                                  autoComplete='off'
                                  min={(new Date(new Date().setFullYear(new Date().getFullYear() - 18))).toISOString().split("T")[0]}
                                /> */}
                                <Flatpickr
                                  value={formik.values.Date_of_birth}
                                  className={`form-control bg-transparent shadow-none customInput ${formik.touched.Date_of_birth && formik.errors.Date_of_birth
                                    ? 'is-invalid'
                                    : ''
                                    }`}
                                  options={{
                                    enableTime: false,
                                    altInput: true,
                                    altFormat: 'Y-m-d',
                                    dateFormat: 'Y-m-d',
                                    maxDate: new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
                                  }}
                                  onChange={(selectedDates) => {
                                    const dateOfBirth = selectedDates[0];
                                    const formattedDate = dateOfBirth ? formatDate(dateOfBirth) : '';
                                    formik.setFieldValue('Date_of_birth', formattedDate);
                                  }}
                                />
                                <label className='form-label fs-6 fw-bolder ' htmlFor='Date_of_birth'>
                                  Date of Birth
                                </label>
                                {formik.touched.Date_of_birth && formik.errors.Date_of_birth && (
                                  <div className='invalid-feedback'>{formik.errors.Date_of_birth}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className='fv-row d-block input-group mt-6 form-group'>
                          <div className='row'>
                            <div className='col-lg-6 marginPageMYMobile'>
                              <div className='form-group mb-0 '>
                                <input
                                  id='Phone'
                                  placeholder=''
                                  className={`form-control bg-transparent shadow-none  customInput ${formik.touched.Phone && formik.errors.Phone ? 'is-invalid' : ''
                                    }`}
                                  type='text'
                                  value={formik.values.Phone}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  name='Phone'

                                  autoComplete='off'
                                />
                                <label
                                  className='form-label fs-6 fw-bolder '
                                  htmlFor='Phone'
                                >
                                  Phone Number
                                </label>
                                {formik.touched.Phone && formik.errors.Phone && (
                                  <div className='invalid-feedback'>{formik.errors.Phone}</div>
                                )}
                              </div>
                            </div>
                            <div className='col-lg-6 '>
                              <div className='form-group mb-0'>
                                {/* <input
                                  id='Date_of_anniversary'
                                  placeholder=''
                                  className='form-control bg-transparent shadow-none customInput'
                                  type='date'
                                  value={formik.values.Date_of_anniversary}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  name='Date_of_anniversary'
                                  autoComplete='off'
                                /> */}
                                  <Flatpickr
                                  value={formik.values.Date_of_anniversary}
                                  className='form-control bg-transparent shadow-none customInput'
                                  options={{
                                    enableTime: false,
                                    altInput: true,
                                    altFormat: 'Y-m-d',
                                    dateFormat: 'Y-m-d',
                                  }}
                                  onChange={(selectedDates) => {
                                    const dateOfAnniversary = selectedDates[0];
                                    const formattedDate = dateOfAnniversary ? formatDate(dateOfAnniversary) : '';
                                    formik.setFieldValue('Date_of_anniversary', formattedDate);
                                  }}
                                />
                                <label className='form-label fs-6 fw-bolder ' htmlFor='Date_of_anniversary'>
                                  Anniversary Date
                                </label>

                              </div>
                            </div>
                          </div>
                        </div>
                        <div className='fv-row d-block input-group mt-6 form-group'>
                          <div className='row'>
                            <div className='col-lg-6 marginPageMYMobile'>
                              <Select
                                options={bloodGroupOptions}
                                value={
                                  formik.values.Blood_group
                                    ? { label: formik.values.Blood_group, value: formik.values.Blood_group }
                                    : null
                                }
                                onChange={(selectedOption) => formik.setFieldValue('Blood_group', selectedOption?.value || '')}
                                isSearchable
                                placeholder='Select Blood Group'
                                styles={{
                                  control: (provided) => ({
                                    ...provided,
                                    border: '1px solid #7c757e',
                                    borderRadius: '12px',
                                    padding: '9px',
                                  }),
                                  placeholder: (provided) => ({
                                    ...provided,
                                    color: '#777',
                                    fontWeight: 600,
                                    fontSize: '16px !important',
                                  }),
                                  singleValue: (provided) => ({
                                    ...provided,
                                    color: '#777',
                                    fontWeight: 600,
                                    fontSize: '16px !important',
                                  }),
                                }}
                              />






                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className=' card-footer text-black  border-top-2 d-flex justify-content-end'>
                      <button
                        type='button'
                        className=' mobileMarginNone primaryOutlineBtn mx-2  btn btn-default btn-sm'
                        onClick={handleDiscard}
                      // onClick={() => {
                      //   setIsProfileSectionVisible(!isProfileSectionVisible);
                      //   setIsEditSectionVisible(!isEditSectionVisible);
                      // }}
                      >
                        Discard
                      </button>
                      <button type="submit" className='navbarMarginForSearch mx-2 my-0 primaryBtn btn btn-default btn-sm'>
                        {loading ? 'Submitting...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </ProfileDetailsSectionStyles>
  );
}

export default ProfileDetailsSection;
