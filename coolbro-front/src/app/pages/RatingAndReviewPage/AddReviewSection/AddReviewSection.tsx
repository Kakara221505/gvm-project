/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { FC, useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { AddReviewSectionStyles } from './AddReviewSectionStyles'
import ReviewCardSection from './ReviewCardSection/ReviewCardSection'
import ReviewImageUploadSection from './ReviewImageUploadSection/ReviewImageUploadSection'
import '../../../../../node_modules/quill/dist/quill.snow.css'
import 'quill/dist/quill.snow.css'
import RatingSection from './RatingSection/RatingSection'
import WriteReviewSection from '../WriteReviewSection/WriteReviewSection'
import * as authHelper from '../../../modules/auth/core/AuthHelpers';
import { useAuth } from '../../../modules/auth';
import Swal from 'sweetalert2';
import {
  defaultFormErrorConfig,
  defaultFormSubmitConfig
} from '../../../config/sweetAlertConfig';


function extractInfoFromURL(url: any) {
  const regex = /\/reviews\/(\w+)\/(\d+)/;
  const match = url.match(regex);
  if (match) {
    const type = match[1]; // "product" or "dealer"
    const id = match[2]; // The corresponding ID
    return { type, id };
  }
  return null;
}


const AddReviewSection: FC = () => {
  const [reviewData, setReviewData] = useState<any>({});
  const [rating, setRating] = useState<string>();
  const [media, setMedia] = useState<File[]>([]);
  const [reviewContent, setReviewContent] = useState<String>();
  const [loading, setLoading] = useState(false);
  const [reviewAllData, setReviewAllData] = useState<any>({})
  const TOKEN = authHelper.getAuth();
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const currentUrl = location.pathname + location.search;
    const info = extractInfoFromURL(currentUrl);
    if (info !== null) {
      if (info.type === "product") {

        setLoading(true);
        axios
          .get(`${process.env.REACT_APP_SERVER_URL}/product/product-details/${info.id}`)
          .then((res: any) => {
            if (res.data && res.data.data) {
              const item = res.data.data;
              setLoading(false);
              setReviewData({ Type: info.type, ID: item.ID, Name: item.Name, SKU_number: item.SKU_number, MainMedia: item.MainMedia })
            }
         
          })
          .catch((err) => {
            console.error(err);
            setLoading(false);
          });

      }
      if (info.type === "dealer") {

        setLoading(true);
        axios
          .get(`${process.env.REACT_APP_SERVER_URL}/dealer/dealer-details/${info.id}`)
          .then((res: any) => {
            if (res.data && res.data.data) {
              const item = res.data.data;
              setLoading(false);
              setReviewData({ Type: info.type, ID: item.ID, Name: item.Company_name, MainMedia: item.MainMedia })
            }
          })
          .catch((err) => {
            console.error(err);
            setLoading(false);
          });

      }
    }

    fetchReviewData()
   
  }, []);

  const fetchReviewData = async () => {
    try {
      setLoading(true);
      const currentUrl = location.pathname + location.search;
      const info = extractInfoFromURL(currentUrl);
      if (info !== null) {
        const response = await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/rating/get_currentuser_rating`,
          {
            Rated_item_type: info.type,
            Rated_item_id: info.id,
            UserID: currentUser ? String(currentUser.ID) : '0',
          },
          {
            headers: { Authorization: `Bearer ${TOKEN?.AccessToken}` },
          }
        );
  
        if (response.data.status === 'success') {
          setLoading(false);
          setReviewAllData(response.data);
          setRating(response.data.data.Rating);
        }
      }
     
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };
  

  const handleRatingChange = (newRating: any) => {
    setRating(newRating);
  };

  const handleMediaUpload = (acceptedFiles: any) => {
    setMedia(acceptedFiles); // Store acceptedFiles in state if needed
  };

  const handleReviewChange = (content: any) => {
    setReviewContent(content);
  };
  const validateForm = () => {
    console.log(rating);
    const ratingAsNumber = rating ? parseFloat(rating) : undefined;
    if (!ratingAsNumber || ratingAsNumber <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please provide a valid star rating!',
      });
      return false;
    }
    return true;
  };
  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!validateForm()) {
        setLoading(false);
        return;
      }
      const formData = new FormData();
      // const userIdFromDetails = currentDetails.length > 0 ? currentDetails[0].ID : '';
      if (reviewAllData.data && reviewAllData.data.ID) {
        formData.append('ID', reviewAllData.data.ID);
      }
      formData.append('UserID', currentUser ? String(currentUser.ID) : '0');
      formData.append("Name", currentUser ? String(currentUser.Name) : '');
      formData.append('Rating', String(rating));
      formData.append('Review', String(reviewContent));

      formData.append("Rated_item_type", reviewData.Type);
      formData.append("Rated_item_id", reviewData.ID);


      media.forEach((file, index) => {
        formData.append("RatingMedia", file, file.name);
      });

      console.log('FormData:', formData);
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/rating/add_update_rating`,
        formData,
        { headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken } }
      );

      if (response.status === 200 && response.data.message) {
        Swal.fire(defaultFormSubmitConfig).then(() => {
          // Navigate to another page after the user clicks "OK"
          const currentUrl = location.pathname + location.search;
          const info = extractInfoFromURL(currentUrl);
        
          if (info !== null) {
            if (info.type === "product") {  
              navigate('/product-details/' + reviewData.ID);
            }
            if (info.type === "dealer") {  
              navigate('/dealer-details/' + reviewData.ID);
            }
          }
        });
      } else {
        Swal.fire(defaultFormErrorConfig);
      }
    } catch (err) {
      console.error(err);
      Swal.fire(defaultFormErrorConfig);
    } finally {
      setLoading(false);
    }
  }
  return (
    <AddReviewSectionStyles>
      <section className='AddReviewListSection my-6'>
        <div className='card AddReviewListCard py-8 px-6'>
          <div className='reviewHeadingMain'>
            <h1 className='primaryTextSemiBold'>CREATE REVIEW</h1>
          </div>
          <div className='reviewCardSection py-4 pb-0'>
            <ReviewCardSection data={reviewData} />
          </div>
          <hr />
          <div className='rateSection py-2 pt-0'>
            <RatingSection onRatingChange={handleRatingChange} rating={rating}/>
          </div>
          <hr />

          <div className='rateSection py-3 pt-0'>
            <ReviewImageUploadSection onMediaUpload={handleMediaUpload} />
          </div>
          <hr />
          <div className='rateSection py-2 pt-0'>
            <div className='headRateText py-2'>
              <h4 className='text-black'>Write a Review</h4>
            </div>

            <div className='uploadSection mt-2'>
              <WriteReviewSection onReviewChange={handleReviewChange} reviewContent={reviewContent}/>
            </div>
          </div>
        </div>

        <div className='addReviewBtn d-flex justify-content-end mt-10'>
          <button
            className='btn btn-default primaryBtn'
            onClick={handleSubmit}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </section>
    </AddReviewSectionStyles>
  )
}

export default AddReviewSection
