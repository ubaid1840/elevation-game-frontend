"use client";
import CheckoutPage from "@/components/stripe/Checkout";
import useCheckSession from "@/lib/checkSession";
import convertToSubcurrency from "@/lib/ConvertToSubcurrency";
import { UserContext } from "@/store/context/UserContext";
import { Box, Center, Heading, Spinner } from "@chakra-ui/react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { redirect } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function Page() {
  const checkSession = useCheckSession();
  const { state: UserState, setUser } = useContext(UserContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (UserState.value.data?.id) {
      const params = new URLSearchParams(window.location.search);
      const allParams = Object.fromEntries(params.entries());
      if (allParams.fee && allParams.g) {
        setData({ fee: Number(allParams.fee), gid: Number(allParams.g) });
        setLoading(false);
      } else {
        redirect(`/${UserState.value.data.role}`);
      }
    }
  }, [UserState.value.data]);

  const RenderCheckout = useCallback(() => {
    return loading ? (
      <Box maxW={"500px"} mt={10}>
        <Spinner />
      </Box>
    ) : (
      <Box maxW={"500px"} mt={10}>
        {UserState.value.data?.email && (
          <Elements
            stripe={stripePromise}
            options={{
              mode: "payment",
              amount: convertToSubcurrency(data?.fee),
              currency: "usd",
            }}
          >
            <CheckoutPage
              amount={data?.fee}
              gameId={data?.gid}
              plan={"trivia"}
            />
          </Elements>
        )}
      </Box>
    );
  }, [data]);

  return (
    <Box p={8} maxWidth="1200px" mx="auto">
      <Heading mb={8} textAlign="center">
        Trivia Game fee
      </Heading>

      <RenderCheckout />
    </Box>
  );
}
