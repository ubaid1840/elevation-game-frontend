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
} from "@chakra-ui/react";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";


export default function PublicGame({ game }) {

    const [user, setUser] = useState(null);

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

    function formatYouTubeURL(url) {
        if (url.includes("youtu.be")) {
            const videoId = url.split("youtu.be/")[1];
            return `https://www.youtube.com/embed/${videoId}`;

        } else if (url.includes("youtube.com/watch?v=")) {
            const videoId = new URL(url).searchParams.get("v");
            return `https://www.youtube.com/embed/${videoId}`;

        } else if (url.includes("youtube.com/shorts/")) {
            const videoId = url.split("youtube.com/shorts/")[1];
            return `https://www.youtube.com/embed/${videoId}`;

        } else if (url.includes("m.youtube.com/watch?v=")) {
            const videoId = new URL(url).searchParams.get("v");
            return `https://www.youtube.com/embed/${videoId}`;
        }

        return url;
    }

    return (

        <Box p={8} bg="white">
            {/* Game Title */}
            <Heading color="teal" mb={6} fontSize="2xl">
                {game?.title}
            </Heading>

            {/* Game Details Section */}
            <Box bg="gray.50" p={6} borderRadius="lg" boxShadow="md" mb={8}>
                <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={4}>
                    <GridItem>
                        <Text fontWeight="bold">Description:</Text>
                        <Text fontSize="sm">{game?.description}</Text>
                    </GridItem>
                    <GridItem>
                        <Text fontWeight="bold">Category:</Text>
                        <Badge colorScheme="purple" fontSize="sm">{game?.category}</Badge>
                    </GridItem>
                    <GridItem>
                        <Text fontWeight="bold">Total Spots:</Text>
                        <Text fontSize="sm">{game?.total_spots}</Text>
                    </GridItem>
                    <GridItem>
                        <Text fontWeight="bold">Spots Remaining:</Text>
                        <Text fontSize="sm">{game?.spots_remaining}</Text>
                    </GridItem>
                    <GridItem>
                        <Text fontWeight="bold">Total Rounds:</Text>
                        <Text fontSize="sm">{game?.totalrounds}</Text>
                    </GridItem>
                    <GridItem>
                        <Text fontWeight="bold">Prize Amount:</Text>
                        <Text fontSize="sm">${game?.prize_amount}</Text>
                    </GridItem>
                    <GridItem>
                        <Text fontWeight="bold">Tier:</Text>
                        <Text fontSize="sm">{game?.level}</Text>
                    </GridItem>
                </Grid>
            </Box>

            {/* Challenge Video Section */}
            {game?.video_link && (
                <Box my={6}>
                    <Heading size="lg" color="purple.700" mb={2}>
                        Challenge Video
                    </Heading>
                    <iframe
                        width="100%"
                        height="400"
                        src={formatYouTubeURL(game.video_link)}
                        title="Challenge Video"
                        frameBorder="0"
                        allowFullScreen
                    ></iframe>
                </Box>
            )}


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