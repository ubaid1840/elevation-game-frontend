"use client";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  Input,
  Divider,
} from "@chakra-ui/react";
import { useState } from "react";

export default function PitchRecordingPage() {
  const [videoLink, setVideoLink] = useState("");

  const handleVideoLinkChange = (e) => {
    setVideoLink(e.target.value);
  };

  const handleSubmit = () => {
    // Handle the video link submission logic here
    console.log("Video Link Submitted:", videoLink);
  };

  return (
    <Sidebar LinkItems={GetLinkItems("user")}>
    <Box p={8}  bg="white" borderRadius="lg" boxShadow="md">
      {/* Instructions Section */}
      <Box bg="purple.50" p={6} borderRadius="lg" boxShadow="md" mb={8}>
        <Heading size="lg" mb={4}>
          Pitch Recording Instructions
        </Heading>
        <Divider borderColor="gray.400" mb={4} />
        <VStack align="start" spacing={4}>
          <Text fontSize="md">
            <strong>Guidelines for Recording Your Pitch:</strong>
          </Text>
          <Text fontSize="sm">
            - Keep your pitch concise (2-3 minutes).<br />
            - Clearly explain your idea and its value.<br />
            - Practice your delivery for clarity and confidence.
          </Text>
          <Text fontSize="md">
            <strong>Technical Requirements:</strong>
          </Text>
          <Text fontSize="sm">
            - Ensure good lighting and clear audio.<br />
            - Use a stable recording device (smartphone or camera).<br />
            - Record in a quiet environment.
          </Text>
        </VStack>
      </Box>

      <Divider />

      {/* Submit Video Link Section */}
      <VStack align="start" spacing={4} mt={8}>
        <Heading size="lg" color="purple.700">
          Submit the Video Link of Your Pitch
        </Heading>
        <Input
          placeholder="Enter your video link here..."
          value={videoLink}
          onChange={handleVideoLinkChange}
          size="lg"
          bg="white"
          borderColor="purple.400"
        />
        <Button
          colorScheme="purple"
          size="lg"
          width="full"
          onClick={handleSubmit}
          isDisabled={!videoLink}
          _hover={{ bg: "purple.600" }}
        >
          Submit
        </Button>
      </VStack>
    </Box>
    </Sidebar>
  );
}
