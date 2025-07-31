import * as Yup from 'yup'

export interface ICreateAccount {
  // UserID: number,
  id: number,
  Company_name : string
  BusinessType : string
  NumberOfEmployees: number
  LegalStatus : string
  Description  : string
  Contact_name : string
  Contact_email : string
  Contact_phone : string
  Year_of_establishment : string
  Gender : string
  Date_of_birth : string
  Address : string
  City : string
  State: string
  PostalCode : string
  Country : string
  GST_number : string
  PAN_number : string
  Account_holder_name : string
  Account_number : string
  Bank_name : string
  Branch: string
  IFSC_code : string
  Latitude : string
  Longitude : string
  UserMedia : [],
  UserMainImage : string
  First_name : string
  Last_name : string
  Phone_number : string
  Phone_number_2 : string
  UPI_id : string,
  Email: string,
  Company_images: [],
  MediaIDsToRemove: []

}

// export interface IEditAccount {
//   // UserID: number,
//   ID: number,
//   Company_name : string
//   BusinessType : string
//   NumberOfEmployees: number
//   LegalStatus : string
//   Description  : string
//   Contact_name : string
//   Contact_email : string
//   Contact_phone : string
//   Year_of_establishment : string
//   Gender : string
//   Date_of_birth : string
//   Address : string
//   City : string
//   State: string
//   PostalCode : string
//   Country : string
//   GST_number : string
//   PAN_number : string
//   Account_holder_name : string
//   Account_number : string
//   Bank_name : string
//   Branch: string
//   IFSC_code : string
//   Latitude : string
//   Longitude : string
//   UserMedia : string
//   UserMainImage : string
//   First_name : string
//   Last_name : string
//   Phone_number : string
//   Phone_number_2 : string
//   UPI_id : string,
//   Email: string
// }
const isIndianGSTValid = (gstNumber:string) => {
  if (gstNumber.length !== 15) {
    return false;
  }
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return regex.test(gstNumber);
};

const isIndianPANValid = (panNo:string) => {
  if (panNo.length !== 10) {
    return false;
  }
  const regex = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
  return regex.test(panNo);
};

const isYearValid = (year: string) => {
  const yearValue = parseInt(year, 10);

  // Check if the year is between 1800 and the current year
  return !isNaN(yearValue) && yearValue >= 1800 && yearValue <= new Date().getFullYear();
};

const isEmailValid = (email: string) => {
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
};
const isPinCodeValid = (pinCode: string) => {
  const pinCodeRegex = /^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/;
  return pinCodeRegex.test(pinCode);
};

const isIFSCCodeValid = (ifscCode: string) => {
  const ifscCodeRegex = /^[a-zA-Z]{4}0[A-Z0-9]{6}$/;
  return ifscCodeRegex.test(ifscCode);
};

const isValidUPI =(upiId: string) =>{
  const upiRegex = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/;
    return upiRegex.test(upiId);
}

const isPhoneNumberValid = (phoneNumber: string) => {
 
  const phoneNumberRegex =  /^(?:(?:\+|0{0,2})91(\s*[\ -]\s*)?|[0]?)?[789]\d{9}|(\d[ -]?){10}\d$/;
  return phoneNumberRegex.test(phoneNumber);
};



const createAccountSchemas = [
  Yup.object({
    Company_name: Yup.string().trim().required().label('Company Name'),
    // Description: Yup.string().required().label('Description is required'),
    BusinessType: Yup.string().required().label('Business Type'),
    // businessEmail: Yup.string().required().label('Contact Email'),
    GST_number: Yup.string()
    .required("GST number is required")
    .test('is-indian-gst-valid', 'Invalid GST number', isIndianGSTValid),
    PAN_number: Yup.string()
    .required("pan number is required")
    .test('is-indian-pan-valid', 'Invalid PAN number', isIndianPANValid),
    LegalStatus: Yup.string().required("Legal Status is required"),
    NumberOfEmployees: Yup.string().required("This field is required"),
    UserMainImage: Yup.string().required("This field is required"),
    // Year_of_establishment: Yup.string().required("Year Of establishment is required."),
    Year_of_establishment: Yup.string().trim()
    .required("Year Of establishment is required.")
    .test('is-valid-year', `Enter year between 1800-${new Date().getFullYear()}`, isYearValid),

  }),
  Yup.object({
    First_name: Yup.string().trim().required().label('First Name is required.'),
    Last_name: Yup.string().trim().required().label('Last Name is required.'),
    
       Contact_phone: Yup.string().trim()
    .required('This field is required')
    .test('is-valid-phone-number', 'Invalid phone number format', isPhoneNumberValid),
  
    Contact_email: Yup.string().trim().required("email is required")
    .test('is-valid-email', 'Invalid email', isEmailValid),
    Date_of_birth: Yup.string().required("Date of Birth is required"),
    Gender: Yup.string().required("Gender is required"),
  }),
  Yup.object({
    Address: Yup.string().trim().required().label('Address is Required'),
    City: Yup.string().trim().required().label('City is required'),
    State: Yup.string().trim().required().label('State is required'),
    // PostalCode: Yup.string().required().label('This Field is required'),
    PostalCode: Yup.string().trim()
    .required("postal code is required")
    .test('is-indian-postal-valid', 'Invalid Code', isPinCodeValid),
    Country: Yup.string().required().label('This Field is required'),
    Phone_number: Yup.string()
    .required('This field is required')
    .test('is-valid-phone-number', 'Invalid phone number format', isPhoneNumberValid),
    Phone_number_2: Yup.string()
    .required('This field is required')
    .test('is-valid-phone-number', 'Invalid phone number format', isPhoneNumberValid),
  }),
  Yup.object({
    Account_number: Yup.string().trim().required().label('This field is required'),
    Account_holder_name: Yup.string().trim().required().label('This field is required'),
    Bank_name: Yup.string().trim().required().label('This field is required'),
    Branch: Yup.string().required().label('This field is required'),
    // IFSC_code: Yup.string().required().label('This field is required'),
    IFSC_code: Yup.string()
    .required('IFSC code is required')
    .test('is-valid-ifsc-code', 'Invalid IFSC code format', isIFSCCodeValid),
    UPI_id: Yup.string()
    .required('UPI ID is required')
    .test('is-valid-upi', 'Invalid UPI ID format', isValidUPI),
    
  }),
  Yup.object({
    // Company_images: Yup.array().required().label('Please upload atleast 1 Image/Video'),
  })
]

const inits: ICreateAccount = {
  // step-1
  // UserID: null,
  id: NaN,
  Email: '',
  Company_name: '',
  BusinessType: '',
  NumberOfEmployees: 0,
  Year_of_establishment:'',
  LegalStatus: '',
  Description: '',
  GST_number:'',
  PAN_number: '',
  UserMainImage: '',

 // step-2
  First_name:'',
  Last_name: '',
  Phone_number:"",
  Contact_email:'',
  Date_of_birth:'',
  Gender: '',

  //step-3
  Address: '',
  City: '',
  State: '',
  PostalCode: '',
  Country: '',

  //step -4
  Account_number:'',
  Account_holder_name:'',
  Bank_name:'',
  Branch:'',
  IFSC_code:'',




 // extra
  Contact_name : '',
  Contact_phone : '',
  Latitude : '',
  Longitude : '',
  UserMedia : [], 
  Phone_number_2 : '',
  UPI_id : '',
  Company_images: [],
  MediaIDsToRemove: [],

}

// const editInits: IEditAccount = {
//   // step-1
//   // UserID: null,
//   ID: NaN,
//   Email: '',
//   Company_name: '',
//   BusinessType: '',
//   NumberOfEmployees: 0,
//   Year_of_establishment:'',
//   LegalStatus: '',
//   Description: '',
//   GST_number:'',
//   PAN_number: '',
//   UserMainImage: '',

//  // step-2
//   First_name:'',
//   Last_name: '',
//   Phone_number:"",
//   Contact_email:'',
//   Date_of_birth:'',
//   Gender: '',

//   //step-3
//   Address: '',
//   City: '',
//   State: '',
//   PostalCode: '',
//   Country: '',

//   //step -4
//   Account_number:'',
//   Account_holder_name:'',
//   Bank_name:'',
//   Branch:'',
//   IFSC_code:'',




//  // extra
//   Contact_name : '',
//   Contact_phone : '',
//   Latitude : '',
//   Longitude : '',
//   UserMedia : '', 
//   Phone_number_2 : '',
//   UPI_id : '',

// }





export {createAccountSchemas, inits}
