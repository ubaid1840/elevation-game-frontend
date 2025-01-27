"use client";

import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Button,
  Text,
  useColorModeValue,
  useToast,
  Icon,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";
import { Link } from "@chakra-ui/next-js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useCheckSession from "@/lib/checkSession";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/config/firebase";
import axios from "axios";

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [referral, setReferral] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const checkSession = useCheckSession();
  const router = useRouter();
  const toast = useToast()  

  useEffect(() => {
    try {
      checkSession().then((res) => {
        if (res.error) {
          console.log(res.error);
        }
        setLoading(false);
      });
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsEmailValid(email.includes("@") && email.includes("."));
    setIsPasswordValid(password.length > 5);
  }, [email, password]);

  const handleSignup = async () => {
    axios
      .post("/api/users", {
        email: email.toLocaleLowerCase(),
        name: name,
        role: "user",
        refered_by: referral,
        schedule: [],
      })
      .then(() => {
        createUserWithEmailAndPassword(auth, email.toLocaleLowerCase(), password).catch((e) => {
          setLoading(false);
          toast({
            title: "Error",
            description: e?.message,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
      })
      .catch((e) => {
        setLoading(false);
        toast({
          title: "Error",
          description: e?.response?.data?.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

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
          {/* <Stack align={"center"} mb={6}>
          <Heading fontSize={"xl"} color={"white"}>
            AIIQ Admin panel sign Up
          </Heading>
        </Stack> */}
          <Stack spacing={3}>
            <FormControl id="name" isRequired>
              <FormLabel fontSize={"15px"} color={"gray.400"}>
                Name
              </FormLabel>
              <Input
                color="gray.400"
                placeholder="John Doe"
                borderRadius={"2px"}
                border={"1px solid"}
                borderColor={"#484848"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                bg={"gray.800"}
                _placeholder={{ color: "gray.500" }}
                _focus={{ borderColor: "purple.400" }}
              />
            </FormControl>
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
                onChange={(e) => setEmail(e.target.value.toLocaleLowerCase())}
                type="email"
                bg={"gray.800"}
                _placeholder={{ color: "gray.500" }}
                _focus={{ borderColor: "purple.400" }}
              />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel fontSize={"15px"} color={"gray.400"}>
                Password
              </FormLabel>
              <InputGroup>
                <Input
                  color="gray.400"
                  placeholder="Please enter at least 7 characters"
                  borderRadius={"2px"}
                  border={"1px solid"}
                  borderColor={"#484848"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  bg={"gray.800"}
                  _placeholder={{ color: "gray.500" }}
                  _focus={{ borderColor: "purple.400" }}
                />
                <InputRightElement h={"full"}>
                  <Icon
                    as={showPassword ? ViewIcon : ViewOffIcon}
                    color={"white"}
                    onClick={() => setShowPassword(!showPassword)}
                    _hover={{ opacity: 0.7, cursor: "pointer" }}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <FormControl id="referral">
              <FormLabel fontSize={"15px"} color={"gray.400"}>
                Referral
              </FormLabel>
              <Input
                color="gray.400"
                placeholder="Default"
                borderRadius={"2px"}
                border={"1px solid"}
                borderColor={"#484848"}
                value={referral}
                onChange={(e) => setReferral(e.target.value)}
                type="text"
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
                isDisabled={!isEmailValid || !isPasswordValid}
                onClick={() => {
                  setLoading(true);
                  handleSignup();
                }}
                size="lg"
                w="full"
              >
                Sign Up
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
