import axios from "axios";

export const API = axios.create({
  baseURL: "https://ecommerce-backend-busm.onrender.com/api"
});