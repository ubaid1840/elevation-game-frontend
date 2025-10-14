"use client";
import { UserContext } from "@/store/context/UserContext";
import {
  Badge,
  Box,
  Button,
  Heading,
  Link,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import axios from "axios";
import moment from "moment";
import { useContext, useEffect, useState } from "react";

export default function Page() {
  const [participantGamesData, setParticipantGamesData] = useState([]);
  const { state: UserState } = useContext(UserContext);

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData();
    }
  }, [UserState.value.data]);

  async function fetchData() {
    axios
      .get(`/api/trivia/users/${UserState.value.data?.id}/games`)
      .then((response) => {
        setParticipantGamesData(response.data.myGames);
      });
  }

  const bgColor = useColorModeValue("white", "gray.800");
  const cardBgColor = useColorModeValue("gray.50", "gray.700");
  const cardHoverBgColor = useColorModeValue("purple.50", "purple.600");
  const borderColor = useColorModeValue("purple.300", "purple.500");

  return (
    <>
      <Box p={8} bg={bgColor}>
        <Heading mb={6} color="purple.700">
          Your Enrolled Games
        </Heading>

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
                <Heading size="md" color="purple.600">
                  {game.title}
                </Heading>
                <Text color="purple.500">
                  Target Close Date:{" "}
                  {moment(new Date(game.deadline)).format("MM/DD/YYYY")}
                </Text>
                <div>
                  <Badge
                    colorScheme={
                      game.status === "COMPLETED" ? "green" : "yellow"
                    }
                    variant="solid"
                    fontSize="1rem"
                  >
                    {game.completed ? "WINNER ANNOUNCED" : "PENDING"}
                  </Badge>
                </div>
              </Stack>
              <Button
                _hover={{ textDecoration: "none" }}
                as={Link}
                href={`/user/trivia/enrolledgames/${game.id}`}
                colorScheme="purple"
                mt={4}
                variant="solid"
                size="md"
                _focus={{ boxShadow: "outline" }}
              >
                View Details
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </>
  );
}
