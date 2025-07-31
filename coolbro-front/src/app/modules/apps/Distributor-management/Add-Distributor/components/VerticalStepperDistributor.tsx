import {useEffect, useRef, useState} from 'react'
import {KTIcon} from '../../../../../../_metronic/helpers'
import {Step1} from './DistributorSteps/Step1'
import {Step2} from './DistributorSteps/Step2'
import {Step3} from './DistributorSteps/Step3'
import {Step4} from './DistributorSteps/Step4'
// import {Step5} from './steps/Step5'
import {StepperComponent} from '../../../../../../_metronic/assets/ts/components'
import {Form, Formik, FormikValues, useFormikContext} from 'formik'
import {createAccountSchemas, ICreateAccount, inits} from './CreateAccountWizardHelper'
import { Step5 } from './DistributorSteps/Step5'
import { defaultDistributorUpdateSuccessful, defaultDistributorAddSuccessful } from '../../../../../config/sweetAlertConfig'
import Swal from 'sweetalert2'
import axios from 'axios'
import {useNavigate, useParams} from 'react-router-dom'
import * as authHelper from '../../../../auth/core/AuthHelpers'

const Vertical = () => {
  const stepperRef = useRef<HTMLDivElement | null>(null)
  const stepper = useRef<StepperComponent | null>(null)
  const {distributorId} = useParams();
  const TOKEN = authHelper.getAuth()
  let [loading, setLoading] = useState(false)
  const [currentSchema, setCurrentSchema] = useState(createAccountSchemas[0])
  const [initValues] = useState<ICreateAccount>(inits)
  const formik = useFormikContext<ICreateAccount>() // Specify the form values type
  // Specify the form values type
  const [editFlag,setEditFlag]=useState<boolean>(false);
  const [editDistributor, setEditDistributor] = useState<any>()

  const navigate = useNavigate()
  console.log("ISDFDS",distributorId );


  useEffect(()=>{
    if(distributorId)
    {
      console.log("Dealer id exist", distributorId);
      axios
      .get(`${process.env.REACT_APP_SERVER_URL}/distributor/${distributorId}`, {
        headers: {Authorization: 'Bearer ' + TOKEN?.AccessToken},
      })
      .then((res) => {
        if (res.data) {
          let distributorData = res.data.data
          console.log('FROMAPI:', distributorData)
          setEditDistributor(distributorData)
          setEditFlag(true);
        }
      })
      .catch((err) => console.log(err))
      
    }
  }, [distributorId])
  



  const loadStepper = () => {
    stepper.current = StepperComponent.createInsance(stepperRef.current as HTMLDivElement)
  }

  const prevStep = () => {
    if (!stepper.current) {
      return
    }

    stepper.current.goPrev()
    console.log("SCH", createAccountSchemas[stepper.current.currentStepIndex - 1]);
    
    setCurrentSchema(createAccountSchemas[stepper.current.currentStepIndex - 1])
  }

  const submitStep = (values: ICreateAccount, actions: FormikValues) => {
    if (!stepper.current) {
      return
    }

    if (stepper.current.currentStepIndex !== stepper.current.totalStepsNumber) {
      stepper.current.goNext()
    } else {

      try {
        setLoading(true)
        let formData = new FormData()
        // key - value pairs
        Object.keys(values).forEach((key) => {
          const value = values[key as keyof ICreateAccount]

          if (value !== null && typeof value !== 'undefined' && value !== '') {
            if (typeof value === 'object') {
              // formData.append(key, value)
              if (value instanceof File) {
                formData.append(key, value)
              }
              else{
                if(key!=="UserMedia"){
                  formData.append(key, JSON.stringify(value));
                }
              }
            } else {
              if(key!=="UserMainImage"){
              formData.append(key, String(value))
              }
            }
          }
        })

        values?.Company_images?.forEach((image: any, imageIndex: any) => {
          // console.log("APPENDED WITH ", `ProductMedia[${index}][color]` , "&", key.optionValue, key.images);
          if(image instanceof File)
          {
            formData.append(`UserMedia`, image)
          }
          
        })




        formData.set("Contact_name", `${values.First_name} ${values.Last_name}`);
    if(editFlag)
    {
       formData.set('id', editDistributor?.UserDetails?.ID);
       formData.delete('Company_images')
       
    }
    else{
      formData.delete('id');
      formData.delete('Company_images')
      formData.delete('MediaIDsToRemove')
    }
        const formDataArray = Array.from(formData.entries())
        for (const pair of formDataArray) {
          console.log(pair[0] + ' - ' + pair[1])
        }

        try {
          axios
            .post(
              `${process.env.REACT_APP_SERVER_URL}/distributor/add_update_distributordetail`,
              formData,
              {
                headers: {Authorization: 'Bearer ' + TOKEN?.AccessToken},
              }
            )
            .then(async (res) => {
              // console.log("GOT RES::", res)
              
              setLoading(false)
              if (res.status === 200 && res.data.message) {
                console.log('Great', res)
                const confirmAdd = await Swal.fire(defaultDistributorAddSuccessful)
                if (confirmAdd.isConfirmed) {
                  // formik.resetForm()
                  actions.resetForm()
                  actions.resetForm()
                  navigate('..')
                }
                navigate('..')
                actions.resetForm()
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
          console.log("ERROUT:",err)
        }
      
    
    } catch (err) {
      console.log(err)
    }
      // stepper.current.goto(1)
      // actions.resetForm()
    }
    setCurrentSchema(createAccountSchemas[stepper.current.currentStepIndex - 1])

  }

  useEffect(() => {
    if (!stepperRef.current) {
      return
    }

    loadStepper()
  }, [stepperRef])

  return (
    <div
      ref={stepperRef}
      className='stepper stepper-pills stepper-column d-flex flex-column flex-xl-row flex-row-fluid'
      id='kt_create_account_stepper'
    >
      {/* begin::Aside*/}
      <div className='card d-flex justify-content-center justify-content-xl-start flex-row-auto w-100 w-xl-300px w-xxl-400px me-9'>
        {/* begin::Wrapper*/}
        <div className='card-body px-6 px-lg-10 px-xxl-15 py-20'>
          {/* begin::Nav*/}
          <div className='stepper-nav'>
            {/* begin::Step 1*/}
            <div className='stepper-item current' data-kt-stepper-element='nav'>
              {/* begin::Wrapper*/}
              <div className='stepper-wrapper'>
                {/* begin::Icon*/}
                <div className='stepper-icon w-40px h-40px'>
                  <i className='stepper-check fas fa-check'></i>
                  <span className='stepper-number'>1</span>
                </div>
                {/* end::Icon*/}

                {/* begin::Label*/}
                <div className='stepper-label'>
                  <h3 className='stepper-title'>Company Details</h3>

                  <div className='stepper-desc fw-semibold'>Setup Your Company Details</div>
                </div>
                {/* end::Label*/}
              </div>
              {/* end::Wrapper*/}

              {/* begin::Line*/}
              <div className='stepper-line h-40px'></div>
              {/* end::Line*/}
            </div>
            {/* end::Step 1*/}

            {/* begin::Step 2*/}
            <div className='stepper-item' data-kt-stepper-element='nav'>
              {/* begin::Wrapper*/}
              <div className='stepper-wrapper'>
                {/* begin::Icon*/}
                <div className='stepper-icon w-40px h-40px'>
                  <i className='stepper-check fas fa-check'></i>
                  <span className='stepper-number'>2</span>
                </div>
                {/* end::Icon*/}

                {/* begin::Label*/}
                <div className='stepper-label'>
                  <h3 className='stepper-title'>General</h3>
                  <div className='stepper-desc fw-semibold'>Setup Your General</div>
                </div>
                {/* end::Label*/}
              </div>
              {/* end::Wrapper*/}

              {/* begin::Line*/}
              <div className='stepper-line h-40px'></div>
              {/* end::Line*/}
            </div>
            {/* end::Step 2*/}

            {/* begin::Step 3*/}
            <div className='stepper-item' data-kt-stepper-element='nav'>
              {/* begin::Wrapper*/}
              <div className='stepper-wrapper'>
                {/* begin::Icon*/}
                <div className='stepper-icon w-40px h-40px'>
                  <i className='stepper-check fas fa-check'></i>
                  <span className='stepper-number'>3</span>
                </div>
                {/* end::Icon*/}

                {/* begin::Label*/}
                <div className='stepper-label'>
                  <h3 className='stepper-title'>Address</h3>
                  <div className='stepper-desc fw-semibold'>Setup Your Address</div>
                </div>
                {/* end::Label*/}
              </div>
              {/* end::Wrapper*/}

              {/* begin::Line*/}
              <div className='stepper-line h-40px'></div>
              {/* end::Line*/}
            </div>
            {/* end::Step 3*/}

            {/* begin::Step 4*/}
            <div className='stepper-item' data-kt-stepper-element='nav'>
              {/* begin::Wrapper*/}
              <div className='stepper-wrapper'>
                {/* begin::Icon*/}
                <div className='stepper-icon w-40px h-40px'>
                  <i className='stepper-check fas fa-check'></i>
                  <span className='stepper-number'>4</span>
                </div>
                {/* end::Icon*/}

                {/* begin::Label*/}
                <div className='stepper-label'>
                  <h3 className='stepper-title'>Account Details</h3>
                  <div className='stepper-desc fw-semibold'>Set Your Account Details</div>
                </div>
                {/* end::Label*/}
              </div>
              {/* end::Wrapper*/}

              {/* begin::Line*/}
              <div className='stepper-line h-40px'></div>
              {/* end::Line*/}
            </div>
            {/* end::Step 4*/}

            {/* begin::Step 5*/}
            <div className='stepper-item' data-kt-stepper-element='nav'>
   
              <div className='stepper-wrapper'>
     
                <div className='stepper-icon w-40px h-40px'>
                  <i className='stepper-check fas fa-check'></i>
                  <span className='stepper-number'>5</span>
                </div>
               
                <div className='stepper-label'>
                  <h3 className='stepper-title'>Media</h3>
                  <div className='stepper-desc fw-semibold'>Set Your Company Media Details</div>
                </div>

              </div>
              
            </div>
            {/* end::Step 5*/}
          </div>
          {/* end::Nav*/}
        </div>
        {/* end::Wrapper*/}
      </div>
      {/* begin::Aside*/}

      <div className='d-flex flex-row-fluid flex-center bg-body rounded'>
        <Formik 
        validationSchema={currentSchema}
        initialValues={initValues}
        onSubmit={submitStep}>
          {() => (
            <Form className='py-10 w-100  px-9' noValidate id='kt_create_account_form'>
              <div className='current' data-kt-stepper-element='content'>
                <Step1 editDistributor={editDistributor} editFlag={editFlag}   />
              </div>

              <div data-kt-stepper-element='content'>
                <Step2 editDistributor={editDistributor} editFlag={editFlag}  />
              </div>

              <div data-kt-stepper-element='content'>
                <Step3 editDistributor={editDistributor} editFlag={editFlag}  />
              </div>

              <div data-kt-stepper-element='content'>
                <Step4 editDistributor={editDistributor} editFlag={editFlag}   />
              </div>

              <div data-kt-stepper-element='content'>
                <Step5 editDistributor={editDistributor} editFlag={editFlag}    />
              </div>

              {/* <div data-kt-stepper-element='content'>
                <Step5 />
              </div> */}

              <div className='d-flex flex-stack pt-10'>
                <div className='mr-2'>
                  <button
                   
                    onClick={prevStep}
                    type='button'
                    className='primaryOutlineBtn primaryTextMedium btn btn-sm  me-3'
                    data-kt-stepper-action='previous'
                  >
                    <KTIcon iconName='arrow-left' className='primaryTextMedium fs-4 me-1' />
                    Previous
                  </button>
                </div>

                <div>
                  <button type='submit' className='primaryBtn btn btn-sm me-3'>
                    <span className='indicator-label d-flex align-items-center'>
                      {stepper.current?.currentStepIndex !==
                        stepper.current?.totalStepsNumber! - 0 && 'Next'}
                      {stepper.current?.currentStepIndex ===
                        stepper.current?.totalStepsNumber! - 0 && 'Submit'}
                      <KTIcon iconName='arrow-right' className='fs-3 ms-2 me-0 ' />
                    </span>
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export {Vertical}
