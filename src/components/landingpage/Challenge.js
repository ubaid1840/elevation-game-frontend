import { Container, HStack, Image, Stack, Text, VStack } from "@chakra-ui/react";


export default function Challenge() {

    return (
        <Container maxW={'100%'} bgImage={'/challenge.jpg'} bgSize={'cover'} bgPosition={'center'} height={{base :'100%', md: '100vh'}} alignItems={'center'} justifyContent={'center'} display={'flex'} p={{base : 10, md : 2}}>
            <Stack maxW={'1200px'} gap={{base : 0, md : 20}} display={'flex'} flexDir={{base : 'column', md : "row"}} align={'center'}>
                <Image src="/challenge.png" width={'400px'} display={{base : 'none', md : "unset"}}/>
                <VStack align={'flex-start'} gap={5}>
                    <Text color={'white'} fontSize={'6xl'}>About the challenge</Text>
                    <Text color={'white'} fontSize={'xl'}>Participate in pitch challenges, earn rewards, and engage in a structured game environment. The platform will support various roles, financial incentives, and detailed analytics, all integrated within a robust and secure system.</Text>
                </VStack>
            </Stack>
        </Container>
    )
}