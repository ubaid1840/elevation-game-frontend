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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Link } from "@chakra-ui/next-js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false); 

  useEffect(() => {
    setIsEmailValid(email.includes("@") && email.includes("."));
  }, [email]);

  async function handleReset() {
  
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
