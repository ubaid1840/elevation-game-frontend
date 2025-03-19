"use client";

import { auth } from "@/config/firebase";
import {
    Box,
    Heading,
    Text,
    Grid,
    GridItem,
    Button,
    Badge,
    Link,
    VStack,
    Flex,
} from "@chakra-ui/react";
import { onAuthStateChanged } from "firebase/auth";
import moment from "moment";
import { useEffect, useState } from "react";


export default function PublicGameTrivia({ game }) {

    const [user, setUser] = useState(null);
    const [instructions, setInstructions] = useState([])

    useEffect(() => {
        if (game?.description) {
            const temp = game.description.split("\n")
            setInstructions(temp)
        }
    }, [game])

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(true)
            } else {
                setUser(false)
            }
        });

        return unsubscribe;
    }, [])



    return (
game &&
        <Box p={8} minH="100vh">
            <Flex flexWrap={"wrap"} justify={"space-between"}>
                <GameCard gameDetailData={game} instructions={instructions} />
                <Leaderboard
                    enrollments={game?.enrollments || []}
                    totalQuestions={
                        game?.questions ? game?.questions.length : 0
                    }
                />
            </Flex>
            <Button
                _hover={{ textDecoration: "none", opacity: 0.7 }}
                href={!user ? "/signup" : "/login"}
                as={Link}
                colorScheme="teal"
                isDisabled={!game}
                mt={6}
                width="100%"
            >
                {!user ? "Sign up" : "Dashboard"}
            </Button>
        </Box>

    )
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

const Leaderboard = ({ enrollments, totalQuestions }) => {
    const sortedUsers = enrollments
        .map((enrollment) => {
            const correctAnswers = enrollment?.progress?.filter(
                (p) => p.isCorrect
            ).length;
            const totalTime = enrollment?.progress?.reduce(
                (acc, curr) => acc + Number(curr.time_taken || 0),
                0
            );


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