import axios from "./axiosInstance";

async function triggerRefreshUserData(email) {

    if (!email) return

    try {

        const response = await axios.get(`/api/userdetail/${email}`);
        const userData = response.data;
        return { ...userData }


    } catch (e) {

        console.log(e)
    }

}

export default triggerRefreshUserData