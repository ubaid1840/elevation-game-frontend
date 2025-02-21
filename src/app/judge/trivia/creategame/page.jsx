"use client";

import { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Select,
  IconButton,
  Heading,
  FormControl,
  FormLabel,
  Center,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { Calendar } from "primereact/calendar";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { UserContext } from "@/store/context/UserContext";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [gameName, setGameName] = useState("");
  const [deadline, setDeadline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([
    { text: "", options: [""], correct: "", time: "" },
  ]);
  const [prize, setPrize] = useState("");
  const [fee, setFee] = useState("");
  const { state: UserState } = useContext(UserContext);
  const toast = useToast();

  useEffect(() => {
    if (UserState?.value?.data?.id) setLoading(false);
  }, [UserState]);

  // Function to update question text
  const updateQuestionText = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].text = value;
    setQuestions(updatedQuestions);
  };

  // Function to update time for question
  const updateQuestionTime = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].time = value;
    setQuestions(updatedQuestions);
  };

  // Function to add a new question
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", options: [""], correct: "", time: "" },
    ]);
  };

  // Function to remove a question
  const removeQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  // Function to add an option to a question
  const addOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push("");
    setQuestions(updatedQuestions);
  };

  // Function to update an option
  const updateOption = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  // Function to remove an option
  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuestions(updatedQuestions);
  };

  // Function to set the correct answer
  const setCorrectAnswer = (questionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].correct = value;
    setQuestions(updatedQuestions);
  };

  const initiateGame = () => {

    const localQuestions = questions.map((item, index) => ({ ...item, id: index }));
 
    axios
      .post("/api/trivia/game", {
        deadline: deadline,
        fee: fee,
        prize: prize,
        title: gameName,
        questions: [...localQuestions],
        created_by: UserState.value.data.id,
      })
      .then(() => {
        toast({
          title: "Success",
          description: "Game created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        router.push("/judge/trivia");
      })
      .catch((e) => {
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
  };

  const isFormInvalid = () => {
    if (!gameName.trim() || !deadline || !fee || !prize) {
      return true;
    }
    if (questions.length == 0) {
      return true;
    }
    for (let question of questions) {
      if (!question.text.trim() || !question.correct || !question.time) {
        return true;
      }
      if (
        question.options.length === 0 ||
        question.options.some((opt) => !opt.trim())
      ) {
        return true;
      }
    }

    return false; // Return false if everything is valid
  };

  return loading ? (
    <Center h={"100vh"}>
      <Spinner />
    </Center>
  ) : (
    <Box p={8} bg="white">
      <Heading mb={6} color="purple.700">
        Create Trivia Game
      </Heading>

      {/* Game Name Input */}
      <FormControl mb={6}>
        <FormLabel htmlFor="gameName">Game Name</FormLabel>
        <Input
          id="gameName"
          placeholder="Enter Game Name"
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
        />
      </FormControl>

      {/* Deadline Calendar */}
      <FormControl mb={6}>
        <FormLabel htmlFor="deadline">Deadline</FormLabel>
        <Box
          border="1px solid"
          borderColor="#D0D5DD"
          borderRadius="md"
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="40px"
          px={4}
        >
          <Calendar
            minDate={new Date()}
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
        <FormLabel>Entry Fee</FormLabel>
        <Input
          type="number"
          min={1}
          placeholder="Enter fee"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
        />
      </FormControl>

      <FormControl mb={6}>
        <FormLabel>Prize</FormLabel>
        <Input
          type="number"
          min={1}
          placeholder="Enter prize"
          value={prize}
          onChange={(e) => setPrize(e.target.value)}
        />
      </FormControl>

      {/* Questions Section */}
      {questions.map((question, qIndex) => (
        <Box
          key={qIndex}
          p={4}
          border="1px solid #D0D5DD"
          borderRadius="md"
          mb={6}
        >
          {/* Question Input */}
          <FormControl mb={4}>
            <FormLabel>Question {qIndex + 1}</FormLabel>
            <Input
              placeholder={`Enter question ${qIndex + 1}`}
              value={question.text}
              onChange={(e) => updateQuestionText(qIndex, e.target.value)}
            />
          </FormControl>

          {/* Time Input */}
          <FormControl mb={4}>
            <FormLabel>Time (seconds)</FormLabel>
            <Input
              type="number"
              min={1}
              placeholder="Enter time in seconds"
              value={question.time}
              onChange={(e) => updateQuestionTime(qIndex, e.target.value)}
            />
          </FormControl>

          {/* Options Section */}
          <FormControl mb={4}>
            <FormLabel>Options</FormLabel>
            {question.options.map((option, oIndex) => (
              <HStack key={oIndex} mb={2}>
                <Input
                  placeholder={`Option ${oIndex + 1}`}
                  value={option}
                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                />
                <IconButton
                  aria-label="Remove option"
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  onClick={() => removeOption(qIndex, oIndex)}
                  isDisabled={question.options.length === 1} // Prevent deleting the last option
                />
              </HStack>
            ))}
            <Button size="sm" mt={2} onClick={() => addOption(qIndex)}>
              Add Option
            </Button>
          </FormControl>

          {/* Select Correct Answer */}
          <FormControl mb={4}>
            <FormLabel>Select Correct Answer</FormLabel>
            <Select
              placeholder="Select Correct Answer"
              value={question.correct}
              onChange={(e) => setCorrectAnswer(qIndex, e.target.value)}
            >
              {question.options.map((option, oIndex) => (
                <option key={oIndex} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* Remove Question Button */}
          <Button
            size="sm"
            colorScheme="red"
            onClick={() => removeQuestion(qIndex)}
          >
            Remove Question
          </Button>
        </Box>
      ))}

      {/* Add Question Button */}
      <Button onClick={addQuestion} colorScheme="blue">
        Add Question
      </Button>

      {/* Submit Button */}
      <Button
        ml={2}
        isDisabled={isFormInvalid()}
        colorScheme="purple"
        onClick={() => {
          setLoading(true);
          initiateGame();
        }}
      >
        Initiate Game
      </Button>
    </Box>
  );
}
