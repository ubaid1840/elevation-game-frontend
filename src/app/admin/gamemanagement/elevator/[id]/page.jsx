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
import RenderProfilePicture from "@/components/RenderProfilePicture";
import DeadlineTooltip from "@/components/deadline-tooltip";
import EndGame from "@/components/end-game";

export default function Page({ params }) {

  const [gameData, setGameData] = useState(null);
  const { state: UserState } = useContext(UserContext);
  const [currentRound, setCurrentRound] = useState(1);
  const [winnersList, setWinnersList] = useState([]);
  const [deadline, setDeadline] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenScore,
    onOpen: onOpenScore,
    onClose: onCloseScore,
  } = useDisclosure();

  const {
    isOpen: isOpenWinner,
    onOpen: onOpenWinner,
    onClose: onCloseWinner,
  } = useDisclosure();
  const {
    isOpen: isOpenStart,
    onClose: onCloseStart,
    onOpen: onOpenStart,
  } = useDisclosure();
  const {
    isOpen: isOpenNextRound,
    onOpen: onOpenNextRound,
    onClose: onCloseNextRound,
  } = useDisclosure();

  const {
    isOpen: isOpenEditInstruction,
    onOpen: onOpenEditInstruction,
    onClose: onCloseEditInstruction,
  } = useDisclosure();

  const {
    isOpen: isOpenEndGame,
    onOpen: onOpenEndGame,
    onClose: onCloseEndGame,
  } = useDisclosure();

  const [selectedPitch, setSelectedPitch] = useState();
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newScore, setNewScore] = useState("");
  const [roundLoading, setRoundLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserId2nd, setSelectedUserId2nd] = useState("");
  const [finalScore, setFinalScore] = useState([]);
  const [editInstruction, setEditInstruction] = useState("");
  const [editDescriptionLoading, setEditDescriptionLoading] = useState(false);
  const [winnerLoading, setWinnerLoading] = useState(false);

  const toast = useToast();

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData();
    }
  }, [UserState.value.data]);


  async function fetchData() {
    axios
      .get(`/api/games/${params.id}/judge`)
      .then((response) => {
        setGameData(response.data);
        setCurrentRound(Number(response.data.currentround || 1));
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

  useEffect(() => {
    if (gameData) {
      const qualifiedPitchesWithAverageScore = gameData.enrollments
        .flatMap((enrollment) =>
          enrollment.pitches
            .filter((pitch) => pitch.pitch_status === "Qualify")
            .map((pitch) => {
              const scores = Object.values(pitch.scores);
              const totalScore = scores.reduce((acc, score) => acc + score, 0);
              const averageScore =
                scores.length > 0 ? totalScore / scores.length : 0;

              return {
                ...pitch,
                user_id: enrollment.user_id,
                averageScore,
                totalScore,
              };
            })
        )
        .sort((a, b) => a.round - b.round);

      setFinalScore(qualifiedPitchesWithAverageScore);
    }
  }, [gameData]);

  const playersWithCumulativeScores = useMemo(() => {
    return winnersList.map((eachWinner) => {
      const playerScores = finalScore.filter(
        (eachScore) => eachWinner?.user_id === eachScore?.user_id
      );

      const cumulativeTotal = playerScores.reduce(
        (acc, curr) => acc + curr.totalScore,
        0
      );
      const cumulativeAverage =
        playerScores.length > 0 ? cumulativeTotal / playerScores.length : 0;

      return {
        ...eachWinner,
        cumulativeTotal,
        cumulativeAverage,
      };
    });
  }, [finalScore, winnersList]);

  const sortedPlayers = useMemo(() => {
    return playersWithCumulativeScores.sort(
      (a, b) => b.cumulativeTotal - a.cumulativeTotal
    );
  }, [playersWithCumulativeScores]);

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

  async function handleSubmitComment(pitchid, userID) {
    axios
      .post("/api/comments", {
        pitch_id: pitchid,
        comment_text: newComment,
        user_id: UserState.value.data?.id,
      })
      .then(async () => {
        addDoc(collection(db, "notifications"), {
          to: userID,
          title: "Comment",
          message: `Got a new comment on your pitch in ${gameData.title}`,
          timestamp: moment().valueOf(),
          status: "pending",
        });
        setNewComment("");
        fetchData();
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
    let userID = null;
    gameData.enrollments.map((eachEnrollment) => {
      eachEnrollment.pitches.map((eachPitch) => {
        if (eachPitch.pitch_id === pitch_id) {
          userID = eachPitch.pitch_user_id;
        }
      });
    });
    axios
      .put(`/api/pitches/${pitch_id}`, {
        score: Number(newScore),
        by: UserState.value.data?.id,
      })
      .then(async (response) => {
        addDoc(collection(db, "notifications"), {
          to: userID,
          title: "Score",
          message: `${UserState.value.data.name} has scored on your pitch in game - ${gameData.title}`,
          timestamp: moment().valueOf(),
          status: "pending",
        });
        setNewScore("");
        fetchData();
      })
      .catch((e) => {
        setLoading(false);
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
        round: Number(gameData.currentround) + 1,
        deadline: deadline,
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

  async function handleWinner() {
    setWinnerLoading(true);
    axios
      .put(`/api/games/${gameData.id}`, {
        winnerid: selectedUserId,
        winnerid2nd: selectedUserId2nd,
      })
      .then(async () => {
        toast({
          title: "Success",
          description: "Prize awarded successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        const temp = winnersList.filter(
          (eachWinner) => eachWinner.user_id === Number(selectedUserId)
        );
        addDoc(collection(db, "notifications"), {
          to: selectedUserId,
          title: "Winner Announced",
          message: `${temp[0].user_name} have won ${gameData.title}`,
          timestamp: moment().valueOf(),
          status: "pending",
        });
        fetchData();
      })
      .catch((e) => {
        console.log(e);
        toast({
          title: "Error",
          description: e?.response?.data?.message || "Notification error",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => {
        setWinnerLoading(false);
        onCloseWinner();
      });
  }

  async function handleStartGame() {
    setRoundLoading(true);
    onCloseStart();
    handleMoveToNextRound();
  }

  function handleEditInstruction() {
    onOpenEditInstruction();
    setEditInstruction("");
  }

  function handleSaveInstruction() {
    let temp = {};

    if (gameData?.roundinstruction) {
      temp = { ...gameData.roundinstruction };
    }
    temp[currentRound] = editInstruction;

    axios
      .put(`/api/games/${gameData.id}`, {
        roundinstruction: temp,
      })
      .then(async () => {
        toast({
          title: "Success",
          description: "Description updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchData();
      })
      .catch((e) => {
        console.log(e);
        toast({
          title: "Error",
          description: e?.response?.data?.message || "Notification error",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => {
        setEditDescriptionLoading(false);
      });
  }

  return (
    <>
      <Box p={6} minH="100vh" bg="gray.50">
        <Box
          p={6}
          bg="white"
          borderRadius="lg"
          boxShadow="md"
          whiteSpace="pre-wrap"
          wordBreak="break-word"
        >
          <Heading as="h1" size="xl" mb={4} color="teal.600">
            {gameData?.title}
          </Heading>
          <VStack align="start" spacing={3}>
            {gameData?.closed_by_admin && <Badge fontSize={"md"} color={"red"}>{gameData?.close_reason}</Badge>}
            <Text>
              <strong>Created By:</strong> {gameData?.created_by_name}
            </Text>
            <Text>
              <strong>Current Round:</strong>{" "}
              {gameData && gameData.currentround === 0 ? (
                <Badge colorScheme="yellow">Waiting for game to start</Badge>
              ) : gameData ? (
                `${gameData.currentround} / ${gameData.totalrounds}`
              ) : (
                "NA"
              )}
            </Text>
            <Text>
              <strong>Tier:</strong> {gameData?.level}
            </Text>
            {/* <Text>
              <strong>Prize Amount: </strong> ${gameData?.prize_amount}
            </Text> */}
            <Text>
              <strong>Winner 1st:</strong>{" "}
              {gameData?.winner ? (
                <Badge fontSize={"lg"} color={"green"}>
                  {gameData?.winner_name}
                </Badge>
              ) : (
                "TBA"
              )}
            </Text>

            <Text>
              <strong>Winner 2nd:</strong>{" "}
              {gameData?.winner_2nd ? (
                <Badge fontSize={"lg"} color={"green"}>
                  {gameData?.winner_2nd_name}
                </Badge>
              ) : (
                "TBA"
              )}
            </Text>

            <Text>
              <strong>Additional Judges:</strong>{" "}
              {gameData?.additional_judges_names.join(", ")}
            </Text>

            <DeadlineTooltip>
              <Text>
                <strong>Target Close Date: </strong>
                {gameData?.deadline
                  ? moment(gameData?.deadline).format("MM/DD/YYYY")
                  : "NA"}
              </Text>
            </DeadlineTooltip>



            <Text>
              <strong>Round Instructions:</strong>{" "}
            </Text>
            <Box whiteSpace="pre-wrap">
              {gameData?.roundinstruction?.[currentRound]}
            </Box>

            {gameData && !gameData?.closed_by_admin && !gameData?.winner &&
              <Button
                isLoading={editDescriptionLoading}
                colorScheme="blue"
                onClick={handleEditInstruction}
              >
                Edit Instruction
              </Button>
            }
          </VStack>
        </Box>
        {gameData && (
          <>
            {gameData.currentround === 0 ? (
              !gameData?.closed_by_admin && !gameData?.winner &&
              <Button
                isDisabled={Number(gameData?.spots_remaining ?? -1) !== 0}
                isLoading={roundLoading}
                colorScheme="purple"
                mt={5}
                onClick={() => {
                  onOpenStart();
                }}
              >
                Start Game
              </Button>
            ) : (
              <Box display="flex" justifyContent="space-between" my={4}>
                <Button
                  colorScheme="purple"
                  onClick={handlePreviousRound}
                  disabled={currentRound === 1}
                >
                  Previous Round
                </Button>
                <Text fontWeight="bold" color="purple.700" mx={"5px"}>
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
            )}
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
                      <HStack>
                        <RenderProfilePicture
                          email={enrollment?.user_email}
                          name={enrollment?.user_name}
                        />
                        <Heading size="md" color="gray.700">
                          {enrollment.user_name}
                        </Heading>
                      </HStack>

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
                                    <strong>Status:</strong>{" "}
                                    {pitch.pitch_status || "TBD"}
                                  </Text>
                                  <HStack>
                                    <Text>
                                      <strong>Score:</strong>
                                    </Text>
                                    <VStack>
                                      {pitch.scores &&
                                        pitch.scores[
                                        UserState.value.data?.id
                                        ] !== undefined && (
                                          <Text>
                                            {
                                              pitch.scores[
                                              UserState.value.data?.id
                                              ]
                                            }
                                          </Text>
                                        )}
                                    </VStack>
                                  </HStack>

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
                                  {!pitch.scores ||
                                    (pitch.scores[UserState.value.data?.id] ==
                                      undefined && (
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
                                      ))}
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
                              {pitch.comments.map((comment, ind) => (
                                <Box
                                  key={ind}
                                  mt={2}
                                  p={3}
                                  bg="white"
                                  borderRadius="md"
                                  border="1px solid"
                                  borderColor="gray.200"
                                  boxShadow="sm"
                                >
                                  <Text>
                                    <strong>{comment.commented_by_name}</strong>
                                    : {comment.comment_text}
                                  </Text>
                                  <Text fontSize="sm" color="gray.500">
                                    {new Date(
                                      comment.created_at
                                    ).toLocaleString()}
                                  </Text>
                                </Box>
                              ))}
                              <Button
                                mt={4}
                                colorScheme="purple"
                                onClick={() => {
                                  setSelectedPitch({
                                    pitch: pitch,
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
          </>
        )}
      </Box>
      {gameData?.totalrounds &&
        gameData.currentround === currentRound &&
        !gameData.winner && !gameData?.closed_by_admin && (
          <Button
            isDisabled={gameData.currentround === gameData.totalrounds}
            isLoading={roundLoading}
            mx={4}
            mb={2}
            colorScheme="purple"
            size={"lg"}
            onClick={() => {
              onOpenNextRound();
            }}
          >
            Move To Next Round
          </Button>
        )}
      {gameData &&
        gameData.currentround === gameData.totalrounds &&
        !gameData.winner && !gameData?.closed_by_admin && 
        (
          <Button
            mx={4}
            mb={2}
            colorScheme="teal"
            size={"lg"}
            onClick={() => {
              const validUsers = gameData.enrollments
                .filter((enrollment) =>
                  enrollment.pitches.every(
                    (pitch) => pitch.pitch_status !== "Disqualify"
                  )
                )
                .map((enrollment) => ({
                  user_id: enrollment.user_id,
                  user_name: enrollment.user_name,
                }));
              setWinnersList(validUsers);
              setSelectedUserId("")
              setSelectedUserId2nd("")
              onOpenWinner();
            }}
          >
            Announce Winner
          </Button>
        )}


      {gameData &&
        !gameData.winner && !gameData?.closed_by_admin && 
        (
          <EndGame type="elevator" gameid={gameData?.id} isOpen={isOpenEndGame} onClose={onCloseEndGame} onRefresh={() => {
            fetchData()
          }} onClick={() => {
            if (gameData.enrollments.length > 1) {
              const validUsers = gameData.enrollments
                .filter((enrollment) =>
                  enrollment.pitches.every(
                    (pitch) => pitch.pitch_status !== "Disqualify"
                  )
                )
                .map((enrollment) => ({
                  user_id: enrollment.user_id,
                  user_name: enrollment.user_name,
                }));
              setWinnersList(validUsers);
              setSelectedUserId("")
              setSelectedUserId2nd("")
              onOpenWinner();
            } else {
              onOpenEndGame()
            }
          }} />
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
                  selectedPitch.pitch_user_id
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

      <Modal isOpen={isOpenWinner} onClose={onCloseWinner}>
        <ModalOverlay />
        <ModalContent
          minW={{ base: "90%", md: "800px" }}
          minH={{ base: "90%", md: "500px" }}
          maxH="90vh"
        >
          <ModalHeader>Award Prize</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack
              gap={{ base: 4, md: 6 }}
              align="stretch"
              spacing={{ base: 4, md: 6 }}
            >
              <Box flex={1}>
                <FormControl id="user_id" mb={4}>
                  <FormLabel>Select 1st Winner</FormLabel>
                  <Select
                    placeholder="Select 1st winner"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    {winnersList.map((winner) => (
                      <option key={winner.user_id} value={winner.user_id}>
                        {winner.user_name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box flex={1}>
                <FormControl id="user_id_2nd" mb={4}>
                  <FormLabel>Select 2nd Winner</FormLabel>
                  <Select
                    placeholder="Select 2nd winner"
                    value={selectedUserId2nd}
                    onChange={(e) => setSelectedUserId2nd(e.target.value)}
                  >
                    {winnersList.map((winner) => (
                      <option key={winner.user_id} value={winner.user_id}>
                        {winner.user_name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box
                flex={1}
                overflowY="auto"
                maxH={{ base: "250px", md: "450px" }}
                w="100%"
              >
                <Text mb={2} fontSize="xl" fontWeight="bold">
                  Final Scores per round
                </Text>

                <>
                  {sortedPlayers.map((eachWinner, ind) => {
                    const playerScores = finalScore.filter(
                      (eachScore) => eachWinner?.user_id === eachScore?.user_id
                    );

                    return (
                      <Box key={ind} mb={4}>
                        <Text fontWeight="bold">{eachWinner.user_name}</Text>
                        {playerScores.map((eachScore, i) => (
                          <Text key={i}>
                            Round {eachScore?.round} Total Score:{" "}
                            {eachScore?.totalScore} <br />
                            Round {eachScore?.round} Average Score:{" "}
                            {eachScore?.averageScore}
                          </Text>
                        ))}
                      </Box>
                    );
                  })}

                  {/* Show cumulative total and average for each player at the bottom */}
                  <Text mb={2} fontSize="xl" fontWeight="bold">
                    Final Scores Cumulative
                  </Text>
                  <Box mt={4}>
                    {sortedPlayers.map((eachWinner, i) => (
                      <Box key={i} mb={2}>
                        <Text fontWeight="bold">{eachWinner.user_name}</Text>
                        <Text>
                          Cumulative Total Score: {eachWinner.cumulativeTotal}
                        </Text>
                        <Text>
                          Cumulative Average Score:{" "}
                          {eachWinner.cumulativeAverage.toFixed(2)}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                </>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" onClick={onCloseWinner}>
              Cancel
            </Button>
            <Button
              isLoading={winnerLoading}
              isDisabled={
                !selectedUserId ||
                !selectedUserId2nd ||
                winnerLoading
              }
              colorScheme="blue"
              ml={3}
              onClick={handleWinner}
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenStart} onClose={onCloseStart}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Start Game</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Text fontWeight={"600"}>Deadline</Text>
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
                minDate={new Date()}
                id="deadline"
                value={deadline}
                onChange={(e) => {
                  setDeadline(e.value);
                }}
                showIcon
                className="custom-calendar"
                dateFormat="mm/dd/yy"
                style={{ width: "100%", zIndex: 99999 }}
              />
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button variant={"outline"} onClick={onCloseStart}>
              Cancel
            </Button>
            <Button
              isDisabled={
                !deadline ||
                !gameData ||
                moment(deadline).isSameOrBefore(
                  moment(new Date(gameData.deadline))
                )
              }
              colorScheme="blue"
              ml={3}
              onClick={handleStartGame}
            >
              Start
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenNextRound} onClose={onCloseNextRound}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Next Round</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Text fontWeight={"600"}>Deadline</Text>
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
                minDate={new Date()}
                id="deadline"
                value={deadline}
                onChange={(e) => {
                  setDeadline(e.value);
                }}
                showIcon
                className="custom-calendar"
                dateFormat="mm/dd/yy"
                style={{ width: "100%", zIndex: 99999 }}
              />
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button variant={"outline"} onClick={onCloseNextRound}>
              Cancel
            </Button>
            <Button
              isDisabled={
                !deadline ||
                !gameData ||
                moment(deadline).isSameOrBefore(
                  moment(new Date(gameData.deadline))
                )
              }
              colorScheme="blue"
              ml={3}
              onClick={() => {
                setRoundLoading(true);
                onCloseNextRound();
                handleMoveToNextRound();
              }}
            >
              Next Round
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenEditInstruction} onClose={onCloseEditInstruction}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Instructions</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <FormControl mt={6}>
              <FormLabel htmlFor="new-comment" fontWeight="bold">
                Instruction:
              </FormLabel>
              <Textarea
                maxH={"400px"}
                isDisabled={loading}
                id="edit-description"
                value={editInstruction}
                onChange={(e) => setEditInstruction(e.target.value)}
                placeholder="Type instruction..."
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button variant={"outline"} onClick={onCloseEditInstruction}>
              Cancel
            </Button>
            <Button
              isDisabled={!editInstruction}
              colorScheme="blue"
              ml={3}
              onClick={() => {
                setEditDescriptionLoading(true);
                onCloseEditInstruction();
                handleSaveInstruction();
              }}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
