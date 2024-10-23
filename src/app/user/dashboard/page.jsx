"use client";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import {
  Box,
  Heading,
  Text,
  Button,
  Grid,
  GridItem,
  Badge,
  VStack,
  Divider,
  HStack,
  Input,
} from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";

export default function Page() {
  // Dummy data for My Games and Available Games
  const myGames = [
    { title: "Pitch Challenge 1", status: "In Progress" },
    { title: "Pitch Challenge 2", status: "Completed" },
  ];

  const availableGames = [
    { title: "Pitch Challenge 3", spotsRemaining: 5, level: "Beginner" },
    { title: "Pitch Challenge 4", spotsRemaining: 2, level: "Intermediate" },
  ];

  const [referralCode] = useState("XYZ123");
  const [referralCount] = useState(10);
  const [residualIncome] = useState(150); // in dollars

  return (
    <Sidebar LinkItems={GetLinkItems("user")}>
    <Box p={8}   bg="white">
      {/* Welcome Banner */}
      <Box
        bgGradient="linear(to-r, purple.600, purple.400)"
        color="white"
        p={8}
        borderRadius="lg"
        boxShadow="md"
        mb={8}
      >
        <Heading>Welcome, John!</Heading>
        <Text mt={4} fontSize="lg">
         {`Here's a quick look at your game progress and referral stats.`}
        </Text>
      </Box>

      {/* My Games Section */}
      <VStack align="start" spacing={6} mb={8}>
        <Heading size="lg" color="purple.700">My Games</Heading>
        <Grid templateColumns="repeat(3, 1fr)" gap={6}>
          {myGames.map((game, index) => (
            <GridItem
              key={index}
              p={6}
              bg="gray.100"
              borderRadius="lg"
              boxShadow="md"
              transition="transform 0.2s"
              _hover={{ transform: "scale(1.05)", boxShadow: "xl" }}
            >
              <Heading size="md" mb={2}>{game.title}</Heading>
              <Badge
                colorScheme={game.status === "Completed" ? "green" : "yellow"}
                variant="solid"
                fontSize="1rem"
              >
                {game.status}
              </Badge>
            </GridItem>
          ))}
        </Grid>
      </VStack>

      <Divider borderColor="gray.300" />

      {/* Enroll in a Game Section */}
      <VStack align="start" spacing={6} mt={8} mb={8}>
        <Heading size="lg" color="purple.700">Enroll in a Game</Heading>
        <Grid templateColumns="repeat(3, 1fr)" gap={6}>
          {availableGames.map((game, index) => (
            <GridItem
              key={index}
              p={6}
              bg="gray.100"
              borderRadius="lg"
              boxShadow="md"
              transition="transform 0.2s"
              _hover={{ transform: "scale(1.05)", boxShadow: "xl" }}
            >
              <Heading size="md" mb={2}>{game.title}</Heading>
              <Text fontSize="lg">Spots Remaining: {game.spotsRemaining}</Text>
              <Text fontSize="lg">Entry Level: {game.level}</Text>
              <Button
              as={Link}
              href={"dashboard/enrollment"}
                mt={4}
                colorScheme="purple"
                variant="solid"
                size="md"
                _hover={{ bg: "purple.600" }}
              >
                Enroll
              </Button>
            </GridItem>
          ))}
        </Grid>
      </VStack>

      <Divider borderColor="gray.300" />

      {/* Referral Program Section */}
      <VStack align="start" spacing={6} mt={8}>
        <Heading size="lg" color="purple.700">Referral Program</Heading>
        <HStack>
          <Text fontSize="lg" fontWeight="bold">Referral Code:</Text>
          <Input value={referralCode} readOnly size="md" width="auto" borderColor="purple.400" />
        </HStack>
        <Text fontSize="lg">Number of Referrals: {referralCount}</Text>
        <Text fontSize="lg">Residual Income Earned: ${residualIncome}</Text>
      </VStack>
    </Box></Sidebar>
  );
}
