import { Container, HStack, Image, Stack, Text, VStack } from "@chakra-ui/react";
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
        <Container maxW={'100%'} bgImage={'/challenge.jpg'} bgSize={'cover'} bgPosition={'center'} height={{ base: '100%', md: '100vh' }} alignItems={'center'} justifyContent={'center'} display={'flex'} p={{ base: 10, md: 2 }}>
            <Stack maxW={'1200px'} gap={{ base: 0, md: 20 }} display={'flex'} flexDir={{ base: 'column', md: "row" }} align={'center'}>
                <Image src="/challenge.png" width={'400px'} display={{ base: 'none', md: "unset" }} />
                <VStack align={'flex-start'} gap={5}>
                    <Text color={'white'} fontSize={'6xl'}>About the challenge</Text>
                    {data.map((item, index) => (
                        <Text key={index} color={'white'} fontSize={'xl'}>{item}</Text>
                    ))}

                </VStack>
            </Stack>
        </Container>
    )
}