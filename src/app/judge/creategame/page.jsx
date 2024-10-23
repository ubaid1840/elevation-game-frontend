"use client";
import React, { useState } from "react";
import {
  Box,
  Heading,
  Textarea,
  Button,
  Input,
  Stack,
  FormControl,
  FormLabel,
  Text,
  Select,
  Divider,
} from "@chakra-ui/react";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";

export default function Page () {
  const [videoLink, setVideoLink] = useState("");
  const [gameDescription, setGameDescription] = useState("");
  const [selectedJudges, setSelectedJudges] = useState([]);
  const [availableJudges, setAvailableJudges] = useState([
    { id: 1, name: "Judge 1" },
    { id: 2, name: "Judge 2" },
    { id: 3, name: "Judge 3" },
    // Add more judges as needed
  ]);

  const handleAddJudge = (event) => {
    const selectedJudgeId = parseInt(event.target.value);
    const selectedJudge = availableJudges.find((judge) => judge.id === selectedJudgeId);

    if (selectedJudge && !selectedJudges.includes(selectedJudge)) {
      setSelectedJudges([...selectedJudges, selectedJudge]);
    }
  };

  const handleInitiateGame = () => {
    // Add logic to initiate the game with the provided details
    console.log("Game initiated with judges:", selectedJudges);
    console.log("Game description:", gameDescription);
    console.log("Video link:", videoLink);
  };

  return (
    <Sidebar LinkItems={GetLinkItems("judge")}>
    <Box p={8} bg="white">
      <Heading mb={6} color="purple.700">Create Game</Heading>

      {/* Video Link Section */}
      <FormControl mb={6}>
        <FormLabel htmlFor="videoLink">Video Link</FormLabel>
        <Input
          id="videoLink"
          type="url"
          placeholder="Enter video link"
          value={videoLink}
          onChange={(e) => setVideoLink(e.target.value)}
        />
      </FormControl>

      {/* Description Section */}
      <FormControl mb={6}>
        <FormLabel htmlFor="gameDescription">Game Description</FormLabel>
        <Textarea
          id="gameDescription"
          placeholder="Describe the game, rules, judging criteria, and resources."
          value={gameDescription}
          onChange={(e) => setGameDescription(e.target.value)}
          minHeight="200px"
        />
      </FormControl>

      {/* Display Video */}
      {videoLink && (
        <Box mb={6}>
          <Text fontWeight="bold" mb={2}>Challenge Video:</Text>
          <iframe
            width="100%"
            height="315"
            src={videoLink.replace("watch?v=", "embed/")}
            title="Challenge Video"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </Box>
      )}

      {/* Select Additional Judges Section */}
      <FormControl mb={6}>
        <FormLabel htmlFor="addJudge">Add Additional Judges</FormLabel>
        <Select id="addJudge" onChange={handleAddJudge} placeholder="Select a judge">
          {availableJudges.map((judge) => (
            <option key={judge.id} value={judge.id}>
              {judge.name}
            </option>
          ))}
        </Select>
      </FormControl>

      <Stack spacing={4} mb={6}>
        <Text fontWeight="bold">Selected Judges:</Text>
        {selectedJudges.map((judge, index) => (
          <Box key={index} borderWidth="1px" borderRadius="md" p={4}>
            <Text>{judge.name}</Text>
          </Box>
        ))}
      </Stack>

      <Button colorScheme="purple" onClick={handleInitiateGame}>
        Initiate Game
      </Button>
    </Box>
    </Sidebar>
  );
};
