"use client";

import SquareCheckout from "@/components/square/checkout";
import { db } from "@/config/firebase";
import useCheckSession from "@/lib/checkSession";
import { UserContext } from "@/store/context/UserContext";
import { debounce } from "@/utils/debounce";
import { Box, Center, Flex, Heading, Spinner, useToast } from "@chakra-ui/react";
import axios from "axios";
import { addDoc, collection } from "firebase/firestore";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";
import { CashAppPay, PaymentForm } from "react-square-web-payments-sdk";

export default function Page() {
  const { state: UserState, setUser } = useContext(UserContext);
  const [continueUrl, setContinueUrl] = useState(false)
  const checkSession = useCheckSession();
  const router = useRouter()
  const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID;
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
  const [errorMessage, setErrorMessage] = useState()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const toast = useToast()

  useEffect(() => {
    const continueURL = new URLSearchParams(window.location.search).get(
      "continueURL"
    );

    if (continueURL && UserState.value.data?.id) {
      console.log(continueURL)
      setContinueUrl(continueURL)
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


  async function handlePayment(token) {
    console.log(token)
  }

  return (

    <Flex minH={"100vh"} minW={"100vw"}>
      <Center flexDir={"column"} minH={"100vh"} minW={"100vw"}>
        {!continueUrl ? (
          <Spinner />
        ) : (
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


                  <CashAppPay redirectURL={`${window.location.origin}/cashapp-payment?continueURL=${window.location.pathname}`} width="full" callbacks={{
                    onTokenization: (event) => {
                      if (event.detail.tokenResult.status === 'OK') {
                        setLoading(true)
                        setMessage("Processing payment ")
                        console.log(event.detail.tokenResult.token)
                        // handlePaymentCashApp(event.detail.tokenResult.token)
                      } else {
                        setErrorMessage("CashApp Payment failed")
                      }
                    },
                  }} />

                </Flex>
              </PaymentForm>

              {errorMessage && (
                <Flex dir="column" gap={2}>

                  <Text color="red.500" mt={4} textAlign="center">
                    {errorMessage}
                  </Text>
                  <Link href={continueUrl || "#"}>
                    <Button >
                      Continue
                    </Button>
                  </Link>
                </Flex>
              )}
            </Box>
          </Flex>
        )}
      </Center>
    </Flex>
  );
}
