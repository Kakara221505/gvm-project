import {useState, useEffect} from 'react'
import '../ProductStatus.css'
import axios from 'axios'
import * as authHelper from '../../../../auth/core/AuthHelpers'
import CustomDropdown from '../../../../../pages/HelperComponents/CustomDropdown'

import {useQuill} from 'react-quilljs'

function AdvancedPanel({onAdvancedPanelChange, formik, editProduct}: any) {
  const TOKEN = authHelper.getAuth()

  const [coolingTechnology, setCoolingTechnology] = useState<string[]>([])
  const [remoteControlType, setRemoteControlType] = useState<string[]>([
    'Standard Remote',
    'Smart Remote',
    'Digital Remote',
  ])

  const [warranty, setWarranty] = useState<string[]>([])
  const mountType = ['Wall Mounting', 'Window Mounting', 'C']
  const [Quantity, setQuantity] = useState<number>()
  const [Model_series, setModelName] = useState<string>('')
  const [Model_number, setModelNumber] = useState<string>('')

  const [Remote_control_type, setRemoteControl] = useState<string>('')
  const [Cooling_technology, setCoolingTech] = useState<string>('')
  // const [remoteControlVal,setRemoteControlVal]=useState<string>('');
  const [Installation_type, setInstallation_type] = useState<string>('')
  const [Noise_level_indoor, setNoise] = useState<number>()
  const [Noise_level_outdoor, setNoiseOutdoor] = useState<number>()
  const [WarrantyPeriod, setWarrantyPeriod] = useState<string>('')
  const [Warranty_period, set_Warranty_Period] = useState<string>('')

  const [Is_available, setIsAvailable] = useState(false)
  const [Is_new_arrival, setIsNewArrival] = useState(false)
  const [Is_best_seller, setIsBestSeller] = useState(false)
  const [Is_featured, setIsFeatured] = useState(false)
  const [Is_exclusive, setIsExclusive] = useState(false)

  const [Has_built_in_air_purifier, setHasBuiltInAirPurification] = useState(false)
  const [Has_anti_bacterial_filter, setHasAntiBacterialFilter] = useState(false)
  const [Has_dust_filter, setHasDustFilter] = useState(false)

  const [Has_voice_control, setHasVoiceControl] = useState(false)
  const [Has_eco_mode, setHasEcoMode] = useState(false)
  const [Has_dehumidification, setHasDehumidification] = useState(false)
  const [Has_turbo_mode, setHasTurboMode] = useState(false)
  const [Has_sleep_mode, setHasSleepMode] = useState(false)
  const [Has_auto_cleaning, setHasAutoCleaning] = useState(false)
  const [Is_wifi_enabled, setIsWiFiEnabled] = useState(false)
  const {quill, quillRef} = useQuill()

  const [Production_year, setProductionYear] = useState<number>()
  const [Frequency, setFrequency] = useState<number>()
  const [Voltage, setVoltage] = useState<number>()
  const [Refrigerant, setRefrigerant] = useState<string>('')
  const [Wattage, setWattage] = useState<number>()
  const [Condenser_coil, setCondenserCoil] = useState<string>('')
  const [Cooling_capacity, setCoolingCapacity] = useState<number>()
  const [Indoor_unit_weight, setIndoorUnitWeight] = useState<number>() //Todo
  const [Dimensions_indoor_height, setIndoorHeight] = useState<number>()
  const [Dimensions_indoor_width, setIndoorWidth] = useState<number>()
  const [Dimensions_indoor_depth, setIndoorDepth] = useState<number>()
  const [Outdoor_unit_weight, setOutdoorUnitWeight] = useState<number>()
  const [Dimensions_outdoor_height, setOutdoorHeight] = useState<number>()
  const [Dimensions_outdoor_width, setOutdoorWidth] = useState<number>()
  const [Dimensions_outdoor_depth, setOutdoorDepth] = useState<number>()

  const [Meta_tag_description, setMetaDescription] = useState<string>('')
  const [Meta_tag_title,setMeta_tag_title]=useState<string>('')
  const [Meta_tag_keywords,setMeta_tag_keywords]=useState<string>('')


  const handleCheckboxChange = (e: any, setStateFunction: (value: any) => void) => {
    const checked = e.target.checked
    setStateFunction(checked)
  }

  const handleInputChange = (e: any, setStateFunction: (value: any) => void) => {
    const value = e.target.value
    setStateFunction(value)
    formik.handleChange(e)
  }

  const handleInputDropDownChange = (e: any, setStateFunction: (value: any) => void) => {
    const value = e
    setStateFunction(value)
    formik.handleChange(e)
  }

  const handleWarrantyChange = (e: any, setStateFunction: (value: any) => void) => {
    const res = e.split(' ')

    let value
    if (res?.length > 0) {
      value = res?.[0]
    }
    setStateFunction(value)
    formik.handleChange(e)
  }

  useEffect(() => {
    if (editProduct) {
      setQuantity(editProduct.Quantity)
      formik.setFieldValue('Quantity',editProduct.Quantity)
      setModelName(editProduct.Model_series)
      formik.setFieldValue('Model_series', editProduct.Model_series )
      setModelNumber(editProduct.Model_number)
      formik.setFieldValue('Model_number', editProduct.Model_number )
      setCoolingTech(editProduct.Cooling_technology)
      setRemoteControl(editProduct.Remote_control_type)
      setProductionYear(editProduct.Production_year)
      formik.setFieldValue('Production_year',editProduct.Production_year)
      setVoltage(editProduct.Voltage)
      formik.setFieldValue('Voltage',editProduct.Voltage)
      setWattage(editProduct.Wattage)
      formik.setFieldValue('Wattage',editProduct.Wattage)
      setRefrigerant(editProduct.Refrigerant)
      setCondenserCoil(editProduct.Condenser_coil)
      setFrequency(editProduct.Frequency)
      formik.setFieldValue('Frequency',editProduct.Frequency)
      setCoolingCapacity(editProduct.Cooling_capacity)
      formik.setFieldValue('Cooling_capacity',editProduct.Cooling_capacity)

      setNoise(editProduct.Noise_level_indoor)
      formik.setFieldValue('Noise_level_indoor',editProduct.Noise_level_indoor)
      setNoiseOutdoor(editProduct.Noise_level_outdoor)
      formik.setFieldValue('Noise_level_outdoor',editProduct.Noise_level_outdoor)
     
      if (editProduct.Warranty !== 0) {
        if (editProduct.Warranty === 1) {
          setWarrantyPeriod(`${editProduct.Warranty_period} year`)
          set_Warranty_Period(editProduct.Warranty_period)
        } else {
          setWarrantyPeriod(`${editProduct.Warranty_period} years`)
          set_Warranty_Period(editProduct.Warranty_period)
        }
      }
      // setWarrantyPeriod(`${editProduct.Warranty_period} year`)
      setIndoorUnitWeight(editProduct.Indoor_unit_weight)
      setIndoorHeight(editProduct.Dimensions_indoor_height)
      setIndoorWidth(editProduct.Dimensions_indoor_width)
      setIndoorDepth(editProduct.Dimensions_indoor_depth)
      setOutdoorUnitWeight(editProduct.Outdoor_unit_weight)
      setOutdoorHeight(editProduct.Dimensions_outdoor_height)
      setOutdoorWidth(editProduct.Dimensions_outdoor_width)
      setOutdoorDepth(editProduct.Dimensions_outdoor_depth)
      setIsAvailable(editProduct.Is_available)
      setIsWiFiEnabled(editProduct.Is_wifi_enabled)
      setIsBestSeller(editProduct.Is_best_seller)
      setIsExclusive(editProduct.Is_exclusive)
      setIsFeatured(editProduct.Is_featured)
      setIsNewArrival(editProduct.Is_new_arrival)
      setHasAntiBacterialFilter(editProduct.Has_anti_bacterial_filter)
      setHasBuiltInAirPurification(editProduct.Has_built_in_air_purifier)
      setHasDustFilter(editProduct.Has_dust_filter) //TODO
      setHasAutoCleaning(editProduct.Has_auto_cleaning)
      setHasVoiceControl(editProduct.Has_voice_control)
      setHasDehumidification(editProduct.Has_dehumidification)
      setHasEcoMode(editProduct.Has_eco_mode)
      setHasTurboMode(editProduct.Has_turbo_mode)
      setHasSleepMode(editProduct.Has_sleep_mode)
      setInstallation_type(editProduct.Installation_type)
      setMetaDescription(editProduct?.Meta_tag_description)
      setMeta_tag_title(editProduct?.Meta_tag_title)
      setMeta_tag_keywords(editProduct?.Meta_tag_keywords)

      quill.clipboard.dangerouslyPasteHTML(editProduct?.Meta_tag_description)
      
    }
  }, [editProduct])

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/product/product-filter`, {
        headers: {Authorization: 'Bearer ' + TOKEN?.AccessToken},
      })
      .then((res) => {
        const details = res.data.data

        const techValue = details['Cooling Technologies'].map((item: any) => item.Name)
        setCoolingTechnology(techValue)

        const warrantyValue = details['Warranty Period'].map((item: any) => item.Name)
        setWarranty(warrantyValue)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  useEffect(() => {
    // console.log("COOLING TECH:", Cooling_technology);

    onAdvancedPanelChange({
      Quantity,
      Model_series,
      Model_number,
      Cooling_technology,
      Noise_level_indoor,
      Noise_level_outdoor,
      Remote_control_type,
      Warranty_period,
      Is_available,
      Is_new_arrival,
      Is_best_seller,
      Is_featured,
      Is_exclusive,
      Has_anti_bacterial_filter,
      Has_built_in_air_purifier,
      Has_dust_filter,
      Has_voice_control,
      Has_dehumidification,
      Has_eco_mode,
      Has_turbo_mode,
      Has_auto_cleaning,
      Has_sleep_mode,
      Is_wifi_enabled,
      Production_year,
      Frequency,
      Voltage,
      Wattage,
      Condenser_coil,
      Cooling_capacity,
      Refrigerant,
      Indoor_unit_weight,
      Dimensions_indoor_height,
      Dimensions_indoor_width,
      Dimensions_indoor_depth,
      Outdoor_unit_weight,
      Dimensions_outdoor_height,
      Dimensions_outdoor_width,
      Dimensions_outdoor_depth,
      Installation_type,
      Meta_tag_title,
      Meta_tag_keywords,
      Meta_tag_description,
    })
  }, [
    Quantity,
    Model_series,
    Model_number,
    Cooling_technology,
    Noise_level_indoor,
    Noise_level_outdoor,
    Remote_control_type,
    Warranty_period,
    Is_available,
    Is_new_arrival,
    Is_best_seller,
    Is_featured,
    Is_exclusive,
    Has_anti_bacterial_filter,
    Has_built_in_air_purifier,
    Has_dust_filter,
    Has_voice_control,
    Has_dehumidification,
    Has_eco_mode,
    Has_turbo_mode,
    Has_auto_cleaning,
    Has_sleep_mode,
    Is_wifi_enabled,
    Production_year,
    Frequency,
    Voltage,
    Wattage,
    Condenser_coil,
    Cooling_capacity,
    Refrigerant,
    Indoor_unit_weight,
    Dimensions_indoor_height,
    Dimensions_indoor_width,
    Dimensions_indoor_depth,
    Outdoor_unit_weight,
    Dimensions_outdoor_height,
    Dimensions_outdoor_width,
    Dimensions_outdoor_depth,
    Installation_type,
    Meta_tag_title,
    Meta_tag_keywords,
    Meta_tag_description
  ])

  useEffect(() => {
    if (quill) {
      quill.on('text-change', () => {
        setMetaDescription(quillRef.current.firstChild.innerHTML)
        formik.setFieldValue('Meta_tag_description', quillRef.current.firstChild.innerHTML)
      })
    }
  }, [quill])

  return (
    <div>
      <div className='card card-flush py-4 rounded-bottom-0'>
        <div className='card-header'>
          <div className='card-title'>
            <h2>Inventory</h2>
          </div>
        </div>
        <div className='card-body py-2'>
          <span className='has-float-label'>
            <input
              id='productQuantity'
              placeholder='Quantity'
              className='form-control bg-transparent shadow-none  customInput'
              type='number'
              name='Quantity'
              autoComplete='off'
              value={Quantity}
              onChange={(e) => handleInputChange(e, setQuantity)}
              onBlur={formik.handleBlur}
            />
            <label className='form-label fs-6 fw-bolder ' htmlFor='Quantity'>
              Quantity
            </label>
            {formik.touched.Quantity && formik.errors.Quantity && (
              <div className='fv-plugins-message-container'>
                <div className='fv-help-block'>{formik.errors.Quantity}</div>
              </div>
            )}
          </span>
          <br />
          <div>

      
          <span className='has-float-label'>
            <input
              id='modelName'
              placeholder='Model Series'
              className='form-control bg-transparent shadow-none  customInput '
              type='text'
              name='modelName'
              autoComplete='off'
              value={Model_series}
              onChange={(e) => { setModelName(e.target.value);
                           formik.setFieldValue('Model_series',e.target.value )   }}
              onBlur={formik.handleBlur}
            />
            <label className='form-label fs-6 fw-bolder text-dark ' htmlFor='modelName'>
              Model Series
            </label>
            {formik.touched.Model_series && formik.errors.Model_series  && (
              
              <div className='fv-plugins-message-container'>
                <div className='fv-help-block'>{formik.errors.Model_series}</div>
              </div>
            )}
          </span>
          </div>
          <br />
          <span className='has-float-label'>
            {/* <br /> */}
            <input
              id='modelNumber'
              placeholder='Model Number'
              className='form-control bg-transparent shadow-none  customInput'
              type='text'
              name='modelNumber'
              autoComplete='off'
              value={Model_number}
              onChange={(e) => { setModelNumber(e.target.value)
                formik.setFieldValue('Model_number',e.target.value ) 
              }}
              onBlur={formik.handleBlur}
            />
            <label className='form-label fs-6 fw-bolder text-dark' htmlFor='modelNumber'>
              Model Number
            </label>
            {formik.touched.Model_number && formik.errors.Model_number  && (
              
              <div className='fv-plugins-message-container'>
                <div className='fv-help-block'>{formik.errors.Model_number}</div>
              </div>
            )}
          </span>
        </div>
      </div>
      <div className='card card-flush py-4 rounded-top-0'>
        <div className='card-header'>
          <div className='card-title'>
            <h2>Features</h2>
          </div>
        </div>
        <div className='card-body py-2'>
          <div className='row'>
            <div className='col-lg-6 px-12'>
              <div className='form-check formCustomCheck mb-0 mt-0 ps-0 py-2'>
                <input
                  className='customCheckBox form-check-input'
                  type='checkbox'
                  value='Voice Control'
                  id='exampleCheck1'
                  onChange={(e) => handleCheckboxChange(e, setHasVoiceControl)}
                  checked={Has_voice_control}
                />
                <label className='text-black form-check-label ms-2' htmlFor='exampleCheck1'>
                  Voice Control
                </label>
              </div>

              <div className='form-check formCustomCheck mb-0 mt-0 ps-0 py-2'>
                <input
                  className='customCheckBox form-check-input'
                  type='checkbox'
                  value='Dehumidification'
                  id='exampleCheck4'
                  onChange={(e) => handleCheckboxChange(e, setHasDehumidification)}
                  checked={Has_dehumidification}
                />
                <label className='text-black form-check-label ms-2' htmlFor='exampleCheck4'>
                  Dehumidification
                </label>
              </div>

              <div className='form-check formCustomCheck mb-0 mt-0 ps-0 py-2'>
                <input
                  className='customCheckBox form-check-input'
                  type='checkbox'
                  value='Sleep Mode'
                  id='exampleCheck5'
                  onChange={(e) => handleCheckboxChange(e, setHasSleepMode)}
                  checked={Has_sleep_mode}
                />
                <label className='text-black form-check-label ms-2' htmlFor='exampleCheck5'>
                  Sleep Mode
                </label>
              </div>

              <div className='form-check formCustomCheck mb-0 mt-0 ps-0 py-2'>
                <input
                  className='customCheckBox form-check-input'
                  type='checkbox'
                  value='Eco Mode'
                  id='exampleCheck3'
                  onChange={(e) => handleCheckboxChange(e, setHasEcoMode)}
                  checked={Has_eco_mode}
                />
                <label className='text-black form-check-label ms-2' htmlFor='exampleCheck3'>
                  Eco Mode
                </label>
              </div>
            </div>
            <div className='col-lg-6 px-12'>
              <div className='form-check formCustomCheck mb-0 mt-0 ps-0 py-2'>
                <input
                  className='customCheckBox form-check-input'
                  type='checkbox'
                  value='Turbo Mode'
                  id='exampleCheck6'
                  onChange={(e) => handleCheckboxChange(e, setHasTurboMode)}
                  checked={Has_turbo_mode}
                />
                <label className='text-black form-check-label ms-2' htmlFor='exampleCheck6'>
                  Turbo Mode
                </label>
              </div>

              <div className='form-check formCustomCheck mb-0 mt-0 ps-0 py-2'>
                <input
                  className='customCheckBox form-check-input'
                  type='checkbox'
                  value='Auto Cleaning'
                  id='AutoCleaning'
                  onChange={(e) => handleCheckboxChange(e, setHasAutoCleaning)}
                  checked={Has_auto_cleaning}
                />
                <label className='text-black form-check-label ms-2' htmlFor='AutoCleaning'>
                  Auto Cleaning
                </label>
              </div>

              <div className='form-check formCustomCheck mb-0 mt-0 ps-0 py-2'>
                <input
                  className='customCheckBox form-check-input'
                  type='checkbox'
                  value='WiFi Enable'
                  id='WiFiEnable'
                  onChange={(e) => handleCheckboxChange(e, setIsWiFiEnabled)}
                  checked={Is_wifi_enabled}
                />
                <label className='text-black form-check-label ms-2' htmlFor='WiFiEnable'>
                  WiFi Enable
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='card card-flush py-4 rounded-top-0'>
        <div className='card-header'>
          <div className='card-title'>
            <h2>Built-In Purification</h2>
          </div>
        </div>
        <div className='card-body py-2'>
          <div className='container'>
            <div className='row px-8'>
              <div className=''>
                <div className='form-check formCustomCheck mb-0 mt-0 ps-0 py-2'>
                  <input
                    className='customCheckBox form-check-input'
                    type='checkbox'
                    value='Built in Air Purification'
                    id='airPurification'
                    onChange={(e) => handleCheckboxChange(e, setHasBuiltInAirPurification)}
                    checked={Has_built_in_air_purifier}
                  />
                  <label className='text-black form-check-label ms-2' htmlFor='airPurification'>
                    Built-in Air Purification
                  </label>
                </div>
              </div>
              <div className=''>
                <div className='form-check formCustomCheck mb-0 mt-0 ps-0 py-2'>
                  <input
                    className='customCheckBox form-check-input'
                    type='checkbox'
                    value='Anti Bacterial'
                    id='antiBacterial'
                    onChange={(e) => handleCheckboxChange(e, setHasAntiBacterialFilter)}
                    checked={Has_anti_bacterial_filter}
                  />
                  <label className='text-black form-check-label ms-2' htmlFor='antiBacterial'>
                    Anti Bacterial
                  </label>
                </div>
              </div>
              <div className=''>
                <div className='form-check formCustomCheck mb-0 mt-0 ps-0 py-2'>
                  <input
                    className='customCheckBox form-check-input'
                    type='checkbox'
                    value='Dust Filter'
                    id='dustFilter'
                    onChange={(e) => handleCheckboxChange(e, setHasDustFilter)}
                    checked={Has_dust_filter}
                  />
                  <label className='text-black form-check-label ms-2' htmlFor='dustFilter'>
                    Dust Filter
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='card card-flush py-4 rounded-top-0'>
        <div className='card-header'>
          <div className='card-title'>
            <h2>Details</h2>
          </div>
        </div>
        <div className='card-body py-2'>
          <div className='row mobileFlexColumn'>
            <div className='col-6 mobileWFull'>
              <CustomDropdown
                options={coolingTechnology}
                label='Select Technology'
                selectedOption={Cooling_technology}
                onChange={(e) => handleInputDropDownChange(e, setCoolingTech)}
              />

              <br />
              <br />
              <CustomDropdown
                options={remoteControlType}
                label='Select Remote Control'
                selectedOption={Remote_control_type}
                onChange={(e) => handleInputDropDownChange(e, setRemoteControl)}
              />
              <br />
              <br />
            </div>
            <div className='col-6 mobileWFull'>
              <CustomDropdown
                options={mountType}
                label='Select Mount Type'
                selectedOption={Installation_type}
                onChange={(e) => handleInputDropDownChange(e, setInstallation_type)}
              />

              <br />
              <br />

              <CustomDropdown
                options={warranty}
                label='Select Warranty'
                disabled={false} //disabled for time being
                selectedOption={Warranty_period}
                onChange={(e) => handleWarrantyChange(e, set_Warranty_Period)}
              />
              <br />
              <br />
            </div>
          </div>
          <div className='row mobileFlexColumn'>
            <div className='col-6 mobileWFull'>
              <div>
              <span className='has-float-label'>
                <input
                  id='productionYear'
                  placeholder='Production Year'
                  className='form-control bg-transparent shadow-none  customInput'
                  type='number'
                  name='Production_year'
                  autoComplete='off'
                  // value={formik.values.Production_year}
                  // onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={Production_year}
                  onChange={(e) => handleInputChange(e, setProductionYear)}
                  // onBlur={formik.handleBlur}
                />
                <label className='form-label fs-6 fw-bolder text-dark' htmlFor='Production_year'>
                  Production Year
                </label>
                {formik.touched.Production_year && formik.errors.Production_year && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.Production_year}</div>
                  </div>
                )}
              </span>
              </div>
              <br />
              <span className='has-float-label'>
                <input
                  id='voltage'
                  placeholder='Voltage'
                  className='form-control bg-transparent shadow-none  customInput'
                  type='number'
                  name='Voltage'
                  autoComplete='off'
                  value={Voltage}
                  onChange={(e) => handleInputChange(e, setVoltage)}
                  onBlur={formik.handleBlur}
                />
                <label className='form-label fs-6 fw-bolder text-dark' htmlFor='Voltage'>
                  Voltage
                </label>
                {formik.touched.Voltage && formik.errors.Voltage && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.Voltage}</div>
                  </div>
                )}
              </span>
              <br />
              <span className='has-float-label'>
                <input
                  id='wattage'
                  placeholder='Wattage'
                  className='form-control bg-transparent shadow-none  customInput'
                  type='number'
                  name='Wattage'
                  autoComplete='off'
                  value={Wattage}
                  onChange={(e) => handleInputChange(e, setWattage)}
                  onBlur={formik.handleBlur}
                />
                <label className='form-label fs-6 fw-bolder text-dark' htmlFor='Wattage'>
                  Wattage
                </label>
                {formik.touched.Wattage && formik.errors.Wattage && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.Wattage}</div>
                  </div>
                )}
              </span>
              <br />
              <div>
             
              <span className='has-float-label'>
                <input
                  id='coolingCapacity'
                  placeholder='Cooling Capacity'
                  className='form-control bg-transparent shadow-none  customInput'
                  type='number'
                  name='Cooling_capacity'
                  autoComplete='off'
                  value={Cooling_capacity}
                  onChange={(e) => handleInputChange(e, setCoolingCapacity)}
                  onBlur={formik.handleBlur}
                />
                <label className='form-label fs-6 fw-bolder text-dark' htmlFor='Cooling_capacity'>
                  Cooling Capacity
                </label>
                {formik.touched.Cooling_capacity && formik.errors.Cooling_capacity && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.Cooling_capacity}</div>
                  </div>
                )}
              </span>
                 
              </div>
              <br />
              <span className='has-float-label'>
                <input
                  id='noiseLevelOutdoor'
                  placeholder='Noise Level Outdoor'
                  className='form-control bg-transparent shadow-none  customInput'
                  type='number'
                  name='Noise_level_outdoor'
                  autoComplete='off'
                  value={Noise_level_outdoor}
                  onBlur={formik.handleBlur}
                  onChange={(e) => handleInputChange(e, setNoiseOutdoor)}
                />
                <label
                  className='form-label fs-6 fw-bolder text-dark'
                  htmlFor='Noise_level_outdoor'
                >
                  Noise Level Outdoor
                </label>
                {formik.touched.Noise_level_outdoor && formik.errors.Noise_level_outdoor && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.Noise_level_outdoor}</div>
                  </div>
                )}
              </span>
            </div>
            <div className='col-6 mobileWFull marginPageMYMobile'>
              <span className='has-float-label'>
                <input
                  id='frequency'
                  placeholder='Frequency'
                  className='form-control bg-transparent shadow-none  customInput'
                  type='number'
                  name='Frequency'
                  autoComplete='off'
                  value={Frequency}
                  onChange={(e) => handleInputChange(e, setFrequency)}
                  onBlur={formik.handleBlur}
                />
                <label className='form-label fs-6 fw-bolder text-dark' htmlFor='Frequency'>
                  Frequency
                </label>
                {formik.touched.Frequency && formik.errors.Frequency && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.Frequency}</div>
                  </div>
                )}
              </span>
              <br />
              <span className='has-float-label'>
                <input
                  id='refrigerant'
                  placeholder='Refrigerant'
                  className='form-control bg-transparent shadow-none  customInput'
                  type='text'
                  name='Refrigerant'
                  autoComplete='off'
                  value={Refrigerant}
                  onChange={(e) => handleInputChange(e, setRefrigerant)}
                />
                <label className='form-label fs-6 fw-bolder text-dark' htmlFor='refrigerant'>
                  Refrigerant
                </label>
              </span>
              <br />
              <div>

              <span className='has-float-label'>
                <input
                  id='condenserCoil'
                  placeholder='Condenser Coil'
                  className='form-control bg-transparent shadow-none  customInput'
                  type='text'
                  name='Condenser_coil'
                  autoComplete='off'
                  value={Condenser_coil}
                  onChange={(e) => handleInputChange(e, setCondenserCoil)}
                />
                <label className='form-label fs-6 fw-bolder text-dark' htmlFor='condenserCoil'>
                  Condenser Coil
                </label>
              </span>
              </div>
              <br />
              <span className='has-float-label'>
                <input
                  id='noiseLevelIndoor'
                  className='form-control bg-transparent shadow-none  customInput'
                  type='number'
                  name='Noise_level_indoor'
                  autoComplete='off'
                  value={Noise_level_indoor}
                  onChange={(e) => handleInputChange(e, setNoise)}
                  onBlur={formik.handleBlur}
                />
                <label className='form-label fs-6 fw-bolder text-dark' htmlFor='Noise_level_indoor'>
                  Noise Level Indoor
                </label>
                {formik.touched.Noise_level_indoor && formik.errors.Noise_level_indoor && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.Noise_level_indoor}</div>
                  </div>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='card card-flush py-4 rounded-top-0'>
        <div className='card-header'>
          <div className='card-title'>
            <h2>Sale Features</h2>
          </div>
        </div>
        <div className='card-body py-2'>
          <div className='row px-10'>
            <div className=''>
              <div className='form-check formCustomCheck mb-0 mt-0 ps-0 py-2'>
                <input
                  className='customCheckBox form-check-input'
                  type='checkbox'
                  value='Available'
                  id='isAvailable'
                  onChange={(e) => handleCheckboxChange(e, setIsAvailable)}
                  checked={Is_available}
                />
                <label className='text-black form-check-label ms-2' htmlFor='isAvailable'>
                  Available
                </label>
              </div>

              <div className='form-check formCustomCheck mb-0 mt-0 ps-0 py-2'>
                <input
                  className='customCheckBox form-check-input'
                  type='checkbox'
                  value='Featured'
                  id='isFeatured'
                  onChange={(e) => handleCheckboxChange(e, setIsFeatured)}
                  checked={Is_featured}
                />
                <label className='text-black form-check-label ms-2' htmlFor='isFeatured'>
                  Featured
                </label>
              </div>
            </div>
            <div className=''>
              <div className='form-check formCustomCheck mb-0 mt-0 ps-0 py-2'>
                <input
                  className='customCheckBox form-check-input'
                  type='checkbox'
                  value='New Arrival'
                  id='isNewArrival'
                  onChange={(e) => handleCheckboxChange(e, setIsNewArrival)}
                  checked={Is_new_arrival}
                />
                <label className='text-black form-check-label ms-2' htmlFor='isNewArrival'>
                  New Arrival
                </label>{' '}
              </div>

              <div className='form-check formCustomCheck mb-0 mt-0 ps-0 py-2'>
                <input
                  className='customCheckBox form-check-input'
                  type='checkbox'
                  value='Exclusive'
                  id='isExclusive'
                  onChange={(e) => handleCheckboxChange(e, setIsExclusive)}
                  checked={Is_exclusive}
                />
                <label className='text-black form-check-label ms-2' htmlFor='isExclusive'>
                  Exclusive
                </label>
              </div>
            </div>
            <div className=''>
              <div className='form-check formCustomCheck mb-0 mt-0 ps-0 py-2'>
                <input
                  className='customCheckBox form-check-input'
                  type='checkbox'
                  value='Best Seller'
                  id='bestSeller'
                  onChange={(e) => handleCheckboxChange(e, setIsBestSeller)}
                  checked={Is_best_seller}
                />
                <label className='text-black form-check-label ms-2' htmlFor='bestSeller'>
                  Best Seller
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='card card-flush py-4 rounded-top-0'>
        <div className='card-header'>
          <div className='card-title'>
            <h2>Weight & Dimensions</h2>
          </div>
        </div>
        <div className='card-body py-2'>
          <div className='row mobileFlexColumn'>
            <div className='col-6 mobileWFull'>
              <h4>Indoor</h4>
              <br />
              <div>
             
              <span className='has-float-label'>
                <input
                  id='indoorUnitWeight'
                  placeholder='Indoor Unit Weight'
                  className='form-control bg-transparent shadow-none  customInput'
                  type='number'
                  name='indoorUnitWeight'
                  autoComplete='off'
                  value={Indoor_unit_weight}
                  onChange={(e) => handleInputChange(e, setIndoorUnitWeight)}
                  onBlur={formik.handleBlur}
                />
                <label className='form-label fs-6 fw-bolder text-dark' htmlFor='indoorUnitWeight'>
                  Indoor Unit Weight
                </label>
              </span>
                 
              </div>
              <br />
              <div>
              
              <span className='has-float-label'>
                <input
                  id='indoorHeight'
                  placeholder='Indoor Height'
                  className='form-control bg-transparent shadow-none  customInput'
                  type='number'
                  name='indoorHeight'
                  autoComplete='off'
                  value={Dimensions_indoor_height}
                  onChange={(e) => handleInputChange(e, setIndoorHeight)}
                  onBlur={formik.handleBlur}
                />
                <label className='form-label fs-6 fw-bolder text-dark' htmlFor='indoorHeight'>
                  Indoor Height
                </label>
              </span>
                
              </div>
              <br />
              <div>
            
              <span className='has-float-label'>
                <input
                  id='indoorWidth'
                  placeholder='Indoor Width'
                  className='form-control bg-transparent shadow-none  customInput'
                  type='number'
                  name='indoorWidth'
                  autoComplete='off'
                  value={Dimensions_indoor_width}
                  onChange={(e) => handleInputChange(e, setIndoorWidth)}
                  onBlur={formik.handleBlur}
                />
                <label className='form-label fs-6 fw-bolder text-dark' htmlFor='indoorWidth'>
                  Indoor Width
                </label>
              </span>
              </div>
              <br />
              <div>
              <span className='has-float-label'>
                <input
                  id='indoorDepth'
                  placeholder='Indoor Depth'
                  className='form-control bg-transparent shadow-none  customInput'
                  type='number'
                  name='indoorDepth'
                  autoComplete='off'
                  value={Dimensions_indoor_depth}
                  onChange={(e) => handleInputChange(e, setIndoorDepth)}
                  onBlur={formik.handleBlur}
                />
                <label className='form-label fs-6 fw-bolder text-dark' htmlFor='indoorDepth'>
                  Indoor Depth
                </label>
              </span>
              </div>
              <br />
            </div>
            <div className='col-6 mobileWFull'>
              <h4>Outdoor</h4>
              <br />
              <div>
              <span className='has-float-label'>
                <input
                  id='outdoorUnitWeight'
                  placeholder='Outdoor Unit Weight'
                  className='form-control bg-transparent shadow-none  customInput'
                  type='number'
                  name='outdoorUnitWeight'
                  autoComplete='off'
                  value={Outdoor_unit_weight}
                  onChange={(e) => handleInputChange(e, setOutdoorUnitWeight)}
                  onBlur={formik.handleBlur}
                />
                <label className='form-label fs-6 fw-bolder text-dark' htmlFor='outdoorUnitWeight'>
                  Outdoor Unit Weight
                </label>
              </span>
              </div>
              <br />
              <div>
          
              <span className='has-float-label'>
                <input
                  id='outdoorHeight'
                  placeholder='Outdoor Height'
                  className='form-control bg-transparent shadow-none  customInput'
                  type='number'
                  name='outdoorHeight'
                  autoComplete='off'
                  value={Dimensions_outdoor_height}
                  onChange={(e) => handleInputChange(e, setOutdoorHeight)}
                  onBlur={formik.handleBlur}
                />
                <label className='form-label fs-6 fw-bolder text-dark' htmlFor='outdoorHeight'>
                  Outdoor Height
                </label>
              </span>
                    
              </div>
              <br />
              <div>
              <span className='has-float-label'>
                <input
                  id='outdoorWidth'
                  placeholder='Outdoor Width'
                  className='form-control bg-transparent shadow-none  customInput'
                  type='number'
                  name='outdoorWidth'
                  autoComplete='off'
                  value={Dimensions_outdoor_width}
                  onChange={(e) => handleInputChange(e, setOutdoorWidth)}
                  onBlur={formik.handleBlur}
                />
                <label className='form-label fs-6 fw-bolder text-dark' htmlFor='outdoorWidth'>
                  Outdoor Width
                </label>
              </span>
              </div>
              <br />
              <div>
             
              <span className='has-float-label'>
                <input
                  id='outdoorDepth'
                  placeholder='Outdoor Depth'
                  className='form-control bg-transparent shadow-none  customInput'
                  type='number'
                  name='outdoorDepth'
                  autoComplete='off'
                  value={Dimensions_outdoor_depth}
                  onChange={(e) => handleInputChange(e, setOutdoorDepth)}
                  onBlur={formik.handleBlur}
                />
                <label className='form-label fs-6 fw-bolder text-dark' htmlFor='outdoorDepth'>
                  Outdoor Depth
                </label>
              </span>
                 
              </div>
              <br />
            </div>
          </div>
        </div>
      </div>

      <div className='card card-flush py-4 rounded-top-0'>
        <div className='card-header'>
          <div className='card-title'>
            <h2>Meta Options</h2>
          </div>
        </div>

        <div className='card-body py-2'>
          <div>
            <label className='form-label fs-5 fw-bold pb-2  '>Meta Tag Title</label>
            <span className=''>
              <input
                id='productMetaTag'
                placeholder='Meta Tag Name'
                className='form-control bg-transparent shadow-none  customInput mb-2'
                type='text'
                name='Meta_tag_title'
                autoComplete='off'
                value={Meta_tag_title}
                onChange={(e) => handleInputChange(e, setMeta_tag_title )}
                onBlur={formik.handleBlur}
              />
              <span className='form-group-label form-check-label'>
                Set a meta tag title. Recommended to be simple and precise keywords.
              </span>
           
            </span>
          </div>
        </div>
   
        <div className='card-body pb-2'>
          <label className='form-label fs-5 fw-bold pb-2 pt-2'>Meta Tag Description</label>
          <div className='form-group mt-1'>
            <div className='row mt-2'>
              <div>
                <div className='' ref={quillRef}></div>
              </div>
            </div>
            <br></br>
          </div>
        </div>
        <br></br>
        <div className='card-body pb-2'>
          <label className='form-group-label form-check-label' htmlFor='descTextArea'>
            Set a meta tag description to the product for increased SEO ranking.
          </label>
        </div>

       <br></br>
        <div className='card-body py-2'>
          <div>
            <label className='form-label fs-5 fw-bold pb-2  '>Meta Tag Keywords</label>
            <span className=''>
              <input
                id='productMetaKeywords'
                // placeholder='Meta Tag Keywords'
                className='form-control bg-transparent shadow-none  customInput mb-2'
                type='text'
                name='Meta_tag_keywords'
                autoComplete='off'
                value={Meta_tag_keywords}
                onChange={(e) => handleInputChange(e, setMeta_tag_keywords)}
                onBlur={formik.handleBlur}
              />
              <span className='form-group-label form-check-label'>
                Set a list of Keywords that the product is related to. Seperate the keywords by ading comma <span>,</span> between each keyword.
              </span>

            </span>
          </div>
        </div>
     


      </div>
    </div>
  )
}

export default AdvancedPanel
