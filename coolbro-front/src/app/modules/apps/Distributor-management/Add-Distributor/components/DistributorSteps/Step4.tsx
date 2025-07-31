import React, {FC, useEffect} from 'react'
import {KTIcon, toAbsoluteUrl} from '../../../../../../../_metronic/helpers'
import {ErrorMessage, Field, useFormikContext} from 'formik'
import { ICreateAccount } from '../CreateAccountWizardHelper'

interface Step4Props {
  editDistributor: any; 
  editFlag: boolean;
  
}

const Step4: FC<Step4Props> = ({editFlag,editDistributor}) => {

  const formik = useFormikContext<ICreateAccount>() 
  useEffect(() => {
    if (editFlag) {
      formik.setFieldValue(
        'Account_holder_name',
        editDistributor?.BankAccountDetails?.Account_holder_name
      )
      formik.setFieldValue('Account_number', editDistributor?.BankAccountDetails?.Account_number)
      formik.setFieldValue('UPI_id', editDistributor?.UserDetails?.UPI_id)
      formik.setFieldValue('IFSC_code', editDistributor?.BankAccountDetails?.IFSC_code)
      formik.setFieldValue('Bank_name', editDistributor?.BankAccountDetails?.Bank_name)
      formik.setFieldValue('Branch', editDistributor?.BankAccountDetails?.Branch)
    }
  }, [editDistributor, editFlag])

  return (
    <div className='w-100'>
    <div className=''>
      <h1 className='primaryTextSemiBold text-dark'>Account Details</h1>

    </div>

    <div className='row editSection marginPageMYMobile'>
            <div className='col-lg-12  mobilePaddingNone'>
              <div className='card boxNavPills'>
              
                <div className='card-body pb-0 pt-0 px-0'>
         
                  <div className=''>
            
                    <div className='fv-row mb-8 paddingPagePXMobile d-block input-group  form-group'>
                   
                    </div>
                    <div className='fv-row mb-8 paddingPagePXMobile d-block input-group  form-group'>
                      <div className='row'>
                        <div className='col-lg-6 marginPageMYMobile'>
                          <div className='form-group paddingPagePXMobile'>
                          <input
                          id='Account_holder_name'
                          placeholder=''
                          className='form-control bg-transparent shadow-none  customInput'
                          type='text'
                          name='Account_holder_name'
                          autoComplete='off'
                          value={formik.values.Account_holder_name.trimStart()}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <label className='form-label fs-6 fw-bolder ' htmlFor='Account_holder_name'>
                          Account Holder Name
                        </label>
                        {formik.touched.Account_holder_name && formik.errors.Account_holder_name && (
                          <div className='fv-plugins-message-container'>
                            <div className='fv-help-block'>{formik.errors.Account_holder_name}</div>
                          </div>
                        )}
                          </div>
                        </div>
                        <div className='col-lg-6'>
                          <div className='form-group paddingPagePXMobile'>
                          <input
                          id='Account_number'
                          placeholder=''
                          className='form-control bg-transparent shadow-none  customInput'
                          type='text'
                          name='Account_number'
                          value={formik.values.Account_number.trim()}
                          autoComplete='off'
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <label className='form-label fs-6 fw-bolder ' htmlFor='Account_number'>
                          Account Number
                        </label>
                        {formik.touched.Account_number && formik.errors.Account_number && (
                          <div className='fv-plugins-message-container'>
                            <div className='fv-help-block'>{formik.errors.Account_number}</div>
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
                          id='Bank_name'
                          placeholder=''
                          className='form-control bg-transparent shadow-none  customInput'
                          type='text'
                          name='Bank_name'
                          value={formik.values.Bank_name.trimStart()}
                          autoComplete='off'
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <label className='form-label fs-6 fw-bolder ' htmlFor='Bank_name'>
                          Bank Name
                        </label>
                        {formik.touched.Bank_name && formik.errors.Bank_name && (
                          <div className='fv-plugins-message-container'>
                            <div className='fv-help-block'>{formik.errors.Bank_name}</div>
                          </div>
                        )}
                          </div>
                        </div>

                        <div className='col-lg-6 '>
                          <div className='form-group paddingPagePXMobile'>
                          <input
                          id='Branch'
                          placeholder=''
                          className='form-control bg-transparent shadow-none  customInput'
                          type='text'
                          name='Branch'
                          autoComplete='off'
                          value={formik.values.Branch.trimStart()}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <label className='form-label fs-6 fw-bolder ' htmlFor='Branch'>
                          Branch
                        </label>
                        {formik.touched.Branch && formik.errors.Branch && (
                          <div className='fv-plugins-message-container'>
                            <div className='fv-help-block'>{formik.errors.Branch}</div>
                          </div>
                        )}
                          </div>
                        </div>
                   
                      </div>
                    </div>
                      <div className='row'>
                        <div className='col-lg-6 marginPageMYMobile'>
                          <div className='form-group'>
                          <input
                        id='IFSC_code'
                        placeholder=''
                        className='form-control bg-transparent shadow-none  customInput'
                        type='text'
                        name='IFSC_code'
                        value={formik.values.IFSC_code.trim()}
                        autoComplete='off'
                        // onChange={formik.handleChange}
                        onChange={(e) =>
                          formik.setFieldValue('IFSC_code', e.target.value.toUpperCase())
                        }
                        onBlur={formik.handleBlur}
                      />
                      <label className='form-label fs-6 fw-bolder ' htmlFor='IFSC_code'>
                        IFSC Code
                      </label>
                      {formik.touched.IFSC_code && formik.errors.IFSC_code && (
                        <div className='fv-plugins-message-container'>
                          <div className='fv-help-block'>{formik.errors.IFSC_code}</div>
                        </div>
                      )}
                          </div>
                        </div>
                        <div className='col-lg-6 marginPageMYMobile'>
                    <div className='form-group paddingPagePXMobile'>
                      <input
                        id='UPI_id'
                        placeholder=''
                        className='form-control bg-transparent shadow-none  customInput'
                        type='text'
                        name='UPI_id'
                        autoComplete='off'
                        value={formik.values.UPI_id.trim()}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      <label className='form-label fs-6 fw-bolder ' htmlFor='UPI_id'>
                        UPI ID
                      </label>
                      {formik.touched.UPI_id && formik.errors.UPI_id && (
                        <div className='fv-plugins-message-container'>
                          <div className='fv-help-block'>{formik.errors.UPI_id}</div>
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
  )
}

export {Step4}
