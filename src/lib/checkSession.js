import { app, auth, db } from "@/config/firebase";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import axios from '@/lib/axiosInstance';
import moment from "moment";

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
                                if (response.data?.role !== 'admin') {
                                    if (response.data?.active == false) {
                                        router.push(`/blocked`)
                                        resolve({ error: "User blocked" })
                                    }
                                }

                               
                                if (pathname.includes("/forgetpassword")) {
                                    router.push(`/${response.data.role}`)
                                } else if (pathname.includes("/login") || pathname.includes("/signup")) {
                                    if (response.data?.role == 'admin') {
                                        router.push(`/${response.data.role}`)
                                    } else if (!response.data.package_expiry || moment().isAfter(moment(response.data.package_expiry))) {
                                        router.push("/payment");
                                    } else {
                                        router.push(`/${response.data.role}`)
                                    }
                                }
                                if (!pathname.includes("/payment") && !pathname.includes("/judgepayment") && !pathname.includes("/payment-success")) {
                                    if (!response.data.package_expiry || moment().isAfter(moment(response.data.package_expiry))) {
                                        router.push("/payment");
                                    }
                                    if (response.data?.role === 'judge') {
                                        if (!response.data?.annual_package_expiry || moment().isAfter(moment(response.data.annual_package_expiry))){
                                            router.push("/judgepayment");
                                        }
                                    }
                                }
                                resolve({ user: { ...response.data, ...user } })
                            } else {
                                signOut(auth)
                                resolve({ error: "User now found" })
                            }
                        }).catch((e) => {

                            signOut(auth)
                            resolve({ error: e.message })
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