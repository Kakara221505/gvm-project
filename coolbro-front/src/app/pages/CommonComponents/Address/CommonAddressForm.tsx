import React from 'react'
import Select from 'react-select'
import { fetchCountryNames } from '../../../common/common'

interface CommonAddressFormProps {
  formik: any
  loading: boolean
  handleDropdownCountryName: (selectedOption: any) => void
  handleCancel: () => void
}

const CommonAddressForm: React.FC<CommonAddressFormProps> = ({
  formik,
  loading,
  handleDropdownCountryName,
  handleCancel,
}) => {
  const countryName = fetchCountryNames()
  return (
    <form onSubmit={formik.handleSubmit}>
      <div className='card-body marginPagePXMobile'>
        <div className='my-6'>
          <div className='fv-row   d-block input-group'>
            <div className='row'>
              <div className='d-flex ms-auto pb-4'>
                <div className='d-flex ms-auto form-check formCustomCheck align-items-center'>
                  <input
                    className='customCheckBox form-check-input'
                    type='checkbox'
                    value={formik.values.isDefaultAddress}
                    id='isDefaultAddress'
                    name='isDefaultAddress'
                    onChange={formik.handleChange}
                    checked={formik.values.isDefaultAddress}
                  />
                  <label
                    className='fs-6 ps-2 d-block fw-medium text-black-500 mb-0'
                    htmlFor='isDefaultAddress'
                  >
                    Is Default
                  </label>
                </div>
              </div>
              <div className='col-lg-6'>
                <div className='form-group '>
                  <input
                    id='First_name'
                    placeholder=''
                    className={`form-control bg-transparent shadow-none  customInput ${formik.touched.First_name && formik.errors.First_name ? 'is-invalid' : ''
                      }`}
                    type='text'
                    name='First_name'
                    autoComplete='off'
                    value={formik.values.First_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <label className='form-label fs-6 fw-bolder ' htmlFor='First_name'>
                    First Name
                  </label>
                  {formik.touched.First_name && formik.errors.First_name && (
                    <div className='invalid-feedback'>{formik.errors.First_name}</div>
                  )}
                </div>
              </div>
              <div className='col-lg-6'>
                <div className='form-group paddingPagePXMobile'>
                  <input
                    id='Last_name'
                    placeholder=''
                    className='form-control profileTextFieldBottomMargin bg-transparent shadow-none  customInput'
                    type='text'
                    name='Last_name'
                    value={formik.values.Last_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    autoComplete='off'
                  />
                  <label className='form-label fs-6 fw-bolder ' htmlFor='Last_name'>
                    Last Name
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className='fv-row   d-block input-group'>
            <div className='row'>
              <div className='col-lg-6 '>
                <div className='form-group paddingPagePXMobile'>
                  <input
                    id='phoneNumber'
                    placeholder=''
                    className={`form-control profileTextFieldBottomMargin bg-transparent shadow-none  customInput ${formik.touched.Phone_number && formik.errors.Phone_number ? 'is-invalid' : ''
                      }`}
                    value={formik.values.Phone_number}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    type='text'
                    name='Phone_number'
                    autoComplete='off'
                  />
                  <label className='form-label fs-6 fw-bolder ' htmlFor='phoneNumber'>
                    Phone Number
                  </label>
                  {formik.touched.Phone_number && formik.errors.Phone_number && (
                    <div className='invalid-feedback'>{formik.errors.Phone_number}</div>
                  )}
                </div>
              </div>
              <div className='col-lg-6'>
                <div className=' form-group paddingPagePXMobile'>
                  <input
                    id='alternativePhoneNumber'
                    placeholder=''
                    className={`form-control profileTextFieldBottomMargin bg-transparent shadow-none  customInput ${formik.touched.Phone_number_2 && formik.errors.Phone_number_2 ? 'is-invalid' : ''
                      }`}
                    value={formik.values.Phone_number_2}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    type='text'
                    name='Phone_number_2'
                    autoComplete='off'
                  />
                  <label className='form-label fs-6 fw-bolder ' htmlFor='alternativePhoneNumber'>
                    Alternative Number
                  </label>
                  {formik.touched.Phone_number_2 && formik.errors.Phone_number_2 && (
                    <div className='invalid-feedback'>{formik.errors.Phone_number_2}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <h4 className='py-4 pt-0'>Address</h4>
          <div className='fv-row   d-block input-group'>
            <div className='row'>
              <div className='col-lg-12'>
                <div className='form-group paddingPagePXMobile'>
                  <textarea
                    className={`form-control profileTextFieldBottomMargin customInput ${formik.touched.Address && formik.errors.Address ? 'is-invalid' : ''
                      }`}
                    value={formik.values.Address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    id='exampleFormControlTextarea1'
                    name='Address'
                  ></textarea>
                  <label className='form-label fs-6 fw-bolder ' htmlFor='address'>
                    Address
                  </label>
                  {formik.touched.Address && formik.errors.Address && (
                    <div className='invalid-feedback'>{formik.errors.Address}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className='fv-row   d-block input-group'>
            <div className='row'>
              <div className='col-lg-6 '>
                <div className='form-group  paddingPagePXMobile'>
                  <input
                    id='city'
                    placeholder=''
                    className={`form-control profileTextFieldBottomMargin bg-transparent shadow-none  customInput ${formik.touched.City && formik.errors.City ? 'is-invalid' : ''
                      }`}
                    value={formik.values.City}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    type='text'
                    name='City'
                    autoComplete='off'
                  />
                  <label className='form-label fs-6 fw-bolder ' htmlFor='city'>
                    City
                  </label>
                  {formik.touched.City && formik.errors.City && (
                    <div className='invalid-feedback'>{formik.errors.City}</div>
                  )}
                </div>
              </div>
              <div className='col-lg-6'>
                <div className='form-group paddingPagePXMobile'>
                  <input
                    id='state'
                    placeholder=''
                    className={`form-control profileTextFieldBottomMargin bg-transparent shadow-none  customInput ${formik.touched.State && formik.errors.State ? 'is-invalid' : ''
                      }`}
                    value={formik.values.State}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    type='text'
                    name='State'
                    autoComplete='off'
                  />
                  <label className='form-label fs-6 fw-bolder ' htmlFor='state'>
                    State
                  </label>
                  {formik.touched.State && formik.errors.State && (
                    <div className='invalid-feedback'>{formik.errors.State}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className='fv-row d-block input-group '>
            <div className='row'>
              <div className='col-lg-6 '>
                <div className='form-group paddingPagePXMobile'>
                  <input
                    id='PostalCode'
                    placeholder=''
                    className={`form-control profileTextFieldBottomMargin bg-transparent shadow-none  customInput ${formik.touched.PostalCode && formik.errors.PostalCode ? 'is-invalid' : ''
                      }`}
                    value={formik.values.PostalCode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    type='text'
                    name='PostalCode'
                    autoComplete='off'
                  />
                  <label className='form-label fs-6 fw-bolder ' htmlFor='PostalCode'>
                    PIN code
                  </label>
                  {formik.touched.PostalCode && formik.errors.PostalCode && (
                    <div className='invalid-feedback'>{formik.errors.PostalCode}</div>
                  )}
                </div>
              </div>
              <div className='form-group col-lg-6'>
                <Select
                  className={` ${formik.touched.Country && formik.errors.Country ? 'is-invalid' : ''}`}
                  options={countryName.map((country: string) => ({ label: country, value: country }))}
                  value={
                    formik.values.Country
                      ? { label: formik.values.Country, value: formik.values.Country }
                      : null
                  }
                  onChange={handleDropdownCountryName}
                  isSearchable
                  placeholder='Select Country'
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
                      color: '#777', // Set the color for the selected value
                      fontWeight: 600,
                      fontSize: '16px !important',
                    }),
                  }}
                />

                {formik.touched.Country && formik.errors.Country && (
                  <div className='invalid-feedback'>{formik.errors.Country}</div>
                )}
              </div>
            </div>
          </div>
          <div className='fv-row d-block input-group '>
            <div className='row'>
              <div className='col-lg-6'>
                <div className='form-group paddingPagePXMobile'>
                  <input
                    id='Nick_name'
                    placeholder=''
                    className='form-control profileTextFieldBottomMargin bg-transparent shadow-none  customInput'
                    type='text'
                    name='Nick_name'
                    value={formik.values.Nick_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    autoComplete='off'
                  />
                  <label className='form-label fs-6 fw-bolder ' htmlFor='Nick_name'>
                    Address Nick name
                  </label>
                </div>
              </div>
              {/* <div className='col-lg-6'>
                         6
                            </div> */}
            </div>
          </div>
        </div>
      </div>
      <div className='card-footer  text-black  border-top-2 d-flex justify-content-end'>
        <button
          type='button'
          className='mobileMarginNone navbarMarginForSearch my-0 mx-2 px-11 primaryOutlineBtn btn btn-default btn-sm'
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button type='submit' className='px-13 mx-2 primaryBtn btn btn-default btn-sm'>
          {loading ? 'Submitting...' : 'Save'}
        </button>
      </div>
    </form>
  )
}

export default CommonAddressForm
