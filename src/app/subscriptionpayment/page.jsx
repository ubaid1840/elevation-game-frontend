"use client";
import SquareCheckout from "@/components/square/checkout";
import useCheckSession from "@/lib/checkSession";
import { UserContext } from "@/store/context/UserContext";
import { Box, Center, Heading, Spinner } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";

export default function Page() {
    const checkSession = useCheckSession();
    const { state: UserState, setUser } = useContext(UserContext);
    const [loading, setLoading] = useState(true)
    const search = useSearchParams()
    const [selectedPlan, setSelectedPlan] = useState("");
    const [amount, setAmount] = useState(0);

    useEffect(() => {
        let unsubscribe;

        checkSession().then((res) => {
            if (res.error) {
                console.log(res.error);
            }
            if (typeof res === "function") {
                unsubscribe = res;
            }
            if (res.user) {
                setUser(res.user);
            }
        }).finally(() => {
            setLoading(false)
        })

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    useEffect(() => {
        if (UserState.value.data?.id) {
            const a = search.get("a")
            const plan = search.get('plan')
            const annual = search.get("annual")
            if (a && !isNaN(Number(a))) {
                setAmount(a)
            }
            if (annual && !isNaN(Number(annual))) {
                setAmount(annual)
            }
            if (plan) {
                setSelectedPlan(plan)
            }
        }


    }, [search, UserState])





    const RenderCheckout = useCallback(() => {
        return (
            <Center mt={10}>
                {loading ? (
                    <Spinner />
                ) : (
                    UserState.value.data?.email && (
                        <SquareCheckout
                            user={UserState.value.data}
                            amount={amount}
                            plan={selectedPlan}

                        />
                    )
                )}
            </Center>
        );
    }, [loading, amount, selectedPlan]);

    return (
        <Box p={8} maxWidth="1200px" mx="auto">
            <Heading mb={8} textAlign="center">
                Subscription fee
            </Heading>

            <RenderCheckout />
        </Box>
    );
}
