import React, {FC, useEffect, useState} from 'react'
import {Field, ErrorMessage, useFormikContext} from 'formik'
import CustomDropdown from '../../../../../../pages/HelperComponents/CustomDropdown'
import {toAbsoluteUrl} from '../../../../../../../_metronic/helpers'
import {ICreateAccount} from '../CreateAccountWizardHelper'
import * as authHelper from '../../../../../auth/core/AuthHelpers'
import {fetchCountryNames} from '../../../../../../common/common'
import axios from 'axios'

interface Step3Props {
  editDealer: any // Replace 'any' with the actual type of editDealer if known
  editFlag: boolean
}

const Step3: FC<Step3Props> = ({editDealer, editFlag}) => {
  const [selectedOption, setSelectedOption] = useState<string>('')
  const TOKEN = authHelper.getAuth()

  const formik = useFormikContext<ICreateAccount>() // Specify the form values type
  const countryNames = fetchCountryNames()
  const [postalCode, setPostalCode] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')

  // console.log("Country names are:", countryNames);

  async function getLatLongVals(pincode: string) {
    const payload = {
      zipCode: pincode,
    }
    axios
      .post(`${process.env.REACT_APP_SERVER_URL}/common/get_details_from_zipcode`, payload, {
        headers: {Authorization: 'Bearer ' + TOKEN?.AccessToken},
      })
      .then((res) => {
        if (res?.status === 200 && res.data.status === 'success') {
          setLat(res?.data?.data?.location?.lat)
          setLng(res?.data?.data?.location?.lng)
          formik.setFieldValue('Latitude', res?.data?.data?.location?.lat)
          formik.setFieldValue('Longitude', res?.data?.data?.location?.lng)
          return
        }
      })
      .catch((err) => {
        console.log('Error while fethcing Pincode Details', err)
      })
  }

  useEffect(() => {
    if (formik.values.PostalCode.length === 6) {
      getLatLongVals(formik.values.PostalCode)
    }
  }, [postalCode])

  useEffect(() => {
    if (editFlag) {
      setSelectedOption(editDealer?.AddressDetails[0]?.Country)
      formik.setFieldValue('Address', editDealer?.AddressDetails[0]?.Address)
      formik.setFieldValue('City', editDealer?.AddressDetails[0]?.City)
      formik.setFieldValue('State', editDealer?.AddressDetails[0]?.State)
      formik.setFieldValue('Country', editDealer?.AddressDetails[0]?.Country)
      formik.setFieldValue('Phone_number', editDealer?.User?.Phone)
      formik.setFieldValue('Phone_number_2', editDealer?.User?.Phone)
      formik.setFieldValue('PostalCode', editDealer?.AddressDetails[0]?.PostalCode)
      setLat(editDealer?.UserDetails?.Latitude)
      setLng(editDealer?.UserDetails?.Longitude)
      formik.setFieldValue('Latitude', editDealer?.UserDetails?.Latitude)
      formik.setFieldValue('Longitude', editDealer?.UserDetails?.Longitude)
    }
  }, [editDealer, editFlag])

  const handleDropdownChange = (option: string) => {
    setSelectedOption(option)
    formik.setFieldValue('Country', option)
  }
  return (
    <div className='w-100'>
      <div className=' pb-lg-12'>
        <h1 className='primaryTextSemiBold text-dark'>Address</h1>
      </div>

      <div className='row editSection marginPageMYMobile'>
        <div className='col-lg-12  mobilePaddingNone'>
          <div className='card boxNavPills'>
            <div className='card-body pb-0 pt-0 px-0'>
              <div className=''>
                <div className='fv-row mb-8 paddingPagePXMobile d-block input-group  form-group'>
                  <div className='row'>
                    <div className='col-lg-12'>
                      <div className='form-group paddingPagePXMobile'>
                        <textarea
                          className='form-control customInput'
                          id='exampleFormControlTextarea1'
                          name='Address'
                          onChange={formik.handleChange}
                          value={formik.values?.Address.trimStart()}
                          onBlur={formik.handleBlur}
                        ></textarea>
                        <label className='form-label fs-6 fw-bolder ' htmlFor='city'>
                          Address
                        </label>
                        {formik.touched.Address && formik.errors.Address && (
                          <div className='fv-plugins-message-container'>
                            <div className='fv-help-block'>{formik.errors.Address}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className='fv-row mb-8 paddingPagePXMobile d-block input-group  form-group'>
                  <div className='row'>
                    <div className='col-lg-6 marginPageMYMobile'>
                      <div className='form-group paddingPagePXMobile'>
                        <input
                          id='City'
                          placeholder=''
                          className='form-control bg-transparent shadow-none  customInput'
                          type='text'
                          name='City'
                          value={formik.values?.City.trimStart()}
                          autoComplete='off'
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <label className='form-label fs-6 fw-bolder ' htmlFor='City'>
                          City
                        </label>
                        {formik.touched.City && formik.errors.City && (
                          <div className='fv-plugins-message-container'>
                            <div className='fv-help-block'>{formik.errors.City}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className='col-lg-6'>
                      <div className='form-group paddingPagePXMobile'>
                        <input
                          id='State'
                          placeholder=''
                          className='form-control bg-transparent shadow-none  customInput'
                          type='text'
                          name='State'
                          value={formik.values.State.trimStart()}
                          autoComplete='off'
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <label className='form-label fs-6 fw-bolder ' htmlFor='State'>
                          State
                        </label>
                        {formik.touched.State && formik.errors.State && (
                          <div className='fv-plugins-message-container'>
                            <div className='fv-help-block'>{formik.errors.State}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className='fv-row  mb-8 paddingPagePXMobile d-block input-group  form-group'>
                  <div className='row'>
                    <div className='col-lg-6 marginPageMYMobile'>
                      <div className='form-group paddingPagePXMobile'>
                        <input
                          id='PostalCode'
                          placeholder=''
                          className='form-control bg-transparent shadow-none  customInput'
                          type='text'
                          name='PostalCode'
                          value={formik?.values?.PostalCode.trim()}
                          autoComplete='off'
                          onChange={(e) => {
                            setPostalCode(e.target.value)
                            formik.setFieldValue('PostalCode', e.target.value)
                          }}
                          onBlur={formik.handleBlur}
                        />
                        <label className='form-label fs-6 fw-bolder ' htmlFor='PostalCode'>
                          PIN code
                        </label>
                        {formik.touched.PostalCode && formik.errors.PostalCode && (
                          <div className='fv-plugins-message-container'>
                            <div className='fv-help-block'>{formik.errors.PostalCode}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className='col-lg-6'>
                      <CustomDropdown
                        options={countryNames}
                        label='Select Country'
                        selectedOption={selectedOption}
                        onChange={handleDropdownChange}
                      />
                      {formik.touched.Country && formik.errors.Country && (
                        <div className='fv-plugins-message-container'>
                          <div className='fv-help-block'>{formik.errors.Country}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* phone number section  */}
                <div className='fv-row mb-8 paddingPagePXMobile d-block input-group  form-group'>
                  <div className='row'>
                    <div className='col-lg-6 marginPageMYMobile'>
                      <div className='form-group paddingPagePXMobile'>
                        <input
                          id='Phone_number'
                          placeholder=''
                          className='form-control bg-transparent shadow-none  customInput'
                          type='text'
                          name='Phone_number'
                          autoComplete='off'
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.Phone_number}
                        />
                        <label className='form-label fs-6 fw-bolder ' htmlFor='Phone_number'>
                          Phone Number
                        </label>
                        {formik.touched.Phone_number && formik.errors.Phone_number && (
                          <div className='fv-plugins-message-container'>
                            <div className='fv-help-block'>{formik.errors.Phone_number}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className='col-lg-6'>
                      <div className='form-group paddingPagePXMobile'>
                        <input
                          id='Phone_number_2'
                          placeholder=''
                          className='form-control bg-transparent shadow-none  customInput'
                          type='text'
                          name='Phone_number_2'
                          autoComplete='off'
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.Phone_number_2}
                        />
                        <label className='form-label fs-6 fw-bolder ' htmlFor='Phone_number_2'>
                          Alternate Number
                        </label>
                        {formik.touched.Phone_number_2 && formik.errors.Phone_number_2 && (
                          <div className='fv-plugins-message-container'>
                            <div className='fv-help-block'>{formik.errors.Phone_number_2}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* latitute- longitude section  */}
                <div className='fv-row mb-8 paddingPagePXMobile d-block input-group  form-group'>
                  <div className='row'>
                    <div className='col-lg-6 marginPageMYMobile'>
                      <div className='form-group paddingPagePXMobile'>
                        <input
                          id='Latitude'
                          placeholder=''
                          className='form-control bg-transparent shadow-none  customInput'
                          type='text'
                          name='Latitude'
                          value={lat}
                          autoComplete='off'
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          disabled={true}
                        />
                        <label className='form-label fs-6 fw-bolder ' htmlFor='Latitude'>
                          Latitude
                        </label>
                        {formik.touched.Latitude && formik.errors.Latitude && (
                          <div className='fv-plugins-message-container'>
                            <div className='fv-help-block'>{formik.errors.Latitude}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className='col-lg-6'>
                      <div className='form-group paddingPagePXMobile'>
                        <input
                          id='Longitude'
                          placeholder=''
                          className='form-control bg-transparent shadow-none  customInput'
                          type='text'
                          name='Longitude'
                          value={lng}
                          autoComplete='off'
                          disabled={true}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <label className='form-label fs-6 fw-bolder ' htmlFor='Longitude'>
                          Longitude
                        </label>
                        {formik.touched.Longitude && formik.errors.Longitude && (
                          <div className='fv-plugins-message-container'>
                            <div className='fv-help-block'>{formik.errors.Longitude}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export {Step3}
