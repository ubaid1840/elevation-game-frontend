"use client"
import { Container, Image, Stack, Text, VStack } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Challenge() {
    const [data, setData] = useState([]);

    useEffect(() => {
        axios.get("/api/pagesettings").then((response) => {
            setData(response.data.about.split("\n"));
        });
    }, []);

    return (
        <Container
            maxW="100%"
            minH="100vh"
            bgImage="/challenge.jpg"
            bgSize="cover"
            bgPosition="center"
            display="flex"
            alignItems="center"
            justifyContent="center"
            py={{ base: 10, md: 8 }}
            px={{ base: 4, md: 8 }}
        >
            <Stack
                maxW="1200px"
                spacing={{ base: 6, md: 12, lg: 20 }}
                direction={{ base: "column", lg: "row" }}
                align="center"
                w="full"
            >
                {/* <Image
          src="/challenge.png"
          width={{ base: "0", md: "400px" }}
          display={{ base: "none", md: "block" }}
          flexShrink={0}
        /> */}

                <VStack
                    align="flex-start"
                    spacing={4}
                    my={{ base: 5, md: 10, lg: 20 }}
                    px={{ base: 5, md: 10, lg: 20 }}
                >
                    <Text
                        color="white"
                        fontSize={{ base: "3xl", md: "5xl", lg: "6xl" }}
                        fontWeight="bold"
                    >
                        About the challenge
                    </Text>
                    {data.map((item, index) => (
                        <Text key={index} color="white" fontSize={{ base: "md", md: "xl" }}>
                            {item}
                        </Text>
                    ))}
                </VStack>
            </Stack>
        </Container>
    );
}
