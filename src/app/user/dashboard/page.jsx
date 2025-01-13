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
} from "@chakra-ui/react";
import axios from "axios";
import moment from "moment";
import Link from "next/link";
import { useCallback, useContext, useEffect, useState } from "react";

export default function Page() {
  const { state: UserState } = useContext(UserContext);
  const [myGames, setMyGames] = useState([]);
  const [availableGames, setAvailableGames] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const toast = useToast();

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
    // axios
    //   .get(`/api/users/${UserState.value.data.id}/games`)
    //   .then((response) => {
    //     console.log(response.data)
    //     setMyGames(response.data);
    //   });

    // axios.get(`/api/games`).then((response) => {
    //   console.log(response.data)
    //   setAvailableGames(response.data);
    // });

    axios.get(`/api/users/${id}/games`).then((response) => {
      setMyGames(response.data.myGames);
      setAvailableGames(response.data.availableGames);
    });
  }

  function checkUrl(game) {
    const userPackage = UserState.value.data?.package;
    let status = false;
    if (
      userPackage === "Platinum" ||
      (userPackage === "Gold" && !["Platinum"].includes(game.level)) ||
      (userPackage === "Iridium" &&
        ["Iridium", "Silver"].includes(game.level)) ||
      (userPackage === "Silver" && game.level === "Silver")
    ) {
      status = true;
    } else {
      status = false;
    }
    if (status == true) {
      return `dashboard/enrollment/${game.id}`;
    } else {
      return `#`;
    }
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
                        {game.completed ? "COMPLETED" : "PENDING"}
                      </Badge>
                    </div>
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
              .filter((game) => {
                if (game.spots_remaining === 0) return false;
                if (game.deadline && moment(game.deadline).isBefore(moment()))
                  return false;
                // const userPackage = UserState.value.data?.package;
                // if (
                //   userPackage === "Platinum" ||
                //   (userPackage === "Gold" && !["Platinum"].includes(game.level)) ||
                //   (userPackage === "Iridium" && ["Iridium", "Silver"].includes(game.level)) ||
                //   (userPackage === "Silver" && game.level === "Silver")
                // ) {
                //   return true;
                // }

                return true;
              })
              .map((game) => (
                <GridItem
                  key={game.id}
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
                    onClick={() => {
                      const userPackage = UserState.value.data?.package;
                      let status = false;
                      if (
                        userPackage === "Platinum" ||
                        (userPackage === "Gold" &&
                          !["Platinum"].includes(game.level)) ||
                        (userPackage === "Iridium" &&
                          ["Iridium", "Silver"].includes(game.level)) ||
                        (userPackage === "Silver" && game.level === "Silver")
                      ) {
                        status = true;
                      } else {
                        status = false;
                      }
                      if (status == false) {
                        toast({
                          title: "Change Package",
                          description: "Please upgrade your package to enroll",
                          status: "success",
                          duration: 3000,
                          isClosable: true,
                        });
                      }
                    }}
                    as={Link}
                    href={checkUrl(game)}
                    mt={4}
                    colorScheme="purple"
                    variant="solid"
                    size="md"
                    _hover={{ bg: "purple.600" }}
                  >
                    Enroll
                  </Button>
                </GridItem>
              ))}
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
