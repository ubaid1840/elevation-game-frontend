"use client";

import { db } from "@/config/firebase";
import useCheckSession from "@/lib/checkSession";
import { UserContext } from "@/store/context/UserContext";
import { debounce } from "@/utils/debounce";
import { Button, Center, Flex, Heading, Spinner, Text } from "@chakra-ui/react";
import axios from "axios";
import { addDoc, collection } from "firebase/firestore";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";

export default function Page() {
  const { state: UserState, setUser } = useContext(UserContext);
  const [message, setMessage] = useState("Verifying Payment");
  const checkSession = useCheckSession();
  const router = useRouter();

  useEffect(() => {
    const paymentIntentId = new URLSearchParams(window.location.search).get(
      "payment_intent"
    );
    if (paymentIntentId && UserState.value.data?.id) {
      fetchPaymentVerification(paymentIntentId);
    }
  }, [UserState.value.data]);

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
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const fetchPaymentVerification = useCallback(
    debounce((paymentIntentId) => {
      axios
        .post("/api/verify-payment", { paymentIntentId })
        .then((response) => {
          if (response.data.plan) {
            if (response.data.plan == "trivia") {
              const gameId = new URLSearchParams(window.location.search).get(
                "g"
              );
              if (gameId) {
                handleUpdateTriviaPayment(paymentIntentId, Number(gameId));
              } else {
                setMessage("Game not found")
                callTimeout()
              }
            } else {
              handleUpdatePackage(response.data.plan, paymentIntentId);
            }
          }
        })
        .catch((e) => {
          console.log(e);
          setMessage("Payment verification failed");
          callTimeout();
        });
    }, 1000),
    []
  );

  async function handleUpdateTriviaPayment(paymentIntent, gid) {
    axios
      .put(
        `/api/trivia/users/${UserState.value.data.id}/games/${gid}/payment`,
        {
          payment_intent_id: paymentIntent,
        }
      )
      .then(async (response) => {
        setMessage("Payment Verified");
        await addDoc(collection(db, "notifications"), {
          to: "admin@gmail.com",
          title: "Trivia Game Payment",
          message: `${
            UserState.value.data?.name || UserState.value.data?.email
          } made payment against trivia game`,
          timestamp: moment().valueOf(),
          status: "pending",
        }).catch((e)=>{
          console.log(e)
        })
        router.push(
          `/${UserState.value.data.role}/trivia/enrolledgames/${gid}`
        );
      })
      .catch((e) => {
        console.log(e)
        setMessage(e?.response?.data?.message || e?.message);
      });
  }

  async function handleUpdatePackage(plan, paymentIntentId) {
    let currentDate = new Date();
    if (plan == "Silver") {
      currentDate.setFullYear(currentDate.getFullYear() + 100);
    } else if (plan == "Promotion") {
      currentDate.setFullYear(currentDate.getFullYear() + 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 30);
    }

    axios
      .post(`/api/users/${UserState.value.data?.id}/payment`, {
        subscription: plan,
        expiry: currentDate,
        paymentIntentId: paymentIntentId,
      })
      .then(async (response) => {
        setMessage("Payment Verified");
        await addDoc(collection(db, "notifications"), {
          to: "admin@gmail.com",
          title: "Payment",
          message: `${
            UserState.value.data?.name || UserState.value.data?.email
          } made payment against ${plan} subscription`,
          timestamp: moment().valueOf(),
          status: "pending",
        });

        callTimeout();
        // if (response.data.success) {
        //   setMessage("Payment Verified Updating Record");
        //   axios
        //     .post("/api/updatetier", {
        //       user_id: UserState.value.data?.id,
        //       plan: plan,
        //       intent_id : UserState.value.data?.package_intent_id || null
        //     })
        //     .then(() => {
        //       callTimeout();
        //     })
        //     .catch((e) => {
        //       setMessage("Something went wrong, refresh the page");
        //       console.log(e);
        //     });
        // } else {
        //   setMessage("Payment Verified");
        //   callTimeout();
        // }
      })
      .catch((e) => {
        console.log(e);
        setMessage(e.response.data.message);
      });
  }

  function callTimeout() {
    setTimeout(() => {
      router.push(`/${UserState.value.data.role}`);
    }, 3000);
  }

  return (
    <Flex minH={"100vh"} minW={"100vw"}>
      <Center flexDir={"column"} minH={"100vh"} minW={"100vw"}>
        {!UserState.value.data?.role ? (
          <Spinner />
        ) : (
          <>
            <Heading>{message}</Heading>
          </>
        )}
      </Center>
    </Flex>
  );
}
