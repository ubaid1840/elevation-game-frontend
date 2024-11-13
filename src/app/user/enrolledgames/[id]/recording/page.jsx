"use client";
import Sidebar from "@/components/sidebar";
import { UserContext } from "@/store/context/UserContext";
import GetLinkItems from "@/utils/SideBarItems";
import {
  Box,
  Heading,
  Text,
  Grid,
  GridItem,
  VStack,
  HStack,
  Select,
  Button,
  Badge,
  Divider,
  Input,
  Stack,
} from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";

export default function GameEnrollmentPage({ params }) {
  const [videoLink, setVideoLink] = useState("");
  const [game, setGame] = useState();
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { state: UserState } = useContext(UserContext);

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData();
    }
  }, [UserState.value.data]);

  async function fetchData() {
    axios.get(`/api/games/${params.id}`).then((response) => {
      setGame(response.data);
    });
  }

  const handleVideoLinkChange = (e) => {
    setVideoLink(e.target.value);
  };

  const handleSubmit = () => {
    axios
      .post("/api/pitches/create", {
        user_id: UserState.value.data.id,
        game_id: params.id,
        round: game.currentround,
        video_link: videoLink,
        status: "",
      })
      .then(() => {
        router.push(`/user/enrolledgames/${params.id}`);
      });
  };

  return (
    <Sidebar LinkItems={GetLinkItems("user")}>
      {game && (
        <Box p={8} bg="white">
          {/* Instructions Section */}
          <Heading color={"teal"} mb={6}>
            {game?.title}
          </Heading>
          <Box bg="purple.50" p={6} borderRadius="lg" boxShadow="md" mb={8}>
            <Heading size="lg" mb={4}>
              Pitch Recording Instructions
            </Heading>
            <Divider borderColor="gray.400" mb={4} />
            <VStack align="start" spacing={4}>
              <Text fontSize="md">
                <strong>Guidelines for Recording Your Pitch:</strong>
              </Text>
              <Text fontSize="sm">- {game?.description}</Text>
              <Text fontSize="md">
                <strong>Technical Requirements:</strong>
              </Text>
              <Text fontSize="sm">
                - Ensure good lighting and clear audio.
                <br />
                - Use a stable recording device (smartphone or camera).
                <br />- Record in a quiet environment.
              </Text>
              <Text fontSize="md">
                <strong>Recommendation:</strong>
              </Text>
              <Text fontSize="sm">- Upload youtube link.</Text>
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
              isLoading={loading}
              colorScheme="purple"
              size="lg"
              width="full"
              onClick={() => {
                setLoading(true);
                handleSubmit();
              }}
              isDisabled={!videoLink}
              _hover={{ bg: "purple.600" }}
            >
              Submit
            </Button>
          </VStack>
        </Box>
      )}
    </Sidebar>
  );
}