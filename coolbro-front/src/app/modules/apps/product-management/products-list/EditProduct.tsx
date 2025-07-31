import LeftPanel from './add-product-panels/LeftPanel'
import GeneralPanel from './add-product-panels/GeneralPanel'
import AdvancedPanel from './add-product-panels/AdvancedPanel'
import Swal from 'sweetalert2'
import './ProductStatus.css'
import {useFormik} from 'formik'
import {useNavigate, useParams} from 'react-router-dom'
import {useState, useEffect} from 'react'
import axios from 'axios'
import * as Yup from 'yup'
import {toast, ToastContainer} from 'react-toastify'
import {defaultProductEditSuccessful} from '../../../../config/sweetAlertConfig'
import '../../../../../../node_modules/react-toastify/dist/ReactToastify.css'
import * as authHelper from '../../../auth/core/AuthHelpers'


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
  Model_series: Yup.string().trim().required('Model Name is Required'),

})

function EditProduct() {
  const TOKEN = authHelper.getAuth()
  const [editProduct, setEditProduct] = useState<{}>()

  const {productId} = useParams()

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/product/${productId}`, {
        headers: {Authorization: 'Bearer ' + TOKEN?.AccessToken},
      })
      .then((res) => {
        if (res.data) {
          let ProductData = res.data.data
          // console.log('FROMAPI:', ProductData)
          setEditProduct(ProductData)
        }
      })
      .catch((err) => console.log(err))
  }, [])

  const [productData, setProductData] = useState<ProductData>({
    id: Number(productId),
    Name: '',
    Price: 0,
    Sale_price: 0,
    // Color: '',
    Description: '',
    Status: 'published',
    CategoryID: 0,
    BrandID: 0,
    Quantity: 0,
    tableData: [],
    EnergyEfficiencyRatingID: 0,
    UserID: 0,
    Remote_control_type: '',
    Is_available: false,
    Cooling_technology: '',
    Noise_level_indoor: 0,
    Room_size_suitability: '',
    Warranty_period: 0,
    Is_new_arrival: false,
    Is_best_seller: false,
    Is_featured: false,
    Is_exclusive: false,
    Has_anti_bacterial_filter: false,
    Has_built_in_air_purifier: false,
    Has_dust_filter: false,
    Has_voice_control: false,
    Has_dehumidification: false,
    Has_eco_mode: false,
    Has_turbo_mode: false,
    Has_auto_cleaning: false,
    Has_sleep_mode: false,
    Is_wifi_enabled: false,
    Model_series: '',
    Production_year: 0,
    Frequency: 0,
    Voltage: 0,
    Wattage: 0,
    Condenser_coil: '',
    Cooling_capacity: 0,
    Refrigerant: '',
    Indoor_unit_weight: 0,
    Dimensions_indoor_height: 0,
    Dimensions_indoor_width: 0,
    Dimensions_indoor_depth: 0,
    Outdoor_unit_weight: 0,
    Dimensions_outdoor_height: 0,
    Dimensions_outdoor_width: 0,
    Dimensions_outdoor_depth: 0,
    ProductMainImage: null,
    Noise_level_outdoor: 0, //TODO
    Installation_type: 'Wall Mount', //TODO
    Model_number: 'ABCD', //TODO
    ProductMedia: undefined,
    MediaIDsToRemove: [],
    VariationIDsToRemove: [],
    editNewImages: [],
    Min_price:0,
    Max_price: 0,
  })

  interface ProductData {
    id: Number
    Name: string
    Price: Number
    Sale_price: Number
    // Color: string
    Description: string
    Status: string
    CategoryID: number
    BrandID: number
    // imagePreview: string
    Quantity: number
    tableData: any
    EnergyEfficiencyRatingID: number
    UserID: number
    Remote_control_type: string
    Is_available: boolean
    // capacityTon: string
    Cooling_technology: string
    Noise_level_indoor: number
    Room_size_suitability: string
    Warranty_period: number
    Is_new_arrival: boolean
    Is_best_seller: boolean
    Is_featured: boolean
    Is_exclusive: boolean
    Has_anti_bacterial_filter: boolean
    Has_built_in_air_purifier: boolean
    Has_dust_filter: boolean
    Has_voice_control: boolean
    Has_dehumidification: boolean
    Has_eco_mode: boolean
    Has_turbo_mode: boolean
    Has_auto_cleaning: boolean
    Has_sleep_mode: boolean
    Is_wifi_enabled: boolean
    Model_series: string
    Production_year: number
    Frequency: number
    Voltage: number
    Wattage: number
    Condenser_coil: string
    Cooling_capacity: number
    Refrigerant: string
    Indoor_unit_weight: number
    Dimensions_indoor_height: number
    Dimensions_indoor_width: number
    Dimensions_indoor_depth: number
    Outdoor_unit_weight: number
    Dimensions_outdoor_height: number
    Dimensions_outdoor_width: number
    Dimensions_outdoor_depth: number
    ProductMainImage: any
    Noise_level_outdoor: number
    Installation_type: string
    Model_number: string
    ProductMedia: any
    MediaIDsToRemove: any
    VariationIDsToRemove: any
    editNewImages: any
    Min_price:number
    Max_price: number
 
   
  }

  const navigate = useNavigate()

  
  const isValidate = (values:any) => {
    

    let errorMessage = 'Please '
    let isProceed = true
 
    if (values.Name === '' || values.Name === null) {
      isProceed = false
      toast.warning(errorMessage + 'Enter Product Name in General Tab')
    }
    if ((values.Is_price === false || String(values.Is_price) === '') && (values.Is_price_range === false || String(values.Is_price_range) === '') ) {
  
        isProceed = false
        toast.warning(errorMessage + 'Enter Price in General Tab')
      
    }
    if (values.Price === undefined || String(values.Price) === '') {
      if(values.Is_price)
      {
        isProceed = false
        toast.warning(errorMessage + 'Enter Base Price in General Tab')
      }
    }
    if (values.Sale_price === undefined || String(values.Sale_price) === '') {
      if(values?.Is_price)
      {
        isProceed = false
        toast.warning(errorMessage + 'Enter Sale Price in General Tab')
      }
    }
    if (values.Min_price === undefined || String(values.Min_price) === '') {
      if(values?.Is_price_range){
        isProceed = false
        toast.warning(errorMessage + 'Enter Min Price in General Tab')
      }
    }
    if (values.Max_price === undefined || String(values.Max_price) === '') {
      if(values?.Is_price_range)
      {
        isProceed = false
        toast.warning(errorMessage + 'Enter Max Price in General Tab')
      }
    }

    if (values.Quantity === undefined || String(values.Quantity) === '') {
      isProceed = false
      toast.warning(errorMessage + 'Enter Quantity in Advanced Tab')
    }
    if (values.CategoryID === undefined || String(values.CategoryID) === '') {
      isProceed = false
      toast.warning(errorMessage + 'Select Category')
    }
    if (values.BrandID === undefined || String(values.BrandID) === '') {
      isProceed = false
      toast.warning(errorMessage + 'Select Brand')
    }
    if (values.EnergyEfficiencyRatingID === undefined || String(values.EnergyEfficiencyRatingID) === '') {
      isProceed = false
      toast.warning(errorMessage + 'Select Energy Rating')
    }
       if (values.Status === undefined || String(values.Status) === '') {
      isProceed = false
      toast.warning(errorMessage + 'Select Status')
    }
       if (values.Room_size_suitability === undefined || String(values.Room_size_suitability) === '') {
      isProceed = false
      toast.warning(errorMessage + 'Select Room Size')
    }
    if(values.ProductMainImage === null || String(values.ProductMainImage) === '')
    {
      isProceed=false;
      toast.warning(errorMessage+'Select product image');
    }
    if(values.Model_number === null || String(values.Model_number) === '')
    {   
      isProceed=false;
      toast.warning(errorMessage+'Enter Model Number in Advance Tab');
    }
      if(values.Model_series === null || String(values.Model_series) === '')
    {   
      isProceed=false;
      toast.warning(errorMessage+'Enter Model Series in Advance Tab');
    }
   
    if(values.editTable !== null && values.editTable.length>0)
    {
      if(values?.colorOptions?.length > values.editTable.length)
      {
          isProceed=false;
          toast.warning(errorMessage+ 'Select atleast one image in each variation')
           return ;
      }
      for(let i=0;i<values.editTable.length;i++)
      {
        const { Media_urls }: { Media_urls: any[] } = values.editTable[i];

        if (Media_urls.length < 1) {
          isProceed=false;
          toast.warning(errorMessage+ 'Select atleast one image in each variation')
          break;
        }
      }
    }



    return isProceed
  }


  const getReal = () => {
    // console.log('Product Main Image', productData.ProductMainImage)

    // console.log("realMediaIDsToRemove", realMediaIDsToRemove);
    // console.log('EditNewImages', productData.editNewImages)
    // console.log('MediaIDsToRemove', productData.MediaIDsToRemove)
    // console.log('VariationIDsToRemove', productData.VariationIDsToRemove)
  }

  const handleGeneralPanelChange = (data: any) => {

    setProductData((prevData) => ({
      ...prevData,
      ...data,
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

  const formik = useFormik({
    initialValues: productData,
    validationSchema,
    onSubmit: (values: any) => {
      productData.tableData = productData.editNewImages
      productData.ProductMainImage= productData?.ProductMainImage || values.ProductMainImage

        
      try {
        values = productData
        // console.log("NEW VSLS", values);
        if(isValidate(values))
        {
        let formData = new FormData()
        Object.keys(values).forEach((key) => {
          const vals = values[key as keyof ProductData]
          if (vals !== null && typeof vals !== 'undefined' && vals !== '') {
            if (typeof vals === 'object') {
              if (vals instanceof File) {
                formData.append(key, vals)
              } else {
                formData.append(key, JSON.stringify(vals))
              }
            } else {
              // console.log("APPEnding ", key , "and  ", values[key as keyof ProductData]);
              
              formData.append(key, values[key as keyof ProductData])
            }
          }
        })
        let productMediaArr: any[] = []
        values.tableData.forEach((key: any, index: any) => {
          formData.append(`ProductMedia[${index}][color]`, key.optionValue)
          productMediaArr.push({Color: key.optionValue})
          key.images.forEach((image: any, imageIndex: any) => {
            formData.append(`ProductMedia[${index}][images]`, image)
          })
        })

        formData.delete('colorOptions')

        // Append the entire array as a single value with the key 'ProductMedia'
        formData.set('ProductMedia', JSON.stringify(productMediaArr))
        if (values?.VariationIDsToRemove.length < 1) {
          formData.set('VariationIDsToRemove', JSON.stringify([]))
        }

        if (values?.MediaIDsToRemove.length < 1) {
          formData.set('MediaIDsToRemove', JSON.stringify([]))
        }

        formData.delete('tableData')
        formData.delete('editNewImages')

        const formDataArray = Array.from(formData.entries())
        // for (const pair of formDataArray) {

        //   console.log(pair)
        // }

        try {
        
          
          axios
            .post(`${process.env.REACT_APP_SERVER_URL}/product/add_update_product`, formData, {
              headers: {Authorization: 'Bearer ' + TOKEN?.AccessToken},
            })
            .then(async (res) => {
              if (res.status === 200 && res.data.message) {
                // console.log('Great', res)
                const confirmAdd = await Swal.fire(defaultProductEditSuccessful)
                if (confirmAdd.isConfirmed) {
                  // formik.resetForm()
                  // navigate('/product/list')
                }
              } else {
                console.log('bad1', res.status)
              }
            })
            .catch((err) => {
              console.log('Error', err)
              // Getting error
            })
        }
        catch (err) {
          console.log(err)
        }
      }} catch (err) {}
    },
  })

  const handleCancel = ()=>{
    navigate('../')
  }



  return (
    <>
      <div className='content d-flex flex-column flex-column-fluid '>
        <div className='post  flex-column-fluid addProductPage'>
          <div className=''>
            <form
              onSubmit={formik.handleSubmit}
              className='form d-flex flex-column flex-lg-row fv-plugins-bootstrap5 fv-plugins-framework'
            >
              <div className='d-flex flex-column gap-7 gap-lg-10 w-100 w-lg-400px mb-7 me-lg-10'>
                <LeftPanel
                  onLeftPanelChanges={handleLeftPanelDataChange}
                  formik={formik}
                  editProduct={editProduct}
                  ID={productData.id}
                />
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
                        editProduct={editProduct}
                        ID={productData.id}
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
                        editProduct={editProduct}
                      />
                    </div>
                  </div>
                  <div className='d-flex justify-content-end align-items-center'>
                    <button
                      // type='submit'
                      type="button" 
                      onClick={handleCancel}
                      className='bg-transparent py-5 rounded-4 px-12 btn custom-button-outline'
                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      className='primaryBtn py-5 px-10  rounded-4 btn btn-primary submitBtn custom-button-color'
                    >
                      Save Changes
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

export default EditProduct
