"use client";
import {
    Avatar,
    Badge,
    Box,
    Container,
    Heading,
    SimpleGrid,
    Text,
    useColorModeValue,
    VStack
} from "@chakra-ui/react";

// Sample top judges data
const topJudges = [
    {
        id: 1,
        name: "Judge 1",
        expertise: "Sports",
        imageUrl: "https://marketplace.canva.com/EAFqNrAJpQs/1/0/1600w/canva-neutral-pink-modern-circle-shape-linkedin-profile-picture-WAhofEY5L1U.jpg",
        rating: 4.9,
    },
    {
        id: 2,
        name: "Judge 2",
        expertise: "Music",
        imageUrl: "https://media.istockphoto.com/id/1300512215/photo/headshot-portrait-of-smiling-ethnic-businessman-in-office.jpg?s=612x612&w=0&k=20&c=QjebAlXBgee05B3rcLDAtOaMtmdLjtZ5Yg9IJoiy-VY=",
        rating: 4.8,
    },
    {
        id: 3,
        name: "Judge 3",
        expertise: "Strategy Games",
        imageUrl: "https://media.istockphoto.com/id/1317804578/photo/one-businesswoman-headshot-smiling-at-the-camera.jpg?s=612x612&w=0&k=20&c=EqR2Lffp4tkIYzpqYh8aYIPRr-gmZliRHRxcQC5yylY=",
        rating: 4.7,
    },
];

export default function Judges() {
    return (

        <Container as={"section"} id="judges" maxW={'100%'} bgImage={'/howitworksbg.jpg'}  bgSize={'cover'} bgPosition={'center'} alignItems={'center'} justifyContent={'center'} display={'flex'} flexDir={'column'} gap={20} py={'100px'}>
             <Heading color={'white'}>TOP JUDGES</Heading>

            <SimpleGrid columns={[1, 2, 3]} spacing={10}>
                {topJudges.map((judge) => (
                    <JudgeCard key={judge.id} judge={judge} />
                ))}
            </SimpleGrid>

        </Container>
    );
}

function JudgeCard({ judge }) {
    return (
        <Box
        padding={4}
            maxW="sm"
            borderRadius="lg"
            overflow="hidden"
            bg={useColorModeValue("whiteAlpha.200", "gray.700")}
            _hover={{ transform: "scale(1.05)", transition: "0.3s" }}
        >
            <Avatar src={judge.imageUrl} w="250px" h="250px" />

            <Box p={6}>
                <VStack align="start">
                    <Heading size="md" color="white">
                        {judge.name}
                    </Heading>
                    <Text fontSize="sm" color="white">
                        Expertise: {judge.expertise}
                    </Text>
                    <Badge colorScheme="green" borderRadius="full" px={2} mt={2}>
                        {judge.rating} ⭐
                    </Badge>
                </VStack>
            </Box>
        </Box>
    );
}
