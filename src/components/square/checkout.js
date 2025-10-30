"use client"

import { db } from "@/config/firebase";
import { debounce } from "@/utils/debounce";
import { Box, Flex, Spinner, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import { addDoc, collection } from "firebase/firestore";
import moment from "moment";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ApplePay, CashAppPay, CreditCard, GooglePay, PaymentForm } from "react-square-web-payments-sdk";

const SquareCheckout = ({ amount, plan, gameId, user }) => {
    const router = useRouter()
    const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID;
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
    const [errorMessage, setErrorMessage] = useState()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const toast = useToast()
    const search = useSearchParams()

    useEffect(() => {
        const cashReq = search.get("cash_request_id")
        if (cashReq) {
            setLoading(true)
            setMessage("Awaiting CashApp Response")
        }


    }, [search])


    const handlePaymentCashApp = useCallback(
        debounce((token) => {
            handlePayment(token);
        }, 1000),
        []
    );

    async function handlePayment(token) {
        setLoading(true)
        setMessage("Processing")
        axios
            .post("/api/square", { token: token, note: plan, amount: amount, gid: gameId, uid: user?.id })
            .then(async (response) => {
                if (response.data?.alreadyPaid) {
                    router.push(`/user/${plan}/enrolledgames/${gameId}`)
                }
                const paymentIntentId = response.data.paymentId
                if (plan == "trivia") {
                    if (gameId) {
                        await handleUpdateTriviaPayment(paymentIntentId, Number(gameId));
                    } else {
                        setErrorMessage("Game not found")
                    }
                } else if (plan === 'elevator') {
                    if (gameId) {
                        await handleUpdateElevatorPayment(paymentIntentId, Number(amount), Number(gameId));
                    } else {
                        setErrorMessage("Game not found")
                    }
                } else {
                    await handleUpdatePackage(plan, paymentIntentId);
                }
            })
            .catch((e) => {
                setMessage("");
                setErrorMessage("Payment Failed! Try other method")
                toast({
                    title: e?.response?.data?.message || e?.message,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
                const url = new URL(window.location.href);
                url.searchParams.delete("cash_request_id");
                window.history.replaceState({}, "", url);
            }).finally(() => {
                setLoading(false)
            })
    }

    async function handleUpdateElevatorPayment(paymentIntent, price, gid) {
        return new Promise((res) => {
            axios
                .post("/api/games/enroll", {
                    userId: user?.id,
                    gameId: gid,
                    entryLevel: "PENDING",
                    paymentIntent: paymentIntent,
                    price: price,
                })
                .then(() => {
                    router.replace(`/user/elevator/enrolledgames/${gid}`);
                })
                .catch((e) => {
                    setMessage("");
                    setErrorMessage("Payment Failed")
                    toast({
                        title: e?.response?.data?.message || e?.message,
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                    const url = new URL(window.location.href);
                    url.searchParams.delete("cash_request_id");
                    window.history.replaceState({}, "", url);

                })
                .finally(() => {
                    res(true)
                });
        })
    };

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
                        `/user/trivia/enrolledgames/${gid}`
                    );
                })
                .catch((e) => {
                    setMessage("");
                    setErrorMessage("Payment Failed")
                    toast({
                        title: e?.response?.data?.message || e?.message,
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                    const url = new URL(window.location.href);
                    url.searchParams.delete("cash_request_id");
                    window.history.replaceState({}, "", url);
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
                    setMessage("");
                    setErrorMessage("Payment Failed")
                    toast({
                        title: e?.response?.data?.message || e?.message,
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                    const url = new URL(window.location.href);
                    url.searchParams.delete("cash_request_id");
                    window.history.replaceState({}, "", url);
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


    if (!locationId || !appId) return null



    return (
        <Flex
            w={'100%'}
            align="center"
            justify="center"
            px={2}
        >
            <Box
                w="full"
                maxW="md"
                bg="white"
                p={6}
                borderRadius="lg"
            >
                <PaymentForm
                    applicationId={appId}
                    locationId={locationId}
                    cardTokenizeResponseReceived={async (token) => {
                        handlePayment(token.token);
                    }}

                    createPaymentRequest={() => ({
                        countryCode: "US",
                        currencyCode: "USD",
                        total: {
                            amount: amount.toString(),
                            label: "Total",
                        },

                    })}
                >
                    <Flex flexDir="column" gap={4}>
                        <Box
                            bg="yellow.100"
                            color="gray.800"
                            p={2}
                            borderRadius="md"
                            textAlign="center"
                            fontSize="sm"
                        >
                            ⚠️ Apple Pay works on Safari browsers that support Apple Pay
                        </Box>

                        <CashAppPay width="full" callbacks={{
                            onTokenization: (event) => {
                                if (event.detail.tokenResult.status === 'OK') {
                                    setLoading(true)
                                    setMessage("Processing payment ")
                                    handlePaymentCashApp(event.detail.tokenResult.token)
                                } else {
                                    setLoading(false)
                                    setMessage("")
                                    setErrorMessage("CashApp Payment failed try again with other method!")
                                    const url = new URL(window.location.href);
                                    url.searchParams.delete("cash_request_id");
                                    window.history.replaceState({}, "", url);
                                }
                            },
                        }} />
                        <ApplePay />
                        <GooglePay />

                        <CreditCard>
                            <Flex
                                flexDir="row"
                                gap={2}
                                align="center"
                                justify="center"
                            >
                                {loading && <Spinner />}
                                <Text fontWeight="medium">
                                    {message ? message : `Pay $${amount}`}
                                </Text>
                            </Flex>
                        </CreditCard>
                    </Flex>
                </PaymentForm>

                {errorMessage && (
                    <Text color="red.500" mt={4} textAlign="center">
                        {errorMessage}
                    </Text>
                )}
            </Box>
        </Flex>
    );

}

export default SquareCheckout

