/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC, useContext, useEffect, useState } from 'react'
import ProductSummaryPage from './ProductSummaryPage/ProductSummaryPage'
import ProductOverviewPage from './ProductOverviewPage/ProductOverviewPage'


const ProductDetailsPage: FC = () => {
  const [productAllData, setProductAllData] = useState<any>({});
  const handleProductData = (data: any) => {
    setProductAllData(data);
  };
  return (
    <div className='mobilePaddingNew container-fluid px-20'>
      <div className=''>
        <div className=''>
          <div className='row my-16 mt-8 align-items-center'>
            <div className='col-lg-12'>
            <ProductSummaryPage onProductData={handleProductData} />
            </div>
            <div className='col-lg-12'>
            <ProductOverviewPage productsData={productAllData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailsPage
