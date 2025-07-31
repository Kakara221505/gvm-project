import React, { useEffect, useState, FC } from 'react';
import Select from 'react-select';
import { fetchCountryNames } from '../../../common/common';
import axios from 'axios';
import { useAuth } from '../../../modules/auth';
import * as authHelper from '../../../modules/auth/core/AuthHelpers';
import Swal from 'sweetalert2'
import {
    defaultByDefaultAddressConfig,
} from '../../../config/sweetAlertConfig'

interface CommonShippingAddressProps {
    formik: any; // Adjust the type as per your formik configuration
    handleCancel: () => void;
    handleDropdownCountryName: (selectedOption: any) => void;
    loading: boolean;
}

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

const CommonShippingAddress: React.FC<CommonShippingAddressProps> = ({
    formik,
    handleCancel,
    handleDropdownCountryName,
    loading,
}) => {
    const TOKEN = authHelper.getAuth();
    const { currentUser } = useAuth();
    const [loader, setLoading] = useState(true);
    const [addressData, setAddressData] = useState<Address[]>([]);
    const [profileCheckboxChecked, setProfileCheckboxChecked] = useState(false);

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
                        const defaultAddress = getDefaultValueAddress(res.data.data);
                        if (defaultAddress) {
                            formik.setValues({
                                ...formik.values,
                                ...defaultAddress,
                            });
                        }
                        else {
                            setProfileCheckboxChecked(false)
                            Swal.fire(defaultByDefaultAddressConfig)
                        }
                    }
                })
                .catch((err) => {
                    if (axios.isAxiosError(err) && err.response && err.response.status === 404) {
                        //  if (res.data.status === 'error' && res.data.message === 'Address not found.') {
                        // Handle 404 and show Swal fire for "Address not found."
                        setProfileCheckboxChecked(false)
                        Swal.fire(defaultByDefaultAddressConfig);
                    }
                    setLoading(false)
                    console.error(err)
                })
        }
    }

    const getDefaultValueAddress = (addresses: Address[]) => {
        // Find the default address
        return addresses.find((address) => address.isDefaultAddress);
    };

    const handleCheckboxClick = () => {
        setProfileCheckboxChecked(!profileCheckboxChecked);

        if (profileCheckboxChecked) {
            // Checkbox is unchecked, clear values
            formik.setValues({
                ...formik.values,
                First_name: '',
                Last_name: '',
                Phone_number: '',
                Phone_number_2: '',
                Address: '',
                City: '',
                State: '',
                PostalCode: '',
                Country: '',
            });
        } else {
            // Checkbox is checked, fetch and set values
            getAllAddress();
        }
    };


    const countryName = fetchCountryNames();

    return (
        <form onSubmit={formik.handleSubmit}>
            <div className='card-body'>
                <div className='my-6 mt-0'>
                    <div className='d-flex pb-5 ms-auto justify-content-end'>
                        <div className='form-check formCustomCheck align-items-center'>
                            <input
                                className='customCheckBoxDefault form-check-input'
                                type='checkbox'
                                value=''
                                id='flexCheckDefault'
                                onClick={handleCheckboxClick}
                                checked={profileCheckboxChecked}
                            />
                            <label
                                className='profileText ps-2 fs-5 d-block     fw-medium text-black-500 mb-0'
                                htmlFor='flexCheckDefault1'
                            >
                                Same as Profile
                            </label>
                        </div>
                    </div>
                    <div className='fv-row  mb-0  d-block input-group  form-group paddingPagePXMobile'>
                        <div className='row'>
                            <div className='col-lg-6 marginPageMYMobile'>
                                <div className='form-group paddingPagePXMobile'>
                                    <input
                                        id='Name'
                                        placeholder=''
                                        className={`form-control bg-transparent shadow-none  customInput ${formik.touched.First_name && formik.errors.First_name
                                            ? 'is-invalid'
                                            : ''
                                            }`}
                                        type='text'
                                        name='First_name'
                                        autoComplete='off'
                                        value={formik.values.First_name}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    <label className='form-label fs-6 fw-bolder ' htmlFor='Name'>
                                        First Name
                                    </label>
                                    {formik.touched.First_name && formik.errors.First_name && (
                                        <div className='invalid-feedback'>
                                            {formik.errors.First_name}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className='col-lg-6'>
                                <div className='form-group paddingPagePXMobile'>
                                    <input
                                        id='Name'
                                        placeholder=''
                                        className='form-control bg-transparent shadow-none  customInput'
                                        type='name'
                                        name='Last_name'
                                        value={formik.values.Last_name}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        autoComplete='off'
                                    />
                                    <label className='form-label fs-6 fw-bolder ' htmlFor='Name'>
                                        Last Name
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='fv-row  mb-0  d-block input-group  form-group paddingPagePXMobile'>
                        <div className='row'>
                            <div className='col-lg-6 marginPageMYMobile'>
                                <div className='form-group paddingPagePXMobile'>
                                    <input
                                        id='phoneNumber'
                                        placeholder=''
                                        className={`form-control bg-transparent shadow-none  customInput ${formik.touched.Phone_number && formik.errors.Phone_number
                                            ? 'is-invalid'
                                            : ''
                                            }`}
                                        value={formik.values.Phone_number}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        type='text'
                                        name='Phone_number'
                                        autoComplete='off'
                                    />
                                    <label
                                        className='form-label fs-6 fw-bolder '
                                        htmlFor='phoneNumber'
                                    >
                                        Phone Number
                                    </label>
                                    {formik.touched.Phone_number && formik.errors.Phone_number && (
                                        <div className='invalid-feedback'>
                                            {formik.errors.Phone_number}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className='col-lg-6'>
                                <div className='form-group '>
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
                                    <label
                                        className='form-label fs-6 fw-bolder '
                                        htmlFor='alternativePhoneNumber'
                                    >
                                        Alternative Number
                                    </label>
                                    {formik.touched.Phone_number_2 && formik.errors.Phone_number_2 && (
                                        <div className='invalid-feedback'>{formik.errors.Phone_number_2}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='d-flex pb-5 ms-auto justify-content-between align-items-baseline navbarMarginForSearch'>
                        <h4 className='mb-0'>Address</h4>
                    </div>

                    <div className='fv-row  mb-0  d-block input-group  form-group paddingPagePXMobile'>
                        <div className='row'>
                            <div className='col-lg-12'>
                                <div className='form-group paddingPagePXMobile'>
                                    <textarea
                                        className={`form-control customInput ${formik.touched.Address && formik.errors.Address
                                            ? 'is-invalid'
                                            : ''
                                            }`}
                                        value={formik.values.Address}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        id='exampleFormControlTextarea1'
                                        name='Address'
                                    ></textarea>

                                    {formik.touched.Address && formik.errors.Address && (
                                        <div className='invalid-feedback'>
                                            {formik.errors.Address}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='fv-row  mb-0  d-block input-group  form-group paddingPagePXMobile'>
                        <div className='row'>
                            <div className='col-lg-6 marginPageMYMobile'>
                                <div className='form-group paddingPagePXMobile'>
                                    <input
                                        id='city'
                                        placeholder=''
                                        className={`form-control bg-transparent shadow-none  customInput ${formik.touched.City && formik.errors.City
                                            ? 'is-invalid'
                                            : ''
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
                                        className={`form-control bg-transparent shadow-none  customInput ${formik.touched.State && formik.errors.State
                                            ? 'is-invalid'
                                            : ''
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
                    <div className='fv-row  mb-0  d-block input-group  form-group paddingPagePXMobile'>
                        <div className='row'>
                            <div className='col-lg-6 marginPageMYMobile'>
                                <div className='form-group paddingPagePXMobile'>
                                    <input
                                        id='pinCode'
                                        placeholder=''
                                        className={`form-control bg-transparent shadow-none  customInput ${formik.touched.PostalCode && formik.errors.PostalCode
                                            ? 'is-invalid'
                                            : ''
                                            }`}
                                        value={formik.values.PostalCode}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        type='text'
                                        name='PostalCode'
                                        autoComplete='off'
                                    />
                                    <label className='form-label fs-6 fw-bolder ' htmlFor='pinCode'>
                                        PIN code
                                    </label>
                                    {formik.touched.PostalCode && formik.errors.PostalCode && (
                                        <div className='invalid-feedback'>
                                            {formik.errors.PostalCode}
                                        </div>
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
                </div>
            </div>

            <div className='card-footer text-black border-top-2 d-flex justify-content-end'>
                <button
                    type='button'
                    className='mobileMarginNone navbarMarginForSearch mx-2 px-11 primaryOutlineBtn btn btn-default btn-sm'
                    onClick={handleCancel}
                >
                    Cancel
                </button>
                <button
                    type='submit'
                    className='px-13 mx-2 navbarMarginForSearch primaryBtn btn btn-default btn-sm'
                >
                    {loading ? 'Updating...' : 'Update'}
                </button>
            </div>
        </form>
    );
};

export default CommonShippingAddress;
