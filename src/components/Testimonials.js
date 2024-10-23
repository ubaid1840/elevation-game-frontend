"use client"
import React from "react";
import {
    Avatar,
    Box,
    Button,
    Container,
    Flex,
    Heading,
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
        <Container maxW={'100%'} bgImage={'/howitworksbg.jpg'} bgSize={'cover'} bgPosition={'center'} alignItems={'center'} justifyContent={'center'} display={'flex'} flexDir={'column'} gap={20} py={'100px'}>
            <Heading color="white">TESTIMONIALS</Heading>
            <TestimonialDemo />
        </Container>
    )
}


const testimonials = [
    {
        name: "Jane Cooper",

        bg: "red.200",

    },
    {
        name: "Kai Doe",
        bg: "orange.200",

    },
    {
        name: "Gina Smith",
        bg: "blue.200",

    },
    {
        name: "Brad Watkins",
        bg: "purple.200",

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
                >{`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Auctor
                  neque sed imperdiet nibh lectus feugiat nunc sem.`}</Text>
            </VStack>
        </Flex>
    );
}

function Arrow({ isLeft }) {
    const { onNext, onPrevious } = useCarousel();
    const onClickHandler = () => {
        if (isLeft) {
            onPrevious();
        } else {
            onNext();
        }
    };
    const pos = isLeft ? { left: "10px" } : { right: "10px" };
    return (
        <Flex pos="absolute" {...pos} top="35%">
            <Button size="lg" variant="solid" onClick={onClickHandler}>
                {isLeft ? <ChevronLeft color="#311748FF" /> : <ChevronRight color="#311748FF" />}
            </Button>
        </Flex>
    );
}

function TestimonialDemo() {
    return (
        <Flex flexDir="column">
            <Carousel>
                <Flex w="fit-content" pos="relative">
                    <CarouselItems mx={2}>
                        {testimonials.map(({ name, title, bg, src, heading }, index) => {
                            return (
                                <CarouselItem index={index} key={name}>
                                    <Box p={10}>
                                        <Testimonial bg={bg} />
                                        <TestimonialAvatar name={name} />
                                    </Box>
                                </CarouselItem>
                            );
                        })}
                    </CarouselItems>

                    <Arrow isLeft />
                    <Arrow isLeft={false} />
                </Flex>
            </Carousel>
        </Flex>
    );
}