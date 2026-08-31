import axios from "axios";
import { headers } from "../config/request.config.js";

const client = axios.create({
 timeout: 15000,
 maxRedirects: 3,
 headers
});

client.interceptors.response.use(r=>r, e=>{
 const code=e.response?.status;
 if(code===403||code===429||code===503) throw new Error("Remote source unavailable");
 throw e;
});

export default client;
