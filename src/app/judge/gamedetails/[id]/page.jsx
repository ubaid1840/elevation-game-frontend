"use client";
import { useContext, useEffect, useState } from "react";
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
} from "@chakra-ui/react";
import axios from "axios";
import { UserContext } from "@/store/context/UserContext";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";

export default function Page({ params }) {
  const router = useRouter();

  const [gameData, setGameData] = useState(null);
  const { state: UserState } = useContext(UserContext);
  const [currentRound, setCurrentRound] = useState(1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenScore,
    onOpen: onOpenScore,
    onClose: onCloseScore,
  } = useDisclosure();
  const [selectedPitch, setSelectedPitch] = useState();
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newScore, setNewScore] = useState("");
  const [roundLoading, setRoundLoading] = useState(false);

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData();
    }
  }, [UserState.value.data]);

  async function fetchData() {
    try {
      const response = await axios.get(`/api/games/${params.id}/judge`);
      setGameData(response.data);
      setCurrentRound(Number(response.data.currentround || 1));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  const handleNextRound = () => {
    if (currentRound < gameData?.totalrounds) {
      setCurrentRound(currentRound + 1);
    }
  };

  const handlePreviousRound = () => {
    if (currentRound > 1) {
      setCurrentRound(currentRound - 1);
    }
  };

  async function handleSubmitComment(pitchid, pitchIndex, enrollmentIndex) {
    axios
      .post("/api/comments", {
        pitch_id: pitchid,
        comment_text: newComment,
        user_id: UserState.value.data.id,
      })
      .then(() => {
        setNewComment("");
        fetchData();
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
      })
      .finally(() => {
        onClose();
        setSelectedPitch();
      });
  }

  async function handleSubmitScore(pitch_id) {
    axios
      .put(`/api/pitches/${pitch_id}`, {
        score: Number(newScore),
      })
      .then((response) => {
        setNewScore("");
        fetchData();
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        onCloseScore();
        setSelectedPitch();
      });
  }

  async function handlePitchStatus(val, pitch_id) {
    axios
      .put(`/api/pitches/${pitch_id}`, {
        status: val,
      })
      .then((response) => {
        fetchData();
      })
      .catch((e) => {
        console.log(e);
      });
  }

  async function handleMoveToNextRound() {
    axios
      .put(`/api/nextround`, {
        id: gameData.id,
        round: (Number(gameData.currentround) + 1),
      })
      .then(() => {
        fetchData();
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setRoundLoading(false);
      });
  }

  return (
    <Sidebar LinkItems={GetLinkItems("judge")}>
      <Box p={6} minH="100vh" bg="gray.50">
        <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
          <Heading as="h1" size="xl" mb={4} color="teal.600">
            {gameData?.title}
          </Heading>
          <VStack align="start" spacing={3}>
            <Text>
              <strong>Created By:</strong> {gameData?.created_by_name}
            </Text>
            <Text>
              <strong>Current Round:</strong> {gameData?.currentround} /{" "}
              {gameData?.totalrounds}
            </Text>
            <Text>
              <strong>Level:</strong> {gameData?.level}
            </Text>
            <Text>
              <strong>Prize Amount:</strong> {gameData?.prize_amount}
            </Text>
            <Text>
              <strong>Winner:</strong> {gameData?.winner || "N/A"}
            </Text>
            <Text>
              <strong>Additional Judges:</strong>{" "}
              {gameData?.additional_judges_names.join(", ")}
            </Text>
          </VStack>
        </Box>

        <Box display="flex" justifyContent="space-between" my={4}>
          <Button
            colorScheme="purple"
            onClick={handlePreviousRound}
            disabled={currentRound === 1}
          >
            Previous Round
          </Button>
          <Text fontWeight="bold" color="purple.700">
            Round: {currentRound}/{gameData?.totalrounds}
          </Text>
          <Button
            colorScheme="purple"
            onClick={handleNextRound}
            disabled={currentRound === gameData?.totalrounds}
          >
            Next Round
          </Button>
        </Box>

        <Heading as="h2" size="lg" mt={10} mb={6} color="teal.500">
          Enrollments
        </Heading>

        <Stack spacing={6}>
          {gameData?.enrollments &&
            gameData.enrollments.map((enrollment, enrolIndex) => (
              <Box
                key={enrollment.user_id}
                p={6}
                bg="white"
                borderRadius="lg"
                boxShadow="md"
              >
                <Stack spacing={4}>
                  <Heading size="md" color="gray.700">
                    {enrollment.user_name}
                  </Heading>

                  {enrollment.pitches.map(
                    (pitch, index) =>
                      pitch.round === currentRound && (
                        <Box
                          key={pitch.pitch_id}
                          p={5}
                          mt={4}
                          bg="gray.100"
                          borderRadius="md"
                          border="1px solid"
                          borderColor="gray.200"
                        >
                          <HStack>
                            <VStack align={"flex-start"}>
                              <Text>
                                <strong>Round:</strong> {pitch.round}
                              </Text>
                              <Text>
                                <strong>Status:</strong> {pitch.pitch_status}
                              </Text>
                              <Text>
                                <strong>Score:</strong> {pitch.score}
                              </Text>
                              <Text>
                                <strong>Video Link:</strong>{" "}
                                <Text
                                  as={Link}
                                  href={pitch.video_link}
                                  target="_blank"
                                  color={"purple.300"}
                                  fontWeight={"bold"}
                                >
                                  Watch
                                </Text>
                              </Text>
                            </VStack>
                            <Spacer />
                            <VStack align={"flex-end"}>
                              {!pitch.score && (
                                <Button
                                  size={"sm"}
                                  colorScheme="purple"
                                  onClick={() => {
                                    setSelectedPitch({
                                      pitch: pitch,
                                      pitchIndex: index,
                                      enrollmentIndex: enrolIndex,
                                    });
                                    onOpenScore();
                                  }}
                                >
                                  Add Score
                                </Button>
                              )}
                              {!pitch.pitch_status && (
                                <>
                                  <Button
                                    size={"sm"}
                                    colorScheme="teal"
                                    onClick={() => {
                                      handlePitchStatus(
                                        "Qualify",
                                        pitch.pitch_id
                                      );
                                    }}
                                  >
                                    Qualify
                                  </Button>
                                  <Button
                                    size={"sm"}
                                    colorScheme="red"
                                    onClick={() => {
                                      handlePitchStatus(
                                        "Disqualify",
                                        pitch.pitch_id
                                      );
                                    }}
                                  >
                                    Disqualify
                                  </Button>
                                </>
                              )}
                            </VStack>
                          </HStack>

                          <Heading size="sm" mt={4} color="teal.500">
                            Comments:
                          </Heading>
                          {pitch.comments.map((comment) => (
                            <Box
                              key={comment.commented_by}
                              mt={2}
                              p={3}
                              bg="white"
                              borderRadius="md"
                              border="1px solid"
                              borderColor="gray.200"
                              boxShadow="sm"
                            >
                              <Text>
                                <strong>{comment.commented_by_name}</strong>:{" "}
                                {comment.comment_text}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                {new Date(comment.created_at).toLocaleString()}
                              </Text>
                            </Box>
                          ))}
                          <Button
                            mt={4}
                            colorScheme="purple"
                            onClick={() => {
                              setSelectedPitch({
                                pitch: pitch,
                                pitchIndex: index,
                                enrollmentIndex: enrolIndex,
                              });
                              onOpen();
                            }}
                          >
                            Add Comment
                          </Button>
                        </Box>
                      )
                  )}
                </Stack>
              </Box>
            ))}
        </Stack>
      </Box>
      {gameData?.totalrounds && (
        <Button
          isDisabled={gameData.currentround === gameData.totalrounds}
          isLoading={roundLoading}
          m={4}
          colorScheme="purple"
          size={"lg"}
          onClick={() => {
            setRoundLoading(true);
            handleMoveToNextRound();
          }}
        >
          Move To Next Round
        </Button>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Pitch {Number(selectedPitch?.ind || 0) + 1}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mt={6}>
              <FormLabel htmlFor="new-comment" fontWeight="bold">
                Add a Comment:
              </FormLabel>
              <Textarea
                isDisabled={loading}
                id="new-comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type your comment here..."
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
            <Button
              ml={3}
              isLoading={loading}
              colorScheme="purple"
              onClick={() => {
                setLoading(true);
                handleSubmitComment(
                  selectedPitch.pitch.pitch_id,
                  selectedPitch.pitchIndex,
                  selectedPitch.enrollmentIndex
                );
              }}
            >
              Submit Comment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenScore} onClose={onCloseScore}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Pitch {Number(selectedPitch?.ind || 0) + 1}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mt={6}>
              <FormLabel htmlFor="new-comment" fontWeight="bold">
                Add Score:
              </FormLabel>
              <Input
                isDisabled={loading}
                id="new-score"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                placeholder="Score out of 100..."
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onCloseScore}>
              Close
            </Button>
            <Button
              ml={3}
              isLoading={loading}
              colorScheme="purple"
              onClick={() => {
                setLoading(true);
                handleSubmitScore(selectedPitch.pitch.pitch_id);
              }}
            >
              Submit Score
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Sidebar>
  );
}
