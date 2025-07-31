import { FC, useState, useEffect } from 'react'
import {toAbsoluteUrl} from '../../../../../_metronic/helpers'
import MyOrderShippingAddress from './MyOrderShippingAddress/MyOrderShippingAddress'
import MyOrderBillingAddress from './MyOrderBillingAddress/MyOrderBillingAddress'
import MyOrderSummary from './MyOrderSummary/MyOrderSummary'
import { useParams } from 'react-router-dom';
import axios from 'axios'

const imageSources:any = {
  delivered: '/media/vectors/Delievered.png',
  processing: '/media/vectors/Processing.png',
  shipped: '/media/vectors/Shipped.png',
  cancelled: '/media/vectors/Cancelled.png',
};
interface Address {
  Company_name?: string;
  GST_number?: string;
  First_name: string;
  Last_name?: string;
  Phone_number: string;
  Phone_number_2?: string;
  Address: string;
  City: string;
  State: string;
  PostalCode: string;
  Country: string;
}

interface OrderItem {
  Quantity: number;
  Color: string;
  Price: string;
  ProductImage: string;
  ProductName: string;
  SkuNumber: string;
}

interface OrderData {
  OrderID: number;
  Delivery_status: string;
  Sub_total_amount: string;
  Discount_amount: string;
  Shipping_charge: string;
  Total_amount: string;
  Order_date: string;
  DealerDetails: {
    Company_name: string;
    Contact_phone: string;
    Address: Address;
  };
  BillingAddress: Address;
  ShippingAddress: Address;
  OrderItems: OrderItem[];
}

const MyOrderDetailsSection: FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const [orderData, setOrderData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  useEffect(() => {
   fetchOrder()
  }, [orderId])
  const fetchOrder = () => {
    setLoading(true)
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/order/${orderId}`)
      .then((res: any) => {
        setLoading(false)
        if (res.data && res.data.data) {
          setOrderData(res.data.data)
        }
      })
      .catch((err) => {
        setLoading(false)
        console.error(err)
      })
  }
  return (
    <section className='container app-container my-10'>
      <div className='mainHeading my-10'>
        <h1 className='primaryTextSemiBold my-4'>ORDER DETAILS</h1>
        <div className='d-flex flex-column'>
          <div className='orderIDInner'>
            <div className='d-inline-flex fs-5 text-black fw-medium'>
              <div className='d-inline-flex align-items-center'>
                <h4 className='mb-0'>Order ID: </h4>
                <h4 className='mb-0 ms-1'>{orderData.OrderID}</h4>
              </div>
              <div className='d-flex statusOrder ms-3 align-items-center'>
                <div className='statusIcon'>
                <img
                            src={toAbsoluteUrl(imageSources[orderData.Delivery_status])}
                            className="img-fluid"
                            alt={orderData.Delivery_status}
                          />
                </div>
                <h4 className={'mb-0 ms-1 '}>{orderData.Delivery_status}</h4>
              </div>
            </div>
          </div>
          <div className='orderIDInner my-1'>
            <div className='d-inline-flex fs-6 text-black fw-medium'>
              <div className='fw-normal'>Placed on: </div>
              <div className='ms-1 fw-medium'>{orderData.Order_date}</div>
              <div className='mx-1'>|</div>
              <div className='d-flex statusOrder'>
                <div className='fw-normal'>Arrive in: </div>
                <div className='ms-1 fw-medium'>Today</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='row my-10'>
        <div className='col-lg-6'>
        <MyOrderShippingAddress address={orderData.ShippingAddress} />
        </div>
        <div className='col-lg-6 marginPageMYMobile'>
        <MyOrderBillingAddress address={orderData.BillingAddress} />
        </div>
      </div>
      <div className='row'>
        <div className='col-lg-12 '>
        <MyOrderSummary orderData={orderData} />
        </div>
      </div>
    </section>
  )
}

export default MyOrderDetailsSection
