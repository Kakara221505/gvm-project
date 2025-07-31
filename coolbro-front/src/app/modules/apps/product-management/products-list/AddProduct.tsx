import React, {useState} from 'react'
import {Formik, useFormik} from 'formik'
import * as Yup from 'yup'
import {toast, ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Swal from 'sweetalert2'
import {useNavigate} from 'react-router-dom'
import axios from 'axios'
import LeftPanel from './add-product-panels/LeftPanel'
import GeneralPanel from './add-product-panels/GeneralPanel'
import AdvancedPanel from './add-product-panels/AdvancedPanel'
import {defaultProductAddSuccessful} from '../../../../config/sweetAlertConfig'
import * as authHelper from '../../../auth/core/AuthHelpers'
import {ProductData, initialProductData} from '../../../../constants/common'



const validationSchema = Yup.object().shape({
  Is_price: Yup.boolean(),
  Is_price_range: Yup.boolean(),
  Name: Yup.string().trim().required('Product Name is required'),
  Price: Yup.number<number>()
  .when('Is_price', {
    is: true,
    then: (schema) =>
      schema
        .required('Base Price is required')
        .positive()
        .integer(),
    otherwise: (schema) => schema,
  }),
  Sale_price: Yup.number<number>()
  .when('Is_price', {
    is: true,
    then: (schema) =>
      schema
        .required('Sale Price is required')
        .positive()
        .integer(),
    otherwise: (schema) => schema,
  }),
  Min_price: Yup.number<number>()
  .when('Is_price_range', {
    is: true,
    then: (schema) =>
      schema
        .required('Min Price is required')
        .positive()
        .integer(),
    otherwise: (schema) => schema,
  }),
  Max_price: Yup.number<number>()
  .when('Is_price_range', {
    is: true,
    then: (schema) =>
      schema
        .required('Max Price is required')
        .positive()
        .integer(),
    otherwise: (schema) => schema,
  }),
  Quantity: Yup.number().required('Quantity is required').positive().integer(),
  Model_number: Yup.string().trim().required('Model Number is required'),
  Production_year: Yup.number().positive().integer().nullable(),
  Voltage: Yup.number().positive().integer().nullable(),
  Wattage: Yup.number().positive().integer().nullable(),
  Frequency: Yup.number().positive().integer().nullable(),
  Cooling_capacity: Yup.number().positive().integer().nullable(),
  Noise_level_indoor: Yup.number().positive().integer().nullable(),
  Noise_level_outdoor: Yup.number().positive().integer().nullable(),
  Status: Yup.string().trim().required('Status is required'),
  ProductMainImage: Yup.mixed().test(
    'file',
    'Product Main Image is required',
    (value) => {
  
      // Check if the value is null or undefined
      if (value === null || value === undefined) {
        return false;
      }
  
      // Check if the value is a File object (you may need to adjust this based on your specific use case)
      if (!(value instanceof File)) {
        return false;
      }
  
      // Additional custom validations for the file (e.g., file size, file type, etc.)
      // Add your custom validation logic here
  
      return true; // Validation passed
    }
  ),
  Model_series: Yup.string().trim().required('Model Name is Required'),
  UserID: Yup.number().required('Distributor is required'),
  BrandID: Yup.number().required('Brand is required'), 
  CategoryID: Yup.number().required('CategoryID is required'), 
    Room_size_suitability: Yup.string().required("Room Size Field is required."),
    EnergyEfficiencyRatingID: Yup.number().required('Energy Rating is required'),
})


export default function AddProduct() {
  const TOKEN = authHelper.getAuth()
  let [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [productData, setProductData] = useState<ProductData>(initialProductData)

  const isValidate = () => {
    console.log("PRODYUVT", productData);
    

    let errorMessage = 'Please '
    let isProceed = true
    

    if (productData.Name === '' || productData.Name === null) {
      isProceed = false
      toast.warning(errorMessage + 'Enter Product Name in General Tab')
    }
    if ((productData.Is_price === false || String(productData.Is_price) === '') && (productData.Is_price_range === false || String(productData.Is_price_range) === '') ) {
  
        isProceed = false
        toast.warning(errorMessage + 'Enter Price in General Tab')
      
    }


    if (productData.Price === undefined || String(productData.Price) === '') {
      if(productData.Is_price)
      {
        isProceed = false
        toast.warning(errorMessage + 'Enter Base Price in General Tab')
      }
    }
    if (productData.Sale_price === undefined || String(productData.Sale_price) === '') {
      if(productData?.Is_price)
      {
        isProceed = false
        toast.warning(errorMessage + 'Enter Sale Price in General Tab')
      }
    }
    if (productData.Min_price === undefined || String(productData.Min_price) === '') {
      if(productData?.Is_price_range){
        isProceed = false
        toast.warning(errorMessage + 'Enter Min Price in General Tab')
      }
    }
    if (productData.Max_price === undefined || String(productData.Max_price) === '') {
      if(productData?.Is_price_range)
      {
        isProceed = false
        toast.warning(errorMessage + 'Enter Max Price in General Tab')
      }
    }

    if (productData.Quantity === undefined || String(productData.Quantity) === '') {
      isProceed = false
      toast.warning(errorMessage + 'Enter Quantity in Advanced Tab')
    }
    if (productData.CategoryID === undefined || String(productData.CategoryID) === '') {
      isProceed = false
      toast.warning(errorMessage + 'Select Category')
    }
    if (productData.BrandID === undefined || String(productData.BrandID) === '') {
      isProceed = false
      toast.warning(errorMessage + 'Select Brand')
    }
    if (productData.EnergyEfficiencyRatingID === undefined || String(productData.EnergyEfficiencyRatingID) === '') {
      isProceed = false
      toast.warning(errorMessage + 'Select Energy Rating')
    }
       if (productData.Status === undefined || String(productData.Status) === '') {
      isProceed = false
      toast.warning(errorMessage + 'Select Status')
    }
       if (productData.Room_size_suitability === undefined || String(productData.Room_size_suitability) === '') {
      isProceed = false
      toast.warning(errorMessage + 'Select Room Size')
    }
    if(productData.ProductMainImage === null || String(productData.ProductMainImage) === '')
    {
      console.log("This failed", productData?.ProductMainImage);
      
      isProceed=false;
      toast.warning(errorMessage+'Select product image');
    }
    if(productData.Model_number === null || String(productData.Model_number) === '')
    {   
      isProceed=false;
      toast.warning(errorMessage+'Enter Model Number in Advance Tab');
    }
      if(productData.Model_series === null || String(productData.Model_series) === '')
    {   
      isProceed=false;
      toast.warning(errorMessage+'Enter Model Series in Advance Tab');
    }
   
    if((productData.TableData !== null && productData.TableData.length>0) || (productData?.colorOptions!=null && productData?.colorOptions?.length>0))
    {
      if(productData.colorOptions.length !== productData.TableData.length)
      {
          isProceed=false;
          toast.warning(errorMessage+ 'Select atleast one image in each variation');
      }

      for(let i=0;i<productData.TableData.length;i++)
      {
        const { images }: { images: any[] } = productData.TableData[i];

        if (images.length < 1) {
          isProceed=false;
          toast.warning(errorMessage+ 'Select atleast one image in each variation')
          break;
        }
      }
    }

    return isProceed
  }



  const formik = useFormik({
    initialValues: productData,
    validationSchema,
    onSubmit: async (values: ProductData) => {
  
      try {
        if (isValidate()) {
          setLoading(true)

          let formData = new FormData()
          Object.keys(values).forEach((key) => {
            const value = values[key as keyof ProductData] || productData[key as keyof ProductData]

            if (value !== null && typeof value !== 'undefined' && value !== '') {
              if (key !== 'TableData') {
                if (typeof value === 'object') {
                  if (value instanceof File) {
                    formData.append(key, value)
                  }
                } else {
                  formData.append(key, String(value))
                }
              }
            }
          })

          

          
 
          productData?.TableData?.forEach((key: any, index: any) => {
            // console.log("APPENDED WITH ", `ProductMedia[${index}][color]` , "&", key.optionValue, key.images);

            formData.append(`ProductMedia[${index}][color]`, key.optionValue)

            // console.log("KEYS IMAGE", key , ">>", key?.images);
            key.images.forEach((image: File, imageIndex: any) => {
              formData.append(`ProductMedia[${index}][images]`, image)
            })
          })

          const formDataArray = Array.from(formData.entries())

          for (const pair of formDataArray) {
            console.log(pair[0] + ' - ' + pair[1])
          }

          try {
            axios
              .post(`${process.env.REACT_APP_SERVER_URL}/product/add_update_product`, formData, {
                headers: {Authorization: 'Bearer ' + TOKEN?.AccessToken},
              })
              .then(async (res) => {
                setLoading(false)
                if (res.status === 200 && res.data.message) {
                  console.log('Great', res)
                  const confirmAdd = await Swal.fire(defaultProductAddSuccessful)
                  if (confirmAdd.isConfirmed) {
                    formik.resetForm()
                    navigate('..')
                  }
                } else {
                  console.log('bad1', res.status)
                }
              })
              .catch((err) => {
                setLoading(false)
                console.log('Error', err)
                // Getting error
              })
          } catch (err) {
            setLoading(false)
            console.log(err)
          }
          // navigate('/auth')
        }
      } catch (err) {
        console.log(err)
      }
    },
  })



  const handleGeneralPanelChange = (data: any) => {
    
    setProductData((prevData) => ({
      ...prevData,
      ...data,
      TableData: data?.tableData || data?.TableData,
    }))
  }

  const handleLeftPanelDataChange = (data: any) => {
    setProductData((prevData) => ({
      ...prevData,
      ...data,
    }))
  }

  const handleAdvancedPanelChange = (data: any) => {
    setProductData((prevData) => ({
      ...prevData,
      ...data,
    }))

  }

  const handleKeyDown = (event:any) => {

    if (event.key === 'Enter') {
    
      event.preventDefault();
    }
  };

  return (
    <>
      <div className='content d-flex flex-column flex-column-fluid '>
        <div className='post  flex-column-fluid addProductPage'>
          <div className=''>
            <form
               onKeyDown={handleKeyDown}
               onSubmit={formik.handleSubmit}
              className='form d-flex flex-column flex-lg-row fv-plugins-bootstrap5 fv-plugins-framework'
            >
              <div className='d-flex flex-column gap-7 gap-lg-10 w-100 w-lg-400px mb-7 me-lg-10'>
                <LeftPanel onLeftPanelChanges={handleLeftPanelDataChange} formik={formik} />
              </div>

              <div className='d-flex flex-column flex-row-fluid gap-7 gap-lg-10'>
                <nav>
                  <div className='nav nav-tabs nav-underline' id='nav-tab' role='tablist'>
                    <button
                      className='text-start w-auto ps-0 pe-12 border-0 bg-transparent tabSelect nav-link active'
                      id='nav-general-tab'
                      data-bs-toggle='tab'
                      data-bs-target='#nav-general'
                      type='button'
                      role='tab'
                      aria-controls='nav-general'
                      aria-selected='true'
                      tabIndex={0}
                    >
                      General
                    </button>
                    <button
                      className='text-start ps-0  w-auto border-0 bg-transparent tabSelect nav-link nav-underline '
                      id='nav-advanced-tab'
                      data-bs-toggle='tab'
                      data-bs-target='#nav-advanced'
                      type='button'
                      role='tab'
                      aria-controls='nav-advanced'
                      aria-selected='false'
                      tabIndex={1}
                    >
                      Advanced
                    </button>
                  </div>
                </nav>

                <div className='tab-content' id='nav-tabContent'>
                  <div
                    className='tab-pane fade show active'
                    id='nav-general'
                    role='tabpanel'
                    aria-labelledby='nav-general-tab'
                  >
                    <div className='d-flex flex-column gap-7 gap-lg-10'>
                      <GeneralPanel
                        onGeneralPanelChange={handleGeneralPanelChange}
                        formik={formik}
                      />
                    </div>
                  </div>
                  <div
                    className='tab-pane fade show'
                    id='nav-advanced'
                    role='tabpanel'
                    aria-labelledby='nav-advanced-tab'
                  >
                    <div className='d-flex flex-column gap-7 gap-lg-10'>
                      <AdvancedPanel
                        onAdvancedPanelChange={handleAdvancedPanelChange}
                        formik={formik}
                      />
                    </div>
                  </div>
                  <div className='d-flex justify-content-end align-items-center'>
                    <button
                      onClick={() => navigate(`/admin/product/list`)}
                      className='bg-transparent py-5 rounded-4 px-12 btn custom-button-outline'
                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      className='primaryBtn py-5 rounded-4 btn btn-primary submitBtn custom-button-color'
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  )
}
