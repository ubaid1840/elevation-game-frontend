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
} from "@chakra-ui/react";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";

export default function Page() {
  const [videoLink, setVideoLink] = useState("");
  const [gameDescription, setGameDescription] = useState("");
  const [selectedJudges, setSelectedJudges] = useState([]);
  const [rounds, setRounds] = useState(1); // Default 1 round
  const [category, setCategory] = useState(""); // For selecting category
  const [availableJudges, setAvailableJudges] = useState([
    { id: 1, name: "Judge 1" },
    { id: 2, name: "Judge 2" },
    { id: 3, name: "Judge 3" },
  ]);

  const handleAddJudge = (event) => {
    const selectedJudgeId = parseInt(event.target.value);
    const selectedJudge = availableJudges.find(
      (judge) => judge.id === selectedJudgeId
    );

    if (selectedJudge && !selectedJudges.includes(selectedJudge)) {
      setSelectedJudges([...selectedJudges, selectedJudge]);
    }
  };

  const handleInitiateGame = () => {
    // Log the details including rounds and category
    console.log("Game initiated with judges:", selectedJudges);
    console.log("Game description:", gameDescription);
    console.log("Video link:", videoLink);
    console.log("Number of rounds:", rounds);
    console.log("Selected category:", category);
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

        {/* Select Number of Rounds */}
        <FormControl mb={6}>
          <FormLabel htmlFor="rounds">Number of Rounds</FormLabel>
          <Input
            id="rounds"
            type="number"
            min={1}
            value={rounds}
            onChange={(e) => setRounds(parseInt(e.target.value))}
            placeholder="Enter number of rounds"
          />
        </FormControl>

        {/* Select Category */}
        <FormControl mb={6}>
          <FormLabel htmlFor="category">Game Category</FormLabel>
          <Select
            id="category"
            placeholder="Select category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="sports">Sports</option>
            <option value="music">Music</option>
            <option value="puzzle">Puzzle</option>
            <option value="strategy">Strategy</option>
          </Select>
        </FormControl>

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

        {/* Display Selected Judges */}
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
}
