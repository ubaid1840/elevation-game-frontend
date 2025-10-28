"use client";
import { db } from "@/config/firebase";
import { UserContext } from "@/store/context/UserContext";
import {
    Badge,
    Box,
    Button,
    Divider,
    FormControl,
    FormLabel,
    Grid,
    GridItem,
    Heading,
    HStack,
    Link,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Progress,
    Stack,
    Text,
    Textarea,
    useDisclosure,
    VStack
} from "@chakra-ui/react";
import axios from "axios";
import { addDoc, collection } from "firebase/firestore";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import DeadlineTooltip from "./deadline-tooltip";

export default function GameDetail({ params }) {

    const [newComment, setNewComment] = useState("");
    const [currentRound, setCurrentRound] = useState(1);
    const [gameDetailData, setGameDetailData] = useState(null);
    const { state: UserState } = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedPitch, setSelectedPitch] = useState();
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        if (UserState.value.data?.id) {
            fetchData();
        }
    }, [UserState.value.data]);

    async function fetchData() {
        try {
            const response = await axios.get(
                `/api/users/${UserState.value.data?.id}/games/${params.id}`
            );
            if (response.data?.game?.completed) {
                setProgress(100)
            } else {
                const current = Number(response.data?.game?.currentround || 0) - 1
                const total = Number(response.data?.game?.totalrounds || 1)
                setProgress((current / total) * 100)
            }
            setGameDetailData(response.data);
            setCurrentRound(response.data.game?.currentround || 1)
        } catch (error) {
            console.error("Error fetching game details:", error);
        }
    }

    const handleNextRound = () => {
        if (currentRound < gameDetailData?.game?.totalrounds) {
            setCurrentRound(currentRound + 1);
        }
    };

    const handlePreviousRound = () => {
        if (currentRound > 1) {
            setCurrentRound(currentRound - 1);
        }
    };

    const currentRoundPitches = gameDetailData?.pitches?.filter(
        (pitch) => pitch.round === currentRound
    );

    async function handleSubmitComment(pitchid, ind) {
        axios
            .post("/api/comments", {
                pitch_id: pitchid,
                comment_text: newComment,
                user_id: UserState.value.data?.id,
            })
            .then(async () => {
                let notify = []
                notify.push(Number(gameDetailData?.game?.created_by))
                gameDetailData.game.additional_judges.map((eachJudge) => {
                    notify.push(eachJudge)
                })
                const promises = notify.map(async (eachJudge) => {
                    try {
                        return await addDoc(collection(db, "notifications"), {
                            to: eachJudge,
                            title: "Comment",
                            message: `${UserState.value.data?.name || UserState.value.data?.email} commented on pitch in ${gameDetailData.game.title}`,
                            timestamp: moment().valueOf(),
                            status: "pending"
                        });
                    } catch (error) {
                        console.error(`Failed to add notification for ${eachJudge}:`, error);

                    }
                });

                try {
                    await Promise.all(promises);
                    console.log("All notifications sent successfully");
                } catch (error) {
                    console.error("Error sending notifications:", error);
                }
                setNewComment("");
                setLoading(false);
                fetchData()
            })
            .catch((e) => {
                console.log(e)
                setLoading(false);
            })
            .finally(() => {
                onClose();
            });
    }

    const handleShareGame = () => {
        const gameLink = `${window.location.origin}/game/elevator/${params.id}`;
        navigator.clipboard.writeText(gameLink).then(() => {
            alert("Game link copied to clipboard!");
        });
    };

    return (
        <>
            <Box p={8} bg="white">
                <Heading mb={4} color="purple.700">
                    {gameDetailData?.game?.title}
                </Heading>

                {gameDetailData?.game?.closed_by_admin && <Badge mb={4} fontSize={"md"} color={"red"}>{gameDetailData?.game?.close_reason}</Badge>}

                <Grid
                    templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }}
                    gap={6}
                    mb={4}
                    overflow="hidden"
                >
                    <GridItem>
                        <Text fontWeight="bold" color="purple.600" wordBreak="break-word">
                            Category: <span>{gameDetailData?.game?.category}</span>
                        </Text>
                    </GridItem>

                    <GridItem>
                        <Text fontWeight="bold" color="purple.600" wordBreak="break-word">
                            Tier: <span>{gameDetailData?.game?.level}</span>
                        </Text>
                    </GridItem>

                    <GridItem>
                        <Text fontWeight="bold" color="purple.600" wordBreak="break-word">
                            Challenge:{" "}
                            <Link
                                href={gameDetailData?.game?.video_link}
                                color="blue.500"
                                isExternal
                                wordBreak="break-all"
                            >
                                Watch
                            </Link>
                        </Text>
                    </GridItem>

                    <GridItem>
                        <Text fontWeight="bold" color="purple.600" wordBreak="break-word">
                            Created By: <span>{gameDetailData?.game?.createdby}</span>
                        </Text>
                    </GridItem>

                    <GridItem>
                        <Text fontWeight="bold" color="purple.600" wordBreak="break-word">
                            Winner 1st:{" "}
                            {gameDetailData?.game?.winner ? (
                                <Badge
                                    colorScheme="green"
                                    fontSize="sm"
                                    whiteSpace="normal"
                                    wordBreak="break-word"
                                    maxW="full"
                                >
                                    {gameDetailData?.game?.winner}
                                </Badge>
                            ) : (
                                gameDetailData?.game?.closed_by_admin ? "No winner selected" : "TBA"
                            )}
                        </Text>
                    </GridItem>

                    <GridItem>
                        <Text fontWeight="bold" color="purple.600" wordBreak="break-word">
                            Winner 2nd:{" "}
                            {gameDetailData?.game?.winner_2nd ? (
                                <Badge
                                    colorScheme="green"
                                    fontSize="sm"
                                    whiteSpace="normal"
                                    wordBreak="break-word"
                                    maxW="full"
                                >
                                    {gameDetailData?.game?.winner_2nd}
                                </Badge>
                            ) : (
                                gameDetailData?.game?.closed_by_admin ? "No winner selected" : "TBA"
                            )}
                        </Text>
                    </GridItem>

                    <DeadlineTooltip>
                        <GridItem>
                            <Text fontWeight="bold" color="purple.600">
                                Target Close Date:{" "}
                                <span>
                                    {gameDetailData?.game?.deadline
                                        ? moment(gameDetailData.game.deadline).format("MM/DD/YYYY")
                                        : ""}
                                </span>
                            </Text>
                        </GridItem>
                    </DeadlineTooltip>

                    <GridItem>
                        <Text fontWeight="bold" color="purple.600" wordBreak="break-word">
                            Current Round:{" "}
                            {gameDetailData?.game?.currentround == 0 ? (
                                <Badge colorScheme="yellow" whiteSpace="normal" wordBreak="break-word">
                                    Waiting for game to start
                                </Badge>
                            ) : (
                                <span>{gameDetailData?.game?.currentround}</span>
                            )}
                        </Text>
                    </GridItem>

                    <GridItem>
                        <Text fontWeight="bold" color="purple.600">
                            Additional Judges:
                        </Text>
                        <Stack spacing={1} mt={2}>
                            {gameDetailData?.game?.judges.map((judge, index) => (
                                <Text key={index} fontSize="sm" wordBreak="break-word">
                                    {judge}
                                </Text>
                            ))}
                        </Stack>
                    </GridItem>

                    <GridItem>
                        <Text fontWeight="bold" color="purple.600">
                            Round Instructions:
                        </Text>
                        <Box whiteSpace="pre-wrap" mt={2} wordBreak="break-word">
                            {gameDetailData?.game?.roundinstruction?.[currentRound]}
                        </Box>
                    </GridItem>
                </Grid>


                {gameDetailData && gameDetailData.game.currentround !== 0 &&
                    <>
                        <Button colorScheme="teal" onClick={handleShareGame} mb={4}>
                            Share Game Link
                        </Button>
                        {gameDetailData &&
                            <Progress
                                value={progress}
                                colorScheme="purple"
                                size="lg"
                                width="100%"
                                borderRadius="md"
                            />
                        }

                        <Divider my={6} />


                        {/* Round Navigation */}
                        <Box display="flex" justifyContent="space-between" mb={4}>
                            <Button
                                colorScheme="purple"
                                onClick={handlePreviousRound}
                                disabled={currentRound === 1}
                            >
                                Previous Round
                            </Button>
                            <Text fontWeight="bold" color="purple.700">
                                Round: {currentRound}/{gameDetailData?.game?.totalrounds}
                            </Text>
                            <Button
                                colorScheme="purple"
                                onClick={handleNextRound}
                                disabled={currentRound === gameDetailData?.game?.totalrounds}
                            >
                                Next Round
                            </Button>
                        </Box>

                        <Divider my={6} />

                        {/* Pitches for Current Round */}
                        <Text fontWeight="bold" fontSize="xl" color="purple.600" mb={4}>
                            Pitches for Round {currentRound}:
                        </Text>
                        <Stack spacing={6}>
                            {currentRoundPitches?.map((pitch, index) => (
                                <Box key={pitch.id}>
                                    <Box borderWidth="1px" borderRadius="md" p={4}>
                                        <Text fontWeight="bold">
                                            Pitch:{" "}
                                            <Text
                                                color={"purple.400"}
                                                as={Link}
                                                href={pitch.video_link}
                                                target="blank"
                                            >
                                                Watch
                                            </Text>
                                        </Text>
                                        <Text color="blue.500">
                                            <Link href={pitch.videoLink} isExternal>
                                                {pitch.videoLink}
                                            </Link>
                                        </Text>
                                        <Text>Status: <Badge color={pitch.status && pitch.status == 'Disqualify' ? 'red' : "green"}>{pitch?.status || "TBD"}</Badge></Text>
                                        <HStack align={'flex-start'}>
                                            <Text>Scores:</Text>
                                            <VStack align={'flex-start'} gap={0}>
                                                {gameDetailData?.game?.created_by !== "1" && <Text >{`${gameDetailData?.game?.createdby}: ${pitch.scores[gameDetailData?.game?.created_by] || "Not Scored"} `}</Text>}
                                                {gameDetailData?.game?.additional_judges.map((id, index) => {
                                                    return {
                                                        name: gameDetailData?.game?.judges[index],
                                                        score: pitch.scores[id] || "Not Scored",
                                                    };
                                                }).map(({ name, score }, idx) => (
                                                    <Text key={idx}>{`${name}: ${score} `}</Text>
                                                ))}
                                            </VStack>
                                        </HStack>
                                        {pitch.scores && (() => {
                                            const scores = Object.values(pitch.scores);
                                            const totalScore = scores.reduce((acc, score) => acc + score, 0);
                                            const averageScore = scores.length > 0 ? (totalScore / scores.length) : 0;
                                            return (
                                                <Text>{`Average Score: `} <strong>{averageScore}</strong></Text>
                                            );
                                        })()}

                                        <Divider my={4} />

                                        <Text fontWeight="bold" color="purple.600" mb={2}>
                                            Comments:
                                        </Text>
                                        <Stack spacing={3} mb={4}>
                                            {pitch.comments?.map((comment, i) => (
                                                <Box key={i} borderWidth="1px" borderRadius="md" p={3}>
                                                    <Text fontWeight="bold">
                                                        {comment.user_id == UserState.value.data?.id
                                                            ? UserState.value.data.name
                                                            : "Judge"}
                                                        :
                                                    </Text>
                                                    <Text>{comment.comment_text}</Text>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Box>
                                    <Button
                                        isDisabled={!UserState.value.data?.navigationAllowed}
                                        mt={4}
                                        colorScheme="purple"
                                        onClick={() => {
                                            setSelectedPitch({
                                                pitch: pitch,
                                                ind: index,
                                            });
                                            onOpen();
                                        }}
                                    >
                                        Add Comment
                                    </Button>
                                </Box>
                            ))}
                        </Stack>
                        {gameDetailData && (gameDetailData.game.currentround === currentRound) && !gameDetailData.pitches.some(pitch => pitch.status === "Disqualify") && !gameDetailData?.game?.winner && !gameDetailData?.game?.closed_by_admin && (
                            <Button
                                isDisabled={!UserState.value.data?.navigationAllowed}
                                w={"full"}
                                as={Link}
                                href={!UserState.value.data?.navigationAllowed ? "#" : `/user/elevator/enrolledgames/${params.id}/recording`}
                                colorScheme="teal"
                                mt={4}
                                _hover={{ textDecoration: "none" }}
                            >
                                Submit Pitch
                            </Button>
                        )}
                    </>
                }

            </Box>

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
                                handleSubmitComment(selectedPitch.pitch.id, selectedPitch.ind);
                            }}
                        >
                            Submit Comment
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}