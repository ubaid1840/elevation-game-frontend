import { storage } from "@/config/firebase";
import { getDownloadURL, ref } from "firebase/storage";


export default async function getDisplayPicture(email) {
    if (!email) return null;
    try {
        const imageRef = ref(storage, `${email}/images/dp.png`);
        return await getDownloadURL(imageRef)
    } catch (error) {
        console.log("Error fetching display picture:");
        return null; 
    }
}