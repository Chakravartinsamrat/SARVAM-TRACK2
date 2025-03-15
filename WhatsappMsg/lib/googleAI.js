import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config()

const genAI = new GoogleGenerativeAI("AIzaSyAnNPcjOmCadmkPxsiE40IYrSWdT_BtSnc");
console.log("process.env.VITE_GEMINI_API_KEY", process.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({model:'gemini-1.5-flash'});

export default model;