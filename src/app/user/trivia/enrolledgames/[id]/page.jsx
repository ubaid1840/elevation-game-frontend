"use client";
import DeadlineTooltip from "@/components/deadline-tooltip";
import { UserContext } from "@/store/context/UserContext";
import { debounce } from "@/utils/debounce";
import {
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Radio,
  RadioGroup,
  Spacer,
  Spinner,
  Stack,
  Text,
  useToast,
  VStack
} from "@chakra-ui/react";
import axios from "axios";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";

export default function Page({ params }) {
  const { state: UserState } = useContext(UserContext);
  const router = useRouter();
  const toast = useToast();

  const [gameDetailData, setGameDetailData] = useState(null);
  const [questions, setQuestions] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [myGameResult, setMyGameResult] = useState();
  const [instructions, setInstructions] = useState([]);
  const [hasAnswered, setHasAnswered] = useState(false);

  useEffect(() => {
    if (UserState.value.data?.id) {
      debouncedFetchData(UserState.value.data?.id);
    }

  }, [UserState.value.data?.id]);

  const debouncedFetchData = useCallback(
    debounce((id) => {
      fetchData(id);
    }, 3000),
    []
  );

  async function fetchQuestion(id) {
    try {
      const response = await axios.get(
        `/api/trivia/users/${id}/games/${params.id}/question`
      );
      if ( !response.data?.message) {
        setQuestions(response.data);
        setTimeLeft(response.data.time * 1000);
      } else {
        setQuestions({});
        fetchMyGameResult(id);

      }
    } catch (e) {
      console.log("Error fetching questions:", e.message);
      toast({
        title: e?.response?.data?.message || e?.message,
        status: "error",
      });
    } finally {
      setLoading(false);
      setHasAnswered(false);
    }
  }

  async function fetchData(id) {
    try {
      const response = await axios.get(
        `/api/trivia/users/${id}/games/${params.id}`
      );
      if (response.data?.enrollment?.payment_intent_id) {
        setInstructions(response.data?.game?.description.split("\n"));
        setGameDetailData(response.data);
        fetchQuestion(id);
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

  async function fetchMyGameResult(id) {
    axios
      .get(`/api/trivia/users/${id}/games/${params.id}/result`)
      .then((response) => {
        setMyGameResult(response.data);
      });
  }


  useEffect(() => {
    if (timeLeft && timeLeft > 0) {
      if (!isModalOpen && !isLoading) {
        const timer = setTimeout(() => setTimeLeft((prev) => prev - 100), 100);
        return () => clearTimeout(timer);
      }
    } else if (!hasAnswered) {
      setHasAnswered(true);
      handleAnswer();
    }
  }, [timeLeft, isModalOpen, isLoading, hasAnswered]);

  const handleAnswer = async () => {
    if (!questions.question_id) return;

    setIsLoading(true);

    axios
      .post(
        `/api/trivia/users/${UserState.value.data.id}/games/${params.id}/question`,
        {
          question_id: questions.question_id,
          selected_option: selectedAnswer,
        }
      )
      .then((response) => {
        setIsLoading(false);
        setSelectedAnswer(null);
        setIsCorrect(response.data.isCorrect);
        setCorrectAnswer(response.data.correct_answer);
        setIsModalOpen(true);
      });
  };

  const handleShareGame = () => {
    const totalTime = myGameResult?.gameDetails?.progress.reduce(
      (acc, curr) => acc + curr.time_taken,
      0
    );
    const correctAnswers = myGameResult?.gameDetails?.progress.filter(
      (p) => p.isCorrect
    ).length;
    const totalQuestions = myGameResult?.questions.length || 0;
    const referral_code = UserState.value.data?.referral_code;

    const gameLink = `${window.location.origin}/game/trivia/${params.id}?time=${totalTime}&correct=${correctAnswers}&question=${totalQuestions}&referral=${referral_code}`;
    navigator.clipboard.writeText(gameLink).then(() => {
      alert("Game link copied to clipboard!");
    });
  };

  const RenderQuestions = useCallback(() => {
    return (
      <RadioGroup onChange={setSelectedAnswer} value={selectedAnswer}>
        <Stack>
          {questions?.options.map((option, idx) => (
            <Radio key={idx} value={option}>
              {String.fromCharCode(idx + 65)}: {option}
            </Radio>
          ))}
        </Stack>
      </RadioGroup>
    );
  }, [questions, selectedAnswer]);

  return (
    <Box p={8} minH="100vh">
      <GameCard gameDetailData={gameDetailData} instructions={instructions} />
      {myGameResult ? (
        <GameResult data={myGameResult} handleShareGame={handleShareGame} />
      ) :
        loading ? (
          <Center mt={10}>
            <Spinner />
          </Center>
        ) : (
          <Box p={5} maxW="600px" mx="auto">
            {questions?.question ? (
              <VStack spacing={4} align="stretch">
                <Text fontSize="lg">Question: {questions?.question}</Text>
                <Progress
                  value={(timeLeft / (questions?.time * 1000)) * 100}
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
                {" Preparing..."}
              </Text>
            )}
          </Box>
        )}
      <AnswerModal
        visible={isModalOpen}
        onClose={(val) => {
          setIsModalOpen(val);
          setQuestions({});
          fetchQuestion(UserState.value.data.id);
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

const GameCard = ({ gameDetailData, instructions }) => {
  return (
    <Box textAlign="center" p={6} borderRadius="md" mb={6}>
      <Heading mb={4} color="purple.400">
        {gameDetailData?.game?.title}
      </Heading>

      <Grid
        templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)" }}
        gap={6}
        mb={4}
      >
        <GridItem>
          {instructions.length > 0 && (
            <Stack dir={{ sm: "column", base: "row" }} justify={"center"}>
              <Text fontWeight="bold">Game Instructions: </Text>
              <VStack gap={0}>
                {instructions.map((eachInstruction, index) => (
                  <Text key={index} fontSize="sm">
                    {`- ${eachInstruction}`}
                  </Text>
                ))}
              </VStack>
            </Stack>
          )}
        </GridItem>

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
        <DeadlineTooltip>
          <GridItem>
            <Text fontWeight="bold">
              Target Close Date:{" "}
              {gameDetailData?.game?.deadline
                ? moment(gameDetailData.game.deadline).format("MM/DD/YYYY")
                : ""}
            </Text>
          </GridItem>
        </DeadlineTooltip>
      </Grid>

      <Divider my={4} />
    </Box>
  );
};

const GameResult = ({ data, handleShareGame }) => {
  const totalTime = data?.gameDetails?.progress.reduce(
    (acc, curr) => acc + curr.time_taken,
    0
  );
  const correctAnswers = data?.gameDetails?.progress.filter(
    (p) => p.isCorrect
  ).length;
  const totalQuestions = data?.questions.length || 0;

  return (
    <Box px={5} mx="auto">
      {/* Summary Box */}
      <Flex>
        <Spacer />
        <Button colorScheme="teal" onClick={handleShareGame} mb={4}>
          Share Game Result
        </Button>
      </Flex>

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
            {totalTime && totalTime.toFixed(4)} seconds
          </Badge>
        </Text>
      </Box>

      <VStack spacing={6} align="stretch">
        {data?.questions.map((question, index) => {
          const userProgress = data?.gameDetails?.progress.find(
            (p) => p.question_id === question.id
          );
          const isCorrect = userProgress?.isCorrect;
          const selectedAnswer = userProgress?.selected_option;
          const timeTaken = userProgress?.time_taken || 0;

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
