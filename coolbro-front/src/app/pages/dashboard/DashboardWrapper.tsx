/* eslint-disable jsx-a11y/anchor-is-valid */
import {FC, useEffect} from 'react'
import {useIntl} from 'react-intl'
import {PageTitle} from '../../../_metronic/admin-layout/core'
import { useAuth } from '../../modules/auth'
import * as authHelper from '../../modules/auth/core/AuthHelpers';
import axios from 'axios'


const DashboardPage: FC = () => (
  <>
    {/* begin::Row */}
    <div className='row g-5 g-xl-10 mb-5 mb-xl-10'>
      
    </div>
  </>
)

const DashboardWrapper: FC = () => {
  const intl = useIntl()
  const { saveAuth, setCurrentUser } = useAuth()

  const getUser = () => {
    const TOKEN = authHelper.getAuth()
    // console.log(TOKEN?.User.ID)
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/users/${TOKEN?.User.ID}`, {
        headers: { Authorization: 'Bearer ' + TOKEN?.AccessToken },
      })
      .then((res) => {
        if (res.data.user) {
         
        } else {
          // Handle error condition
          saveAuth(undefined);
        setCurrentUser(undefined);
        }
      })
      .catch((err) => {
        saveAuth(undefined);
        setCurrentUser(undefined);
      });
  };

  useEffect(() => {
    getUser()
  }, [])
  
  return (
    <>
      <PageTitle breadcrumbs={[]}>{intl.formatMessage({id: 'MENU.DASHBOARD'})}</PageTitle>
      <DashboardPage />
    </>
  )
}

export default DashboardWrapper
