import { defineStore } from "pinia"
import axios from "axios"

const BASE_URL = "http://3.130.240.169:3000/"

export const SessionStore = defineStore("session", {
  state: () => ({
    auth_token: null as string | null,
    user: {
      id: null,
      username: null,
      email: null
    }
  }),
  getters: {
    getAuthToken: (state) => {
      return state.auth_token
    },
    getUserEmail: (state) => {
      return state.user?.email
    },
    getUserID: (state) => {
      return state.user?.id
    },
    isLoggedIn: (state) => {
      const loggedOut =
        state.auth_token == null || state.auth_token == JSON.stringify(null)
      return !loggedOut
    }
  },
  actions: {
    registerUser(payload: any) {
      return new Promise((resolve, reject) => {
        axios
          .post(`${BASE_URL}users`, payload)
          .then((response) => {
            this.setUserInfo(response)
            resolve(response)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    loginUser(payload: any) {
      console.log(payload)
      new Promise((resolve, reject) => {
        axios
          .post(`${BASE_URL}users/sign_in`, payload)
          .then((response) => {
            this.setUserInfo(response)
            resolve(response)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    logoutUser() {
      console.log("logoutUser()")
      console.log(this.auth_token)
      const config = {
        headers: {
          Authorization: this.auth_token
        }
      }
      new Promise<void>((resolve, reject) => {
        axios
          .delete(`${BASE_URL}users/sign_out`, config)
          .then(() => {
            //Reset user info
            this.resetUserInfo()
            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    loginUserWithToken(payload: any) {
      console.log("loginUserWithToken storeSessions.js")
      const config = {
        headers: {
          Authorization: payload.auth_token,
        }
      }
      new Promise((resolve, reject) => {
        axios
          .get(`${BASE_URL}member-data`, config)
          .then((response) => {
            //setUserInfoFromToken
            this.setUserInfoFromToken(response)
            resolve(response)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    setUserInfo(data: any) {
      this.user = data.data.user;
      this.auth_token = data.headers.authorization;
      axios.defaults.headers.common["Authorization"] =
        data.headers.authorization
      localStorage.setItem("auth_token", data.headers.authorization)
    },
    setUserInfoFromToken(data: any) {
      this.user = data.data.user
      this.auth_token = localStorage.getItem("auth_token")
    },
    resetUserInfo() {
      this.user = {
        id: null,
        username: null,
        email: null
      }
      this.auth_token = null
      localStorage.removeItem("auth_token")
      axios.defaults.headers.common["Authorization"] = null
    },
  }
})
