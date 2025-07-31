import { SweetAlertOptions } from 'sweetalert2'; // Import SweetAlertOptions

export const defaultDeleteErrorConfig: SweetAlertOptions = {
  title: 'Error',
  text: 'An error occurred while deleting the data.',
  icon: 'error',
  confirmButtonText: 'Ok!',
  customClass: {
    confirmButton: 'btn fw-bold btn-danger',
  },
};

export const defaultDeleteConfig: SweetAlertOptions = {
  title: 'Are you sure?',
  text: 'Do you want to delete this data?',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Yes, delete!',
  cancelButtonText: 'No, Cancel',
  customClass: {
    confirmButton: 'btn fw-bold btn-danger',
    cancelButton: 'btn fw-bold btn-light btn-active-primary',
  },
};

export const defaultDeleteSuccessConfig: SweetAlertOptions = {
  title: 'Deleted!',
  text: 'The data has been deleted.',
  icon: 'success',
  confirmButtonText: 'Ok, got it!',
  customClass: {
    confirmButton: 'btn fw-bold btn-primary',
  },
};

export const defaultFormSubmitConfig: SweetAlertOptions = {
  text: 'Form has been successfully submitted!.',
  icon: 'success',
  confirmButtonText: 'Ok, got it!',
  customClass: {
      confirmButton: 'btn fw-bold btn-primary',
  },
};
export const defaultFormUpdateConfig: SweetAlertOptions = {
  text: 'Changes has been successfully submitted!.',
  icon: 'success',
  confirmButtonText: 'Ok, got it!',
  customClass: {
      confirmButton: 'btn fw-bold btn-primary',
  },
};

export const defaultFormErrorConfig: SweetAlertOptions = {
  title: 'Error',
  text: 'An error occurred while submitting the form data.',
  icon: 'error',
  confirmButtonText: 'Ok!',
  customClass: {
    confirmButton: 'btn fw-bold btn-danger',
  },
};

export const defaultByDefaultPhoneExistConfig: SweetAlertOptions = {
  title: 'Error',
  text: 'Phone number already exists.',
  icon: 'error',
  confirmButtonText: 'Ok!',
  customClass: {
    confirmButton: 'btn fw-bold btn-danger',
  },
};

export const defaultColorConfig: SweetAlertOptions = {
  title: 'Error',
  text: 'Please select the color.',
  icon: 'error',
  confirmButtonText: 'Ok!',
  customClass: {
    confirmButton: 'btn fw-bold btn-danger',
  },
};

export const quantityConfig: SweetAlertOptions = {
  title: 'Error',
  text: 'Please select the quantity',
  icon: 'error',
  confirmButtonText: 'Ok!',
  customClass: {
    confirmButton: 'btn fw-bold btn-danger',
  },
};

export const defaultProductAddSuccessful: SweetAlertOptions = {
  text: 'Product has been added successfully!.',
  icon: 'success',
  confirmButtonText: 'Ok, got it!',
  customClass: {
      confirmButton: 'btn fw-bold btn-primary',
  },
};
export const defaultDeleteVariation: SweetAlertOptions = {
  title: 'Are you sure?',
  text: 'Do you want to delete this Color Variation? All Media related to this variation will be deleted.',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Yes, delete!',
  cancelButtonText: 'No, Cancel',
  customClass: {
    confirmButton: 'btn fw-bold btn-danger',
    cancelButton: 'btn fw-bold btn-light btn-active-primary',
  },
};

export const defaultProductEditSuccessful: SweetAlertOptions = {
  text: 'Product Details has been edited successfully!.',
  icon: 'success',
  confirmButtonText: 'Ok, got it!',
  customClass: {
      confirmButton: 'btn fw-bold btn-primary',
  },
};

export const defaultDealerAddSuccessful: SweetAlertOptions = {
  text: 'Dealer has been added successfully!.',
  icon: 'success',
  confirmButtonText: 'Ok, got it!',
  customClass: {
      confirmButton: 'btn fw-bold btn-primary',
  },
};

export const defaultDealerUpdateSuccessful: SweetAlertOptions = {
  text: 'Dealer details has been updated successfully!.',
  icon: 'success',
  confirmButtonText: 'Ok, got it!',
  customClass: {
      confirmButton: 'btn fw-bold btn-primary',
  },
};

export const defaultDistributorAddSuccessful: SweetAlertOptions = {
  text: 'Distributor has been added successfully!.',
  icon: 'success',
  confirmButtonText: 'Ok, got it!',
  customClass: {
      confirmButton: 'btn fw-bold btn-primary',
  },
};

export const defaultDistributorUpdateSuccessful: SweetAlertOptions = {
  text: 'Distributor details has been updated successfully!.',
  icon: 'success',
  confirmButtonText: 'Ok, got it!',
  customClass: {
      confirmButton: 'btn fw-bold btn-primary',
  },
};

export const defaultVariationConfig: SweetAlertOptions = {
  title: 'Error',
  text: 'Please select variant.',
  icon: 'error',
  confirmButtonText: 'Ok!',
  customClass: {
    confirmButton: 'btn fw-bold btn-danger',
  },
};

export const defaultDealerConfig: SweetAlertOptions = {
  title: 'error',
  text: 'Please select dealer to place order.',
  icon: 'error',
  confirmButtonText: 'Ok!',
  customClass: {
    confirmButton: 'btn fw-bold btn-danger',
  },
};
export const defaultShippingAddressConfig: SweetAlertOptions = {
  title: 'error',
  text: 'Please fill the shipping address details to place order.',
  icon: 'error',
  confirmButtonText: 'Ok!',
  customClass: {
    confirmButton: 'btn fw-bold btn-danger',
  },
};
export const defaultBillingAddressConfig: SweetAlertOptions = {
  title: 'error',
  text: 'Please fill the billing address details to place order.',
  icon: 'error',
  confirmButtonText: 'Ok!',
  customClass: {
    confirmButton: 'btn fw-bold btn-danger',
  },
};
export const defaultOutOfStockConfig: SweetAlertOptions = {
  title: 'error',
  text: 'Please remove out of stock item',
  icon: 'error',
  confirmButtonText: 'Ok!',
  customClass: {
    confirmButton: 'btn fw-bold btn-danger',
  },
};
export const defaultBillingAddressValidationConfig: SweetAlertOptions = {
  title: 'error',
  text: 'Please fill the billing address before providing GST information.',
  icon: 'error',
  confirmButtonText: 'Ok!',
  customClass: {
    confirmButton: 'btn fw-bold btn-danger',
  },
};

export const defaultShippingAddressFormConfig: SweetAlertOptions = {
  text: 'Shipping Address has been successfully submitted!.',
  icon: 'success',
  confirmButtonText: 'Ok, got it!',
  customClass: {
      confirmButton: 'btn fw-bold btn-primary',
  },
};
export const defaultBillingAddressFormConfig: SweetAlertOptions = {
  text: 'Billing Address has been successfully submitted!.',
  icon: 'success',
  confirmButtonText: 'Ok, got it!',
  customClass: {
      confirmButton: 'btn fw-bold btn-primary',
  },
};
export const defaultByDefaultAddressConfig: SweetAlertOptions = {
  title: 'error',
  text: 'Default address not available',
  icon: 'error',
  confirmButtonText: 'Ok!',
  customClass: {
    confirmButton: 'btn fw-bold btn-danger',
  },
};
export const defaultByDefaultShippingConfig: SweetAlertOptions = {
  title: 'error',
  text: 'Shipping address not available',
  icon: 'error',
  confirmButtonText: 'Ok!',
  customClass: {
    confirmButton: 'btn fw-bold btn-danger',
  },
};


export const defaultContactUsFormConfig: SweetAlertOptions = {
  text: 'Contact Details has been successfully submitted!.',
  icon: 'success',
  confirmButtonText: 'Ok, got it!',
  customClass: {
      confirmButton: 'btn fw-bold btn-primary',
  },

 
};