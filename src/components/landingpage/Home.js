"use client"
import {
  Container,
  Img,
  Text,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import Button from "../ui/Button";
import Link from "next/link";

export default function HomePage() {
  const logoSize = useBreakpointValue({ base: "150px", md: "250px", lg: "300px" });

  return (
    <Container
      as="section"
      id="home"
      maxW="100%"
      minH="100vh"
      bgImage="/home.jpg"
      bgSize="cover"
      bgPosition="center"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDir="column"
      px={4}
      py={8}
    >
      <VStack
        align="center"
        justify="center"
        textAlign="center"
        spacing={{ base: 6, md: 10 }}
        w="100%"
        my={{ base: 5, md: 10, lg: 20 }} 
        px={{ base: 5, md: 10, lg: 20 }}
      >
        <Text
          fontSize={{ sm : "xl", base: "4xl", md: "6xl", lg: "8xl" }}
          color="white"
          fontWeight="bold"
        >
          THE GAME OF CHALLENGES
        </Text>

        <VStack spacing={{ base: 4, md: 8 }} >
          <Text fontSize={{ base: "md", md: "xl", lg: "2xl" }} color="white" maxW="800px">
            Join the Virtual Three-Minute Elevator Pitch and compete for exciting prizes!
          </Text>

          <Img
            src="/logo.png"
            height={logoSize}
            maxH="300px"
            alt="Challenge Logo"
            objectFit="contain"
          />

          <Button size="lg" as={Link} href="/login">
            GET STARTED
          </Button>
        </VStack>
      </VStack>
    </Container>
  );
}
