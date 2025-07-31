import { Suspense, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { I18nProvider } from '../_metronic/i18n/i18nProvider'
import { LayoutProvider, LayoutSplashScreen } from '../_metronic/layout/core'
import { MasterInit } from '../_metronic/layout/MasterInit'
import { AuthInit, useAuth } from './modules/auth'
import * as authHelper from './modules/auth/core/AuthHelpers';
const App = () => {
  const { saveAuth, setCurrentUser } = useAuth();
  useEffect(() => {
    const TOKEN = authHelper.getAuth();
    if (!TOKEN?.AccessToken) {
      saveAuth(undefined)
      setCurrentUser(undefined)
    }
  }, [])

  return (
    <Suspense fallback={<LayoutSplashScreen />}>
      <I18nProvider>
        <LayoutProvider>
          <AuthInit>
            <Outlet />
            <MasterInit />
          </AuthInit>
        </LayoutProvider>
      </I18nProvider>
    </Suspense>
  )
}

export { App }
