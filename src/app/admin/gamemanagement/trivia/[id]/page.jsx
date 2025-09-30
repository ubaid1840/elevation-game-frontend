"use client";
import RenderProfilePicture from "@/components/RenderProfilePicture";
import { UserContext } from "@/store/context/UserContext";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Center,
  Divider,
  Flex,
  Heading,
  Spinner,
  Stack,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import moment from "moment";
import { useContext, useEffect, useState } from "react";

export default function Page({ params }) {
  const [gameData, setGameData] = useState(null);
  const { state: UserState } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [instructions, setInstructions] = useState([]);
  const toast = useToast();

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData();
    }
  }, [UserState.value.data]);

  async function fetchData() {
    axios
      .get(`/api/trivia/game/${params.id}`)
      .then((response) => {
        setGameData(response.data);
      })
      .catch((e) => {
        toast({
          title: "Error",
          description: e.response.data.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        console.error("Error fetching data:", e);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return loading ? (
    <Center h={"100vh"}>
      <Spinner />
    </Center>
  ) : (
    <Box p={8} minH="100vh">
      <Flex flexWrap={"wrap"} justify={"space-between"}>
        <GameCard gameDetailData={gameData} instructions={instructions} />
        <Leaderboard
          enrollments={gameData?.enrollments || []}
          totalQuestions={gameData?.questions ? gameData?.questions.length : 0}
        />
      </Flex>
      <Divider my={4} />
      <UserResultsAccordion
        enrollments={gameData?.enrollments || []}
        questions={gameData?.questions || []}
      />
    </Box>
  );
}

const GameCard = ({ gameDetailData, instructions }) => {
  return (
    <Box p={6} borderRadius="md" mb={2}>
      <Heading mb={4} color="purple.400">
        {gameDetailData?.game?.title}
      </Heading>

      <Box gap={2} display={"flex"} flexDir={"column"}>
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

        <Text fontWeight="bold">
          Prize:{" "}
          <Badge colorScheme="green">${gameDetailData?.game?.calculated_prize}</Badge>
        </Text>
        <Text fontWeight="bold">
          Winner:{" "}
          {gameDetailData?.game?.winner_id ? (
            <Badge colorScheme="purple">
              {gameDetailData?.game?.winner_name}
            </Badge>
          ) : (
            "TBA"
          )}
        </Text>
        <Text fontWeight="bold">
          Created By:{" "}
          <Badge colorScheme="blue">
            {gameDetailData?.game?.created_by_name}
          </Badge>
        </Text>
        <Text fontWeight="bold">
          Category: {gameDetailData?.game?.category}
        </Text>
        <Text fontWeight="bold">
          Start Date:{" "}
          {gameDetailData?.game?.start_date
            ? moment(gameDetailData.game.start_date).format("MM/DD/YYYY")
            : ""}
        </Text>
        <Text fontWeight="bold">
          Deadline:{" "}
          {gameDetailData?.game?.deadline
            ? moment(gameDetailData.game.deadline).format("MM/DD/YYYY")
            : ""}
        </Text>
        <Text fontWeight="bold">
          Spots Available: {gameDetailData?.game?.spots_remaining}
        </Text>
        <Text fontWeight="bold">
          Total Participants: {gameDetailData?.game?.total_participants}
        </Text>
      </Box>
    </Box>
  );
};

const UserResultsAccordion = ({ enrollments, questions }) => {
  return (
    <>
      <Text fontWeight={"bold"} fontSize={"2xl"} color="purple.500" my={2}>
        Participants Results
      </Text>
      <Accordion allowMultiple>
        {enrollments.map((enrollment) => {
          const { user_name, progress, user_email } = enrollment;

          return (
            <AccordionItem key={enrollment.id}>
              <h2>
                <AccordionButton m={2}>
                  <Flex flex="1" textAlign="left" alignItems={"center"}>
                    <RenderProfilePicture email={user_email} name={user_name} />
                    <Text ml={2}>{user_name || "Unknown User"}</Text>
                  </Flex>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel>
                <VStack spacing={4} align="stretch">
                  {questions.map((question, index) => {
                    const userProgress = progress?.find(
                      (p) => p.question_id === question.id
                    );
                    const isCorrect = userProgress?.isCorrect;
                    const selectedAnswer = userProgress?.selected_option;

                    return (
                      <Box
                        key={question.id}
                        p={4}
                        borderWidth="1px"
                        borderRadius="md"
                        bg={isCorrect ? "green.50" : "red.50"}
                      >
                        <Text fontWeight="bold">
                          {index + 1}. {question.text}
                        </Text>
                        <Stack mt={2} spacing={2}>
                          {question.options.map((option, idx) => (
                            <Box
                              key={idx}
                              p={2}
                              borderWidth="1px"
                              borderRadius="md"
                              bg={
                                option === selectedAnswer
                                  ? isCorrect
                                    ? "green.200"
                                    : "red.200"
                                  : option === question.correct
                                  ? "blue.200"
                                  : "gray.100"
                              }
                            >
                              <Text>
                                {String.fromCharCode(65 + idx)}: {option}
                                {option === selectedAnswer && (
                                  <Badge
                                    ml={2}
                                    colorScheme={isCorrect ? "green" : "red"}
                                  >
                                    {isCorrect
                                      ? "Selected Answer ✔️"
                                      : "Selected Answer ❌"}
                                  </Badge>
                                )}
                                {option === question.correct && !isCorrect && (
                                  <Badge ml={2} colorScheme="blue">
                                    Correct Answer
                                  </Badge>
                                )}
                              </Text>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    );
                  })}
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          );
        })}
      </Accordion>
    </>
  );
};

const Leaderboard = ({ enrollments, totalQuestions }) => {
  const sortedUsers = enrollments
    .map((enrollment) => {
      const progress = Array.isArray(enrollment.progress)
        ? enrollment.progress
        : [];

      const correctAnswers = progress.filter((p) => p.isCorrect).length;
      const totalTime = progress.reduce(
        (acc, curr) => acc + Number(curr.time_taken || 0),
        0
      );

      return {
        user_name: enrollment.user_name || "Unknown User",
        correctAnswers,
        totalQuestions,
        totalTime : totalTime.toFixed(4),
      };
    })
    .sort(
      (a, b) => b.correctAnswers - a.correctAnswers || a.totalTime - b.totalTime
    )
    .slice(0, 10);

  const getRankIcon = (rank) => {
    if (rank === 0) return "🏆";
    if (rank === 1) return "🥈";
    if (rank === 2) return "🥉";
    return `#${rank + 1}`;
  };

  return (
    <Box p={5} borderWidth="1px" borderRadius="md">
      <Text fontSize="2xl" fontWeight="bold" mb={4} textAlign="center">
        Leaderboard 🏆
      </Text>
      <VStack spacing={3} align="stretch">
        {sortedUsers.map(
          (user, index) =>
            index < 5 && (
              <Flex
                key={index}
                justify="space-between"
                align="center"
                p={3}
                borderWidth="1px"
                borderRadius="md"
              >
                <Text fontWeight="bold" flex="1">
                  {getRankIcon(index)} {user.user_name}
                </Text>

                <Badge
                  colorScheme="green"
                  px={3}
                  mx={2}
                  py={1}
                  borderRadius="md"
                >
                  ✅ {user.correctAnswers} / {user.totalQuestions} Correct
                </Badge>

                <Badge colorScheme="blue" px={3} py={1} borderRadius="md">
                  ⏱ {user.totalTime && user.totalTime} sec
                </Badge>
              </Flex>
            )
        )}
      </VStack>
    </Box>
  );
};
