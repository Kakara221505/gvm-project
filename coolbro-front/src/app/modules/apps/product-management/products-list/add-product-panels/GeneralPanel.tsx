import {useState, useEffect} from 'react'
import '../ProductStatus.css'
import {useQuill} from 'react-quilljs'
import '../../../../../../../node_modules/quill/dist/quill.snow.css'
import 'quill/dist/quill.snow.css'
import ImageGroupModal from './ImageGroupModal'
import CustomDropdown from '../../../../../pages/HelperComponents/CustomDropdown'
// import { KTIcon, toAbsoluteUrl } from '../../../../';
import {KTIcon , toAbsoluteUrl} from '../../../../../../_metronic/helpers'
import {toast} from 'react-toastify'
import Swal from 'sweetalert2'
import { defaultDeleteVariation } from '../../../../../config/sweetAlertConfig'
// import { log } from 'console'

export default function GeneralPanel({formik, onGeneralPanelChange, editProduct, ID}: any) {
  const [editNewImages, setEditNewImages] = useState<string[]>([])
  const [VariationIDsToRemove, setVariationIDsToRemove] = useState<number[]>([])
  const {quill, quillRef} = useQuill()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [variation, setVariation] = useState<string>('')
  // const [priceMode,setPriceMode]=useState('price');
  const [Is_price,setIsPrice]=useState(false);
  const [Is_price_range,setIsPriceRange]=useState(false);



  const [Description, setDescription] = useState<string>('')


  const [Name, setProductName] = useState<string>('')
  const [editTable, setEditTable] = useState<string[]>([])
  const [alreadyExists, setAlreadyExists] = useState<string>('')
  const [Color, setMediaColor] = useState<string>('')
  const [Price, setBasePrice] = useState<number>()

   const [startRangePrice,setStartRangePrice]=useState<number>();
   const [endRangePrice,setEndRangePrice]=useState<number>();

  const [Sale_price, setSalePrice] = useState<number>()
  const [selectedOption, setSelectedOption] = useState<string>('')
  const options = ['Red', 'Blue', 'Yellow']
  const [colorOptions, setColorOptions] = useState<string[]>([])

  const [tableData, setTableData] = useState<string[]>([])

  const [MediaIDsToRemove, setMediaIDsToRemove] = useState<number[]>([])

  const [ProductMedia, setNewImages] = useState<File[]>([])

  const [editOptionValue, setEditOptionValue] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string | null>(null)

  const [variationData, setVariationData] = useState<object[]>([{}])



  const deleteVariationConfirmation = async (id: any) => {
    const confirmDelete = await Swal.fire(defaultDeleteVariation);
    if (confirmDelete.isConfirmed) {
        
    }
  };

  const deleteImageGroup = async(optionValueToDelete: any) => {

const confirmDelete = await Swal.fire(defaultDeleteVariation);
if (confirmDelete.isConfirmed) {
  if (tableData) {
  
    // Filter out the object with the matching optionValue
    const updatedTableData = tableData.filter(
      (item: any) => item.optionValue !== optionValueToDelete
    )
    // Update the table data state
    setTableData(updatedTableData)
  }   
}
   
  }

  const deleteVariationGroup = async(idToDelete: any, valueToDelete: string) => {
 
    const confirmDelete = await Swal.fire(defaultDeleteVariation);
    if (confirmDelete.isConfirmed) {
    if (editTable) {
  
      const updatedTableData = editTable.filter((item: any) => item.ID !== idToDelete)
      setEditTable(updatedTableData)

      const getVariationID: any = editTable.find((single: any) => single.ID === idToDelete)
      const variationID = getVariationID?.ID
      if (String(variationID[0]) !== 'C')
        setVariationIDsToRemove([...VariationIDsToRemove, variationID])

      // setRemoveVariation(valueToDelete)
     
      const updatedEditImageTable = editNewImages.filter(
        (item: any) => item.optionValue !== valueToDelete
      )
   
      setEditNewImages(updatedEditImageTable)
    }
  }
  }

  const handleCreateImage = (colorOptions: any) => {
    if (!Color) {
      toast.warning('Please select a color variant from the dropdown.')
    } else {
      setIsModalOpen(true)
    }

    if (editTable.length !== 0 || ID) {
      setEditOptionValue(null)
      // setIsModalOpen(true)
      const isMediaColorExists: any = editTable.find((obj: any) => obj.Value === Color)
      if (isMediaColorExists) {
        setIsModalOpen(true)
        setEditValue(isMediaColorExists.Value)
      
      } else {
      
        setEditValue(Color)
        // const newObject = {}
      }
    } else if (tableData.length !== 0 || !ID) {
      const isMediaColorExists = tableData.find((obj: any) => obj.optionValue === Color)
      if (isMediaColorExists) {
        setAlreadyExists(isMediaColorExists)
      } else {
        setAlreadyExists('')
      }
      setEditValue(null)
      setEditOptionValue(null)
    }
  }

  const openEditModal = (optionValue: any) => {
    setEditOptionValue(optionValue)
    setMediaColor(optionValue)
  }

  const openEditModalNew = (optionValue: any) => {

    setEditOptionValue(null)
    setEditValue(optionValue)
    setMediaColor(optionValue)
  }

  const handleDropdownChange = (option: string) => {

    setSelectedOption(option)
  }

  const handleDropdownChangeColors = (colorOptions: string) => {
    setMediaColor(colorOptions)
    setIsModalOpen(true)
  }

  const handleSalePriceChange = (e: any) => {
    setSalePrice(e.target.value)
    formik.handleChange(e)
  }

  const handleBasePriceChange = (e: any) => {
    
    setBasePrice(e.target.value)
    formik.handleChange(e)
  }

  const handleProductNameChange = (e: any) => {
    setProductName(e.target.value)
    formik.handleChange(e)
  }

  const handleStartRange = (e: any) => {
  
    setStartRangePrice(e.target.value)
    formik.handleChange(e)
  }
  const handleEndRange = (e: any) => {
   
    setEndRangePrice(e.target.value)
    formik.handleChange(e)
  }
  const handlePriceRangeChange = (e: any) => {
    
   setIsPriceRange(e.target.checked)
   setIsPrice(false)
  //  formik.handleChange(e);
  formik.setFieldValue('Is_price_range', e.target.checked)
  formik.setFieldValue('Is_price', false)
  }

  const handlePriceChange = (e: any) => {
   
    setIsPrice(e.target.checked)
    setIsPriceRange(false)
    formik.setFieldValue('Is_price', e.target.checked)
    formik.setFieldValue('Is_price_range', false)
  //  formik.handleChange(e);

  }



  const addVariation = () => {
    if (variation) {
      const alreadyExists = colorOptions.find((single: any) => single === variation)
 
      if (alreadyExists) {
        toast.warn('Already Exists')
      } else {
      
        setColorOptions([...colorOptions, variation])
        setVariation('')
      }
    }
  }

  // I miss the air, I miss my friends
  // I miss my mother, I miss it when
  // Life was a party to be thrown
  // But that was a million years ago

  useEffect(() => {
    if (editProduct) {
      let colorOpt: string[] = []
     
      setProductName(editProduct.Name)
      formik.setFieldValue('Name',editProduct.Name)
      
      if(editProduct?.Is_price)
      {
        setIsPrice(true)
        setBasePrice(editProduct.Price)
        setSalePrice(editProduct.Sale_price)
        formik.setFieldValue('Is_price',true )
        formik.setFieldValue('Price',editProduct.Price)
        formik.setFieldValue('Sale_price',editProduct.Sale_price)
      
      }
      else if(editProduct?.Is_price_range)
      {
        setIsPriceRange(true)
        setStartRangePrice(editProduct?.Min_price)
        setEndRangePrice(editProduct?.Max_price)
        formik.setFieldValue('Is_price_range',true )
        formik.setFieldValue('Min_price',editProduct.Min_price)
        formik.setFieldValue('Max_price',editProduct.Max_price)
      
      }


      setDescription(editProduct?.Description)
      quill.clipboard.dangerouslyPasteHTML(editProduct?.Description)
      for (let i = 0; i < editProduct?.Variations?.length; i++) {
        colorOpt = [...colorOpt, editProduct?.Variations[i]?.Value]
      }
   
      setColorOptions(colorOpt)
      setEditTable(editProduct.Variations)
      // setMediaColor(editProduct.Color)
    }
  }, [editProduct])

  useEffect(() => {
    onGeneralPanelChange({
      Name,
      Price,
      Sale_price,
      Description,
      tableData,
      MediaIDsToRemove,
      editNewImages,
      VariationIDsToRemove,
      colorOptions,
      Is_price,
      Is_price_range,
      Min_price: startRangePrice,
      Max_price: endRangePrice,
      editTable
    })
  }, [
    Name,
    Price,
    Sale_price,
    Description,
    tableData,
    MediaIDsToRemove,
    editNewImages,
    VariationIDsToRemove,
    colorOptions,
    Is_price,
    Is_price_range,
    startRangePrice,
    endRangePrice,
    editTable
  ])

  const updateTableData = (optionValue: string, images: any, editOption: string) => {
    // Create a new data object based on the received data
    setNewImages(images)
    const newData: any = {
      optionValue,
      images,
    }
    if (editOption) {
      const updatedTableData = tableData.filter((obj: any) => obj.optionValue !== editOption)
      setTableData([...updatedTableData, newData])
    } else {
      // Update the table data state with the new data
      setTableData([...tableData, newData])
    }
  }

  useEffect(() => {
    if (quill) {
      quill.on('text-change', () => {
        setDescription(quillRef.current.firstChild.innerHTML)
      })
    }
  }, [quill])

 async function handleDeleteColorOpt(colorToRemove:any)
  {
 
    const confirmDelete = await Swal.fire(defaultDeleteVariation);
    if (confirmDelete.isConfirmed) {
    if(editProduct)
    {
     
      if (editTable) {
          const getColorId:any= editTable.find((editColor:any)=> editColor?.Value===colorToRemove);

       const updatedTableData = editTable.filter((item: any) => item.ID !== getColorId?.ID)
       setEditTable(updatedTableData)

       const getVariationID: any = editTable.find((single: any) => single.ID === getColorId?.ID)
       const variationID = getVariationID?.ID
       if (String(variationID?.[0]) !== 'C')
         setVariationIDsToRemove([...VariationIDsToRemove, variationID])
 
       // setRemoveVariation(colorToRemove)
      
       const updatedEditImageTable = editNewImages.filter(
         (item: any) => item.optionValue !== colorToRemove
       )
    
       setEditNewImages(updatedEditImageTable)
     }
  
     
      setColorOptions(prevColorOptions => prevColorOptions.filter(color => color !== colorToRemove));
        
    }
    else{
      const confirmDelete = await Swal.fire(defaultDeleteVariation);
      if (confirmDelete.isConfirmed) {
        if (tableData) {
        
          // Filter out the object with the matching optionValue
          const updatedTableData = tableData.filter(
            (item: any) => item.optionValue !== colorToRemove
          )
          // Update the table data state
          setTableData(updatedTableData)
         
        }   
        setColorOptions(prevColorOptions => prevColorOptions.filter(color => color !== colorToRemove));
        
      }
    
  }
}
}








  return (
    <div>
      <div className='card card-flush py-4 w-auto h-auto'>
        <div className='card-header'>
          <div className='card-title'>
            <h2>General</h2>
          </div>
        </div>
        <div className='card-body pt-0'>
          <div className='form-group'>
            <input
              id='productName'
              placeholder=''
              className='form-control bg-transparent shadow-none customInput'
              type='text'
              name='Name'
              autoComplete='off'
              value={Name}
              onChange={handleProductNameChange}
              onBlur={formik.handleBlur}
            />
            <label className={`form-label fs-6 fw-bolder ${Name ? 'float' : ''}`} htmlFor='Name'>
              Product Name
            </label>
            {formik.touched.Name && formik.errors.Name && (
              <div className='fv-plugins-message-container'>
                <div className='fv-help-block'>{formik.errors.Name}</div>
              </div>
            )}
          </div>

          <br />
          <div className='form-group mt-3'>
            <h3 className='primaryTextSemiBold'> Description</h3>

            <div className='row mt-5'>
              <div className=''>
                <div className='' ref={quillRef}></div>
              </div>
            </div>
            <br />
          </div>
        </div>
        <div className='card-body pb-2'>
          <label className='form-group-label form-check-label' htmlFor='descTextArea'>
            Set a description to the product for better visibility
          </label>
        </div>
      </div>

      <br />

      <div className='card card-flush py-4'>
        <div className='card-header'>
          <div className='card-title'>
            <h2>Variations</h2>
          </div>
        </div>

        <br />
        <div className='card-body pt-0'>
          <div className='form-group'>
            <h3>Add Product Variations</h3>
            <br />

            {/* variation box  */}

            <div className='row newVariation'>
              <div className='col-md-6'>
                <CustomDropdown
                  options={options}
                  label='Color'
                  selectedOption={selectedOption}
                  disabled={true} // Set isDropdownDisabled to true to disable the dropdown
                  onChange={handleDropdownChange}
                />
              </div>
              <div className='col-md-6'>
                <div className='mb-3'> 
                  <div className='form-group navbarMarginForSearch d-flex align-items-center'>
                    <input
                      id='Variation'
                      placeholder=''
                      className='form-control bg-transparent shadow-none  customInput'
                      type='text'
                      name='Variation'
                      autoComplete='off'
                      value={variation}
                      onChange={(e) => setVariation(e.target.value)}
                    />
                    <label
                      className={`form-label fs-6 fw-bolder ${variation ? 'float' : ''}`}
                      htmlFor='Variation'
                    >
                      Variation
                    </label>
                  {variation?.length>0 &&  <div className='' onClick={addVariation}>
                    <KTIcon iconName='check-circle' className='fs-1 clear-all-icon text-success cursor-pointer p-4  '   />
                    </div>}
                     
                  </div>
                </div>
              </div>
            </div>

            {colorOptions?.length > 0 &&
              colorOptions?.map((color, idx) => (
                <div className='row newVariation' key={idx}>
                  <div className='col-md-6'>
                    <CustomDropdown
                      options={options}
                      label='Color'
                      selectedOption={selectedOption}
                      disabled={true} // Set isDropdownDisabled to true to disable the dropdown
                      onChange={handleDropdownChange}
                    />
                  </div>
                  <div className='col-md-6'>
                    <div className='mb-3'>
                      <div className='form-group navbarMarginForSearch d-flex align-items-center'>
                        <input
                          id='Variation'
                          placeholder=''
                          className='form-control bg-transparent shadow-none  customInput'
                          type='text'
                          name='Variation'
                          autoComplete='off'
                          value={color}
                          disabled
                          // onChange={(e) => setVariation(e.target.value)}
                        />
                       
                        <label
                          className={`form-label fs-6 fw-bolder ${variation ? 'float' : ''}`}
                          htmlFor='Variation'
                        >
                          Variation
                        </label>
                        <div onClick={()=>handleDeleteColorOpt(color)}>
                        <KTIcon iconName='trash' className='fs-1 clear-all-icon text-danger cursor-pointer p-4'   />
                      </div>
                      </div>
                     
                    </div>
                  </div>
                </div>

              ))}

      
            <br />
            <button
              className='primaryBtn py-5 rounded-4 btn btn-lg btn btn-primary custom-button-color'
              onClick={addVariation}
              type='button'
            >
              + Add Another Variation
            </button>
          </div>
        </div>
      </div>
      <br />

      <div className='card card-flush py-4 pb-0'>
        <div className='card-header'>
          <div className='card-title'>
            <h2>Media</h2>
          </div>
        </div>
        <div className='card-body pt-0 pb-3'>
          <div className='form-group'>
            <div className='row d-flex  align-items-center mt-4'>
              <div className='d-flex mobileFlexColumn  justify-content-between'>
                <div className='col-lg-3'>
                  <br />
                  <CustomDropdown
                    options={colorOptions}
                    label='Select Color'
                    selectedOption={Color}
                    onChange={handleDropdownChangeColors}
                  />
                </div>
                <div className=' marginPageMYMobile d-flex contentCenter dFLexAlignItemsCenterMobile justDropEnd '>
                  <button
                    className='primaryBtn btn btn-lg py-5 rounded-4 custom-button-color'
                    type='button'
                    data-bs-toggle={isModalOpen ? 'modal' : ''}
                    data-bs-target='#exampleModal'
                    disabled={colorOptions?.length <= 0 || Color === '' ? true : false}
                    onClick={handleCreateImage}
                  >
                    Create Image Group
                  </button>

                  <br />
                </div>
              </div>
            </div>
            <div
              className='modal fade'
              id='exampleModal'
              tabIndex={-1}
              aria-labelledby='exampleModalLabel'
              aria-hidden='true'
            >
              <ImageGroupModal
                updateTableData={updateTableData}
                mediaColor={Color} //this will accept color
                editOptionValue={editOptionValue} // first time going null for edit
                tableData={tableData}
                setTableData={setTableData}
                editTable={editTable}
                alreadyExists={alreadyExists}
                MediaIDsToRemove={MediaIDsToRemove}
                setMediaIDsToRemove={setMediaIDsToRemove}
                editValue={editValue}
                // updateEditTable={updateEditTable}
                setEditTable={setEditTable}
                setEditNewImages={setEditNewImages}
                editNewImages={editNewImages}
                ID={ID}
              />
            </div>
            <br />
            <br />
            <div className='row'>
              <div className='table-responsive col-md-12'>
                <table className='table table-rounded table-row-bordered border gy-7 gs-7'>
                {colorOptions?.length>0 && Color && <thead>
                    <tr className='fw-semibold fs-6 text-gray-800 border-bottom-2 border-gray-200 text-center'>
                      {/* <th scope='col'>GROUP CODE</th> */}
                      <th scope='col'>OPTION VALUES</th>
                      <th scope='col'>ACTIONS</th>
                    </tr>
                  </thead>}
                  <tbody>
                    {tableData &&
                      tableData.map((single: any, index) => {
                        return (
                          <tr className='table-active text-center'>
                            <td className=''>C_{single.optionValue}</td>
                            <td className='text-center'>
                              <div className='btn-group'>
                                <button
                                  type='button'
                                  className='btn btn-light btn-active-light-primary btn-flex btn-center btn-sm'
                                  data-bs-toggle='dropdown'
                                  data-kt-menu-trigger='click'
                                  data-kt-menu-placement='bottom-end'
                                >
                                  Actions
                                  <i className='ki-duotone ki-down fs-5 ms-1'></i>
                                </button>
                                <div className='dropdown-menu menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4'>
                                  <div className='dropdown-item menu-item px-3'>
                                    <button
                                      type='button'
                                      className='menu-link px-3 border-none'
                                      // type='button'
                                      data-bs-toggle='modal'
                                      data-bs-target='#exampleModal'
                                      onClick={() => openEditModal(single.optionValue)}
                                    >
                                      Edit
                                    </button>
                                  </div>
                                  <div className='dropdown-item menu-item px-3'>
                                    <button
                                      type='button'
                                      className='menu-link px-3'
                                      onClick={() => deleteImageGroup(single.optionValue)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    {editTable &&
                      editTable.map((single: any, index) => {
                        return (
                          <tr className='table-active text-center'>
                            <td>C_{single.Value}</td>
                            <td className='text-center'>
                              <div className='btn-group'>
                                <button
                                  type='button'
                                  className='btn btn-light btn-active-light-primary btn-flex btn-center btn-sm'
                                  data-bs-toggle='dropdown'
                                  data-kt-menu-trigger='click'
                                  data-kt-menu-placement='bottom-end'
                                >
                                  Actions
                                  <i className='ki-duotone ki-down fs-5 ms-1'></i>
                                </button>
                                <div className='dropdown-menu menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4'>
                                  <div className='dropdown-item menu-item px-3'>
                                    <button
                                      type='button'
                                      className='menu-link px-3 border-none'
                                      // type='button'
                                      data-bs-toggle='modal'
                                      data-bs-target='#exampleModal'
                                      onClick={() => openEditModalNew(single.Value)}
                                    >
                                      Edit
                                    </button>
                                  </div>
                                  <div className='dropdown-item menu-item px-3'>
                                    <button
                                      type='button'
                                      className='menu-link px-3'
                                      onClick={() => deleteVariationGroup(single.ID, single.Value)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    {/* <button type='button' onClick={() => console.log(tableData)}></button> */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <br />

      <div className='card card-flush pb-8'>
        <div className='card-header pb-0'>
          <div className='card-title'>
            <h2>Pricing</h2>
          </div>
          
        </div>

        <div className='card-label-box pb-8'>
  <div className=''>
    <input id="radPriceMode" type='radio' name="Is_price" checked={Is_price ===true ? true : false} onChange={handlePriceChange}   />
    <label htmlFor="radPriceMode">Price</label>
  </div>
  <div className=''>
    <input id="radPriceModeRange" type='radio' name="Is_price_range" checked={Is_price_range===true ? true : false} onChange={handlePriceRangeChange}   />
    <label htmlFor="radPriceModeRange">Price Range</label>
  </div>
</div>



     
        <div className='card-body py-0'>
        { formik.touched.Is_price  && (Is_price===false && Is_price_range===false) &&  (
              <div className='fv-plugins-message-container'>
                <div className='fv-help-block'>{"Please Choose the Price Format"}</div>
              </div>
            )}
{Is_price &&      
    <div className='pricingDiv'>
            <div className='has-float-label mb-8 d-block'>
              <input
                id='basePrice'
                placeholder='Base Price'
                className='form-control bg-transparent shadow-none  customInput'
                type='number'
                name='Price'
                autoComplete='off'
                disabled={!Is_price}
                
                value={Price}
                onChange={handleBasePriceChange}
                onBlur={formik.handleBlur}
              />


              <label className='form-label fs-6 fw-bolder ' htmlFor='floatingInputBasePrice'>
                Base Price
              </label>
              {formik.touched.Price && formik.errors.Price && (
                <div className='fv-plugins-message-container'>
                  <div className='fv-help-block'>{"Base Price must be greater than 0"}</div>
                </div>
              )}
            </div>

            <div className='has-float-label mb-8 d-block'>
              <input
                id='salePrice'
                placeholder='Sale Price'
                className='form-control bg-transparent shadow-none  customInput'
                type='number'
                name='Sale_price'
                autoComplete='off'
                disabled={Is_price? false : true}
                value={Sale_price}
                onChange={handleSalePriceChange}
                onBlur={formik.handleBlur}
              />
              <label className='form-label fs-6 fw-bolder text-dark required' htmlFor='Sale_price'>
                Sale Price
              </label>
              {formik.touched.Sale_price && formik.errors.Sale_price && (
                <div className='fv-plugins-message-container'>
                  <div className='fv-help-block'>{"Sale Price must be greater than 0"}</div>
                </div>
              )}
            </div>
          </div>
}
{ Is_price_range &&
          <div className='pricingDiv row'>
            <div className='has-float-label mb-8 d-block col md-6'>
              <input
                id='Min_price'
                placeholder='Starting Range'
                className='form-control bg-transparent shadow-none  customInput'
                type='number'
                name='Min_price'
                disabled={Is_price_range ? false : true}
               
                autoComplete='off'
                value={startRangePrice}
                onChange={handleStartRange}
                onBlur={formik.handleBlur}
              />
              <label className='form-label fs-6 fw-bolder ' >
              Starting Range
              </label>
              {formik.touched.Min_price && formik.errors.Min_price && (
                <div className='fv-plugins-message-container'>
                  <div className='fv-help-block'>{"Startring Range must be greater than 0."}</div>
                </div>
              )}
            </div>

            <div className='has-float-label mb-8 d-block col md-6'>
          
              <input
                id='Max_price'
                placeholder='End Range'
                className='form-control bg-transparent shadow-none  customInput'
                type='number'
                name='Max_price'
                autoComplete='off'
                value={endRangePrice}
                disabled={Is_price_range ? false : true}
                onChange={handleEndRange}
                onBlur={formik.handleBlur}
              />
         
              <label className='form-label fs-6 fw-bolder text-dark required' >
                End Range
              </label>
              {formik.touched.Max_price && formik.errors.Max_price && (
                <div className='fv-plugins-message-container'>
                  <div className='fv-help-block'>{"End Range must be greater than 0."}</div>
                </div>
              )}
            </div>
          </div>}




        </div>
      </div>
    </div>
  )
}
