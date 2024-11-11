"use client";
import Sidebar from "@/components/sidebar";
import { UserContext } from "@/store/context/UserContext";
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
import axios from "axios";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";

export default function Page() {
  const { state: UserState } = useContext(UserContext);
  const [myGames, setMyGames] = useState([]);
  const [availableGames, setAvailableGames] = useState([]);

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData();
    }
  }, [UserState.value.data]);

  async function fetchData() {
    axios
      .get(`/api/users/${UserState.value.data.id}/games`)
      .then((response) => {
        setMyGames(response.data);
      });

    axios.get(`/api/games`).then((response) => {
      setAvailableGames(response.data);
    });
  }

  return (
    <Sidebar LinkItems={GetLinkItems("user")}>
      <Box p={8} bg="white">
        <Box
          bgGradient="linear(to-r, purple.600, purple.400)"
          color="white"
          p={8}
          borderRadius="lg"
          boxShadow="md"
          mb={8}
        >
          <Heading>Welcome, {UserState.value.data?.name}</Heading>
          <Text mt={4} fontSize="lg">
            {`Here's a quick look at your game progress and referral stats.`}
          </Text>
        </Box>

        <VStack align="start" spacing={6} mb={8}>
          <Heading size="lg" color="purple.700">
            My Games
          </Heading>
          <Grid templateColumns="repeat(3, 1fr)" gap={6}>
            {myGames.map(
              (game, index) =>
                !game.completed && (
                  <GridItem
                    as={Link}
                    href={`/user/enrolledgames/${game.id}`}
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
                  >
                    <Heading size="md" mb={2}>
                      {game.title}
                    </Heading>
                    <Badge
                      colorScheme={
                        game.status === "COMPLETED" ? "green" : "yellow"
                      }
                      variant="solid"
                      fontSize="1rem"
                    >
                      {game.completed ? "COMPLETED" : "PENDING"}
                    </Badge>
                  </GridItem>
                )
            )}
          </Grid>
        </VStack>

        <Divider borderColor="gray.300" />

        <VStack align="start" spacing={6} mt={8} mb={8}>
          <Heading size="lg" color="purple.700">
            Enroll in a Game
          </Heading>
          <Grid templateColumns="repeat(3, 1fr)" gap={6}>
            {availableGames
              .filter(
                (game) => !myGames.some((myGame) => myGame.id === game.id)
              )
              .map((game, index) =>
                game.spots_remaining && game.spots_remaining === 0 ? null : (
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
                      {game.title}
                    </Heading>
                    <Text fontSize="lg">
                      Spots Remaining: {game.spots_remaining}
                    </Text>
                    <Text fontSize="lg">Entry Level: {game.level}</Text>
                    <Button
                      as={Link}
                      href={`dashboard/enrollment/${game.id}`}
                      mt={4}
                      colorScheme="purple"
                      variant="solid"
                      size="md"
                      _hover={{ bg: "purple.600" }}
                    >
                      Enroll
                    </Button>
                  </GridItem>
                )
              )}
          </Grid>
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
              value={UserState.value.data?.referral_code}
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
            {Number(UserState.value.data?.tier1 || 0) +
              Number(UserState.value.data?.tier2 || 0) +
              Number(UserState.value.data?.tier3 || 0) +
              Number(UserState.value.data?.winner_earnings || 0)}
          </Text>
        </VStack>
      </Box>
    </Sidebar>
  );
}
