import { Box, Container, Heading, HStack, Image, SimpleGrid, Stack, Text, VStack } from "@chakra-ui/react";
import HowItWorkCard from "../ui/HowItWorkCard";


export default function How() {

    return (
        <Container as={"section"} id="howitworks" maxW={'100%'} bgImage={'/howitworksbg.jpg'} bgSize={'cover'} bgPosition={'center'} minH={'100vh'} alignItems={'center'} justifyContent={'center'} display={'flex'} flexDir={'column'} p={{base : 10, md : 10}}>
            <Heading color={'white'}>HOW IT WORKS?</Heading>
            <VStack align={'center'} justify={'center'}>
                <SimpleGrid columns={[1, 2, 3]} spacing={5} mt={10} >
                    <HowItWorkCard title={"1- Choose a game"} img={"/choosegame.png"} />
                    <HowItWorkCard title={"2- Enroll"} img={"/enroll.png"} />
                    <HowItWorkCard title={"3- Record Your Pitch"} img={"/record.png"} />

                </SimpleGrid>
                <SimpleGrid columns={[1, 2]} spacing={5} mt={10} >
                    <HowItWorkCard title={"4- Get Critiques"} img={"/getcritique.png"} />
                    <HowItWorkCard title={"5- Compete for Prizes"} img={"/compete.png"} />
                </SimpleGrid>
            </VStack>
        </Container>
    )
}