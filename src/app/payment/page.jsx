"use client";
import CheckoutPage from "@/components/stripe/Checkout";
import useCheckSession from "@/lib/checkSession";
import convertToSubcurrency from "@/lib/ConvertToSubcurrency";
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
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function Page() {
  const [packages, setPackages] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [amount, setAmount] = useState(null);
  const [subscriptionOptions, setSubscriptionOptions] = useState([]);
  const [currentPlan, setCurrentPlan] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();
  const checkSession = useCheckSession();
  const { state: UserState, setUser } = useContext(UserContext);
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
    }).finally(()=>{
      setLoading(false)
    })

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

  const handlePlanChange = (value) => {
    setSelectedPlan(value);
    const temp = subscriptionOptions.filter((item) => item.label === value);
    setAmount(temp[0].price);
  };

  async function handlePackageSelect(pkg) {
    setSelectedPlan(pkg.label);
    setAmount(pkg.price);
  }

  const RenderCheckout = useCallback(() => {
    return (
      <Box maxW={"500px"} mt={10}>
        {amount && UserState.value.data?.email && selectedPlan && (
          <Elements
            stripe={stripePromise}
            options={{
              mode: "payment",
              amount: convertToSubcurrency(amount),
              currency: "usd",
            }}
          >
            <CheckoutPage
              amount={amount}
              userID={UserState.value.data?.id}
              plan={selectedPlan}
            />
          </Elements>
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
              lg: "repeat(4, 1fr)",
            }}
            gap={6}
          >
            {packages.map((pkg) => (
              // pkg.label !== 'Silver' &&
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
