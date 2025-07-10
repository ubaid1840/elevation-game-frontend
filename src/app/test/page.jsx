"use client";
import axios from "@/lib/axiosInstance";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { CreditCard, PaymentForm } from "react-square-web-payments-sdk";

export default function Home() {
  const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID;
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

  async function handlePayment(token) {
    axios
      .post("/api/square", { token: token })
      .then((response) => {
        console.log(response.data);
      })
      .catch((e) => {
        console.log(e?.message);
      });
  }

  async function handleVerify() {
    axios
      .post("/api/square/verify", {
        paymentId: "BGNtMYoaTmDy9UWqx6jy7pzaLQfZY",
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((e) => {
        console.log(e?.response?.data?.message);
      });
  }

  return (
    <Flex alignItems={"center"} justifyContent={"center"} height={"100vh"} flexDir={'column'} gap={5}>
      <PaymentForm
        applicationId={appId}
        locationId={locationId}
        cardTokenizeResponseReceived={async (token) => {
          handlePayment(token.token);
        }}
      >
        <CreditCard >
          <Text>Pay 10$</Text>
        </CreditCard>
      </PaymentForm>
      <Box>
        <Button onClick={handleVerify}>
          <Text>Verify Payment</Text>
        </Button>
      </Box>
    </Flex>
  );
}
