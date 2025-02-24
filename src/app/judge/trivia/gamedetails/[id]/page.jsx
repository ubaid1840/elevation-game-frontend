"use client";
import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Text,
  Stack,
  Heading,
  Button,
  Grid,
  GridItem,
  Divider,
  VStack,
  Flex,
  Link,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  Textarea,
  ModalFooter,
  HStack,
  Spacer,
  Input,
  useToast,
  Select,
  Badge,
  Center,
  Spinner,
  Accordion,
  AccordionButton,
  AccordionPanel,
  AccordionItem,
  AccordionIcon,
} from "@chakra-ui/react";
import axios from "axios";
import { UserContext } from "@/store/context/UserContext";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import { GhostButton } from "@/components/ui/Button";
import { Calendar } from "primereact/calendar";
import moment from "moment";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/config/firebase";

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
        // console.log(response.data);
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
          totalQuestions={
            gameData?.game?.questions ? gameData?.game?.questions.length : 0
          }
        />
      </Flex>
      <Divider my={4} />
      <UserResultsAccordion
        enrollments={gameData?.enrollments || []}
        questions={gameData?.game?.questions || []}
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
          <Text fontWeight="bold">
            Prize:{" "}
            <Badge colorScheme="green">${gameDetailData?.game?.prize}</Badge>
          </Text>
          <Text fontWeight="bold">
            Winner:{" "}
            {gameDetailData?.game?.winner_id ? (
              <Badge colorScheme="purple">{gameDetailData?.game?.winner_name}</Badge>
            ) : (
              "TBA"
            )}
          </Text>
          <Text fontWeight="bold">
            Created By:{" "}
            <Badge colorScheme="blue">{gameDetailData?.game?.created_by_name}</Badge>
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
          const { user_name, progress } = enrollment;

          return (
            <AccordionItem key={enrollment.id}>
              <h2>
                <AccordionButton m={2}>
                  <Box as="span" flex="1" textAlign="left">
                    {user_name || "Unknown User"}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel>
                <VStack spacing={4} align="stretch">
                  {questions.map((question, index) => {
                    const userProgress = progress?.find(
                      (p) => p.questionId === question.id
                    );
                    const isCorrect = userProgress?.isCorrect;
                    const selectedAnswer = userProgress?.answer;

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
                                      ? "Your Answer ✔️"
                                      : "Your Answer ❌"}
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
      const correctAnswers = enrollment?.progress?.filter(
        (p) => p.isCorrect
      ).length;
      const totalTimeTaken = enrollment?.progress?.reduce(
        (acc, p) => acc + (Number(p.timeTaken) || 0),
        0
      );
      const totalTime = (totalTimeTaken / 1000).toFixed(2);

      return {
        user_name: enrollment.user_name || "Unknown User",
        correctAnswers,
        totalQuestions,
        totalTime,
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
                  ⏱ {user.totalTime} sec
                </Badge>
              </Flex>
            )
        )}
      </VStack>
    </Box>
  );
};
