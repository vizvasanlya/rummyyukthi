import axios from "axios";

const API_URL = "http://13.50.16.71:5000/api"; 

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;

export const ENDPOINTS = {
  JOIN: "/game/join", 
};