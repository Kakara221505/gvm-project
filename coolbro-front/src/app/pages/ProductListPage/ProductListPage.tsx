/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import ProductFilterPage from './ProductFilterPage/ProductFilterPage'
import ProductCardPage from './ProductCardPage/ProductCardPage'
import { Filters, InitialFilters } from '../../constants/common';
import cloneDeep from 'clone-deep';

interface ProductFilterCanvasProps {
  visibleFilterOffCanvas: (showOffCanvas: boolean) => void; // Define the prop type
  showOffCanvas: boolean;
  setShowOffCanvas: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProductListPage: FC<ProductFilterCanvasProps> = ({ showOffCanvas, setShowOffCanvas }) => {

  const [selectedFilters, setSelectedFilters] = useState<Filters>(cloneDeep(InitialFilters));
  const [showOffCanvas1, setShowOffCanvas1] = useState(false);
  const [productList, setProductList] = useState(false);
  const { searchQuery } = useParams<{ searchQuery?: string }>(); // Retrieve searchQuery from the URL
  const safeSearchQuery = searchQuery || '';

  useEffect(() => {
    console.log(searchQuery);
    console.log(safeSearchQuery);
  }, [showOffCanvas1, productList, selectedFilters, safeSearchQuery])

  const handleVisibleOffCanvas = (isVisibleOffCanvas: boolean) => {
    setShowOffCanvas1(isVisibleOffCanvas);
  };

  const childData = (isVisibleOffCanvas1: boolean) => {
    setShowOffCanvas1(!showOffCanvas1);
    setProductList(!isVisibleOffCanvas1);
  }

  return (
    <div className='mobilePaddingNew container-fluid px-20'>
      <div className='mobilePaddingNone'>
        <div className=''>
          <div className='row marginPageMYMobile my-8'>
            <div className='col-lg-3 ipadDisplayNone'>
              <ProductFilterPage
                showOffCanvasFilter={showOffCanvas1}
                parentToChild={childData}
                onFilterChange={setSelectedFilters}
              />
              
            </div>
            <div className='col-lg-9'>
              <ProductCardPage
                visibleOffCanvas={handleVisibleOffCanvas}
                selectedFilters={selectedFilters}
                searchQuery = {safeSearchQuery}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductListPage
