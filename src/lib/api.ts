// src/lib/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000", // Nest 서버 주소
  timeout: 5000,
});
