import axios from "axios";

const API = axios.create({
  baseURL: "https://renegan-backend.onrender.com/",
});

export const EmailDomainVerify = async (data) =>
  await API.post("/auth/emailVerify", data);

export const SendOtp = async (data) =>
  await API.post("/auth/generateOtp", data);

export const VerifyOtp = async (data) =>
  await API.post("/auth/otpVerify", data);

export const SignInApi = async (data) => await API.post("/auth/signIn", data);
