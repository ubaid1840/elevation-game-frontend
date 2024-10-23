
import {
    Box,
    Heading,
    Container,
    Text,
    Stack,
    Icon,
    useColorModeValue,
    createIcon,
    VStack,
} from "@chakra-ui/react";
import Button from "./ui/Button";


export default function HomePage() {

    return (
        
           

            <Container as={"section"} id="home" maxW={'100%'} bgImage={'/home.jpg'} bgSize={'cover'} bgPosition={'center'} height={'100vh'} alignItems={'center'} justifyContent={'center'}>

                <VStack
                    align={'center'}
                    justify={'center'}
                    textAlign={'center'}
                    w={'100%'}
                    height={'100%'}
                >
                    <Text variant={'heading'} fontSize={'8xl'} color={'white'}>
                        THE GAME OF CHALLENGES
                    </Text>
                    <Text fontSize={'2xl'} color={'white'}>
                        Join the Virtual Three-Minute Elevator Pitch and complete for exciting prizes!
                    </Text>
                    <div>
                        <Button size={'lg'} mt={4}>
                            GET STARTED
                        </Button>
                    </div>

                </VStack>
            </Container>
       
    )
}