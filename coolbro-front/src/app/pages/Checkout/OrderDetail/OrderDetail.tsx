import { FC, useState, useEffect } from 'react';
import { toAbsoluteUrl } from '../../../../_metronic/helpers';
import { OrderDetailStyles } from './OrderDetailStyles';
import axios, { AxiosResponse } from 'axios';
import { useFormik } from 'formik'
import * as Yup from 'yup'
import * as authHelper from '../../../modules/auth/core/AuthHelpers'
import Swal from 'sweetalert2'
import { fetchCountryNames } from '../../../common/common'
import {
  defaultShippingAddressFormConfig,
  defaultBillingAddressFormConfig,
  defaultFormErrorConfig,
  defaultBillingAddressValidationConfig
} from '../../../config/sweetAlertConfig'
import { useAuth } from '../../../modules/auth';
import { Coordinates, useGeolocation } from '../../../../context/GeolocationContext';
import CommonShippingAddress from '../../CommonComponents/Address/CommonShippingAddress';
import CommonBillingAddress from '../../CommonComponents/Address/CommonBillingAddress';
import { Button, Modal } from 'react-bootstrap';



interface Address {
  id?: number
  UserID: number
  Company_name: string
  GST_number: string
  First_name: string
  Last_name: string
  Phone_number: string
  Phone_number_2: string
  Address: string
  City: string
  State: string
  PostalCode: string
  Country: string
  Nick_name: string
  isDefaultAddress: false,
}

const validationSchema = Yup.object().shape({
  First_name: Yup.string().trim().required('First Name is required'),
  Phone_number: Yup.string()
    .test('is-valid-phone-number', 'Invalid phone number format', function (value: string | undefined) {
      if (!value) { return false; }
      const phoneRegex = /^\d{10}$/;
      return phoneRegex.test(value);
    }).required('Phone is required'),
  Phone_number_2: Yup.string()
    .test('is-valid-phone-number', 'Invalid phone number format', function (value) {
      // Check for undefined or empty value
      if (!value) {
        return true; // No error if the value is not provided
      }

      const phoneRegex = /^\d{10}$/;
      return phoneRegex.test(value);
    }),
  Address: Yup.string().trim().required('Address is required'),
  City: Yup.string().trim().required('City is required'),
  State: Yup.string().trim().required('State is required'),
  PostalCode: Yup.string()
    .test('is-indian-postal-valid', 'Invalid pin code format', function (value) {
      if (!value) {
        return true; // No error if the value is not provided
      }
      const pinRegex = /^\d{6}$/;
      return pinRegex.test(value);
    }).required('Pin Code is required'),
  Country: Yup.string().trim().required('Country is required'),
})

const validationSchemaForGST = Yup.object().shape({

  Company_name: Yup.string().trim().required('Company name is required'),
  GST_number: Yup.string()
  .trim()
  .required('GST number is required')
  .test('is-indian-gst-valid', 'Invalid GST number format', function (value) {
    return isIndianGSTValid(value);
  }),

})

const isIndianGSTValid = (gstNumber:any) => {
  if (gstNumber.length !== 15) {
    // GST number should be exactly 15 characters long
    return false;
  }
  // Define the regular expression pattern for Indian GST numbers
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  if (!regex.test(gstNumber)) {
    // GST number does not match the expected pattern
    return false;
  }
  return true;
};


interface Dealer {
  ID: number;
  Company_name: string;
  Contact_name: string;
  Contact_email: string;
  Address: string;
  Contact_phone: number;
  Media_url: string;
  averageRating: string;
  addressDetailsArray: any;
  City: string;
  PostalCode: number;
  State: string;
}

interface DealerDetails {
  ID: number;
  Company_name: string;
  Contact_name: string;
  Contact_email: string;
  Address: string;
  Contact_phone: number;
  PostalCode: number;
  State: string;
  City: string
}

const OrderDetail: FC = () => {
  const coordinates = useGeolocation();
  const [selectedDealer, setSelectedDealer] = useState<DealerDetails | null>(null);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isHeaderVisibleShipAddress, setIsHeaderVisibleShipAddress] = useState(true);
  const [isHeaderVisibleBillAddress, setIsHeaderVisibleBillAddress] = useState(true);
  const [isHeaderVisibleGSTAddress, setIsHeaderVisibleGSTAddress] = useState(true);
  const TOKEN = authHelper.getAuth()
  const { currentUser, logout } = useAuth()
  const [selectedShippingAddressID, setSelectedShippingAddressID] = useState<any>(null)
  const [selectedBillingAddressID, setSelectedBillingAddressID] = useState<any>(null)
  const [shippingAddressData, setShippingAddressData] = useState<Address[]>([]);
  const [billingAddressData, setBillingAddressData] = useState<Address[]>([]);
  const [initialShippingFormValues, setInitialShippingFormValues] = useState<Address | null>(null)
  const [initialBillingFormValues, setInitialBillingFormValues] = useState<Address | null>(null)
  const [openAddShippingAddress, setOpenAddShippingAddress] = useState(false);
  const [openEditShippingAddress, setOpenEditShippingAddress] = useState(false);
  const [openAddBillingAddress, setOpenAddBillingAddress] = useState(false)
  const [openEditBillingAddress, setOpenEditBillingAddress] = useState(false)

  const [isGSTInvoiceEnabled, setIsGSTInvoiceEnabled] = useState(false);
  const [isGSTInvoiceChecked, setIsGSTInvoiceChecked] = useState(false);
  const [isGSTInvoiceModalOpen, setIsGSTInvoiceModalOpen] = useState(false);
  const [isGSTInvoiceDataExist, setIsGSTInvoiceDataExist] = useState(false);

  const [modalData, setModalData] = useState({
    GST_number: '',
    Company_name: '',
  });

  const useAddressFormik = (type: 'shipping' | 'billing') => {
    const initialValues = {
      UserID: currentUser ? currentUser.ID : '',
      Company_name: '',
      GST_number: '',
      First_name: '',
      Last_name: '',
      Phone_number: '',
      Phone_number_2: '',
      Address: '',
      City: '',
      State: '',
      PostalCode: '',
      Country: '',
      Nick_name:'',
      isDefaultAddress: false,
      ...(type === 'shipping' ? initialShippingFormValues : initialBillingFormValues),
    };

    const formik = useFormik({
      initialValues,
      validationSchema,
      onSubmit: (values) => {
        try {
          setLoading(true);
          const requestData: Address = {
            UserID: currentUser ? Number(currentUser.ID) : 0,
            Company_name: values.Company_name,
            GST_number: values.GST_number,
            First_name: values.First_name,
            Last_name: values.Last_name,
            Phone_number: values.Phone_number,
            Phone_number_2: values.Phone_number_2,
            Address: values.Address,
            City: values.City,
            State: values.State,
            PostalCode: values.PostalCode,
            Country: values.Country,
            Nick_name:values.Nick_name,
            isDefaultAddress: false,
          };

          if (type === 'shipping') {
            if (selectedShippingAddressID !== null) {
              requestData.id = selectedShippingAddressID;
            } else {
              delete requestData.id
            }
          } else {
            if (selectedBillingAddressID !== null) {
              requestData.id = selectedBillingAddressID;
            } else {
              delete requestData.id
            }
          }
          axios
            .post(`${process.env.REACT_APP_SERVER_URL}/address/add_update_address`, requestData, {
              headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken },
            })
            .then(async (res) => {
              if (res.status === 200 && res.data.message) {
                setLoading(false);
                const addressIdKey = type === 'shipping' ? 'shippingId' : 'billingId';
                localStorage.setItem(addressIdKey, res.data.addressId);

                const confirmAdd =
                  type === 'shipping'
                    ? await Swal.fire(defaultShippingAddressFormConfig)
                    : await Swal.fire(defaultBillingAddressFormConfig);

                if (confirmAdd.isConfirmed) {
                  if (type === 'shipping') {
                    setOpenAddShippingAddress(false);
                    setOpenEditShippingAddress(false);
                    setSelectedShippingAddressID(null);
                    setIsHeaderVisibleShipAddress(false);
                    getAllShippingAddress();
                  } else {
                    setOpenAddBillingAddress(false);
                    setOpenEditBillingAddress(false);
                    setSelectedBillingAddressID(null);
                    setIsHeaderVisibleBillAddress(false);
                    getAllBillingAddress();
                  }
                }
              } else {
                handleRequestError(res);
              }
            })
            .catch((err) => {
              console.log(err);
              Swal.fire(defaultFormErrorConfig);
              setLoading(false);
            });
        } catch (err) {
          Swal.fire(defaultFormErrorConfig);
          setLoading(false);
        }
      },
    });
    return formik;
  };

  const formikShipping = useAddressFormik('shipping');
  const formikBilling = useAddressFormik('billing');

  const handleRequestError = (res: AxiosResponse) => {
    setLoading(false);
    Swal.fire(defaultFormErrorConfig);

    if (res.status === 400) {
      console.log('Bad Request: ', res.data.error);
    } else if (res.status === 401) {
      logout();
    } else {
      console.log('Error: ', res.data.error);
    }
  };

  const fetchAddress = async (addressId: string, setAddressData: React.Dispatch<React.SetStateAction<Address[]>>) => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_SERVER_URL}/address/${addressId}`, {
        headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken },
      });
      if (res.data.status === 'success') {
        setLoading(false);
        setAddressData([res.data.data]);
        setIsGSTInvoiceEnabled(true);
        const dataExist = res.data.data.Company_name || res.data.data.GST_number;
        setIsGSTInvoiceDataExist(!!dataExist);
        setIsGSTInvoiceChecked(!!dataExist)
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  };

  const getAllShippingAddress = () => {
    const shippingAddressId = localStorage.getItem('shippingId');
    if (shippingAddressId) {
      fetchAddress(shippingAddressId, setShippingAddressData);
    }
  };

  const getAllBillingAddress = () => {
    const billingAddressId = localStorage.getItem('billingId');
    if (billingAddressId) {
      fetchAddress(billingAddressId, setBillingAddressData);
    }
  };

  const handleEditShippingAddress = (address: any, index: number) => {
    setSelectedShippingAddressID(address.ID)
    setInitialShippingFormValues(address)
    setOpenAddShippingAddress(false)
    setOpenEditShippingAddress(true)
  }
  useEffect(() => {
    console.log("After state update:", openEditShippingAddress);
  }, [openEditShippingAddress]);

  const resetShippingFormValues = () => {
    formikShipping.resetForm();
    setInitialShippingFormValues(null);
    setOpenAddShippingAddress(true)
    setOpenEditShippingAddress(false)
  };
  const handleShippingCancel = () => {
    setSelectedShippingAddressID(null)
    setOpenAddShippingAddress(false)
    setOpenEditShippingAddress(false)
  }

  const handleEditBillingAddress = (address: any, index: number) => {
    setSelectedBillingAddressID(address.ID)
    setInitialBillingFormValues(address)
    setOpenAddBillingAddress(false)
    setOpenEditBillingAddress(true)
  }
  useEffect(() => {
    console.log("After state update:", openEditBillingAddress);
  }, [openEditBillingAddress]);

  const resetBillingFormValues = () => {
    formikBilling.resetForm();
    setInitialBillingFormValues(null);
    setOpenAddBillingAddress(true)
    setOpenEditBillingAddress(false)
  };
  const handleBillingCancel = () => {
    setSelectedBillingAddressID(null)
    setOpenAddBillingAddress(false);
    setOpenEditBillingAddress(false)
  }

  const handleDropdownCountryName = (selectedOption: any) => {
    formikShipping.setFieldValue('Country', selectedOption?.label || '');
  };
  const handleDropdownCountryNameBilling = (selectedOption: any) => {
    formikBilling.setFieldValue('Country', selectedOption?.label || '');
  };

  useEffect(() => {

    const shippingAddressId = localStorage.getItem('shippingId');
    const billingAddressId = localStorage.getItem('billingId');
    const storedDealerId = localStorage.getItem('selectedDealerId');
    if (storedDealerId) {
      // If the dealer ID is stored in local storage, fetch dealer details
      fetchDealerDetails(parseInt(storedDealerId));
      setIsHeaderVisible(false)
    }
    if (shippingAddressId) {
      getAllShippingAddress();
      setIsHeaderVisibleShipAddress(false);
    } else {
      setIsHeaderVisibleShipAddress(true);
    }
    if (billingAddressId) {
      getAllBillingAddress();
      setIsHeaderVisibleBillAddress(false);
    } else {
      setIsHeaderVisibleBillAddress(true);
    }

    fetchCountryNames();
  }, [TOKEN?.AccessToken, currentUser])

  useEffect(() => {

    if (initialShippingFormValues) {
      formikShipping.setValues({ ...formikShipping.values, ...initialShippingFormValues });
    };
    if (initialBillingFormValues) {
      formikBilling.setValues({ ...formikBilling.values, ...initialBillingFormValues })
    };
  }, [initialShippingFormValues, initialBillingFormValues])

  const fetchDealers = async (coord: Coordinates | null) => {
    setLoading(true);
    if (coord) {
      const { latitude, longitude } = coord;
      setLoading(true);
      // Now you have the user's current latitude and longitude
      axios
        .post(`${process.env.REACT_APP_SERVER_URL}/dealer/search-dealer`, {
          Page: 1,
          Limit: 10,
          "latitude": latitude,
          "longitude": longitude
        })
        .then((res: any) => {
          if (res.data && res.data.data) {
            setLoading(false);
            setDealers(res.data.data);
            console.log(dealers);
          }
          else {
            setLoading(false);
            setDealers([]);
          }
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else {
      console.error("Geolocation is not available in this browser.");
    }
  };

  const fetchDealerDetails = (dealerId: number) => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/dealer/dealer-details/${dealerId}`)
      .then((res: any) => {
        if (res.data && res.data.data) {
          setLoading(false);
          setSelectedDealer(res.data.data);
        } else {
          setLoading(false);
          setSelectedDealer(null);
        }
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
        setSelectedDealer(null);
      });
  };
  const handleSelectButtonClick = () => {
    fetchDealers(coordinates);
  }

  const handleSelectDealer = (selectedDealer: Dealer) => {
    localStorage.setItem('selectedDealerId', selectedDealer.ID.toString());
    fetchDealerDetails(selectedDealer.ID);
    setSelectedDealer(selectedDealer);
    setIsHeaderVisible(false)
  }

  // const handleSubmitGSTAddress = () => {
  //   setIsGSTInvoiceModalOpen(false);
  //   // setIsGSTInvoiceDataExist(true);
  //   validationSchemaForGST.validate(formikBilling.values, { abortEarly: false })
  //   const billingAddressId = localStorage.getItem('billingId');
  //   const requestData = {
  //     id: billingAddressId,
  //     GST_number: formikBilling.values.GST_number,
  //     Company_name: formikBilling.values.Company_name,
  //   };
  //   axios
  //     .post(`${process.env.REACT_APP_SERVER_URL}/address/add_update_address`, requestData, {
  //       headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken },
  //     })
  //     .then((res) => {
  //       if (res.status === 200 && res.data.message) {
  //         setIsGSTInvoiceDataExist(true);
  //         getAllBillingAddress();
  //       } else {
  //         handleRequestError(res);
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       Swal.fire(defaultFormErrorConfig);
  //       setLoading(false);
  //     });

  //   // api call  
  // }

  const formik = useFormik({
    initialValues: {
      GST_number: '',
      Company_name: ''
    }, ...(initialBillingFormValues),
    validationSchema: validationSchemaForGST,
    onSubmit: (values) => {
      try {
        setLoading(true)
        setIsGSTInvoiceModalOpen(false);
        const billingAddressId = localStorage.getItem('billingId');
        const requestData = {
          id: billingAddressId,
          GST_number: formik.values.GST_number,
          Company_name: formik.values.Company_name,
        };
        axios
      .post(`${process.env.REACT_APP_SERVER_URL}/address/add_update_address`, requestData, {
        headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken },
      })
      .then((res) => {
        if (res.status === 200 && res.data.message) {
          setLoading(false)
          setIsGSTInvoiceDataExist(true);
          getAllBillingAddress();
        } else {
          handleRequestError(res);
        }
      })
          .catch((err) => {
            console.log(err)
            Swal.fire(defaultFormErrorConfig)
            //formik.setFieldError('Name', err.response.data.message);
            setLoading(false)
            // Handle the error
          })
      } catch (err) {
        Swal.fire(defaultFormErrorConfig)
        setLoading(false)
        // Handle the error
      }
    },
  })

  const handleCheckboxChange = () => {
    // if (isGSTInvoiceEnabled) {
    //   setIsGSTInvoiceChecked(true);
    //   setIsGSTInvoiceModalOpen(true);
    // }
    const billingAddressId = localStorage.getItem('billingId');

    if (billingAddressId) {
      // If billing address is available, open GST Invoice Modal
      setIsGSTInvoiceChecked(true);
      setIsGSTInvoiceModalOpen(true);
    } else {
      Swal.fire(defaultBillingAddressValidationConfig);
    }
  };
  const handleEditGstData = (address: any, index: number) => {
    setSelectedBillingAddressID(address.ID);
  
    // Set initial values for the GST form
    formik.setValues({
      GST_number: address.GST_number || '',
      Company_name: address.Company_name || '',
    });
  
    setIsGSTInvoiceModalOpen(true);
  };
  
  // const openGSTInvoiceModal = () => {
  //   setIsGSTInvoiceModalOpen(true);
  // };

  const closeGSTInvoiceModal = () => {
    formik.resetForm(); 
    setIsGSTInvoiceModalOpen(false);
    if (isGSTInvoiceDataExist) {
      setIsGSTInvoiceChecked(true);
    } else {
      setIsGSTInvoiceChecked(false);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setModalData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    formikBilling.setFieldValue(name, value);
  };

  return (
    <>
      <OrderDetailStyles>
        <section>
          <div className='row my-10'>
            <div className='col-lg-12 px-0 pe-10'>

              <div className='headingText'>
                <h1 className='primaryTextBold'>CHECKOUT DETAILS</h1>
              </div>

              <div className='productCard mt-5'>
                <div className='row'>
                  <div className='col-lg-12'>
                    <SelectDealersSection
                      isHeaderVisible={isHeaderVisible}
                      handleSelectButtonClick={handleSelectButtonClick}
                      dealers={dealers}
                      onSelectDealer={handleSelectDealer}
                      selectedDealer={selectedDealer}
                    />

                    {/* Shipping Address Section */}
                    <div className='my-8 mt-0 boxNavPills'>
                      {isHeaderVisibleShipAddress ? (
                        <div id='accordion1' className='boxNavPills'>
                          <div className='card'>
                            <div
                              className='card-header px-8 py-4 d-flex align-items-center'
                              id='headingOne2'
                            >
                              <div className='d-flex justify-content-between align-items-center'>
                                <div className='d-flex align-items-center'>
                                  <div className=''>
                                    <div className='accordionHead'>2</div>
                                  </div>
                                  <h2 className='ps-4 text-gray-500 mb-0'>Shipping Address</h2>
                                </div>
                              </div>

                              <button
                                className='btn btn-link'
                                onClick={() => resetShippingFormValues()}
                              >
                                <div className='d-flex'>
                                  <i className='fa fa-plus primaryTextBold fs-1'></i>
                                </div>
                              </button>
                            </div>
                            <div id='collapseOne1'>
                              {openAddShippingAddress && (
                                <CommonShippingAddress
                                  formik={formikShipping}
                                  handleCancel={handleShippingCancel}
                                  handleDropdownCountryName={handleDropdownCountryName}
                                  loading={loading}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div id='accordion2' className='my-4'>
                          {shippingAddressData.map((address: any, index: number) => (
                            <div className='card boxNavPills my-3' key={index}>
                              <div className='px-8 py-8 pt-4' id={`headingOne2-${index}`}>
                                <h5 className='mb-0'>
                                  <div className='d-flex justify-content-between align-items-center'>
                                    <div className='d-flex align-items-center'>
                                      <div className=''>
                                        <div className='accordionHead'>2</div>
                                      </div>
                                      <h2 className='ps-4 text-gray-500 mb-0'>Shipping Address</h2>
                                    </div>
                                    <div className='actionButtons d-flex align-items-center justify-content-end ms-auto'>
                                      <button className="btn btn-link ">
                                        <div className='px-2'>
                                          <img
                                            className='cursor-pointer'
                                            onClick={() => handleEditShippingAddress(address, index)}
                                            alt='actBtn'
                                            src={toAbsoluteUrl('/media/vectors/EditAction.png')}
                                          />
                                        </div>
                                      </button>
                                    </div>
                                  </div>
                                  <div className='innerContactDetails my-3'>
                                    <div className='d-flex  addAlignStart   my-2 mobileFlexColumn'>
                                      <div className='d-flex align-items-center navbarMarginForSearch'>
                                        <img
                                          alt='actBtn'
                                          height={30}
                                          width={30}
                                          src={toAbsoluteUrl('/media/vectors/nameIconCustom.png')}
                                        />
                                        <h4 className='  text-black fw-normal mb-0 ps-2 fw-normal'>
                                          {address.First_name} {address.Last_name}
                                        </h4>
                                      </div>
                                      <div className='d-flex marginTopProfile align-items-center navbarMarginForSearch mobileMarginNone mx-4'>
                                        <img
                                          alt='actBtn'
                                          height={30}
                                          width={30}
                                          src={toAbsoluteUrl('/media/vectors/dialIconCustom.png')}
                                        />
                                        <h4 className=' text-black fw-normal mb-0 ps-2 '>
                                          {address.Phone_number}
                                        </h4>
                                      </div>
                                    </div>

                                    <div className='d-flex addAlignStart align-items-center '>
                                      <div className='my-2 paddingPagePXMobile'>
                                        <img
                                          height={30}
                                          alt='actBtn'
                                          width={30}
                                          src={toAbsoluteUrl('/media/vectors/pinIconCustom.png')}
                                        />
                                      </div>
                                      <h4 className='text-black fw-normal mb-0 ps-3'>
                                        {address.Address}, {address.City}, {address.State} - {address.PostalCode}, {address.Country}.
                                      </h4>
                                    </div>
                                  </div>
                                </h5>
                              </div>

                              <div
                                id={`collapseOne2-${index}`}
                              >
                                {openEditShippingAddress && (
                                  <CommonShippingAddress
                                    formik={formikShipping}
                                    handleCancel={handleShippingCancel}
                                    handleDropdownCountryName={handleDropdownCountryName}
                                    loading={loading}
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* End of Shipping Address Section */}

                    {/* Billing Address Section */}
                    <div className='my-8 mt-0 boxNavPills'>
                      {isHeaderVisibleBillAddress ? (
                        <div id='accordion1' className='boxNavPills'>
                          <div className='card'>
                            <div
                              className='card-header px-8 py-4 d-flex align-items-center'
                              id='headingOne2'
                            >
                              <div className='d-flex justify-content-between align-items-center'>
                                <div className='d-flex align-items-center'>
                                  <div className=''>
                                    <div className='accordionHead'>3</div>
                                  </div>
                                  <h2 className='ps-4 text-gray-500 mb-0'>Billing Address</h2>
                                </div>
                              </div>

                              <button
                                className='btn btn-link '
                                data-bs-toggle='collapse'
                                data-bs-target='#collapseOne1'
                                aria-expanded='false'
                                aria-controls='collapseOne1'
                                onClick={() => resetBillingFormValues()}
                              >
                                <div className='d-flex'>
                                  <i className='fa fa-plus primaryTextBold fs-1'></i>
                                </div>
                              </button>
                            </div>
                            <div
                              id='collapseOne1'
                              className='collapse'
                              aria-labelledby='headingOne1'
                              data-parent='#accordion1'
                            >
                              {openAddBillingAddress && (
                                <CommonBillingAddress
                                  formik={formikBilling}
                                  handleCancel={handleBillingCancel}
                                  handleDropdownCountryName={handleDropdownCountryNameBilling}
                                  loading={loading}
                                />
                              )}
                            </div>
                          </div>

                        </div>
                      ) : (

                        <div id='accordion2' className='my-4'>
                          {billingAddressData.map((address: any, index: number) => (
                            <div className='card boxNavPills my-3' key={index}>
                              <div className='px-8 py-8 pt-4' id={`headingOne2-${index}`}>
                                <h5 className='mb-0'>
                                  <div className='d-flex justify-content-between align-items-center'>
                                    <div className='d-flex align-items-center'>
                                      <div className=''>
                                        <div className='accordionHead'>3</div>
                                      </div>
                                      <h2 className='ps-4 text-gray-500 mb-0'>Billing Address</h2>
                                    </div>
                                    <div className='actionButtons d-flex align-items-center justify-content-end ms-auto'>
                                      <button className="btn btn-link ">
                                        <div className='px-2'>
                                          <img
                                            className='cursor-pointer'
                                            onClick={() => handleEditBillingAddress(address, index)}
                                            alt='actBtn'
                                            src={toAbsoluteUrl('/media/vectors/EditAction.png')}
                                          />
                                        </div>
                                      </button>
                                    </div>
                                  </div>
                                  <div className='innerContactDetails my-3'>
                                    <div className='d-flex  addAlignStart   my-2 mobileFlexColumn'>
                                      <div className='d-flex align-items-center navbarMarginForSearch'>
                                        <img
                                          alt='actBtn'
                                          height={30}
                                          width={30}
                                          src={toAbsoluteUrl('/media/vectors/nameIconCustom.png')}
                                        />
                                        <h4 className='  text-black fw-normal mb-0 ps-2 fw-normal'>
                                          {address.First_name} {address.Last_name}
                                        </h4>
                                      </div>
                                      <div className='d-flex marginTopProfile align-items-center navbarMarginForSearch mobileMarginNone mx-4'>
                                        <img
                                          alt='actBtn'
                                          height={30}
                                          width={30}
                                          src={toAbsoluteUrl('/media/vectors/dialIconCustom.png')}
                                        />
                                        <h4 className=' text-black fw-normal mb-0 ps-2 '>
                                          {address.Phone_number}
                                        </h4>
                                      </div>
                                    </div>

                                    <div className='d-flex addAlignStart align-items-center '>
                                      <div className='my-2 paddingPagePXMobile'>
                                        <img
                                          height={30}
                                          alt='actBtn'
                                          width={30}
                                          src={toAbsoluteUrl('/media/vectors/pinIconCustom.png')}
                                        />
                                      </div>
                                      <h4 className='text-black fw-normal mb-0 ps-3'>
                                        {address.Address}, {address.City}, {address.State} - {address.PostalCode}, {address.Country}.
                                      </h4>
                                    </div>
                                  </div>
                                </h5>
                              </div>
                              <div
                                id={`collapseOne2-${index}`}
                              >
                                {openEditBillingAddress && (
                                  <div>
                                    <CommonBillingAddress
                                      formik={formikBilling}
                                      handleCancel={handleBillingCancel}
                                      handleDropdownCountryName={handleDropdownCountryNameBilling}
                                      loading={loading}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* End of Billing Address Section */}

                    {/* Use GST Invoice Section */}
                    <div id='accordion4' className='my-8 mb-0 boxNavPills'>
                      <div className='card'>
                        <div className='card-header  border-0 py-4 px-8 d-flex align-items-center' id='headingOne1' >
                          <div className='d-flex justify-content-between align-items-center'>
                            <div className='d-flex align-items-center'>
                              <div className='form-check formCustomCheck align-items-center'>
                                <input
                                  className='customCheckBox form-check-input'
                                  type='checkbox'
                                  value=''
                                  checked={isGSTInvoiceChecked}
                                  onChange={handleCheckboxChange}
                                  id='flexCheckDefault'
                                />
                                <label className='ps-5 fs-2 ps-4 d-block fw-medium text-black-500 mb-0' htmlFor='flexCheckDefault2'>
                                  Use GST Invoice
                                </label>
                              </div>
                            </div>
                          </div>
                          {isGSTInvoiceDataExist ? (
                            <div>
                               {billingAddressData.map((address: any, index: number) => (
                            <div className='d-flex cusror-pointer'   onClick={() => handleEditGstData(address, index)}>
                              <img src={toAbsoluteUrl('/media/vectors/EditAction.png')} className='img-fluid cursor-pointer' alt='Logout' />
                            </div>
                             ))}
                            </div>
                          ) : ('')}
                        </div>
                        {isGSTInvoiceDataExist ? (
                         
                          <div className='px-8 pb-5 mobilePaddingNone innerContactDetails my-3'>
                              {billingAddressData.map((address: any, index: number) => (
                            <div className='d-flex addAlignStart align-items-center my-1 mobileFlexColumn'>
                              <div className='my-1 ps-2 d-flex align-items-center '>
                                <img alt='actBtn' height={30} width={30} src={toAbsoluteUrl('/media/vectors/OrganizationIcon.png')} />
                                <h4 className='text-black fw-normal mb-0 ps-2 fw-normal'>{address.Company_name}</h4>
                              </div>
                              <div className='my-1 ps-2 d-flex align-items-center  mobileMarginNone mx-4'>
                                <img alt='actBtn' height={30} width={30} src={toAbsoluteUrl('/media/vectors/GSTWhiteIcon.png')} />
                                <h4 className='text-black fw-normal mb-0 ps-2 '>{address.GST_number}</h4>
                              </div>
                            </div>
                              ))}
                             
                          </div>
                        ) : ('')}

                        <Modal show={isGSTInvoiceModalOpen} onHide={closeGSTInvoiceModal} centered>
                          <Modal.Header closeButton>
                            <Modal.Title className='primaryTextMediumBold'>Your GST Information</Modal.Title>
                          </Modal.Header>
                          <form onSubmit={formik.handleSubmit}>
                            <Modal.Body>
                              <div className='container-fluid px-10'>
                                {/* ... (other code remains the same) */}
                                <div className='fv-row d-block input-group  form-group paddingPagePXMobile'>
                                  <div className='row'>
                                    <div className='col-lg-12'>
                                      <div className='form-group '>
                                        <input
                                          id='GST_number'
                                          placeholder=''
                                          className={`form-control bg-transparent shadow-none  customInput ${formik.touched.GST_number && formik.errors.GST_number
                                            ? 'is-invalid'
                                            : ''
                                            }`}
                                          type='text'
                                          name='GST_number'
                                          autoComplete='off'
                                          value={formik.values.GST_number}
                                          onChange={formik.handleChange}
                                          onBlur={formik.handleBlur}
                                        />
                                        <label
                                          className='form-label fs-6 fw-bolder '
                                          htmlFor='GSTIN'
                                        >
                                          GSTIN
                                        </label>
                                        {formik.touched.GST_number && formik.errors.GST_number && (
                                          <div className='text-danger'>{formik.errors.GST_number}</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className='fv-row d-block input-group  form-group paddingPagePXMobile'>
                                  <div className='row'>
                                    <div className='col-lg-12'>
                                      <div className='form-group mb-0 paddingPagePXMobile'>
                                        <input
                                          id='Company_name'
                                          placeholder=''
                                          className={`form-control bg-transparent shadow-none  customInput ${formik.touched.Company_name && formik.errors.Company_name
                                            ? 'is-invalid'
                                            : ''
                                            }`}
                                          type='text'
                                          name='Company_name'
                                          autoComplete='off'
                                          value={formik.values.Company_name}
                                          onChange={formik.handleChange}
                                          onBlur={formik.handleBlur}
                                        />
                                        <label
                                          className='form-label fs-6 fw-bolder '
                                          htmlFor='organizationName'
                                        >
                                          Company Name
                                        </label>
                                        {formik.touched.Company_name && formik.errors.Company_name && (
                                          <div className='text-danger'>{formik.errors.Company_name}</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className='d-flex  align-items-center navbarMarginForSearch'>
                                  <img
                                    src={toAbsoluteUrl('/media/vectors/InfoIcon.png')}
                                    className='img-fluid cursor-pointer'
                                    alt='Logout'
                                  />{' '}
                                  <small className='text-black ps-2'>
                                    Incorrect GSTIN details will lead to order cancellation
                                  </small>
                                </div>
                              </div>
                            </Modal.Body>
                            <Modal.Footer className='d-flex m-auto border-top-0 pt-0'>
                              <Button variant='primary' disabled={loading} className='primaryBtn btn btn-primary px-15' type='submit'>
                              {!loading ? 'Submit' : 'Submiting'}
                              </Button>
                            </Modal.Footer>
                          </form>
                        </Modal>
                      </div>
                    </div>
                    {/* End of Use GST Invoice Section */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </OrderDetailStyles>
    </>
  )
}


const SelectDealersHeader: React.FC<{
  handleSelectButtonClick: () => void;
  isHeaderVisible: boolean;
  selectedDealer: DealerDetails | null;
}> = ({ handleSelectButtonClick, isHeaderVisible, selectedDealer }) => (
  <div className={` ${isHeaderVisible ? 'px-8 py-4' : 'py-4 px-8'}`} id='headingOne1'>
    <div className='d-flex justify-content-between align-items-center'>
      <div className='d-flex align-items-center'>
        <div className=''>
          <div className='accordionHead'>1</div>
        </div>
        <h2 className='ps-4 text-gray-500 mb-0'>
          {isHeaderVisible ? 'Select Dealer' : 'Selected Dealer'}
        </h2>
      </div>
      <button
        className='btn btn-link '
        data-bs-toggle='modal'
        data-bs-target='#kt_modal_1'
        aria-expanded='false'
        aria-controls='collapseOne1'
        onClick={handleSelectButtonClick}
      >
        <div className='d-flex'>
          {isHeaderVisible ? (
            <i className='fa fa-plus primaryTextBold fs-1'></i>
          ) : selectedDealer ? (
            <img
              src={toAbsoluteUrl('/media/vectors/EditAction.png')}
              className='img-fluid'
              alt='Edit'
            />
          ) : null}
        </div>
      </button>
    </div>
    {selectedDealer && <SelectedDealerDetails selectedDealer={selectedDealer} />}
  </div>
);

const SelectedDealerDetails: React.FC<{ selectedDealer: DealerDetails | null }> = ({ selectedDealer }) => (
  <div className='innerContactDetails  zza mobilePaddingNone'>
    <div className='mobileMarginNone my-3 align-items-center'>
      <div className='d-flex justify-content-around py-0 mobilePaddingNone flex-column'>
        <div className='d-flex flex-wrap justifyContentMobileBetween'>
          <div className='d-flex align-items-center my-1 ps-2'>
            <img
              height={30}
              width={30}
              src={toAbsoluteUrl('/media/vectors/DealerOrg.png')}
              alt=''
            />
            <h4 className=' ms-3 text-black fw-normal mb-0 mobilePaddingNone'>
              {selectedDealer?.Company_name}
            </h4>
          </div>
          <div className='d-flex align-items-center my-1  navbarMarginForSearch ps-2'>
            <img
              height={30}
              width={30}
              src={toAbsoluteUrl('/media/vectors/mailIconCustom.png')}
              alt=''
            />
            <h4 className=' text-black fw-normal mobilePaddingNone mb-0 ms-3'>
              {selectedDealer?.Contact_email}
            </h4>
          </div>
          <div className='d-flex align-items-center my-1 navbarMarginForSearch  ps-2'>
            <img
              height={30}
              width={30}
              src={toAbsoluteUrl('/media/vectors/dialIconCustom.png')}
              alt=''
            />
            <h4 className=' text-black fw-normal mb-0 mobilePaddingNone ms-3'>
              {selectedDealer?.Contact_phone}
            </h4>
          </div>
        </div>

        <div className='my-1 d-flex addAlignStart align-items-center ps-2'>
          <div className=' paddingPagePXMobile'>
            <img
              height={30}
              alt='actBtn'
              width={30}
              src={toAbsoluteUrl('/media/vectors/pinIconCustom.png')}
            />
          </div>
          <h4 className=' text-black fw-normal mb-0 ps-3 '>
            {selectedDealer?.Address} {selectedDealer?.City} {selectedDealer?.State} {selectedDealer?.PostalCode}
          </h4>
        </div>

      </div>
    </div>
  </div>
);

const SelectDealerModal: React.FC<{
  dealers: Dealer[];
  onSelectDealer: (dealer: Dealer) => void;
  toggleOverlay: () => void;
  showOverlay: boolean;
  selectedDealer: Dealer | null;
}> = ({ dealers, onSelectDealer, toggleOverlay, showOverlay,selectedDealer }) => (
  <div className='modal fade' tabIndex={-1} id='kt_modal_1'>
    <div className='modal-dialog modal-lg'>
      <div className='modal-content'>
        <div className='modal-header pb-4'>
          <h2 className='primaryTextMediumBold mb-0'>Select Dealer</h2>
          <div
            className='text-white btn btn-icon  ms-2'
            data-bs-dismiss='modal'
            aria-label='Close'
          >
            <i className='fa fa-close text-black fs-2'></i>
          </div>
        </div>
        <div className='modal-body DealerBodyWrapper'>
          <div className='row' >
          {dealers.map((dealer) => (
  <div
    className={`col-lg-4 ${
      selectedDealer && selectedDealer.ID === dealer.ID ? 'selected' : ''
    }`}
    key={dealer.ID}
    onClick={() => onSelectDealer(dealer)}
  >
    <div className=''>
      <div className='img-square-wrapper'>
        <div className=''>
          <div className='rateImageDiv1' onClick={toggleOverlay}>
            <img
              className='img-fluid mobileWFull'
              src={toAbsoluteUrl('/media/vectors/Dealer1.png')}
              alt='Card cap'
            />
            {(selectedDealer && selectedDealer.ID === dealer.ID) && (
              <div className='overlay'>
                <i className='fa fa-check'></i>
              </div>
            )}
            <div className='ratingMainDiv1'>
              <div className='rateText'>{dealer.averageRating}</div>
              <div className=''>
                <i
                  className='fa fa-star ps-2 text-white'
                  aria-hidden='true'
                ></i>
              </div>
            </div>
          </div>
        </div>
        <div className='my-5'>
          <h2 className='card-title primaryTextBold'>
            {dealer.Company_name}
          </h2>

          <div className='d-flex align-items-center'>
            <div className='my-2'>
              <img
                className='img-fluid'
                src={toAbsoluteUrl('/media/vectors/typcn_location.png')}
                alt=''
              />
            </div>
            <h5 className='secondaryText mb-0 ps-2'>
              {dealer.addressDetailsArray && dealer.addressDetailsArray.length > 0
                ? dealer.addressDetailsArray[0].City
                : ''}
            </h5>
          </div>
        </div>
      </div>
    </div>
  </div>
))}

          </div>
        </div>
        <div className='modal-footer contentAround'>
          <button
            type='button'
            className='primaryOutlineBtn px-10 btn btn-light'
            data-bs-dismiss='modal'
          >
            Close
          </button>
          {/* <button
            data-bs-dismiss='modal'
            type='button'
            className='px-10 primaryBtn  btn btn-primary'
          >
            Select
          </button> */}
        </div>
      </div>
    </div>
  </div>
);

interface SelectDealersSectionProps {
  isHeaderVisible: boolean;
  handleSelectButtonClick: () => void;
  dealers: Dealer[];
  onSelectDealer: (dealer: Dealer) => void;
  selectedDealer: DealerDetails | null
}

const SelectDealersSection: React.FC<SelectDealersSectionProps> = ({
  isHeaderVisible,
  handleSelectButtonClick,
  dealers,
  onSelectDealer,
  selectedDealer
}) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const toggleOverlay = () => {
    setShowOverlay(!showOverlay)
  }

  return (
    <div id="accordion1" className="my-8 mt-0 boxNavPills">
      <div className="card">
        <SelectDealersHeader
          handleSelectButtonClick={handleSelectButtonClick}
          isHeaderVisible={isHeaderVisible}
          selectedDealer={selectedDealer}
        />
        <SelectDealerModal
          dealers={dealers}
          onSelectDealer={onSelectDealer}
          toggleOverlay={toggleOverlay}
          showOverlay={showOverlay}
          selectedDealer={selectedDealer as Dealer | null} 
        />
      </div>
    </div>
  );
};


export default OrderDetail
