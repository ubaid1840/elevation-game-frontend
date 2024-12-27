"use client";
import React, { useCallback, useContext, useEffect, useState } from "react";
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
  Input,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import axios from "axios";
import { UserContext } from "@/store/context/UserContext";
import { debounce } from "@/utils/debounce";

export default function Page() {
  const cardBg = useColorModeValue("gray.100", "gray.700");
  const cardHoverBg = useColorModeValue("purple.50", "purple.600");
  const { state: UserState } = useContext(UserContext);
  const [allGames, setAllGames] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (UserState.value.data?.id) {
      debouncedFetchData(UserState.value.data.id);
    }
  }, [UserState.value.data]);

  const debouncedFetchData = useCallback(
    debounce((id) => {
      fetchData(id);
    }, 1000), 
    []
  );

  async function fetchData(id) {
    axios.get(`/api/games/judge/${id}`).then((response) => {
      setAllGames(response.data);
    });
  }

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredGames = allGames.filter((game) => {
    const matchesName = game?.title
      ?.toLowerCase()
      .includes(filter.toLowerCase());
    return matchesName;
  });

  return (
    <Sidebar LinkItems={GetLinkItems("judge")}>
      <Box p={8} bg="white">
        <Heading mb={6} color="purple.700">
          Dashboard
        </Heading>

        {filteredGames.length == 0 ? (
          <Center>
            <Text>No games available</Text>
          </Center>
        ) : (
          <>
            <Input
              mb={4}
              placeholder="Search by title"
              value={filter}
              onChange={handleFilterChange}
            />
            <Tabs>
              <TabList>
                <Tab>Pending</Tab>
                <Tab>Completed</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    {filteredGames
                      .filter((item) => !item.winner)
                      .map((game, index) => (
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
                              Current Round: {game.currentround || 0} /{" "}
                              {game.totalrounds}
                            </Text>
                            <Text fontWeight="bold" color="purple.700">
                              Total Judges: {game.additional_judges.length + 1}
                            </Text>
                            <Text fontWeight="bold" color="purple.700">
                              Status:{" "}
                              <Badge
                                colorScheme={game.winner ? "green" : "yellow"}
                              >
                                {game.winner ? "Completed" : "Pending"}
                              </Badge>
                            </Text>
                          </Stack>
                        </Box>
                      ))}
                  </SimpleGrid>
                </TabPanel>
                <TabPanel>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    {filteredGames
                      .filter((item) => item.winner)
                      .map((game, index) => (
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
                              Current Round: {game.currentround || 0} /{" "}
                              {game.totalrounds}
                            </Text>
                            <Text fontWeight="bold" color="purple.700">
                              Total Judges: {game.additional_judges.length + 1}
                            </Text>
                            <Text fontWeight="bold" color="purple.700">
                              Status:{" "}
                              <Badge
                                colorScheme={game.winner ? "green" : "yellow"}
                              >
                                {game.winner ? "Completed" : "Pending"}
                              </Badge>
                            </Text>
                          </Stack>
                        </Box>
                      ))}
                  </SimpleGrid>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </>
        )}
      </Box>
    </Sidebar>
  );
}
