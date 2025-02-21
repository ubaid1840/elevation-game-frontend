import { app, auth, db } from "@/config/firebase";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import axios from '@/lib/axiosInstance';
import moment from "moment";
import { useCallback, useContext, useRef, useState, useEffect } from "react";

export default function useCheckSession() {
    const router = useRouter();
    const pathname = usePathname();
    const [isCheckingSession, setIsCheckingSession] = useState(false);
    const unsubscribeRef = useRef(null);

    const debouncedData = useCallback(
        debounce(async (user) => {
            return await checkData(user);
        }, 1500),
        []
    );

    async function checkData(user) {
        try {
         
            const response = await axios.get(`/api/userdetail/${user.email}`);
            const userData = response.data;

            if (userData?.role) {
                if (userData.role !== 'admin') {
                    if (!userData.package_expiry || moment().isAfter(moment(userData.package_expiry, "YYYY-MM-DD"), "day")) {
                        if (
                            !pathname.includes("/payment") &&
                            !pathname.includes("/judgepayment") &&
                            !pathname.includes("/payment-success")
                        ) {
                            if(pathname.includes("/elevator")){
                                router.replace("/payment");
                            }
                            // router.push("/payment");
                           
                        }
                    }

                    if (userData.role === 'judge') {
                        if (!userData.annual_package_expiry || moment().isAfter(moment(userData.annual_package_expiry, "YYYY-MM-DD"), "day")) {
                            if (!pathname.includes("/judgepayment") && !pathname.includes("/payment-success")) {
                                router.replace("/judgepayment");
                            }
                        }
                    }
                }

                if (
                    !pathname.includes(userData.role) &&
                    !pathname.includes("/payment") &&
                    !pathname.includes("/judgepayment") &&
                    !pathname.includes("/triviapayment") &&
                    !pathname.includes("/payment-success")
                ) {
                    router.replace(`/${userData.role}`);
                }
                return { user: { ...userData, ...user } };
            } else {
                signOut(auth);
                return { error: "User not found" };
            }
        } catch (e) {
            signOut(auth);
            return { error: e.message };
        }
    }

    const checkSession = useCallback(async () => {
        if (isCheckingSession) return { status: false };

        return new Promise((resolve) => {
            setIsCheckingSession(true);

            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (user && user.email) {
                    const result = await debouncedData(user);
                    resolve(result);
                } else {
                    if (pathname.includes('admin') || pathname.includes('user') || pathname.includes('judge')) {
                        router.push('/login');
                    }
                    resolve({ status: false });
                }
                setIsCheckingSession(false);
            });

            unsubscribeRef.current = unsubscribe;
        });
    }, [isCheckingSession, debouncedData, pathname, router]);

    useEffect(() => {
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, []);

    return checkSession;
}


function debounce(func, delay = 1000) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        return new Promise((resolve, reject) => {
            timeout = setTimeout(async () => {
                try {
                    const result = await func(...args);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            }, delay);
        });
    };
}