import { FC } from 'react';
import { MyOrderCardStyles } from './MyOrderCardStyles';
import { toAbsoluteUrl } from '../../../../../../_metronic/helpers';
import { useNavigate } from 'react-router-dom';



interface OrderItem {
  ProductID: string;
  Color: string;
  Quantity: number;
  ProductName: string;
  SkuNumber: string;
  MainImage: string;
  Price: string;
}

interface OrderData {
  OrderID: string;
  Delivery_status: string;
  Order_date: string;
  Dealer_name: string;
  OrderItems: OrderItem[];
}


const imageSources:any = {
  delivered: '/media/vectors/Delievered.png',
  processing: '/media/vectors/Processing.png',
  shipped: '/media/vectors/Shipped.png',
  cancelled: '/media/vectors/Cancelled.png',
};

interface MyOrderCardProps {
  ordersData: OrderData[];
}

const MyOrderCard: FC<MyOrderCardProps> = ({ ordersData }) => {
  const navigate = useNavigate ()
  const calculateGrandTotal = (orderItems: OrderItem[]) => {
    return orderItems.reduce((total, item) => total + parseFloat(item.Price), 0).toFixed(2);
  }; 

  const navigateToOrderDetails = (id: string) => {
    navigate('/user/order-details/'+id)
  }
  return (
    <MyOrderCardStyles>
      {ordersData.map((order, index) => (
        <div className="list-group customMyOrderList mobileMarginNone mx-4 my-8" key={index}>
          <div

            className="list-group-item list-group-item-action customMyOrderListAction active"
          >
            <div className="d-flex justify-content-between mobileFlexColumn">
              <div className="">
                <div className="d-flex flex-column dFLexAlignItemsCenterMobile">
                  <div className="orderIDInner">
                    <div className="d-inline-flex fs-5 text-black fw-medium">
                      <div className='d-inline-flex align-items-center orderIDHover' onClick={() => navigateToOrderDetails(order.OrderID)}>
                      <h4 className="mb-0">Order ID: </h4>
                      <h4 className="mb-0 ms-1">{order.OrderID}</h4>

                      </div>
                      <div className="d-flex statusOrder ms-3 align-items-center">
                        <div className="statusIcon">
                          <img
                            src={toAbsoluteUrl(imageSources[order.Delivery_status])}
                            className="img-fluid"
                            alt={order.Delivery_status}
                          />
                        </div>
                        <h4 className={'mb-0 ms-1 ' + order.Delivery_status}>{order.Delivery_status}</h4>
                      </div>
                    </div>
                  </div>
                  <div className="orderIDInner my-1">
                    <div className="d-inline-flex fs-6 text-black fw-medium ">
                      <div className="fw-normal">Placed on: </div>
                      <div className="ms-1 fw-medium">{order.Order_date}</div>
                      <div className="mx-1">|</div>
                      <div className="d-flex statusOrder">
                        <div className="fw-normal">Arrive in: </div>
                        <div className="ms-1 fw-medium">Today</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-center  navbarMarginForSearch mb-0 contentAround">
                <div className="fs-5 text-black fw-medium">
                  <h4 className="mb-0  fw-medium text-end">{calculateGrandTotal(order.OrderItems)}</h4>
                  <div className="ms-1 fw-normal text-end">Grand Total</div>
                </div>
              </div>
            </div>
          </div>
          <div className="innerMainSectionList">
            {order.OrderItems.map((OrderItems, itemIndex) => (
              <div
                className="list-group-item customMyOrderListAction border-top-0 list-group-item-action"
                key={itemIndex}
              >
                <div className="d-flex listMobileRespo justify-content-between align-items-center">
                  <div className="productImg d-flex align-items-center">
                    <div className="commonBGMain">
                      <img
                        height={70}
                        width={70}
                        className="mobileWFull"
                        src={toAbsoluteUrl('/media/vectors/BGCommonPortraitImage.png')}
                        alt="Card cap"
                      />
                      <div className="commonBGACMain">
                        <img
                          height={60}
                          width={60}
                          className="mobileWFull ACImageCommon"
                          src={OrderItems.MainImage}
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="productName  text-black ms-3 fw-medium fs-5">
                      {OrderItems.ProductName}
                    </div>
                  </div>
                  <div className="stockDiv">
                    <div className="d-flex align-items-center mt-1 mb-0">
                      <img
                        className='img-fluid'
                        src={toAbsoluteUrl('/media/vectors/Quantity.png')}
                        alt=""
                      />
                      <h4 className="mb-0 fw-medium viewChildTitle mx-2 ">{OrderItems.Quantity}</h4>
                    </div>
                  </div>
                  <div className="colorDiv">
                    <div className="d-flex align-items-center mt-1 mb-0">
                      <img
                        className='img-fluid'
                        src={toAbsoluteUrl('/media/vectors/ColorIcon.png')}
                        alt=""
                      />
                      <h4 className="mb-0 fw-medium viewChildTitle mx-2 ">{OrderItems.Color}</h4>
                    </div>
                  </div>
                  <div className="">
                    <div className="fs-5 text-black fw-medium">
                      <h4 className="fw-medium text-end viewChildTitle mb-0 mt-1">{OrderItems.Price}</h4>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </MyOrderCardStyles>
  );
};

export default MyOrderCard;
