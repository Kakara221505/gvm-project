import {
  FC,
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
  Dispatch,
  SetStateAction,
} from 'react'
import { signOut } from "firebase/auth";
import { auth as GoogleAuth } from '../../../config/firebaseConfig'
import { LayoutSplashScreen } from '../../../../_metronic/layout/core'
import { AuthModel, UserModel } from './_models'
import * as authHelper from './AuthHelpers'
// import {getUserByToken} from './_requests'
import { WithChildren } from '../../../../_metronic/helpers'
import { getUserByToken } from './_requests'
import { useDispatch } from 'react-redux';
import { addToCart } from '../../../../redux/Slices/cartSlice';

type AuthContextProps = {
  auth: AuthModel | undefined
  saveAuth: (auth: AuthModel | undefined) => void
  currentUser: UserModel | undefined
  setCurrentUser: Dispatch<SetStateAction<UserModel | undefined>>
  logout: () => void
}

const initAuthContextPropsState = {
  auth: authHelper.getAuth(),
  saveAuth: () => { },
  currentUser: undefined,
  setCurrentUser: () => { },
  logout: () => { },
}

const AuthContext = createContext<AuthContextProps>(initAuthContextPropsState)

const useAuth = () => {
  return useContext(AuthContext)
}

const AuthProvider: FC<WithChildren> = ({ children }) => {
  const [auth, setAuth] = useState<AuthModel | undefined>(authHelper.getAuth())
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>()
  const dispatch = useDispatch();
  const saveAuth = (auth: AuthModel | undefined) => {
    setAuth(auth)
    if (auth) {
      authHelper.setAuth(auth)
    } else {
      authHelper.removeAuth()
    }
  }


   async function signOutGoogleUser(email:string)
   {
    console.log("Sign out function with user ", email);

    if(GoogleAuth !== null){
    // const auth = getAuth();
   await signOut(GoogleAuth).then(() => {
      // Sign-out successful.
        console.log("Signout is success");
    }).catch((error) => {
      // An error happened.
      console.log("Error occured during Signout",error)
      console.error(error);
    });
  }
    
   }
  const logout = async () => {
    const localCurrentUser=localStorage.getItem('auth-token')
    let localUser;
    if(localCurrentUser!== null)
    {
       localUser=JSON.parse(localCurrentUser);
       const loginType= localUser?.User?.Login_type;
       if(loginType==="2")
       {
          await signOutGoogleUser(localUser?.User?.Email);
       }
    }
    saveAuth(undefined)
    setCurrentUser(undefined)
    dispatch(addToCart(0));
    localStorage.setItem('modelOpenedAfterLogin', JSON.stringify(false));
    localStorage.removeItem("shippingId")
    localStorage.removeItem("selectedDealerId")
    localStorage.removeItem("billingId")
  }

  return (
    <AuthContext.Provider value={{ auth, saveAuth, currentUser, setCurrentUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

const AuthInit: FC<WithChildren> = ({ children }) => {
  const { auth, logout, setCurrentUser } = useAuth()
  const didRequest = useRef(false)
  const [showSplashScreen, setShowSplashScreen] = useState(true)
  // We should request user by authToken (IN OUR EXAMPLE IT'S API_TOKEN) before rendering the application
  useEffect(() => {
    const requestUser = async (apiToken: string) => {
      try {
        if (!didRequest.current) {
          const { data } = await getUserByToken(apiToken)
          if (data && data.ID) {
            setCurrentUser(data)
          }
        }
      } catch (error) {
        console.error(error)
        if (!didRequest.current) {
          logout()
        }
      } finally {
        setShowSplashScreen(false)
      }

      return () => (didRequest.current = true)
    }

    if (auth && auth.AccessToken) {
      requestUser(auth.AccessToken)
    } else {
      logout()
      setShowSplashScreen(false)
    }
    // eslint-disable-next-line
  }, [])

  return showSplashScreen ? <LayoutSplashScreen /> : <>{children}</>
}

export { AuthProvider, AuthInit, useAuth }
