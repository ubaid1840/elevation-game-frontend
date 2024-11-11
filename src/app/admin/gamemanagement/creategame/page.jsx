"use client";
import React, { useContext, useEffect, useState } from "react";
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
import axios from "axios";
import { UserContext } from "@/store/context/UserContext";
import { useRouter } from "next/navigation";
import { Calendar } from "primereact/calendar";

export default function Page() {
  const [title, setTitle] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [gameDescription, setGameDescription] = useState("");
  const [selectedJudges, setSelectedJudges] = useState([]);
  const [rounds, setRounds] = useState(1);
  const [category, setCategory] = useState("");
  const [totalSpots, setTotalSpots] = useState(0);
  const [prize, setPrize] = useState(0);
  const [deadline, setDeadline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableJudges, setAvailableJudges] = useState([]);
  const [level, setLevel] = useState(null);
  const route = useRouter();
  const { state: UserState } = useContext(UserContext);

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData();
    }
  }, [UserState.value.data]);

  async function fetchData() {
    axios.get("/api/users?role=judge").then((response) => {
      setAvailableJudges(response.data);
    });
  }

  const handleAddJudge = (event) => {
    const selectedJudgeId = parseInt(event.target.value);
    const selectedJudge = availableJudges.find(
      (judge) => judge.id === selectedJudgeId
    );

    if (selectedJudge && !selectedJudges.includes(selectedJudge)) {
      setSelectedJudges([...selectedJudges, selectedJudge]);
    }
  };

  const handleInitiateGame = async () => {
    const data = {
      title,
      description: gameDescription,
      totalRounds: Number(rounds),
      category,
      spotsRemaining: Number(totalSpots),
      additional_judges: selectedJudges.map((judge) => judge.id),
      total_spots: Number(totalSpots),
      video_link: videoLink,
      creator_id: UserState.value.data.id,
      prize_amount: prize,
      deadline,
      currentround: 1,
      level,
    };

    try {
      axios
        .post("/api/games", data)
        .then(() => {
          route.push("/admin/gamemanagement");
        })
        .catch((e) => {
          setLoading(false);
        });
    } catch (error) {
      console.error("Error initiating game:", error);
      setLoading(false);
    }
  };

  return (
    <Sidebar LinkItems={GetLinkItems("admin")}>
      <Box p={8} bg="white">
        <Heading mb={6} color="purple.700">
          Create Game
        </Heading>

        <FormControl mb={6}>
          <FormLabel htmlFor="title">Game Title</FormLabel>
          <Input
            id="title"
            placeholder="Enter game title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormControl>

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

        {videoLink && (
          <Box mb={6}>
            <Text fontWeight="bold" mb={2}>
              Challenge Video:
            </Text>
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

        <FormControl mb={6}>
          <FormLabel htmlFor="level">Level</FormLabel>
          <Select
            value={level}
            id="level"
            onChange={(e) => setLevel(e.target.value)}
            placeholder="Select level"
          >
            <option value={"Beginner"}>Beginner</option>
            <option value={"Intermediate"}>Intermediate</option>
            <option value={"Advance"}>Advance</option>
          </Select>
        </FormControl>

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

        <FormControl mb={6}>
          <FormLabel htmlFor="totalSpots">Total Spots</FormLabel>
          <Input
            id="totalSpots"
            type="number"
            min={1}
            value={totalSpots}
            onChange={(e) => setTotalSpots(parseInt(e.target.value))}
            placeholder="Enter total spots available"
          />
        </FormControl>

        <FormControl mb={6}>
          <FormLabel htmlFor="deadline">Deadline</FormLabel>
          <Box
            border={"1px solid"}
            borderColor={"#D0D5DD"}
            borderRadius={"md"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            height={"40px"}
            px={4}
          >
            <Calendar
              id="deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.value)}
              showIcon
              className="custom-calendar"
              dateFormat="mm/dd/yy"
              style={{ width: "100%" }}
            />
          </Box>
        </FormControl>

        <FormControl mb={6}>
          <FormLabel htmlFor="grandprize">Grand Prize</FormLabel>
          <Input
            id="grandprize"
            type="number"
            min={1}
            value={prize}
            onChange={(e) => setPrize(parseInt(e.target.value))}
            placeholder="Enter grand prize"
          />
        </FormControl>

        <FormControl mb={6}>
          <FormLabel htmlFor="category">Game Category</FormLabel>
          <Select
            id="category"
            placeholder="Select category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Action">Action</option>
            <option value="Adventure">Adventure</option>
            <option value="Puzzle">Puzzle</option>
            <option value="Strategy">Strategy</option>
            <option value="Sports">Sports</option>
            <option value="Racing">Racing</option>
            <option value="Role-Playing">Role-Playing</option>
            <option value="Simulation">Simulation</option>
            <option value="Arcade">Arcade</option>
            <option value="Trivia">Trivia</option>
          </Select>
        </FormControl>

        <FormControl mb={6}>
          <FormLabel htmlFor="addJudge">Add Additional Judges</FormLabel>
          <Select
            id="addJudge"
            onChange={handleAddJudge}
            placeholder="Select a judge"
          >
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

        <Button
          isLoading={loading}
          colorScheme="purple"
          onClick={() => {
            setLoading(true);
            handleInitiateGame();
          }}
        >
          Initiate Game
        </Button>
      </Box>
    </Sidebar>
  );
}
