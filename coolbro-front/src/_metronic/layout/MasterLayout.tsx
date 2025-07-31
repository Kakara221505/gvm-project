import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { HeaderWrapper } from './components/header/HeaderWrapper'
// import {RightToolbar} from '../partials/layout/RightToolbar'
import { ScrollTop } from './components/scroll-top'
import { Content } from './components/content'
import { FooterWrapper } from './components/footer'
import { ThemeModeProvider } from '../partials'
import { reInitMenu } from '../helpers'
import ChildHeader from './components/ChildHeaderComponent/ChildHeader/ChildHeader'

const MasterLayout = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [searchData, setSearchQuery] = useState('');
  const location = useLocation()
  const navigate = useNavigate()
  const { searchQuery } = useParams<{ searchQuery?: string }>();

  useEffect(() => {

    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsSticky(scrollPosition > 0);
    }

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    reInitMenu();
  }, [location.key]);

  const headerClass = isSticky ? 'stickyHeader' : ''

  // Clear searchQuery on page change
  useEffect(() => {
    if (!location.pathname.includes('/product-list')) {
      setSearchQuery('');
    }
    else {
      if (searchQuery)
        setSearchQuery(searchQuery as string);
    }
  }, [location.pathname]);

  const handleSearchSubmit = () => {
    if (searchData.trim() !== '') {
      // Redirect to the SearchResults page with the search query as a URL parameter
      navigate(`/product-list/${encodeURIComponent(searchData)}`)
    } else {
      navigate(`/product-list`)
    }
  }

  return (
    <ThemeModeProvider>
      <div className='d-flex flex-column flex-root app-root' id='kt_app_root'>
        <div className='app-page flex-column flex-column-fluid' id='kt_app_page'>
          <div className={`custom-header ${headerClass}`}>
            <div className='position-reltive d-flex flex-column justify-content-center'>
              <div className=''>
                <HeaderWrapper
                  searchQuery={searchData}
                  setSearchQuery={setSearchQuery}
                  handleSearchSubmit={handleSearchSubmit}
                />
              </div>
              <div className='position-relative row mx-0'>
                <ChildHeader />
              </div>
            </div>
          </div>
          <div className='app-wrapper flex-column flex-row-fluid' id='kt_app_wrapper'>
            <div className='app-main flex-column flex-row-fluid' id='kt_app_main'>
              <div className='d-flex flex-column flex-column-fluid'>
                <Content>
                  <Outlet />
                </Content>
              </div>
              <FooterWrapper />
            </div>
          </div>
        </div>
      </div>
      <ScrollTop />
    </ThemeModeProvider>
  )
}

export { MasterLayout }
