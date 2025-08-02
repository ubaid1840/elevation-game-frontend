"use client";
import SquareCheckout from "@/components/square/checkout";
import useCheckSession from "@/lib/checkSession";
import { UserContext } from "@/store/context/UserContext";
import { Box, Center, Heading, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";

export default function Page() {
  const checkSession = useCheckSession();
  const { state: UserState, setUser } = useContext(UserContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
        router.replace(`/${UserState.value.data.role}`);
      }
    }
  }, [UserState.value.data]);

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
              plan={"trivia"}
            />
          )
        )}
      </Center>
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
