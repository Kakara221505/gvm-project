import axios from 'axios'
import { AuthModel, UserModel } from './_models'

const API_URL = process.env.REACT_APP_SERVER_URL

export const GET_USER_BY_ACCESSTOKEN_URL = `${API_URL}/auth/verify_token`
export const LOGIN_URL = `${API_URL}/auth/login_with_password`
export const REGISTER_URL = `${API_URL}/auth/register`
export const REQUEST_PASSWORD_URL = `${API_URL}/forgot_password`

// Server should return AuthModel
export function login(email: string, password: string) {
  return axios.post<AuthModel>(LOGIN_URL, {
    Email: email,
    Password: password,
    Login_type: '0',
  })
}

// Server should return AuthModel
export function register(
  email: string,
  phone: string,
  name: string,
  password: string,
  country_code: string,
  login_type: string,
  role: string
) {
  return axios.post(REGISTER_URL, {
    Email: email,
    Phone: phone,
    Name: name,
    Password: password,
    Country_code: country_code,
    Login_type: login_type,
    Role: role
  })
}

// Server should return object => { result: boolean } (Is Email in DB)
export function requestPassword(email: string) {
  return axios.post<{ result: boolean }>(REQUEST_PASSWORD_URL, {
    email,
  })
}

export function getUserByToken(token: string) {
  return axios.post<UserModel>(GET_USER_BY_ACCESSTOKEN_URL, {
    api_token: token,
  })
}
