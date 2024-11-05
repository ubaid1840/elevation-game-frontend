import { app, auth, db } from "@/config/firebase";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import axios from '@/lib/axiosInstance';

export default function useCheckSession() {
    const router = useRouter();
    const pathname = usePathname()

    const checkSession = async () => {
        return new Promise((resolve, reject) => {
            const unsubscribe = onAuthStateChanged(auth, async user => {
                if (user) {
                    if (user.email) {
                        await axios.get(`/api/userdetail/${user.email}`).then(async (response) => {
                            if (response.data?.role) {
                                if (pathname.includes("/login") || pathname.includes("/signup") || pathname.includes("/forgetpassword")) {
                                    router.push(`/${response.data.role}`)
                                }
                                resolve({ user: { ...response.data, ...user } })
                            } else {
                                signOut(auth)
                                resolve({error : "User now found"})
                            }
                        }).catch((e) => {                            
                            
                            signOut(auth)
                            resolve({error : e.message})
                        })

                    }

                } else {
                    if (pathname.includes('admin') || pathname.includes('user') || pathname.includes('judge')) {
                        router.push('/login')
                    }
                    resolve({ status: false })
                }
            })
            return () => {
                unsubscribe()
            }
        })
    };

    return checkSession;
}