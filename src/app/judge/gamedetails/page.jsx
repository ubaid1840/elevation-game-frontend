"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Stack,
  Text,
  Divider,
  useColorModeValue,
  SimpleGrid,
} from "@chakra-ui/react";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import { useRouter } from "next/navigation";
import axios from "axios";




export default function Page() {
  const cardBg = useColorModeValue("gray.100", "gray.700");
  const cardHoverBg = useColorModeValue("purple.50", "purple.600");
  const router = useRouter()
  const handleGameClick = (gameId) => {
    console.log(`Game ID: ${gameId} clicked`);
    router.push(`/judge/gamedetails/${gameId}`)
  };
  const [unfinishedGamesData, setUnfinishedGamesData] = useState([])

  useEffect(()=>{
    fetchData()
  },[])

  async function fetchData() {
    axios.get("/api/games")
    .then((response)=>{
      setUnfinishedGamesData(response.data)
    })
  }

  return (
    <Sidebar LinkItems={GetLinkItems("judge")}>
      <Box p={8} bg="white">
        <Heading mb={6} color="purple.700">Dashboard</Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {unfinishedGamesData.map((game, index) => (
            <Box
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
              }}
              onClick={() => handleGameClick(game.id)}
            >
              <Stack spacing={3}>
                <Heading size="md" color="purple.800">{game.title}</Heading>
                <Divider />
                <Text fontWeight="bold" color="purple.700">Total Participants: {game.total_participants}</Text>
                <Text fontWeight="bold" color="purple.700">Entry Level Prize: {game.prize_amount
                }</Text>
                <Text fontWeight="bold" color="purple.700">Current Round: {game.currentround || 0} / {game.totalrounds}</Text>
                <Text fontWeight="bold" color="purple.700">Total Judges: {game.totaljudges}</Text>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Sidebar>
  );
}
