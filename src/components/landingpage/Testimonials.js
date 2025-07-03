"use client"
import React from "react";
import {
    Avatar,
    Box,
    Button,
    Container,
    Flex,
    Heading,
    HStack,
    Link,
    Stack,
    Text,
    VStack
} from "@chakra-ui/react";
import {
    Carousel,
    CarouselItem,
    useCarouselItem,
    CarouselItems,
    useCarousel
} from "chakra-framer-carousel";
import { ChevronLeft, ChevronRight } from "react-feather";


export default function Testimonials() {

    return (
        <Container maxW={'100%'} bgImage={'/challenge.jpg'} bgSize={'cover'} bgPosition={'center'} alignItems={'center'} justifyContent={'center'} display={'flex'} flexDir={'column'} gap={20} py={'100px'}>
            <Heading color="white">TESTIMONIALS</Heading>
            <TestimonialDemo />
        </Container>
    )
}

function Toolbar() {
    const { onNext, onPrevious } = useCarousel();
    return (
        <Flex w="full" justify="center">
            <HStack>
                <Button w="115px" onClick={onPrevious}>
                    <ChevronLeft color="#311748FF" />
                </Button>
                <Button w="115px" onClick={onNext}>
                    <ChevronRight color="#311748FF" />
                </Button>
            </HStack>
        </Flex>
    );
}

const testimonials = [
    {
        name: "Darius King",
        text: "As a former Shark Tank hopeful, the Game of Challenges gave me a second chance to shine—this time without giving up equity!",
        bg: "red.200",

    },
    {
        name: "Nia Martinez",
        text : "I’ve earned real money playing Trivia and pitching my business ideas—this is the future of virtual competitions.",
        bg: "orange.200",

    },
    {
        name: "Elisa (Judge)",
        text : "As a judge, I’ve been blown away by the creativity of the participants. This platform is unlike anything I’ve ever seen.",
        bg: "blue.200",

    },
    {
        name: "Game Fact",
        text : "Game of Challenges is backed by a real U.S. Patent and built with purpose: to empower entrepreneurs, content creators, and thinkers.",
        bg: "purple.200",

    },
    {
        name : "Malik R. (Trivia Winner)",
        text : "I made $1,200 from two trivia games and I didn’t even need a subscription. This is way better than traditional giveaways.",
        bg : "orange.200"
    },
    {
        name : "Sandra J. (Platinum Member)",
        text : "The elevator pitch helped me raise awareness for my nonprofit—judges gave me real feedback, not just scores.",
        bg : "yellow.200"
    }
];

const TestimonialAvatar = ({ name }) => {
    return (
        <Flex align={"center"} mt={8} direction={"column"}>
            <Stack spacing={-1} align={"center"}>
                <Text color={'white'} fontWeight={600}>{name}</Text>
            </Stack>
        </Flex>
    );
};

function Testimonial({ bg, heading }) {
    const { onClickHandler, position } = useCarouselItem();
    const isCenter = position === "center";
    return (
        <Flex
            w={isCenter ? "375px" : "325px"}
            h={isCenter ? "250px" : "200px"}
            pos="relative"
            boxShadow="lg"
            align="center"
            as="button"
            onClick={onClickHandler}
            bg={bg}
            rounded="xl"
            justify="center"
            _after={{
                content: `""`,
                w: 0,
                h: 0,
                borderLeft: "solid transparent",
                borderLeftWidth: 16,
                borderRight: "solid transparent",
                borderRightWidth: 16,
                borderTop: "solid",
                borderTopWidth: 16,
                borderTopColor: bg,
                pos: "absolute",
                bottom: "-16px",
                left: "50%",
                transform: "translateX(-50%)"
            }}
        >
            <VStack p={10}>

                <Text
                    fontSize="sm"
                    textAlign="center"
                >{heading}</Text>
            </VStack>
        </Flex>
    );
}



function TestimonialDemo() {
    return (
        <Flex flexDir="column">
            <Carousel>
                <Flex w="fit-content" flexDir="column">
                    <CarouselItems mx={2}>
                        {testimonials.map(({ name, text, bg }, index) => {
                            return (
                                <CarouselItem index={index} key={name}>
                                    <Box p={10}>
                                        <Testimonial heading={text} bg={bg} />
                                        <TestimonialAvatar name={name} />
                                    </Box>
                                </CarouselItem>
                            );
                        })}
                    </CarouselItems>
                    <Toolbar />
                </Flex>
            </Carousel>
        </Flex>
    );
}