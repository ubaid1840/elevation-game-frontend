"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  Text,
  useToast,
  Flex,
  Stack,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  Icon,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { Link } from "@chakra-ui/next-js";

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  useEffect(() => {
    setIsEmailValid(email.includes("@") && email.includes("."));
    setIsPasswordValid(password.length > 5);
  }, [email, password]);

  const handleLogin = async () => {
   
  };

  return (
    <div>
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
                onChange={(e) => setemail(e.target.value)}
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
                      _hover={{ opacity: 0.7, cursor:'pointer' }}
                    />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <Link
              fontSize={"14px"}
              href="/forgetpassword"
              textAlign={"right"}
              color={"purple.400"}
              _hover={{ color: "purple.600" }}
            >
              Forgot Password?
            </Link>
            <Stack spacing={6}>
              <Button
                isLoading={loading}
                borderRadius={"2px"}
                colorScheme={"purple"}
                isDisabled={!isEmailValid || !isPasswordValid}
                onClick={() => {
                  setLoading(true);
                  handleLogin();
                }}
                size="lg"
                w="full"
              >
                Sign in
              </Button>
            </Stack>
          </Stack>
          <Stack align={"center"} mt={6}>
            <Text color={"gray.300"}>
              Need an account?{" "}
              <Link
                href="/signup"
                color={"purple.400"}
                _hover={{ color: "purple.600" }}
              >
                Sign Up
              </Link>
            </Text>
          </Stack>
        </Box>
      </Flex>
    </div>
  );
}