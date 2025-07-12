import axios from 'axios';


const axiosInstance = axios.create({
  headers: {
    'Cache-Control': 'no-cache',  
    Pragma: 'no-cache',           
    Expires: '0',                 
  },
});

export default axiosInstance;