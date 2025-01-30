"use client";
import CheckoutPage from "@/components/stripe/Checkout";
import useCheckSession from "@/lib/checkSession";
import convertToSubcurrency from "@/lib/ConvertToSubcurrency";
import { UserContext } from "@/store/context/UserContext";
import { Box, Heading } from "@chakra-ui/react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useCallback, useContext, useEffect, useState } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function Page() {
  const checkSession = useCheckSession();
  const { state: UserState, setUser } = useContext(UserContext);
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

  const RenderCheckout = useCallback(() => {
    return (
      <Box maxW={"500px"} mt={10}>
        {UserState.value.data?.email && (
          <Elements
            stripe={stripePromise}
            options={{
              mode: "payment",
              amount: convertToSubcurrency(750),
              currency: "usd",
            }}
          >
            <CheckoutPage
              amount={750}
              userID={UserState.value.data.id}
              plan={"Promotion"}
            />
          </Elements>
        )}
      </Box>
    );
  }, [UserState.value.data]);

  return (
    <Box p={8} maxWidth="1200px" mx="auto">
      <Heading mb={8} textAlign="center">
        Judge Annual Fee
      </Heading>

      <RenderCheckout />
    </Box>
  );
}
