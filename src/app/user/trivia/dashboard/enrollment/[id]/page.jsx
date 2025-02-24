"use client";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Box,
  Heading,
  Stack,
  Text,
  Button,
  Progress,
  VStack,
  RadioGroup,
  Radio,
  Badge,
  Grid,
  GridItem,
  Divider,
  useToast,
  Skeleton,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Spinner,
} from "@chakra-ui/react";
import axios from "axios";
import { UserContext } from "@/store/context/UserContext";
import moment from "moment";
import { redirect, useRouter } from "next/navigation";
import { debounce } from "@/utils/debounce";

export default function Page({ params }) {
  const { state: UserState } = useContext(UserContext);
  const router = useRouter();
  const toast = useToast();

  const [gameDetailData, setGameDetailData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [instructions, setInstructions] = useState([]);

  useEffect(() => {
    if (UserState.value.data?.id) {
      debouncedFetchData(params.id);
    }
  }, [UserState.value.data]);

  const debouncedFetchData = useCallback(
    debounce((id) => {
      fetchData(id);
    }, 3000),
    []
  );

  async function fetchData(id) {
    try {
      const response = await axios.get(`/api/trivia/game/${id}`);
      if (response.data?.game?.description) {
        const splitData = response.data.game.description.split("\n");
        setInstructions(splitData);
      }
      setGameDetailData(response.data);
    } catch (e) {
      console.log("Error fetching game details:", e.message);
      toast({
        title: e?.response?.data?.message || e?.message,
        status: "error",
      });
    }
  }

  async function handleEnroll() {
    setLoading(true);
    axios
      .put(`/api/trivia/game/${params.id}`, {
        user_id: UserState.value.data.id,
      })
      .then(() => {
        router.push(`/user/trivia/enrolledgames/${params.id}`);
      })
      .catch((e) => {
        console.log(e);
        toast({
          title: "Error",
          description: e?.response?.data?.message || e?.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <Box p={8} minH="100vh">
      <Box p={6} borderRadius="md" mb={6}>
        <Heading mb={4} color="purple.400">
          {gameDetailData?.game?.title}
        </Heading>

        <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={4}>
          <GridItem>
            <Text fontWeight="bold">
              Prize:{" "}
              <Badge colorScheme="green">${gameDetailData?.game?.prize}</Badge>
            </Text>
          </GridItem>
          <GridItem>
            <Text fontWeight="bold">
              Winner:{" "}
              {gameDetailData?.game?.winner ? (
                <Badge colorScheme="purple">
                  {gameDetailData?.game?.winner_name}
                </Badge>
              ) : (
                "TBA"
              )}
            </Text>
          </GridItem>
          <GridItem>
            <Text fontWeight="bold">
              Created By:{" "}
              <Badge colorScheme="blue">
                {gameDetailData?.game?.created_by_name}
              </Badge>
            </Text>
          </GridItem>

          <GridItem>
            <Text fontWeight="bold">
              Category: {gameDetailData?.game?.category}
            </Text>
          </GridItem>

          <GridItem>
            <Text fontWeight="bold">
              Start Date:{" "}
              {gameDetailData?.game?.start_date
                ? moment(gameDetailData.game.start_date).format("MM/DD/YYYY")
                : ""}
            </Text>
          </GridItem>

          <GridItem>
            <Text fontWeight="bold">
              Deadline:{" "}
              {gameDetailData?.game?.deadline
                ? moment(gameDetailData.game.deadline).format("MM/DD/YYYY")
                : ""}
            </Text>
          </GridItem>

          <GridItem>
            <Text fontWeight="bold">
              Spots Available: {gameDetailData?.game?.spots_remaining}
            </Text>
          </GridItem>

          <GridItem>
            <Text fontWeight="bold">
              Total Participants: {gameDetailData?.game?.total_participants}
            </Text>
          </GridItem>
        </Grid>

        {instructions.length > 0 && (
          <>
            <Text fontSize="md">
              <strong>Game Instructions:</strong>
            </Text>
            <VStack align={"flex-start"} gap={0}>
              {instructions.map((eachInstruction, index) => (
                <Text key={index} fontSize="sm">
                  {`- ${eachInstruction}`}
                </Text>
              ))}
            </VStack>
          </>
        )}

        <Divider my={4} />
        {gameDetailData?.game && (
          <Button
            isLoading={loading}
            onClick={() => handleEnroll()}
            colorScheme="blue"
            disabled={
              gameDetailData.game.spots_remaining === 0 ||
              moment().isBefore(moment(gameDetailData.game.startDate), "day")
            }
          >
            Play Game
          </Button>
        )}
      </Box>
    </Box>
  );
}
