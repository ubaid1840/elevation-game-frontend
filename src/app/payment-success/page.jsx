"use client";

import useCheckSession from "@/lib/checkSession";
import { UserContext } from "@/store/context/UserContext";
import { Button, Center, Flex, Heading, Spinner, Text } from "@chakra-ui/react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";

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
      axios
        .post("/api/verify-payment", {
          paymentIntentId: paymentIntentId,
        })
        .then((response) => {
          if (response.data.plan) {
            handleUpdatePackage(response.data.plan, paymentIntentId);
          }
        })
        .catch((e) => {
          console.log(e);
          setMessage("Payment verification failed");
          callTimeout();
        });
    }
  }, [UserState.value.data]);

  useEffect(() => {
    checkSession().then((val) => {
      setUser(val.user);
    });
  }, []);

  async function handleUpdatePackage(plan, paymentIntentId) {
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 30); 
    axios
      .post(`/api/users/${UserState.value.data.id}/payment`, {
        subscription: plan,
        expiry: currentDate,
        paymentIntentId: paymentIntentId,
      })
      .then((response) => {
        if (response.data.success) {
          setMessage("Payment Verified Updating Record");
          axios
            .post("/api/updatetier", {
              user_id: UserState.value.data.id,
              plan: plan,
              intent_id : UserState.value.data?.package_intent_id || null
            })
            .then(() => {
              callTimeout();
            })
            .catch((e) => {
              setMessage("Something went wrong, refresh the page");
              console.log(e);
            });
        } else {
          setMessage("Payment Verified");
          callTimeout();
        }
      })
      .catch((e) => {
        console.log(e);
        setMessage(e.response.data.message);
      })
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
