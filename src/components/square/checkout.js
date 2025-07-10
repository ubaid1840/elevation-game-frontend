"use client"

import { db } from "@/config/firebase";
import { Box, Spinner, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import { addDoc, collection } from "firebase/firestore";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreditCard, PaymentForm } from "react-square-web-payments-sdk";

const SquareCheckout = ({ amount, plan, gameId, user }) => {
    const router = useRouter()

    const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID;
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
    const [errorMessage, setErrorMessage] = useState()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const toast = useToast()

    async function handlePayment(token) {
        setLoading(true)
        setMessage("Processing")
        axios
            .post("/api/square", { token: token, note: plan, amount: amount })
            .then(async (response) => {
                const paymentIntentId = response.data.paymentId

                if (plan == "trivia") {

                    if (gameId) {
                        await handleUpdateTriviaPayment(paymentIntentId, Number(gameId));
                    } else {
                        setErrorMessage("Game not found")
                    }
                } else {
                    await handleUpdatePackage(plan, paymentIntentId);
                }
            })
            .catch((e) => {
                setMessage("Payment failed");
                toast({
                    title: e?.response?.data?.message || e?.message,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }).finally(() => {
                setLoading(false)
            })
    }


    async function handleUpdateTriviaPayment(paymentIntent, gid) {

        return new Promise((res) => {
            axios
                .put(
                    `/api/trivia/users/${user?.id}/games/${gid}/payment`,
                    {
                        payment_intent_id: paymentIntent,
                    }
                )
                .then(async (response) => {
                    setMessage("Payment completed");
                    await addDoc(collection(db, "notifications"), {
                        to: "admin@gmail.com",
                        title: "Trivia Game Payment",
                        message: `${user?.name || user?.email
                            } made payment against trivia game`,
                        timestamp: moment().valueOf(),
                        status: "pending",
                    }).catch((e) => {
                        console.log(e)
                    })
                    router.push(
                        `/${user.role}/trivia/enrolledgames/${gid}`
                    );
                })
                .catch((e) => {
                    setMessage("Payment failed");
                    toast({
                        title: e?.response?.data?.message || e?.message,
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                }).finally(() => {
                    res(true)
                })

        })
    }

    async function handleUpdatePackage(plan, paymentIntentId) {

        return new Promise((res) => {
            let currentDate = new Date();
            if (plan == "Silver") {
                currentDate.setFullYear(currentDate.getFullYear() + 100);
            } else if (plan == "Promotion") {
                currentDate.setFullYear(currentDate.getFullYear() + 1);
            } else {
                currentDate.setDate(currentDate.getDate() + 30);
            }

            axios
                .post(`/api/users/${user?.id}/payment`, {
                    subscription: plan,
                    expiry: currentDate,
                    paymentIntentId: paymentIntentId,
                })
                .then(async (response) => {
                    setMessage("Payment Verified");
                    await addDoc(collection(db, "notifications"), {
                        to: "admin@gmail.com",
                        title: "Payment",
                        message: `${user?.name || user?.email
                            } made payment against ${plan} subscription`,
                        timestamp: moment().valueOf(),
                        status: "pending",
                    });

                    callTimeout();

                })
                .catch((e) => {
                    setMessage("Payment failed");
                    toast({
                        title: e?.response?.data?.message || e?.message,
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                }).finally(() => {
                    res(true)
                })
        })

    }

    function callTimeout() {
        setTimeout(() => {
            router.replace(`/${user.role}`);
        }, 3000);
    }

    return (
        <Box display={'flex'} flexDir={'column'} gap={2}>
            <PaymentForm
                applicationId={appId}
                locationId={locationId}
                cardTokenizeResponseReceived={async (token) => {
                    handlePayment(token.token);
                }}
            >
                <CreditCard >
                    <Box display={'flex'} flexDir={"row"} gap={2} alignItems={'center'} justifyContent={'center'}>
                        {loading && <Spinner />}   <Text>{`${message ? message : `Pay $${amount}`}`}</Text>
                    </Box>
                </CreditCard>
            </PaymentForm>
            {errorMessage && <div>{errorMessage}</div>}
        </Box>
    )
}

export default SquareCheckout

