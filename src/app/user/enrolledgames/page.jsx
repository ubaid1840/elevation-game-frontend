"use client";
import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Heading,
  Stack,
  Text,
  Button,
  SimpleGrid,
  useColorModeValue,
  Link,
} from "@chakra-ui/react";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import { useRouter } from "next/navigation";
import axios from "axios";
import { UserContext } from "@/store/context/UserContext";


export default function Page() {
  const router = useRouter();
  const [participantGamesData, setParticipantGamesData] = useState([]);
  const { state: UserState } = useContext(UserContext);

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData();
    }
  }, [UserState.value.data]);

  async function fetchData() {
    axios
      .get(`/api/users/${UserState.value.data?.id}/games`)
      .then((response) => {
        console.log(response.data);
        setParticipantGamesData(response.data.myGames);
      });
  }

  const handleViewDetails = (gameId) => {
    router.push("/user/enrolledgames/singlegame");
  };

  const bgColor = useColorModeValue("white", "gray.800");
  const cardBgColor = useColorModeValue("gray.50", "gray.700");
  const cardHoverBgColor = useColorModeValue("purple.50", "purple.600");
  const borderColor = useColorModeValue("purple.300", "purple.500");

  return (
    <Sidebar LinkItems={GetLinkItems("user")}>
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
                  Current Round: {game.currentround}
                </Text>
              </Stack>
              <Button
              _hover={{textDecoration:'none'}}
               as={Link}
               href={`/user/enrolledgames/${game.id}`}
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
    </Sidebar>
  );
}
