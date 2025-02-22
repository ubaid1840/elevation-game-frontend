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
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState("");

  useEffect(() => {
    if (UserState.value.data?.id) {
      debouncedFetchData(UserState.value.data?.id);
    }
  }, [UserState.value.data]);

  const debouncedFetchData = useCallback(
    debounce((id) => {
      fetchData(id);
    }, 3000),
    []
  );

  const shuffleArray = (array) => {
    return array
      .map((item) => ({
        ...item,
        options: item.options.sort(() => Math.random() - 0.5),
      }))
      .sort(() => Math.random() - 0.5);
  };

  async function fetchData(id) {
    try {
      const response = await axios.get(
        `/api/trivia/users/${id}/games/${params.id}`
      );

      if (response.data?.enrollment?.payment_intent_id) {
        setGameDetailData(response.data);

        let shuffledQuestions = shuffleArray(response.data.game.questions);

        const userProgress = response.data.enrollment.progress || [];
        setProgress(userProgress);

        const remainingQuestions = shuffledQuestions.filter(
          (q) =>
            !userProgress.some((p) => Number(p.questionId) === Number(q.id))
        );

        if (remainingQuestions.length > 0) {
          setLoading(false);
          setQuestions(remainingQuestions);
          setCurrentIndex(0);
          setTimeLeft(remainingQuestions[0].time || 10);
        } else {
          setLoading(false);
          toast({ title: "You have completed this game!", status: "info" });
        }
      } else {
        router.push(
          `/triviapayment?g=${params.id}&fee=${response.data.game.fee}`
        );
      }
    } catch (e) {
      console.log("Error fetching game details:", e.message);
      toast({
        title: e?.response?.data?.message || e?.message,
        status: "error",
      });
      router.push("/user/trivia/enrolledgames");
    }
  }

  useEffect(() => {
    if (timeLeft > 0) {
      if (!isModalOpen && !isLoading) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      }
    } else {
      handleAnswer();
    }
  }, [timeLeft, isModalOpen, isLoading]);

  const handleAnswer = async () => {
    if (questions.length === 0) return;

    setIsLoading(true);

    const correct = questions[currentIndex].correct === selectedAnswer;
    setIsCorrect(correct);
    setCorrectAnswer(questions[currentIndex].correct);
    setIsModalOpen(true);

    const questionData = {
      questionId: questions[currentIndex].id,
      answer: selectedAnswer,
      timeTaken: questions[currentIndex].time - timeLeft,
      isCorrect: correct,
    };

    setProgress([...progress, questionData]);

    axios
      .put(
        `/api/trivia/users/${UserState.value.data.id}/games/${params.id}/progress`,
        {
          progress: [...progress, questionData],
        }
      )
      .then(() => {
        if (currentIndex + 1 < questions.length) {
         
          setSelectedAnswer(null);
          setIsLoading(false);
        } else {
          setQuestions([]);
          toast({
            title: "Game Finished! Results Submitted.",
            status: "success",
          });
        }
      })
      .catch((e) => {
        toast({
          title: e?.response?.data?.message || e?.message,
          status: "error",
        });
      });
  };

  const RenderQuestions = useCallback(() => {
    return (
      <RadioGroup onChange={setSelectedAnswer} value={selectedAnswer}>
        <Stack>
          {questions[currentIndex].options.map((option, idx) => (
            <Radio key={idx} value={option}>
              {String.fromCharCode(idx + 65)}: {option}
            </Radio>
          ))}
        </Stack>
      </RadioGroup>
    );
  }, [questions, currentIndex, selectedAnswer]);

  return (
    <Box p={8} minH="100vh">
      <GameCard gameDetailData={gameDetailData} />
      {progress.length > 0 &&
      gameDetailData &&
      gameDetailData?.game?.questions.length === progress.length ? (
        <GameResult
          progress={progress}
          questions={gameDetailData?.game?.questions || []}
        />
      ) : loading ? (
        <Center mt={10}>
          <Spinner />
        </Center>
      ) : (
        gameDetailData && (
          <Box p={5} maxW="600px" mx="auto">
            {questions.length > 0 && currentIndex < questions.length ? (
              <VStack spacing={4} align="stretch">
                <Text fontSize="lg">
                  Question: {questions[currentIndex].text}
                </Text>
                <Progress
                  value={(timeLeft / questions[currentIndex].time) * 100}
                  size="sm"
                  colorScheme="purple"
                />
                <RenderQuestions />
                <Button
                  colorScheme="purple"
                  onClick={handleAnswer}
                  isDisabled={!selectedAnswer || isLoading}
                >
                  {isLoading ? "Saving..." : "Continue"}
                </Button>
              </VStack>
            ) : (
              <Text fontSize="xl" textAlign="center">
                {isLoading ? "Game finished" : " Preparing next question..."}
              </Text>
            )}
          </Box>
        )
      )}
      <AnswerModal
        visible={isModalOpen}
        onClose={(val) => {
          setIsModalOpen(val);
          if(currentIndex + 1 < questions.length){
            setCurrentIndex(currentIndex + 1);
            setTimeLeft(questions[currentIndex + 1].time || 10);
          }
       
        }}
        isCorrect={isCorrect}
        correctAnswer={correctAnswer}
      />
    </Box>
  );
}

const AnswerModal = ({ visible, onClose, isCorrect, correctAnswer }) => {
  return (
    <Modal isOpen={visible} onClose={() => onClose(false)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Answer Feedback</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isCorrect ? (
            <Text color="green.500">✅ Correct Answer!</Text>
          ) : (
            <Text color="red.500">
              ❌ Wrong Answer! <br />✅ Correct Answer:{" "}
              <strong>{correctAnswer}</strong>
            </Text>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => onClose(false)} colorScheme="blue">
            Continue
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const GameCard = ({ gameDetailData }) => {
  return (
    <Box textAlign="center" p={6} borderRadius="md" mb={6}>
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
              <Badge colorScheme="purple">{gameDetailData?.game?.winner}</Badge>
            ) : (
              "TBA"
            )}
          </Text>
        </GridItem>
        <GridItem>
          <Text fontWeight="bold">
            Created By:{" "}
            <Badge colorScheme="blue">{gameDetailData?.game?.createdby}</Badge>
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
      </Grid>

      <Divider my={4} />
    </Box>
  );
};

const GameResult = ({ progress, questions }) => {
  const totalTime = progress.reduce((acc, curr) => acc + curr.timeTaken, 0);
  const correctAnswers = progress.filter((p) => p.isCorrect).length;
  const totalQuestions = questions.length;

  return (
    <Box px={5} mx="auto">
      {/* Summary Box */}
      <Box
        textAlign="center"
        p={5}
        mb={6}
        borderWidth="1px"
        borderRadius="md"
        bg="gray.50"
      >
        <Text fontSize="2xl" fontWeight="bold">
          Game Results
        </Text>
        <Text fontSize="lg" mt={2}>
          <Badge colorScheme="green" fontSize="lg">
            {correctAnswers} / {totalQuestions}
          </Badge>{" "}
          Correct Answers
        </Text>
        <Text fontSize="lg" mt={2}>
          ⏳ Total Time Taken:{" "}
          <Badge colorScheme="blue" fontSize="lg">
            {totalTime} seconds
          </Badge>
        </Text>
      </Box>

      <VStack spacing={6} align="stretch">
        {questions.map((question, index) => {
          const userProgress = progress.find(
            (p) => p.questionId === question.id
          );
          const isCorrect = userProgress?.isCorrect;
          const selectedAnswer = userProgress?.answer;
          const timeTaken = userProgress?.timeTaken || 0;

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

              <Text fontSize="sm" color="gray.500" mt={1}>
                ⏱️ Time Taken: {timeTaken} seconds
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
                        <Badge ml={2} colorScheme={isCorrect ? "green" : "red"}>
                          {isCorrect ? "Your Answer ✔️" : "Your Answer ❌"}
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
    </Box>
  );
};
