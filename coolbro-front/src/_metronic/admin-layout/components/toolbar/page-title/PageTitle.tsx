import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { useLayout } from '../../../core'
import { usePageData } from '../../../core/PageData'

const PageTitle = () => {
  const { pageTitle, pageDescription, pageBreadcrumbs } = usePageData()
  const { config, classes } = useLayout()
  const appPageTitleDirection = config.app?.pageTitle?.direction
  // console.log(pageTitle);
  // console.log(config);
  return (
    <div
      id='kt_page_title'
      data-kt-swapper='true'
      data-kt-swapper-mode='prepend'
      data-kt-swapper-parent="{default: '#kt_content_container', 'lg': '#kt_toolbar_container'}"
      className={clsx(
        'page-title d-flex flex-wrap me-3',
        classes.pageTitle.join(' '),
        config.app?.pageTitle?.class,
        {
          'flex-column justify-content-center': appPageTitleDirection === 'column',
          'align-items-center': appPageTitleDirection !== 'column',
        }
      )}
    >
      {/* begin::Title */}
      {config.app?.pageTitle?.display && pageTitle && (
        <h1
          className={clsx('page-heading d-flex primaryTextSemiBold fw-bold fs-1 my-4 mt-0', {
            'flex-column justify-content-center': appPageTitleDirection,
            'align-items-center': !appPageTitleDirection,
          })}
        >
          {pageTitle}
          {pageDescription && config.app?.pageTitle && config.app?.pageTitle?.description && (
            <span
              className={clsx('page-desc text-muted fs-7 fw-semibold', {
                'pt-2': appPageTitleDirection === 'column',
              })}
            >
              {config.app?.pageTitle?.direction === 'row' && (
                <span className='h-20px border-1 border-gray-300 border-start ms-3 mx-2'></span>
              )}
              {pageDescription}{' '}
            </span>
          )}
        </h1>
      )}
      {/* end::Title */}

      {pageBreadcrumbs &&
        pageBreadcrumbs.length > 0 &&
        config.app?.pageTitle &&
        config.app?.pageTitle?.breadCrumb && (
          <>
            {config.app?.pageTitle?.direction === 'row' && (
              <span className='h-20px border-gray-300 border-start mx-4'></span>
            )}
            <ul className='breadcrumb breadcrumb-separatorless fw-semibold fs-7 my-0'>
              <li
                className={clsx('breadcrumb-item', {
                  'text-dark': true, // Home is always text-dark
                })}
                key="home" // Unique key for the Home item
              >
                <Link className='text-muted text-hover-primary' to='/'>
                  Home
                </Link>
              </li>
              <li
                className={clsx('breadcrumb-item', {
                  'text-dark': true, // Home is always text-dark
                })}>
                <span className='bullet bg-gray-400 w-5px h-2px'></span>
              </li>
              {Array.from(pageBreadcrumbs).map((item, index) => (
                <li
                  className={clsx('breadcrumb-item', {
                    'text-dark': !item.isSeparator && item.isActive,
                    'text-muted': !item.isSeparator && !item.isActive,
                  })}
                  key={`${item.path}${index}`}
                >
                  {!item.isSeparator ? (
                    <Link className='text-muted text-hover-primary' to={item.path}>
                      {item.title}
                    </Link>
                  ) : (
                    <span className='bullet bg-gray-400 w-5px h-2px'></span>
                  )}
                </li>
              ))}
              <li className='breadcrumb-item text-dark'>{pageTitle}</li>
            </ul>
          </>
        )}
    </div>
  )
}

export { PageTitle }
