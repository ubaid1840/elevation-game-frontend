"use client";
import React from "react";
import {
  Box,
  Heading,
  Stack,
  Text,
  Button,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import { useRouter } from "next/navigation";

// Sample data for participant's enrolled games
const participantGamesData = [
  {
    id: 1,
    title: "Game Idea 1",
    currentRound: 2,
  },
  {
    id: 2,
    title: "Game Idea 2",
    currentRound: 1,
  },
  {
    id: 3,
    title: "Game Idea 3",
    currentRound: 4,
  },
  {
    id: 4,
    title: "Game Idea 4",
    currentRound: 3,
  },
];

export default function Page() {
  const router = useRouter();

  // Function to handle view details button click
  const handleViewDetails = (gameId) => {
    console.log(`View details for Game ID: ${gameId}`);
    router.push("/user/enrolledgames/singlegame");
  };

  // Define color values
  const bgColor = useColorModeValue("white", "gray.800");
  const cardBgColor = useColorModeValue("gray.50", "gray.700");
  const cardHoverBgColor = useColorModeValue("purple.50", "purple.600");
  const borderColor = useColorModeValue("purple.300", "purple.500");

  return (
    <Sidebar LinkItems={GetLinkItems("user")}>
      <Box p={8} bg={bgColor}>
        <Heading mb={6} color="purple.700">Your Enrolled Games</Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          {participantGamesData.map((game) => (
            <Box
              key={game.id}
              borderWidth="1px"
              borderRadius="md"
              p={4}
              transition="0.3s"
              _hover={{
                boxShadow: "lg",
                transform: "scale(1.02)",
                bg: cardHoverBgColor,
              }}
              bg={cardBgColor}
              borderColor={borderColor}
            >
              <Stack spacing={2}>
                <Heading size="md" color="purple.600">{game.title}</Heading>
                <Text color="purple.500">Current Round: {game.currentRound}</Text>
              </Stack>
              <Button
                colorScheme="purple"
                mt={4}
                onClick={() => handleViewDetails(game.id)}
                variant="solid"
                size="md"
                _focus={{ boxShadow: "outline" }} // Add focus styles for accessibility
              >
                View Details
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Sidebar>
  );
}
