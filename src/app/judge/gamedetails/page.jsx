"use client";
import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Heading,
  Stack,
  Text,
  Divider,
  useColorModeValue,
  SimpleGrid,
  Center,
  Link,
  Badge,
} from "@chakra-ui/react";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import { useRouter } from "next/navigation";
import axios from "axios";
import { UserContext } from "@/store/context/UserContext";

export default function Page() {
  const cardBg = useColorModeValue("gray.100", "gray.700");
  const cardHoverBg = useColorModeValue("purple.50", "purple.600");
  const router = useRouter();
  const [unfinishedGamesData, setUnfinishedGamesData] = useState([]);
  const { state: UserState } = useContext(UserContext);

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData(UserState.value.data?.id);
    }
  }, [UserState.value.data]);

  async function fetchData(id) {
    axios.get(`/api/games/judge/${id}`).then((response) => {
      setUnfinishedGamesData(response.data);
    });
  }

  return (
    <Sidebar LinkItems={GetLinkItems("judge")}>
      <Box p={8} bg="white">
        <Heading mb={6} color="purple.700">
          Dashboard
        </Heading>

        {unfinishedGamesData.length == 0 ? (
          <Center>
            <Text>No games available</Text>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {unfinishedGamesData.map((game, index) => (
              <Box
                as={Link}
                href={`/judge/gamedetails/${game.id}`}
                key={index}
                mb={6}
                borderWidth="1px"
                borderRadius="md"
                p={4}
                cursor="pointer"
                transition="0.2s ease-in-out"
                bg={cardBg}
                boxShadow="lg"
                _hover={{
                  boxShadow: "xl",
                  transform: "scale(1.03)",
                  bg: cardHoverBg,
                  textDecoration: "none",
                }}
              >
                <Stack spacing={3}>
                  <Heading size="md" color="purple.800">
                    {game.title}
                  </Heading>
                  <Divider />
                  <Text fontWeight="bold" color="purple.700">
                    Total Participants: {game.enrollments.length}
                  </Text>
                  <Text fontWeight="bold" color="purple.700">
                    Entry Level Prize: {game.prize_amount}
                  </Text>
                  <Text fontWeight="bold" color="purple.700">
                    Current Round: {game.currentround || 0} / {game.totalrounds}
                  </Text>
                  <Text fontWeight="bold" color="purple.700">
                    Total Judges: {game.additional_judges.length + 1}
                  </Text>
                  <Text fontWeight="bold" color="purple.700">
                    Status: <Badge colorScheme={game.winner ?"green" : "yellow"}>{game.winner ? "Completed" : "Pending"}</Badge>
                  </Text>
                </Stack>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Sidebar>
  );
}
