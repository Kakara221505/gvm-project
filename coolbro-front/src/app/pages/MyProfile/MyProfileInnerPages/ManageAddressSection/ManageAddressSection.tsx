import React, { useEffect, useState, FC } from 'react'
import { toAbsoluteUrl } from '../../../../../_metronic/helpers'
import { ManageAddressSectionStyles } from './ManageAddressSectionStyles'
import * as authHelper from '../../../../modules/auth/core/AuthHelpers'
import { fetchCountryNames } from '../../../../common/common'
import axios from 'axios'
import { useAuth } from '../../../../modules/auth'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Swal from 'sweetalert2'
import CommonAddressForm from '../../../CommonComponents/Address/CommonAddressForm'
import {
  defaultDeleteErrorConfig,
  defaultDeleteSuccessConfig,
  defaultDeleteConfig,
  defaultFormErrorConfig,
  defaultFormUpdateConfig,
} from '../../../../config/sweetAlertConfig'

interface Address {
  id?: number
  UserID: number
  Company_name: string
  Nick_name: string
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
  isDefaultAddress: boolean
}

const validationSchema = Yup.object().shape({
  First_name: Yup.string().trim().required('First Name is required'),
  Phone_number: Yup.string()
    .test('is-valid-phone-number','Invalid phone number format', function (value: string | undefined) {
      if (!value) { return false; }
      const phoneRegex = /^\d{10}$/;
      return phoneRegex.test(value);
    }).required('Phone is required'),
  Phone_number_2: Yup.string()
    .test('is-valid-phone-number','Invalid phone number format', function (value) {
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
  .test('is-indian-postal-valid','Invalid pin code format',function (value) {
    if (!value) {
      return true; // No error if the value is not provided
    }
    const pinRegex = /^\d{6}$/;
    return pinRegex.test(value);
  }).required('Pin Code is required'),
  Country: Yup.string().trim().required('Country is required'),
})

const ManageAddressSection: FC = () => {
  const [loading, setLoading] = useState(true)
  const [selectedAddressID, setSelectedAddressID] = useState<any>(null)
  const [addressData, setAddressData] = useState<Address[]>([])
  const TOKEN = authHelper.getAuth()
  const { currentUser } = useAuth()
  const [initialFormValues, setInitialFormValues] = useState<Address | null>(null)
  const [openAddAddress, setOpenAddAddress] = useState(false)
  const [openEditAddress, setOpenEditAddress] = useState(false)
  const [openFormIndex, setOpenFormIndex] = useState<number | null>(null)

  const handleEditAddress = (address: any, index: number) => {
    setSelectedAddressID(address.ID)
    setInitialFormValues(address)
    setOpenAddAddress(false)
    setOpenEditAddress(true)
    setOpenFormIndex(index)
  }
  const handleCancel = () => {
    setOpenAddAddress(false)
    setOpenEditAddress(false)
    setOpenFormIndex(null)
  }
  const handleDropdownCountryName = (selectedOption: any) => {
    formik.setFieldValue('Country', selectedOption?.label || '')
  }

  const formik = useFormik({
    initialValues: {
      UserID: currentUser ? currentUser.ID : '',
      Company_name: '',
      Nick_name: '',
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
      isDefaultAddress: false,
      ...initialFormValues,
    },
    validationSchema,

    onSubmit: async (values) => {
      try {
        setLoading(true)
        const requestData: Address = {
          UserID: currentUser ? Number(currentUser.ID) : 0,
          Company_name: values.Company_name,
          Nick_name: values.Nick_name,
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
          isDefaultAddress: values.isDefaultAddress,
        }
        if (selectedAddressID !== null) {
          requestData.id = selectedAddressID
        } else {
          delete requestData.id
        }
        const response = await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/address/add_update_address`,
          requestData,
          {
            headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken },
          }
        )
        handleResponse(response)
      } catch (error) {
        console.error(error)
        handleErrorResponse(error)
      }
    },
  })

  const handleResponse = (res: any) => {
    if (res.status === 200 && res.data.message) {
      setLoading(false)
      getAllAddress()
      handleSuccessResponse()
    } else {
      setLoading(false)
      handleErrorResponse(res)
    }
  }

  const handleSuccessResponse = async () => {
    const confirmAdd = await Swal.fire(defaultFormUpdateConfig)
    if (confirmAdd.isConfirmed) {
      setOpenAddAddress(false)
      setOpenEditAddress(false)
      setOpenFormIndex(null)
    }
  }

  const handleErrorResponse = (error: any) => {
    setLoading(false)
    Swal.fire(defaultFormErrorConfig)
    if (error.response) {
      // Handle other status codes or error messages
      if (error.response.status === 400) {
        console.log('Bad Request: ', error.response.data.error)
      } else if (error.response.status === 401) {
        console.log('Unauthorized: ', error.response.data.error)
      } else {
        console.log('Error: ', error.response.data.error)
      }
    }
  }

  const resetFormValues = () => {
    formik.resetForm()
    setInitialFormValues(null)
    setOpenAddAddress(true)
    setOpenEditAddress(false)
  }

  useEffect(() => {
    getAllAddress()
    fetchCountryNames()
  }, [TOKEN?.AccessToken, currentUser])

  useEffect(() => {
    if (openFormIndex === null && initialFormValues !== null) {
      setInitialFormValues(null)
    }
    if (initialFormValues) {
      formik.setValues({ ...formik.values, ...initialFormValues })
    }
  }, [initialFormValues, openFormIndex])

  const getAllAddress = () => {
    if (currentUser) {
      const userId = currentUser.ID
      setLoading(true)
      axios
        .get(`${process.env.REACT_APP_SERVER_URL}/address/userid/${userId}`, {
          headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken },
        })
        .then((res: any) => {
          if (res.data.status === 'success') {
            setLoading(false)
            setAddressData(res.data.data)
          }
        })
        .catch((err) => {
          setLoading(false)
          console.error(err)
        })
    }
  }

  const deleteAddress = async (id: any) => {
    const confirmDelete = await Swal.fire(defaultDeleteConfig)
    if (confirmDelete.isConfirmed) {
      try {
        const response = await axios.delete(`${process.env.REACT_APP_SERVER_URL}/address/${id}`, {
          headers: { Authorization: `Bearer ${TOKEN?.AccessToken}` },
        })

        if (response.data.message) {
          getAllAddress()
          Swal.fire(defaultDeleteSuccessConfig)
        } else {
          Swal.fire(defaultDeleteErrorConfig)
        }
      } catch (error) {
        Swal.fire(defaultDeleteErrorConfig)
        console.error('Delete Brand Error:', error)
      }
    }
  }

  return (
    <>
      <ManageAddressSectionStyles>
        <section>
          <div className='row'>
            <div className='col-lg-12  '>
              <div id='accordion1' className='boxNavPills'>
                <div className='card'>
                  <div className='card-header py-4 d-flex align-items-center' id='headingOne1'>
                    <h5 className='mb-0'>
                      <button
                        className='btn btn-link '
                        aria-expanded='false'
                        aria-controls='collapseOne1'
                        onClick={() => resetFormValues()}
                      >
                        <div className='d-flex'>
                          <i className='fa fa-plus text-black fs-1'></i>
                          <h2 className='ps-4 mb-0'>Add a new address</h2>
                        </div>
                      </button>
                    </h5>
                  </div>
                  <div id='collapseOne1'>
                    {openAddAddress && (
                      <CommonAddressForm
                        formik={formik}
                        handleCancel={handleCancel}
                        handleDropdownCountryName={handleDropdownCountryName}
                        loading={loading}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div id='accordion2' className='my-4'>
                {addressData.map((address: any, index: number) => (
                  <div className='card boxNavPills my-3' key={index}>
                    <div className='px-8 py-8 pt-4' id={`headingOne2-${index}`}>
                      <h5 className='mb-0'>
                        <div className='actionButtons d-flex align-items-center  ms-auto'>
                          <div className='col d-flex align-items-center'>
                            <span className='badge py-2 px-2 rounded-2 fs-8 badge-light-success'>
                              {address.Nick_name ? (
                                <>
                                  <i className='pe-2 text-success fa fa-address-card' />{' '}
                                  {address.Nick_name}{' '}
                                </>
                              ) : null}
                            </span>
                            <span className='ms-2 badge py-2 px-2 rounded-2 fs-8 badge-light-primary'>
                              {address.isDefaultAddress === true ? 'Default address' : ''}
                            </span>
                          </div>
                          <div className='d-flex col justify-content-end'>
                            <div className='px-2'>
                              <img
                                className='cursor-pointer'
                                onClick={() => handleEditAddress(address, index)}
                                alt='actBtn'
                                src={toAbsoluteUrl('/media/vectors/EditAction.png')}
                              />
                            </div>
                            <div className='px-2'>
                              <img
                                className='cursor-pointer'
                                alt='actBtn'
                                src={toAbsoluteUrl('/media/vectors/DeleteAction.png')}
                                onClick={() => deleteAddress(address.ID)}
                              />
                            </div>
                          </div>
                        </div>
                        <div className='innerContactDetails'>
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
                    <div id={`collapseOne2-${index}`}>
                      {openEditAddress && openFormIndex === index && (
                        <CommonAddressForm
                          formik={formik}
                          handleCancel={handleCancel}
                          handleDropdownCountryName={handleDropdownCountryName}
                          loading={loading}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </ManageAddressSectionStyles>
    </>
  )
}

export default ManageAddressSection
