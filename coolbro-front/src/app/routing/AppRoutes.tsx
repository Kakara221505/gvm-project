/**
 * High level router.
 *
 * Note: It's recommended to compose related routes in internal router
 * components (e.g: `src/app/modules/Auth/pages/AuthPage`, `src/app/BasePage`).
 */

import { FC } from 'react'
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom'
import { PrivateRoutes } from './PrivateRoutes'
import { PublicRoutes } from './PublicRoutes'
import { UserRoutes } from './UserRoutes'
import { ErrorsPage } from '../modules/errors/ErrorsPage'
import { Logout, AuthPage, useAuth } from '../modules/auth'
import { App } from '../App'

/**
 * Base URL of the website.
 *
 * @see https://facebook.github.io/create-react-app/docs/using-the-public-folder
 */
const { PUBLIC_URL } = process.env

const AppRoutes: FC = () => {
  const { currentUser } = useAuth()
  // console.log(currentUser)
  return (
    // 1 = admin
    // 2 = user
    <BrowserRouter basename={PUBLIC_URL}>
      <Routes>
        <Route element={<App />}>
          <Route path='logout' element={<Logout />} />

          {currentUser && (
            <>
              {currentUser.UserRoleID === 1 && (
                <>
                  <Route path="/admin/*" element={<PrivateRoutes />} />
                  <Route index element={<Navigate to="/admin/dashboard" />} />
                </>
              )}
              {currentUser.UserRoleID === 2 && (
                <>
                  <Route path="/user/*" element={<UserRoutes />} />
                  <Route element={<Navigate to="/user/my-profile" />} />
                </>
              )}
            </>
          )}
          <Route path='*' element={<PublicRoutes />} />

          {!currentUser && (
            <>
              <Route path='auth/*' element={<AuthPage />} />

            </>
          )}
          <Route path='error/*' element={<ErrorsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export { AppRoutes }

