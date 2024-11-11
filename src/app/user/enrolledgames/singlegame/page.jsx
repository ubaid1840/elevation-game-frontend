"use client";
import React, { useState } from "react";
import {
  Box,
  Heading,
  Stack,
  Text,
  Textarea,
  Button,
  Divider,
  FormControl,
  FormLabel,
  useColorModeValue,
  Progress,
} from "@chakra-ui/react";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";


const participantDetailData = {
  id: 1,
  name: "Participant 1",
  submittedPitch: "https://example.com/video1",
  currentRound: 1,
  totalRounds: 5,
  judgeComments: [
    { id: 1, judge: "Judge A", comment: "Great concept!" },
    { id: 2, judge: "Judge B", comment: "Needs more detail on implementation." },
    { id: 3, judge: "Judge C", comment: "Interesting idea, but clarify the rules." },
  ],
};

export default function Page() {
  const [newPitchLink, setNewPitchLink] = useState("");

  const handlePitchChange = (event) => {
    setNewPitchLink(event.target.value);
  };

  const handleResubmitPitch = () => {
    // console.log(`New pitch submitted: ${newPitchLink}`);
    setNewPitchLink("");
  };

  return (
    <Sidebar LinkItems={GetLinkItems("user")}>
      <Box p={8} bg="white">
        <Heading mb={6} color="purple.700">{`${participantDetailData.name}'s Pitch`}</Heading>

        <Text fontWeight="bold" color="purple.600">Current Round: {participantDetailData.currentRound}/{participantDetailData.totalRounds}</Text>
        <Progress
            value={0.7 * 100}
            colorScheme="purple"
            size="lg"
            width="100%"
            borderRadius="md"
          />
        <Text fontWeight="bold" color="purple.600" mt={4}>Submitted Pitch:</Text>
        <Text color="blue.500">
          <a href={participantDetailData.submittedPitch} target="_blank" rel="noopener noreferrer">
            {participantDetailData.submittedPitch}
          </a>
        </Text>

        <FormControl mt={6}>
          <FormLabel htmlFor="new-pitch" fontWeight="bold">Resubmit Your Pitch Link:</FormLabel>
          <Textarea
            id="new-pitch"
            value={newPitchLink}
            onChange={handlePitchChange}
            placeholder="Enter the new pitch link here..."
          />
          <Button
            colorScheme="purple"
            mt={2}
            onClick={handleResubmitPitch}
          >
            Resubmit Pitch
          </Button>
        </FormControl>

        <Text fontWeight="bold" color="purple.600" mt={6}>Judge Comments:</Text>
        <Stack spacing={4} mb={6}>
          {participantDetailData.judgeComments.map((comment) => (
            <Box key={comment.id} borderWidth="1px" borderRadius="md" p={3}>
              <Text fontWeight="bold">{comment.judge}:</Text>
              <Text>{comment.comment}</Text>
            </Box>
          ))}
        </Stack>
      </Box>
    </Sidebar>
  );
}
