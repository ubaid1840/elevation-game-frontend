"use client";
import Sidebar from "@/components/sidebar";
import { UserContext } from "@/store/context/UserContext";
import { debounce } from "@/utils/debounce";
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
  useToast,
  Flex,
} from "@chakra-ui/react";
import axios from "axios";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";

export default function Page() {
  const { state: UserState } = useContext(UserContext);
  const [myGames, setMyGames] = useState([]);
  const [availableGames, setAvailableGames] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermMyGame, setSearchTermMyGame] = useState("");

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
    axios.get(`/api/trivia/users/${id}/games`).then((response) => {
      setMyGames(response.data.myGames);
      setAvailableGames(response.data.availableGames);
    });
  }

  const RenderEachGame = ({ game }) => {
    const [loading, setLoading] = useState(false);

    return (
      <Box
        maxW={"300px"}
        key={game.id}
        p={6}
        bg="gray.100"
        borderRadius="lg"
        boxShadow="md"
        transition="transform 0.2s"
        _hover={{ transform: "scale(1.05)", boxShadow: "xl" }}
        justifyContent={"space-between"}
        display={'flex'}
        flexDir={'column'}
      >
        <Box mb={4}>
          <Heading size="md" mb={2}>
            {game.title}
          </Heading>
          <Text fontSize="lg">Spots Available: {game.spots_remaining}</Text>
          <Text fontSize="lg">Entry fee: {game.fee}</Text>
          {/* <Text fontSize="lg">
          Start Date: {moment(new Date(game.start_date)).format("MM/DD/YYYY")}
        </Text> */}
          <Text fontSize="lg">
            Deadline: {moment(new Date(game.deadline)).format("MM/DD/YYYY")}
          </Text>
        </Box>

        <Button
          as={Link}
          href={`/user/trivia/dashboard/enrollment/${game.id}`}
          isLoading={loading}
          colorScheme="purple"
          variant="solid"
          size="md"
          _hover={{ bg: "purple.600" }}
        >
          More Info
        </Button>
      </Box>
    );
  };

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
            {`Here's a quick look at your game progress and referral stats.`}
          </Text>
        </Box>

        <VStack align="start" spacing={6} mb={8}>
          <Heading size="lg" color="purple.700">
            My Games
          </Heading>
          <Input
            placeholder="Search my games"
            value={searchTermMyGame}
            onChange={(e) => setSearchTermMyGame(e.target.value)}
          />
          <Flex wrap={"wrap"} gap={6}>
            {myGames
              .filter((game) =>
                game.title
                  ?.toLowerCase()
                  .includes(searchTermMyGame.toLowerCase())
              )
              .map(
                (game, index) =>
                  !game.completed && (
                    <Box
                      maxW={"300px"}
                      as={Link}
                      href={`/user/trivia/enrolledgames/${game.id}`}
                      key={index}
                      p={6}
                      bg="gray.100"
                      borderRadius="lg"
                      boxShadow="md"
                      transition="transform 0.2s"
                      _hover={{
                        transform: "scale(1.05)",
                        boxShadow: "xl",
                        cursor: "pointer",
                      }}
                      justifyContent={"space-between"}
                      display={"flex"}
                      flexDir={"column"}
                    >
                      <Heading size="md" mb={2}>
                        {game.title}
                      </Heading>
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
                    </Box>
                  )
              )}
          </Flex>
          {/* <Grid templateColumns="repeat(3, 1fr)" gap={6}>
           
          </Grid> */}
        </VStack>

        <Divider borderColor="gray.300" />

        <VStack align="start" spacing={6} mt={8} mb={8}>
          <Heading size="lg" color="purple.700">
            Participate in a Game
          </Heading>
          <Input
            placeholder="Search games"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Flex wrap={"wrap"} gap={6}>
            {availableGames
              .filter((game) => {
                const matchesSpots = game.spots_remaining !== 0;
                const matchesTitle = game.title
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase());
                return matchesSpots && matchesTitle;
              })
              .map((game, index) => (
                <RenderEachGame key={index} game={game} />
              ))}
          </Flex>
          {/* <Grid templateColumns="repeat(3, 1fr)" gap={6}>
           
          </Grid> */}
        </VStack>

        <Divider borderColor="gray.300" />

        <VStack align="start" spacing={6} mt={8}>
          <Heading size="lg" color="purple.700">
            Referral Program
          </Heading>
          <HStack>
            <Text fontSize="lg" fontWeight="bold">
              Referral Code:
            </Text>
            <Input
              onChange={() => {}}
              value={UserState.value.data?.referral_code || ""}
              readOnly
              size="md"
              width="auto"
              borderColor="purple.400"
            />
          </HStack>
          <Text fontSize="lg">
            Number of Referrals: {UserState.value.data?.referral_count || 0}
          </Text>
          <Text fontSize="lg">
            Residual Income Earned: $
            {Number(UserState.value.data?.residual_income || 0)}
          </Text>
        </VStack>
      </Box>
    </>
  );
}
