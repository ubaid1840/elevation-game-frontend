"use client";
import Sidebar from "@/components/sidebar";
import { UserContext } from "@/store/context/UserContext";
import GetLinkItems from "@/utils/SideBarItems";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Divider,
  Badge,
  useBreakpointValue,
  Tooltip,
  Button,
} from "@chakra-ui/react";
import axios from "axios";
import { useContext, useEffect, useState } from "react";

export default function LeaderboardPage() {
  const { state: UserState } = useContext(UserContext);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData();
    }
  }, [UserState.value.data]);

  async function fetchData() {
    axios.get(`/api/pitches/leaderboard`).then((response) => {
      setParticipants(response.data);
    });
  }

  return (
    <Sidebar LinkItems={GetLinkItems("user")}>
      <Box p={8}>
        {/* Leaderboard Header */}
        <VStack spacing={4} align="start">
          <Heading size="lg" color="purple.700" textAlign="center" mb={6}>
            Leaderboard
          </Heading>
          <Divider borderColor="purple.400" />
        </VStack>

        {/* Rankings Table */}
        <Table
          variant="simple"
          size={useBreakpointValue({ base: "sm", md: "md" })}
        >
          <Thead>
            <Tr>
              <Th color="white" bg="purple.500">
                Rank
              </Th>
              <Th color="white" bg="purple.500">
                Name
              </Th>
              <Th color="white" bg="purple.500">
                Top Pitch
              </Th>
              <Th color="white" bg="purple.500">
                Score
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {participants.map((participant, index) => (
              <Tr key={index} _hover={{ bg: "purple.50" }}>
                <Td>{index + 1}</Td>
                <Td>
                  <Text fontWeight="bold" color="purple.600">
                    {participant.name}
                  </Text>
                </Td>
                <Td>{participant.game_title}</Td>
                <Td>
                  <Badge
                    colorScheme={
                      participant.score && participant.score >= 90
                        ? "green"
                        : "red"
                    }
                  >
                    {participant?.score}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {/*      
      <HStack justifyContent="center" mt={8}>
        <Button colorScheme="purple" size="lg" onClick={() => alert('See details')}>
          View Detailed Rankings
        </Button>
      </HStack> */}
      </Box>
    </Sidebar>
  );
}
