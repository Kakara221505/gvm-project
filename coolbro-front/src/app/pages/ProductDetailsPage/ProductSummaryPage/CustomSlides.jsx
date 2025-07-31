import React, { useEffect, useRef } from 'react';
import SwiperCore, { Navigation, Thumbs } from 'swiper/core';
import 'swiper/swiper-bundle.css';
import 'swiper/components/navigation/navigation.min.css';
import 'swiper/components/thumbs/thumbs.min.css';
import './CustomSlides.css';
import Drift from 'drift-zoom';

// Initialize Swiper modules
SwiperCore.use([Navigation, Thumbs]);

const CustomSlides = ({ productMedia }) => {
  const sliderThumbsRef = useRef(null);
  const sliderImagesRef = useRef(null);

  useEffect(() => {
    if (sliderThumbsRef.current) {
      // Initialize Swiper for the thumbnail slider
      
      const sliderThumbs = new SwiperCore(sliderThumbsRef.current, {
        direction: 'vertical',
        slidesPerView: window.innerWidth < 768 ? 2 : 4, // Adjust the number of slidesPerView for mobile view
        spaceBetween: 24,
        navigation: {
          nextEl: '.slider__next',
          prevEl: '.slider__prev',
        },
        freeMode: true,
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
        breakpoints: {
          0: { direction: 'horizontal' },
          768: { direction: 'vertical' },
        },
      });

      // Initialize Swiper for the full-size image slider
      const sliderImages = new SwiperCore(sliderImagesRef.current, {
        direction: 'vertical',
        slidesPerView: 1,
        spaceBetween: 32,
        navigation: {
          nextEl: '.slider__next',
          prevEl: '.slider__prev',
        },
        thumbs: {
          swiper: sliderThumbs,
        },
        breakpoints: {
          0: { direction: 'horizontal' },
          768: { direction: 'vertical' },
        },
      });

      // Handle navigation visibility based on image count
      if (sliderThumbs.slides.length <= 4) {
        console.log("in")
        document.querySelector('.slider__next').disabled = true;
        document.querySelector('.slider__prev').disabled = true;
        document.querySelector('.slider__next').classList.add('hidden');
        document.querySelector('.slider__prev').classList.add('hidden');
      }
      else {
        document.querySelector('.slider__next').disabled = false;
        document.querySelector('.slider__prev').disabled = false;
        document.querySelector('.slider__next').classList.remove('hidden');
        document.querySelector('.slider__prev').classList.remove('hidden');
      }

      document.querySelectorAll('.slider__image.main__image img').forEach((img, index) => {
        img.onload = () => {
          new Drift(img, {
            paneContainer: document.querySelector('.zoom'),
            inlinePane: false,
            handleTouch: false,
            inlineOffsetY: -85,
            containInline: true,
          });
        };
      });

      // Manually handle click events on thumbnail slides
      document.querySelectorAll('.swiper-container .slider__image.thumbnail__image').forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
          sliderImages.slideTo(index);
        });
      });

      // Cleanup Swiper instances on component unmount
      return () => {
        sliderThumbs.destroy();
        sliderImages.destroy();
      };
    }
  }, [productMedia]);

  return (
    <section className="slider ">
      <div className="slider__flex  position-relative">
        <div className="slider__col ">
          <div className="slider__prev">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="16"
              viewBox="0 0 28 16"
              fill="none"
            >
              <path
                d="M2 14L14 2L26 14"
                stroke="black"
                strokeOpacity="0.7"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="slider__thumbs" >
            <div className="swiper-container" ref={sliderThumbsRef}>
              <div className="swiper-wrapper">
                {productMedia.map((image, index) => (
                  <div key={index} className="swiper-slide">
                    <div className="slider__image thumbnail__image">
                      <img src={image?.Media_url} alt="" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="slider__next">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="16"
              viewBox="0 0 28 16"
              fill="none"
            >
              <path
                d="M2 2L14 14L26 2"
                stroke="black"
                strokeOpacity="0.7"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className="slider__images " >
          <div className="swiper-container" ref={sliderImagesRef}>
            <div className="swiper-wrapper">
              {productMedia.map((image, index) => (
                <div key={index} className="swiper-slide">
                  <div className="slider__image main__image">
                    <img src={image?.Media_url} data-zoom={image?.Media_url} alt="" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomSlides;
