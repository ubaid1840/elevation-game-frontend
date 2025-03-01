"use client";

import {
  Button,
  FormControl,
  Flex,
  Input,
  Stack,
  Text,
  useColorModeValue,
  useToast,
  Box,
  FormLabel,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link } from "@chakra-ui/next-js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/config/firebase";
import useCheckSession from "@/lib/checkSession";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const toast = useToast();
  const checkSession = useCheckSession();

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
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      if (unsubscribe) {
        unsubscribe();  // Cleanup on unmount
      }
    };
  }, []);

  useEffect(() => {
    setIsEmailValid(email.includes("@") && email.includes("."));
  }, [email]);

  async function handleReset() {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        toast({
          title: "Email sent",
          description: "Please check your email for password reset link.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((e) => {
        toast({
          title: "Error",
          description: "Failed to send link. Please try again",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <>
      <Header />
      <Flex
        minH={"100vh"}
        align={"center"}
        justify={"center"}
        bg={useColorModeValue("gray.900", "gray.800")}
        px={4}
      >
        <Box
          maxW={"lg"}
          w={"full"}
          bg={useColorModeValue("gray.800", "gray.700")}
          boxShadow={"2xl"}
          rounded={"lg"}
          p={8}
        >
          <Stack spacing={3}>
            <FormControl id="email" isRequired>
              <FormLabel fontSize={"15px"} color={"gray.400"}>
                Email
              </FormLabel>
              <Input
                color="gray.400"
                placeholder="youremail@example.com"
                borderRadius={"2px"}
                border={"1px solid"}
                borderColor={"#484848"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                bg={"gray.800"}
                _placeholder={{ color: "gray.500" }}
                _focus={{ borderColor: "purple.400" }}
              />
            </FormControl>

            <Stack mt={5}>
              <Button
                isLoading={loading}
                borderRadius={"2px"}
                colorScheme={"purple"}
                isDisabled={!isEmailValid}
                onClick={() => {
                  setLoading(true);
                  handleReset();
                }}
                size="lg"
                w="full"
              >
                Reset
              </Button>
            </Stack>
          </Stack>
          <Stack align={"center"} mt={6}>
            <Text color={"gray.300"}>
              Already a user?{" "}
              <Link
                href="/login"
                color={"purple.400"}
                _hover={{ color: "purple.600" }}
              >
                Login
              </Link>
            </Text>
          </Stack>
        </Box>
      </Flex>
      <Footer />
    </>
  );
}
