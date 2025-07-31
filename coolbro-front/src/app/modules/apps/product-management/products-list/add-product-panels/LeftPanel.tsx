import { useState, useEffect } from 'react'
import axios from 'axios'
import * as authHelper from '../../../../auth/core/AuthHelpers'
import { toAbsoluteUrl } from '../../../../../../_metronic/helpers'
import CustomDropdown from '../../../../../pages/HelperComponents/CustomDropdown'
import { toast } from 'react-toastify'
import { Formik } from 'formik'

function LeftPanel({ onLeftPanelChanges, formik, editProduct, ID }: any) {
  const TOKEN = authHelper.getAuth()

  const [Status, setStatus] = useState<string>('');
  const [productCategory, setProductCategory] = useState<string>('');
  const [productBrand, setProductBrand] = useState<string>('');
  const [ProductMainImage, setProductMainImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [distributors, setDistributors] = useState<any[]>([]); // Replace 'any' with a more specific type
  const [UserID, setDistributorID] = useState<number | undefined>();
  const [selectedDistributor, setSelectedDistributor] = useState<string>('');
  const [BrandID, setProductBrandID] = useState<number | undefined>();
  const [CategoryID, setProductCategoryID] = useState<number | undefined>();
  const [EnergyEfficiencyRatingID, setEnergyRatingID] = useState<number | undefined>();
  const [energyRating, setEnergyRating] = useState<string>('');
  const [Room_size_suitability, setSize] = useState<string>('');

  const options = ['Published', 'Inactive', 'Draft'];

  const [details, setDetails] = useState<any>({}); 

  const [categoryOptions, setCategoryOptions] = useState<any[]>([])
  const [brandOptions, setBrandOptions] = useState<any[]>([])

  const [energyOptions, setEnergyOptions] = useState<string[]>([])
  const [roomSizeOptions, setRoomSizeOptions] = useState<string[]>([])

  useEffect(() => {
    if (editProduct) {
      
      const { CategoryID, UserID, BrandID, EnergyEfficiencyRatingID } = editProduct;

      if (CategoryID !== 0) {
        setProductCategoryID(CategoryID);
        // const category = categoryOptions.find((c:any) => details.Categories && details.Categories[c] && details.Categories[c].ID === CategoryID);
        const category= categoryOptions.find((c:any) => parseInt(c.ID) === CategoryID )
        setProductCategory(category?.Name || '');
        formik.setFieldValue('CategoryID',CategoryID );
      }

      if (UserID !== 0) {
        setDistributorID(UserID);
        const distributor = distributors.find((d: any) => d.ID === UserID);
        setSelectedDistributor(distributor?.Name || '');
        formik.setFieldValue('CategoryID',CategoryID );
      }

      if (BrandID !== 0) {
        setProductBrandID(BrandID);
        // const brand = brandOptions.find((b) => details.Brands && details.Brands[b] && details.Brands[b].ID === BrandID);
        const brand = brandOptions.find((b:any)=> parseInt(b?.ID)=== BrandID)
      
        setProductBrand(brand?.Name || '');
      }

      if (EnergyEfficiencyRatingID !== 0) {
        setEnergyRatingID(EnergyEfficiencyRatingID);
      
        
        // const energyRating = energyOptions.find((e) => details['Energy Ratings'] && details['Energy Ratings'][e] && details['Energy Ratings'][e].ID === EnergyEfficiencyRatingID);
        const energyRating:any = energyOptions.find((e: any) => parseInt(e.ID) === EnergyEfficiencyRatingID);
        setEnergyRating(energyRating?.Name || '');
      }


      setSize(editProduct.Room_size_suitability);
      setStatus(editProduct.Status);
      setImagePreview(editProduct.MainMedia);
      formik.setFieldValue('ProductMainImage',editProduct.MainMedia )

      
    }
  }, [editProduct]);

  useEffect(() => {
    onLeftPanelChanges({
      Status,
      CategoryID,
      BrandID,
      ProductMainImage,
      EnergyEfficiencyRatingID,
      Room_size_suitability,
      UserID,
    });
  }, [Status, CategoryID, BrandID, ProductMainImage, EnergyEfficiencyRatingID, Room_size_suitability, UserID]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;

    if (file) {
      const fileExtension = file.name.split('.').pop();
      if (fileExtension && fileExtension.toLowerCase() === 'png') {
        setProductMainImage(file);
        formik.setFieldValue('ProductMainImage', file);

        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Only PNG files are accepted for the thumbnail image.');
      }
    }
  }

  const colors: { [key: string]: string } = {
    Published: 'success',
    Draft: 'primary',
    Inactive: 'danger',
  };

  const changeDistributor = (distributorValue: string) => {
    setSelectedDistributor(distributorValue);
    const distributor = distributors.find((d: any) => d.Name === distributorValue);
    setDistributorID(distributor?.ID || undefined);
    formik.setFieldValue('UserID', distributor?.ID || undefined )
  }

  const handleDropdownChange = (option: string) => {
    setStatus(option);
    formik.setFieldValue('Status', option)
  }

  const handleCategoryChange = (categoryOptionValue: string) => {
    const selectedCategory: any = categoryOptions.find((category: any) => category.Name === categoryOptionValue);
  
    if (selectedCategory) {
      setProductCategory(categoryOptionValue);
      setProductCategoryID(selectedCategory.ID);
      formik.setFieldValue('CategoryID',selectedCategory.ID )
    }
  }
  
  const handleBrandChange = (brandOptionValue: string) => {
    const selectedBrand: any = brandOptions.find((brand: any) => brand.Name === brandOptionValue);
  
    if (selectedBrand) {
      setProductBrand(brandOptionValue);
      setProductBrandID(selectedBrand.ID);
      formik.setFieldValue('BrandID',  selectedBrand.ID)
    }
  }
  
  const changeEnergyRating = (energyValue: string) => {
    const selectedEnergyRating: any = energyOptions.find((energy: any) => energy.Name === energyValue);
  
    if (selectedEnergyRating) {
  
      setEnergyRating(energyValue);
      setEnergyRatingID(selectedEnergyRating.ID);
      formik.setFieldValue('EnergyEfficiencyRatingID',selectedEnergyRating.ID )

    }
  }
  

  const changeRoomSize = (room: string) => {

    setSize(room);
    formik.setFieldValue('Room_size_suitability', room);

  }

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/users/?page=1&limit=15&userRole=4`, {
        headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken },
      })
      .then((res) => {
        const userDetails = res.data.users;
        setDistributors(userDetails);
      })
      .catch((err) => {
        console.log('error in userRole API', err);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/product/product-filter`, {
        headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken },
      })
      .then((res) => {
        const data = res.data.data;

        const brands = data.Brands?.map((single: any) => single) || [];
        setBrandOptions(brands);

        const categories = data.Categories?.map((single: any) => single) || [];
        setCategoryOptions(categories);

        const energyValues = data['Energy Ratings']?.map((single: any) => single) || [];
        setEnergyOptions(energyValues);

        const sizeValues = data['Room Size']?.map((single: any) => single.Name) || [];
        setRoomSizeOptions(sizeValues);

        setDetails(data);
      })
      .catch((err) => console.log(err));
  }, []);


  return (
    <>
      <br />

      <div className='row'>
        <div className='col-md-11'>
          <div className='card card-flush py-4'>
            <div className='card-header'>
              <div className='card-title'>
                <h2>Thumbnail</h2>
              </div>
            </div>
            <div className='card-body py-0 text-center pt-0'>
            <div className='centerImage'>
  {imagePreview ? (
    <img src={imagePreview} className='thumbnailPreview position-relative' alt="thumbnail-img" />
  ) : (
    <img
      src={toAbsoluteUrl('/media/vectors/NoImageBorderLess.png')}
      className='thumbnailPreview position-relative'
      alt='product-main-img'
    />
  )}
  <div className='thumbnailButton'>
    <label
      className='btn btn-icon btn-active-color-primary w-20px h-20px bg-body shadow'
      data-bs-toggle='tooltip'
      aria-label='Change avatar'
      data-bs-original-target='Change Avatar'
      data-kt-initialized={1}
      htmlFor='thumbnailUpload'
    >
      <img
        alt='Logo'
        src={toAbsoluteUrl('/media/vectors/Edit Square.png')}
        className='fs-2'
      />
    </label>
    <input
      type='file'
      onChange={handleFileSelect}
      accept='image/png'
      style={{ display: 'none' }}
      id='thumbnailUpload'
      onBlur={formik.handleBlur}
      
      
    />


  </div>
</div>

              <br />

              <p className='text-black fs-5 text-center' >
                Set the product thumbnail image. Only *.png files are accepted{' '}
              </p>
              {formik.touched.ProductMainImage && formik.errors.ProductMainImage && (
  <div className='fv-plugins-message-container'>
    <div className='fv-help-block'>Product Image is Required (*).</div>
  </div>
)}
            </div>
          </div>
          <br />

          <div className='card card-flush py-4'>
            <div className='card-header'>
              <div className='card-title'>
                <h2>Status</h2>
              </div>
              <div className='card-toolbar'>
                <div className={`rounded-circle bg-${colors[Status]} w-15px h-15px`}></div>
              </div>
            </div>
            <div className='card-body py-0'>

              <div className='row'>
                <div className='col-md-12'>
                <br />
                  <CustomDropdown
                    options={options}
                    label='Select Status'
                    selectedOption={Status}
                    onChange={handleDropdownChange}
                    
                  />

                
                  {  formik.touched.Status  && formik.errors.Status && (
  <div className='fv-plugins-message-container'>
    <div className='fv-help-block'>{formik.errors.Status}</div>
  </div>
)}
                </div>
              </div>
            </div>
          </div>
          <br />

          <div className='card card-flush py-4'>
            <div className='card-header'>
              <div className='card-title'>
                <h2>Product Details</h2>
              </div>
            </div>
            <div className='card-body pt-0'>
              <div className='row'>
                <div className='col-md-12'>
                  <br />
                  <CustomDropdown
                    options={categoryOptions.map((single: any) => single.Name)}
                    label='Select Category'
                    selectedOption={productCategory}
                    onChange={handleCategoryChange}
                   
                  />
                </div>
          {formik.touched.CategoryID && formik.errors.CategoryID  && (
              <div className='fv-plugins-message-container'>
                <div className='fv-help-block'>Category is required</div>
              </div>
            )}
              </div>
              <br />

              <div className='row'>
                <div className='col-md-12'>
                  <br />
                  <CustomDropdown
                    options={brandOptions.map((single: any) => single.Name)}
                    label='Select Brand'
                    selectedOption={productBrand}
                    onChange={handleBrandChange}
                    
                   
                  />
                   {formik.touched.BrandID && formik.errors.BrandID && (
  <div className='fv-plugins-message-container'>
    <div className='fv-help-block'>{"BrandID is required."}</div>
  </div>
)}
                
                </div>
              </div>
              <br />
              <div className='row'>
                <div className='col-md-12'>
                  <br />
                  <CustomDropdown
                    options={energyOptions.map((single: any) => single.Name)}
                    label='Select Energy Rating'
                    selectedOption={energyRating}
                    onChange={changeEnergyRating}
                  />

{formik.touched.EnergyEfficiencyRatingID && formik.errors.EnergyEfficiencyRatingID && (
  <div className='fv-plugins-message-container'>
    <div className='fv-help-block'>{"Energy Rating field is required."}</div>
  </div>
)}

                </div>
              </div>
              <br />
              <div className='row'>
                <div className='col-md-12'>
                  <br />
                  <CustomDropdown
                    options={roomSizeOptions.map((single: any) => single)}
                    label='Select Room Size'
                    selectedOption={Room_size_suitability}
                    onChange={changeRoomSize}
                  />
             
                {  formik.touched.Room_size_suitability  && formik.errors.Room_size_suitability && (
  <div className='fv-plugins-message-container'>
    <div className='fv-help-block'>{formik.errors.Room_size_suitability}</div>
  </div>
)}

                  <br />
                </div>
              </div>

           
            
             
             

              <br />
              <div className='row'>
                <div className='col-md-12'>
                  <br />
                  <CustomDropdown
                    options={distributors.map((single: any) => single.Name)}
                    label='Select Distributor'
                    selectedOption={selectedDistributor}
                    onChange={changeDistributor}
                  />
               {  formik.touched.UserID  && formik.errors.UserID && (
  <div className='fv-plugins-message-container'>
    <div className='fv-help-block'>{"Distributor is required."}</div>
  </div>
)}

                  <br />
                  <br />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LeftPanel
