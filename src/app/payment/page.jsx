"use client";
import SquareCheckout from "@/components/square/checkout";
import useCheckSession from "@/lib/checkSession";
import { UserContext } from "@/store/context/UserContext";
import {
  Box,
  Button,
  Center,
  Grid,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { useCallback, useContext, useEffect, useState } from "react";


export default function Page() {
  const [packages, setPackages] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [amount, setAmount] = useState(null);
  const checkSession = useCheckSession();
  const { state: UserState, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;

    checkSession()
      .then((res) => {
        if (res.error) {
          console.log(res.error);
        }
        if (typeof res === "function") {
          unsubscribe = res;
        }
        if (res.user) {
          setUser(res.user);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    axios.get("/api/settings").then((response) => {
      const temp = [...response.data];
      temp.sort((a, b) => a.price - b.price);
      setPackages([...temp]);
    });
  }

 
  async function handlePackageSelect(pkg) {
    setSelectedPlan(pkg.label);
    setAmount(pkg.price);
  }

  const RenderCheckout = useCallback(() => {
    return (
      <Box maxW={"500px"} mt={10}>
        {amount && UserState.value.data?.email && selectedPlan && (
          <SquareCheckout
            amount={amount}
            user={UserState.value.data}
            plan={selectedPlan}
          />
        )}
      </Box>
    );
  }, [amount]);

  return (
    <Box p={8} maxWidth="1200px" mx="auto">
      {loading ? (
        <Center>
          <Spinner />
        </Center>
      ) : (
        <>
          <Heading mb={8} textAlign="center">
            Choose Your Package
          </Heading>
          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap={6}
          >
            {packages.map((pkg) => (
            
              <Box
                key={pkg.label}
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                p={6}
                textAlign="center"
                boxShadow="lg"
              >
                <VStack spacing={3}>
                  <Heading size="md">{pkg.label}</Heading>
                  <Text fontSize="xl" fontWeight="bold">
                    ${pkg.price}
                  </Text>
                  <Button
                    onClick={() => handlePackageSelect(pkg)}
                    colorScheme="teal"
                    variant="solid"
                  >
                    Select
                  </Button>
                </VStack>
              </Box>
            ))}
          </Grid>
        </>
      )}

      <RenderCheckout />
    </Box>
  );
}
