"use client";
import SquareCheckout from "@/components/square/checkout";
import useCheckSession from "@/lib/checkSession";
import { UserContext } from "@/store/context/UserContext";
import { Box, Center, Heading, Spinner, useToast } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";

export default function Page() {
  const checkSession = useCheckSession();
  const { state: UserState, setUser } = useContext(UserContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();

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
      if (allParams.p && allParams.g) {
        checkPayment(Number(allParams.p), Number(allParams.g))
      } else {
        router.replace(`/${UserState.value.data.role}`);
      }
    }
  }, [UserState.value.data]);

  async function checkPayment(fee, gid) {

    try {
      const response = await axios.get(`/api/checkpayment?type=elevator&uid=${UserState.value.data?.id}&gid=${gid}`)
      if (response?.data?.status) {
        router.replace(`/${UserState.value.data.role}/elevator/enrolledgames/${gid}`);
      }
    } catch (error) {

      toast({
        title: "Error",
        description: "Error checking payment status, refresh page",
        status: "error",
        duration: 3000,
        isClosable: true,
      });

    } finally {
      setData({ fee, gid })
      setLoading(false)
    }

  }

 

  const RenderCheckout = useCallback(() => {
    return (
      <Center mt={10}>
        {loading ? (
          <Spinner />
        ) : (
          UserState.value.data?.email && (
            <SquareCheckout
              user={UserState.value.data}
              amount={data?.fee}
              gameId={data?.gid}
              plan={"elevator"}
            />
          )
        )}
      </Center>
    );
  }, [data, loading]);

  return (
    <Box p={8} maxWidth="1200px" mx="auto">
      <Heading mb={8} textAlign="center">
        Elevator Game fee
      </Heading>

      <RenderCheckout />
    </Box>
  );
}
