"use client";
import { auth } from "@/config/firebase";
import { Box, Heading, Text, Button, VStack } from "@chakra-ui/react";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <Box
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bg={"white"}
      color="white"
      textAlign="center"
    >
      <VStack
        spacing={6}
        p={8}
        bg="rgba(0, 0, 0, 0.7)"
        borderRadius="lg"
        boxShadow="lg"
        maxWidth="400px"
        w="90%"
      >
        <Heading fontSize="2xl">Access Blocked</Heading>
        <Text fontSize="lg">
          You have been blocked by the admin. Kindly contact support for more
          information on support@example.com
        </Text>

        <Link href={"/"}>
          <Button colorScheme="blue" variant="solid" onClick={()=>{
            signOut(auth)
            router.push("/")
          }}>
            Home
          </Button>
        </Link>
      </VStack>
    </Box>
  );
}
