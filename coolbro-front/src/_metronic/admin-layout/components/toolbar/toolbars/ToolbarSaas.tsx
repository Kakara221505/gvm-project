/* eslint-disable jsx-a11y/anchor-is-valid */
import {FC, useEffect} from 'react'
//import {KTIcon} from '../../../../helpers'

const ToolbarSaas: FC = () => {
 // const [progress, setProgress] = useState<string>('1')
  useEffect(() => {
    document.body.setAttribute('data-kt-app-toolbar-fixed', 'true')
  }, [])

  return (
    <div className='d-flex align-items-center gap-2'>
      {/* begin::Action wrapper */}
      
    </div>
  )
}

export {ToolbarSaas}
