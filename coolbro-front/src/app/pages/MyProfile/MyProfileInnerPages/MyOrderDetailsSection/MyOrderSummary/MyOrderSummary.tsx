// MyOrderSummary.tsx
import React from 'react';
import { MyOrderSummaryStyles } from './MyOrderSummaryStyles';

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
  OrderItems?: OrderItem[]; // Make OrderItems optional
}

interface MyOrderSummaryProps {
  orderData: OrderData;
}

const MyOrderSummary: React.FC<MyOrderSummaryProps> = ({ orderData }) => {
  return (
    <MyOrderSummaryStyles>
      <section>
        <div className="card pb-0 border border-1 border-gray-300 rounded-4 card-flush py-4 pt-0 flex-row-fluid overflow-hidden">
          <div className="card-header headerCustom">
            <div className="card-title">
              <h2>Order #{orderData.OrderID}</h2>
            </div>
          </div>

          <div className="card-body pt-0 px-0 pb-0">
            <div className="table-responsive">
              <table className="table align-middle table-row-dashed fs-6 gy-5 mb-0">
                <thead className="headerCustom border-bottom border-bottom-1 border-gray-300">
                  <tr className="text-gray-400 fw-bold fs-7 text-uppercase gs-0">
                    <th className="text-start min-w-175px text-black ps-10">Product</th>
                    <th className="text-center min-w-100px text-black text-end">SKU</th>
                    <th className="text-center min-w-70px text-black text-end">QTY</th>
                    <th className="text-center min-w-100px text-black text-end">COLOR</th>
                    <th className="text-center min-w-100px text-black text-end pe-10">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="fw-semibold text-gray-600">
                  {orderData.OrderItems?.map((item, index) => (
                    <tr key={index} className="border-bottom border-bottom-1 border-gray-300">
                      <td className="ps-10 border-0 d-flex m-auto justify-content-start">
                        <div className="d-flex align-items-center">
                          <a href={`/product/${item.SkuNumber}`} className="symbol symbol-50px">
                            <img src={item.ProductImage} alt={item.ProductName} className="symbol-label" />
                          </a>
                          <div className="ms-5">
                            <a href={`/product/${item.SkuNumber}`} className="fw-bold text-gray-600 text-hover-primary">
                              {item.ProductName}
                            </a>
                            {/* Assuming Delivery Date is available in your API response */}
                            <div className="fs-7 text-muted">Delivery Date: {orderData.Order_date}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">{item.SkuNumber}</td>
                      <td className="text-center">{item.Quantity}</td>
                      <td className="text-center">{item.Color}</td>
                      <td className="text-center">${(parseFloat(item.Price) * item.Quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="border-bottom-0">
                    <td colSpan={4} className="text-end">
                      Subtotal
                    </td>
                    <td className="text-center">${orderData.Sub_total_amount}</td>
                  </tr>
                  <tr className="border-bottom border-bottom-1 border-gray-300">
                    <td colSpan={4} className="text-end">
                      Shipping Rate
                    </td>
                    <td className="text-center">${orderData.Shipping_charge}</td>
                  </tr>
                  <tr className="border-bottom border-bottom-1 border-gray-300">
                    <td colSpan={4} className="text-end">
                      Discount Amount
                    </td>
                    <td className="text-center">${orderData.Discount_amount}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="fs-3 text-dark text-end">
                      Grand Total
                    </td>
                    <td className="text-dark fs-3 fw-bolder text-center">${orderData.Total_amount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </MyOrderSummaryStyles>
  );
};

export default MyOrderSummary;
