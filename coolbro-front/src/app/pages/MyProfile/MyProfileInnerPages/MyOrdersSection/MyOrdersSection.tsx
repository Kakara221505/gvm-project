import {FC, useEffect, useState} from 'react'
import {MyOrdersSectionStyles} from './MyOrdersSectionStyles'
import MyOrderCard from './MyOrderCard/MyOrderCard'
import Tab from 'react-bootstrap/Tab'
import {Nav} from 'react-bootstrap'
import NoOrderSection from './NoOrderSection/NoOrderSection'
import axios from 'axios';
import { useAuth } from '../../../../modules/auth'
import * as authHelper from '../../../../modules/auth/core/AuthHelpers';


var tabData = [
  {
    eventKey: 'allOrders',
    title: 'All Orders',
    status: 'all',
  },
  {
    eventKey: 'processing',
    title: 'Processing',
    status: 'processing',
  },
  {
    eventKey: 'shipped',
    title: 'Shipped',
    status: 'shipped',
  },
  {
    eventKey: 'cancelled',
    title: 'Cancelled',
    status: 'cancelled',
  },
  {
    eventKey: 'delivered',
    title: 'Delivered',
    status: 'delivered',
  },
]
const MyOrdersSection: FC = () => {
  const [activeKey, setActiveKey] = useState(tabData[0].eventKey)
  const [ordersData, setOrderData] = useState([])
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const TOKEN = authHelper.getAuth();
  const handleTabSelect = (selectedKey: any) => {
    setActiveKey(selectedKey)
  }



  useEffect(() => {
   
    fetchOrdersData();
  }, [activeKey])

  const fetchOrdersData = async () => {
    setLoading(true);
      try {
        let deliveryStatus;
      
        // Determine the Delivery_status based on the active tab
        if (activeKey !== 'allOrders') {
          const selectedTab = tabData.find(tab => tab.eventKey === activeKey);
          deliveryStatus = selectedTab ? selectedTab.status : null;
        }
        axios
          .post(`${process.env.REACT_APP_SERVER_URL}/order/get_order_list`,{
            Delivery_status: deliveryStatus,
          }, { headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken } })
          .then((res: any) => {
            if (res.data && res.data.data) {
              setLoading(false);
              setOrderData(res.data.data);
              console.log("hii",ordersData)
            } else {
              setLoading(false);
              setOrderData([]);
            }
          })
          .catch((err) => {
            console.error(err);
            setLoading(false);
          });
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }


  return (
    <>
      <MyOrdersSectionStyles>
        <Tab.Container id='justify-tab-example' activeKey={activeKey} onSelect={handleTabSelect}>
      
            <div className='mainParent  marginPageMYMobile'>
            <Nav variant='pills' className='mobileMarginNone navbarMarginForSearch customNavpills mx-7'>
              {tabData.map((tab, index) => (
                <Nav.Item key={index} className='navItem'>
                  <Nav.Link
                    eventKey={tab.eventKey}
                    className={
                      activeKey === tab.eventKey
                        ? 'custom-active-nav-link ms-4'
                        : 'ms-4 custom-active-nav-link'
                    }
                  >
                    {tab.title}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
            </div>
   

            <Tab.Content>
            {tabData.map((tab, index) => (
              <Tab.Pane key={index} eventKey={tab.eventKey}>
                {loading ? (
                  <p>Loading...</p>
                ) : ordersData.length === 0 ? (
                  <NoOrderSection />
                ) : (
                  <MyOrderCard ordersData={ordersData} />
                )}
              </Tab.Pane>
            ))}
          </Tab.Content>
        </Tab.Container>
      </MyOrdersSectionStyles>
    </>
  )
};

export default MyOrdersSection
