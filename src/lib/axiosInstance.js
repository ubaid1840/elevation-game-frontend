import axios from 'axios';

// Create an Axios instance with custom headers
const axiosInstance = axios.create({
  headers: {
    'Cache-Control': 'no-cache',  // Prevent caching
    Pragma: 'no-cache',           // HTTP 1.0 backward compatibility
    Expires: '0',                 // Expire immediately
  },
});

export default axiosInstance;