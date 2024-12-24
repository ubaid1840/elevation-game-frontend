"use client";
import React, { useContext, useEffect, useState } from "react";
import {
    Box,
    Heading,
    Stack,
    Text,
    Textarea,
    Button,
    Divider,
    FormControl,
    FormLabel,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Input,
    NumberInput,
    NumberInputField,
    Link,
    Grid,
    GridItem,
    Badge,
    useDisclosure,
    Progress,
} from "@chakra-ui/react";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import axios from "axios";
import { UserContext } from "@/store/context/UserContext";
import moment from "moment";
import Head from "next/head";

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
                `/api/users/${UserState.value.data.id}/games/${params.id}`
            );
            if (response.data?.game?.completed) {
                setProgress(100)
            } else {
                const current = Number(response.data?.game?.currentround || 0) - 1
                const total = Number(response.data?.game?.totalrounds || 1)
                setProgress((current / total) * 100)
            }
            console.log(response.data)
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
                user_id: UserState.value.data.id,
            })
            .then(() => {
                setNewComment("");
                setLoading(false);
                fetchData()
            })
            .catch((e) => {
                setLoading(false);
            })
            .finally(() => {
                onClose();
            });
    }

    const handleShareGame = () => {
        const gameLink = `${window.location.origin}/game/${params.id}`;
        navigator.clipboard.writeText(gameLink).then(() => {
            alert("Game link copied to clipboard!");
        });
    };

    return (
        <Sidebar LinkItems={GetLinkItems("user")}>
            <Box p={8} bg="white">
                <Heading mb={4} color="purple.700">
                    {gameDetailData?.game?.title}
                </Heading>

                <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={4}>
                    <GridItem>
                        <Text fontWeight="bold" color="purple.600">
                            Category: <span>{gameDetailData?.game?.category}</span>
                        </Text>
                    </GridItem>
                    <GridItem>
                        <Text fontWeight="bold" color="purple.600">
                            Tier: <span>{gameDetailData?.game?.level}</span>
                        </Text>
                    </GridItem>
                    <GridItem>
                        <Text fontWeight="bold" color="purple.600">
                            Prize Amount: <span>${gameDetailData?.game?.prize_amount}</span>
                        </Text>
                    </GridItem>
                    <GridItem>
                        <Text fontWeight="bold" color="purple.600">
                            Challenge:{" "}
                            <Link
                                href={gameDetailData?.game?.video_link}
                                color="blue.500"
                                isExternal
                            >
                                Watch
                            </Link>
                        </Text>
                    </GridItem>
                    <GridItem >
                        <Text fontWeight="bold" color="purple.600">
                            Created By: <span>{gameDetailData?.game?.createdby}</span>
                        </Text>
                    </GridItem>
                    <GridItem >
                        <Text fontWeight="bold" color="purple.600">
                            Winner: <span>{gameDetailData?.game?.winner ? <Badge fontSize={'lg'} color={'green'}>{gameDetailData?.game?.winner}</Badge> : "TBA"}</span>
                        </Text>
                    </GridItem>
                    <GridItem >
                        <Text fontWeight="bold" color="purple.600">
                            Deadline: <span>{gameDetailData?.game?.deadline ? moment(gameDetailData.game.deadline).format("MM/DD/YYYY") : ""}</span>
                        </Text>
                    </GridItem>
                    <GridItem >
                        <Text fontWeight="bold" color="purple.600">
                            Current Round: {gameDetailData?.game?.currentround == 0 ? <Badge colorScheme="yellow">Waiting for game to start</Badge> : <span>{gameDetailData?.game?.currentround}</span>}
                        </Text>
                    </GridItem>
                    <GridItem >
                        <Text fontWeight="bold" color="purple.600">
                            Additional Judges:
                        </Text>
                        <Stack spacing={1} mt={2}>
                            {gameDetailData?.game?.judges.map((judge, index) => (
                                <Text key={index}>{judge}</Text>
                            ))}
                        </Stack>
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
                                        <Text>Status: <Badge color={pitch.status && pitch.status == 'Disqualify' ? 'red' : "green"}>{pitch.status}</Badge></Text>
                                        <Text>Score: {pitch.score}</Text>

                                        <Divider my={4} />

                                        <Text fontWeight="bold" color="purple.600" mb={2}>
                                            Comments:
                                        </Text>
                                        <Stack spacing={3} mb={4}>
                                            {pitch.comments?.map((comment, i) => (
                                                <Box key={i} borderWidth="1px" borderRadius="md" p={3}>
                                                    <Text fontWeight="bold">
                                                        {comment.user_id == UserState.value.data.id
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
                        {gameDetailData && !gameDetailData.pitches.some(pitch => pitch.status === "Disqualify") && !gameDetailData?.game?.winner && moment(gameDetailData.game.deadline).isSameOrAfter(moment()) && (
                            <Button
                                w={"full"}
                                as={Link}
                                href={`/user/enrolledgames/${params.id}/recording`}
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
        </Sidebar>
    );
}