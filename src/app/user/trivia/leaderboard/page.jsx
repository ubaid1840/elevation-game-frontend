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

export default function Page() {
  const { state: UserState } = useContext(UserContext);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData();
    }
  }, [UserState.value.data]);

  async function fetchData() {
    axios.get(`/api/trivia/leaderboard`).then((response) => {
      setParticipants(response.data);
    });
  }

  return (
    <>
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
                Title
              </Th>
              <Th color="white" bg="purple.500">
                Player
              </Th>
              <Th color="white" bg="purple.500">
                Best Time
              </Th>
              <Th color="white" bg="purple.500">
                Correct Answers
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {participants.map((participant, index) => (
              <Tr key={index} _hover={{ bg: "purple.50" }}>
                <Td>
                  <Text fontWeight="bold" color="purple.600">
                    {participant.game_title}
                  </Text>
                </Td>
                <Td>{participant.top_user_name}</Td>
                <Td>{participant.total_time_taken} SEC</Td>
                <Td>
                  <Badge colorScheme={"green"}>
                    {participant?.total_correct_answers} /
                      {participant?.total_questions}
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
    </>
  );
}
