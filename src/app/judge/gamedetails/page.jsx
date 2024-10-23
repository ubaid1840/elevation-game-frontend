"use client";
import React from "react";
import {
  Box,
  Heading,
  Stack,
  Text,
  Divider,
  useColorModeValue,
  SimpleGrid,
} from "@chakra-ui/react";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import { useRouter } from "next/navigation";

// Sample data for unfinished games
const unfinishedGamesData = [
  {
    id: 1,
    title: "Game Idea 1",
    participants: 5,
    entryLevelPrize: "$100",
    currentRound: 2,
    totalRounds: 5,
    totalJudges: 3,
  },
  {
    id: 2,
    title: "Game Idea 2",
    participants: 3,
    entryLevelPrize: "$150",
    currentRound: 1,
    totalRounds: 4,
    totalJudges: 2,
  },
  // Add more unfinished games as needed
];

export default function Page() {
  const cardBg = useColorModeValue("gray.100", "gray.700");
  const cardHoverBg = useColorModeValue("purple.50", "purple.600");
  const router = useRouter()
  const handleGameClick = (gameId) => {
    console.log(`Game ID: ${gameId} clicked`);
    router.push("/judge/gamedetails/singlegame")
  };

  return (
    <Sidebar LinkItems={GetLinkItems("judge")}>
      <Box p={8} bg="white">
        <Heading mb={6} color="purple.700">Games Details</Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {unfinishedGamesData.map((game) => (
            <Box
              key={game.id}
              mb={6}
              borderWidth="1px"
              borderRadius="md"
              p={4} // Reduced padding for a smaller card
              cursor="pointer"
              transition="0.2s ease-in-out"
              bg={cardBg}
              boxShadow="lg"
              _hover={{
                boxShadow: "xl",
                transform: "scale(1.03)",
                bg: cardHoverBg,
              }}
              onClick={() => handleGameClick(game.id)}
            >
              <Stack spacing={3}>
                <Heading size="md" color="purple.800">{game.title}</Heading>
                <Divider />
                <Text fontWeight="bold" color="purple.700">Total Participants: {game.participants}</Text>
                <Text fontWeight="bold" color="purple.700">Entry Level Prize: {game.entryLevelPrize}</Text>
                <Text fontWeight="bold" color="purple.700">Current Round: {game.currentRound} / {game.totalRounds}</Text>
                <Text fontWeight="bold" color="purple.700">Total Judges: {game.totalJudges}</Text>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Sidebar>
  );
}
