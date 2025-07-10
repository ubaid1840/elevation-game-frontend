"use client";
import SquareCheckout from "@/components/square/checkout";
import useCheckSession from "@/lib/checkSession";
import { UserContext } from "@/store/context/UserContext";
import { Box, Heading } from "@chakra-ui/react";
import { useCallback, useContext, useEffect } from "react";


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
          
            <SquareCheckout
              amount={750}
              user={UserState.value.data}
              plan={"Promotion"}
            />
        
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
