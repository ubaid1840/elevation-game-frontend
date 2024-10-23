"use client";
import Sidebar from "@/components/sidebar";
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

// Dummy data for leaderboard
const participants = [
  { rank: 1, name: "Alice Smith", pitchTitle: "Innovative Pitch", score: 95 },
  { rank: 2, name: "John Doe", pitchTitle: "Creative Solution", score: 90 },
  { rank: 3, name: "Emma Johnson", pitchTitle: "Eco-Friendly Idea", score: 85 },
  { rank: 4, name: "Michael Brown", pitchTitle: "Tech Revolution", score: 80 },
  { rank: 5, name: "Sophia Davis", pitchTitle: "Future Vision", score: 75 },
];

export default function LeaderboardPage() {
  return (
    <Sidebar LinkItems={GetLinkItems("user")}>
    <Box p={8}   bg="white" borderRadius="lg" boxShadow="xl" overflow="hidden">
      {/* Leaderboard Header */}
      <VStack spacing={4} align="start">
        <Heading size="lg" color="purple.700" textAlign="center" mb={6}>
          Leaderboard
        </Heading>
        <Divider borderColor="purple.400" />
      </VStack>

      {/* Rankings Table */}
      <Table variant="simple" size={useBreakpointValue({ base: "sm", md: "md" })}>
        <Thead>
          <Tr>
            <Th color="white" bg="purple.500">Rank</Th>
            <Th color="white" bg="purple.500">Name</Th>
            <Th color="white" bg="purple.500">Top Pitch</Th>
            <Th color="white" bg="purple.500">Score</Th>
          </Tr>
        </Thead>
        <Tbody>
          {participants.map((participant) => (
            <Tr key={participant.rank} _hover={{ bg: "purple.50" }}>
              <Td>{participant.rank}</Td>
              <Td>
                <Tooltip label={`View details about ${participant.name}`} hasArrow>
                  <Text fontWeight="bold" color="purple.600">{participant.name}</Text>
                </Tooltip>
              </Td>
              <Td>{participant.pitchTitle}</Td>
              <Td>
                <Badge colorScheme={participant.score >= 90 ? "green" : "red"}>
                  {participant.score}
                </Badge>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Action Button */}
      <HStack justifyContent="center" mt={8}>
        <Button colorScheme="purple" size="lg" onClick={() => alert('See details')}>
          View Detailed Rankings
        </Button>
      </HStack>
    </Box>
    </Sidebar>
  );
}
