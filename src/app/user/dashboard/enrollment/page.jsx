"use client";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import {
  Box,
  Heading,
  Text,
  Grid,
  GridItem,
  VStack,
  HStack,
  Select,
  Button,
  Badge,
  Divider,
  Input,
  Stack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GameEnrollmentPage() {
  const router = useRouter();
  // Dummy data for game details
  const gameDetails = {
    title: "Pitch Challenge",
    category: "Strategy",
    description: "Compete in a thrilling strategic pitch battle.",
    levels: [
      {
        level: "Beginner",
        games: [
          { title: "Pitch Challenge 1", prize: "$100", spotsRemaining: 10 },
          { title: "Pitch Challenge 2", prize: "$120", spotsRemaining: 5 },
        ],
      },
      {
        level: "Intermediate",
        games: [
          { title: "Pitch Challenge 3", prize: "$500", spotsRemaining: 3 },
        ],
      },
      {
        level: "Advanced",
        games: [
          { title: "Pitch Challenge 4", prize: "$1000", spotsRemaining: 2 },
        ],
      },
    ],
  };

  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const handleLevelChange = (e) => {
    setSelectedLevel(e.target.value);
    setSelectedGame(""); // Reset game when level changes
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function handleEnroll() {
    router.push("/user/dashboard/enrollment/recording");
  }

  return (
    <Sidebar LinkItems={GetLinkItems("user")}>
      <Box p={8} bg="white">
        {/* Game Details Section */}
        <Box bg="purple.50" p={6} borderRadius="lg" boxShadow="md" mb={8}>
          <Heading size="lg" mb={4}>
            {gameDetails.title}
          </Heading>
          <Text fontSize="lg" color="gray.600" mb={4}>
            Category: {gameDetails.category}
          </Text>
          <Text fontSize="md" color="gray.600" mb={4}>
            {gameDetails.description}
          </Text>
        </Box>

        <Divider />

        {/* Enrollment Form Section */}
        <VStack align="start" spacing={6} mt={8}>
          <Heading size="lg" color="purple.700">
            Enroll in the Game
          </Heading>

          {/* Select Entry Level */}
          <Text fontWeight="bold" fontSize="lg">
            Choose Entry Level:
          </Text>
          <Select
            placeholder="Select level"
            value={selectedLevel}
            onChange={handleLevelChange}
            bg="white"
            borderColor="purple.400"
            size="lg"
            mb={4}
          >
            {gameDetails.levels.map((level, index) => (
              <option key={index} value={level.level}>
                {level.level}
              </option>
            ))}
          </Select>

          {/* Entry Level Cards */}
          <Grid
            templateColumns={{
              base: "repeat(1, 1fr)",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap={6}
            width="100%"
          >
            {gameDetails.levels.map((level, index) => (
              <GridItem
                key={index}
                p={6}
                bg="gray.100"
                borderRadius="lg"
                boxShadow="md"
                transition="transform 0.2s"
                _hover={{ transform: "scale(1.05)", boxShadow: "xl" }}
              >
                <Heading size="md" mb={2}>
                  {level.level}
                </Heading>
                <Text fontSize="lg" mb={2}>
                  Games:
                </Text>
                {level.games.map((game, gameIndex) => (
                  <HStack key={gameIndex} justifyContent="space-between" mb={2}>
                    <Text fontSize="md">{game.title}</Text>
                    <Badge colorScheme="green" variant="solid" fontSize="1rem">
                      {game.spotsRemaining} Spots
                    </Badge>
                  </HStack>
                ))}
              </GridItem>
            ))}
          </Grid>

          {/* Select Game based on the selected entry level */}
          {selectedLevel &&
            gameDetails.levels
              .find((l) => l.level === selectedLevel)
              ?.games.map((game, index) => (
                <HStack spacing={4} w="100%" key={index}>
                  <Button
                    onClick={() => setSelectedGame(game.title)}
                    variant="outline"
                    colorScheme="purple"
                    flex="1"
                    mb={2}
                  >
                    {game.title} - {game.prize} - Spots Remaining:{" "}
                    {game.spotsRemaining}
                  </Button>
                </HStack>
              ))}

          {/* Payment Details */}
          {selectedGame && (
            <Stack spacing={4} w="100%" mt={4}>
              <Heading size="md" color="purple.600">
                Payment Details
              </Heading>
              <Input
                placeholder="Card Number"
                name="cardNumber"
                value={paymentDetails.cardNumber}
                onChange={handlePaymentChange}
                size="lg"
                bg="white"
                borderColor="purple.400"
              />
              <HStack>
                <Input
                  placeholder="Expiry Date (MM/YY)"
                  name="expiryDate"
                  value={paymentDetails.expiryDate}
                  onChange={handlePaymentChange}
                  size="lg"
                  bg="white"
                  borderColor="purple.400"
                />
                <Input
                  placeholder="CVV"
                  name="cvv"
                  value={paymentDetails.cvv}
                  onChange={handlePaymentChange}
                  size="lg"
                  bg="white"
                  borderColor="purple.400"
                />
              </HStack>

              {/* Enroll Button */}
              <Button
                onClick={() => {
                  handleEnroll();
                }}
                colorScheme="purple"
                size="lg"
                width="full"
                mt={8}
                _hover={{ bg: "purple.600" }}
                isDisabled={!selectedGame} // Disable if no game is selected
              >
                Enroll Now
              </Button>
            </Stack>
          )}
        </VStack>
      </Box>
    </Sidebar>
  );
}
