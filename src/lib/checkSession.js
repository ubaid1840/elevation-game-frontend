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
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (user) {
                    if (user.email) {
                        try {
                            const response = await axios.get(`/api/userdetail/${user.email}`);
                            const userData = response.data;

                            if (userData?.role) {
                                if (userData.role !== 'admin') {
                                    if (!userData.package_expiry || moment().isAfter(moment(userData.package_expiry))) {
                                        if (
                                            !pathname.includes("/payment") &&
                                            !pathname.includes("/judgepayment") &&
                                            !pathname.includes("/payment-success")
                                        ) {
                                            router.push("/payment");
                                        }
                                        // resolve({ error: "Package expired" });
                                        // return;
                                    }

                                    if (userData.role === 'judge') {
                                        if (!userData.annual_package_expiry || moment().isAfter(moment(userData.annual_package_expiry))) {
                                            if (!pathname.includes("/judgepayment") && !pathname.includes("/payment-success")) {
                                                router.push("/judgepayment");
                                            }
                                            // resolve({ error: "Annual package expired" });
                                            // return;
                                        }
                                    }
                                }

                                if (!pathname.includes(userData.role) &&
                                    !pathname.includes("/payment") &&
                                    !pathname.includes("/judgepayment") &&
                                    !pathname.includes("/payment-success")) {
                                    router.push(`/${userData.role}`);
                                    // resolve({ error: "Wrong route" });
                                    // return
                                }

                                resolve({ user: { ...userData, ...user } });
                            } else {
                                signOut(auth);
                                resolve({ error: "User not found" });
                            }
                        } catch (e) {
                            signOut(auth);
                            resolve({ error: e.message });
                        }
                    }
                } else {
                    if (pathname.includes('admin') || pathname.includes('user') || pathname.includes('judge')) {
                        router.push('/login');
                    }
                    resolve({ status: false });
                }
            });

            return () => {
                unsubscribe();
            };
        });
    };

    return checkSession;
}