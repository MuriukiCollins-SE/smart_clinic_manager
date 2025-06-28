// src/api.js

import axios from 'axios'

const API_BASE = 'http://localhost:5000'

export const api = axios.create({
  baseURL: API_BASE,
})

export const authHeader = () => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}
