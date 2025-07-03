"use client";
import { UserContext } from "@/store/context/UserContext";
import { debounce } from "@/utils/debounce";
import {
  Badge,
  Box,
  Center,
  Divider,
  Flex,
  Heading,
  Input,
  Link,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import axios from "axios";
import { useCallback, useContext, useEffect, useState } from "react";
import { IoIosWarning } from "react-icons/io";

export default function Page() {
  const cardBg = useColorModeValue("gray.100", "gray.700");
  const cardHoverBg = useColorModeValue("purple.50", "purple.600");
  const { state: UserState } = useContext(UserContext);
  const [allGames, setAllGames] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (UserState.value.data?.id) {
      debouncedFetchData(UserState.value.data?.id);
    }
  }, [UserState.value.data]);

  const debouncedFetchData = useCallback(
    debounce((id) => {
      fetchData(id);
    }, 1000),
    []
  );

  async function fetchData(id) {
    axios.get(`/api/trivia/game/judge/${id}`).then((response) => {
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
    <>
      <Box p={8} bg="white">
        <Box
          bgGradient="linear(to-r, purple.600, purple.400)"
          color="white"
          p={8}
          borderRadius="lg"
          boxShadow="md"
          mb={8}
        >
          <Heading>
            Welcome To Trivia Dashboard, {UserState.value.data?.name}
          </Heading>
          <Text mt={4} fontSize="lg">
            {`Here's a quick look at your games.`}
          </Text>
          {/* {UserState.value.data?.hasActiveWaiver ? null : (
            <>
              {UserState.value.data?.monthlySubscriptionStatus == false && (
                <Flex alignItems={"center"} gap={2} mt={4} color={"orange.200"}>
                  <IoIosWarning size={"20"} />{" "}
                  <Text fontSize="lg">
                    Monthly package expired, navigate to subscription page and
                    buy again.
                  </Text>
                </Flex>
              )}
              {UserState.value.data?.annualSubscriptionStatus == false && (
                <Flex alignItems={"center"} gap={2} mt={4} color={"orange.200"}>
                  <IoIosWarning size={"20"} />{" "}
                  <Text fontSize="lg">
                    Annual package expired, navigate to subscription page and
                    buy again.
                  </Text>
                </Flex>
              )}
            </>
          )} */}
        </Box>

        <Input
          mb={4}
          placeholder="Search by title"
          value={filter}
          onChange={handleFilterChange}
        />

        {filteredGames.length == 0 ? (
          <Center>
            <Text>No games available</Text>
          </Center>
        ) : (
          <>
            <Tabs>
              <TabList>
                <Tab>Pending</Tab>
                <Tab>Completed</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    {filteredGames
                      .filter((item) => !item.winner_id)
                      .map((game, index) => (
                        <Box
                          as={Link}
                          href={`/judge/trivia/gamedetails/${game.id}`}
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
                              Total Participants: {game.total_enrollments}
                            </Text>
                            <Text fontWeight="bold" color="purple.700">
                              Entry fee: {game.fee}
                            </Text>
                            <Text fontWeight="bold" color="purple.700">
                              Prize: {game.prize}
                            </Text>
                            <Text fontWeight="bold" color="purple.700">
                              Status:{" "}
                              <Badge
                                colorScheme={
                                  game.winner_id ? "green" : "yellow"
                                }
                              >
                                {game.winner_id ? "Completed" : "Pending"}
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
                      .filter((item) => item.winner_id)
                      .map((game, index) => (
                        <Box
                          as={Link}
                          href={`/judge/trivia/gamedetails/${game.id}`}
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
                              Total Participants: {game.total_enrollments}
                            </Text>
                            <Text fontWeight="bold" color="purple.700">
                              Entry fee: {game.fee}
                            </Text>
                            <Text fontWeight="bold" color="purple.700">
                              Prize: {game.prize}
                            </Text>
                            <Text fontWeight="bold" color="purple.700">
                              Status:{" "}
                              <Badge
                                colorScheme={
                                  game.winner_id ? "green" : "yellow"
                                }
                              >
                                {game.winner_id ? "Winner Announced" : "Pending"}
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
    </>
  );
}
