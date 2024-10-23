"use client"
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
    SimpleGrid,
    Link,
    HStack,
    Wrap,
    WrapItem,
} from "@chakra-ui/react";
import { FaFacebook, FaInstagram, FaPinterest, FaTwitter } from "react-icons/fa6";


export default function Footer() {

    return (
        
           

            <Container bg={'#282828FF'} color={'white'} maxW={'100%'} fontWeight={'600'} py={5} alignItems={'center'} justifyContent={'center'} display={'flex'} px={20}>
                <Wrap justify={'space-between'} w={'100%'} align={'center'}>
                    <WrapItem>
                    <VStack align={'flex-start'}  justify={'center'} w={'fit-content'}>
                        <Text as={Link} href="#" _hover={{opacity:0.7}}>ABOUT</Text>
                        <Text color={'whiteAlpha.700'} fontWeight={'400'}>Learn more about our mission and team</Text>
                    </VStack>
                    </WrapItem>
                    <WrapItem>
                    <VStack  align={'flex-start'} justify={'center'} w={'fit-content'}>
                        <Text as={Link} href="#" _hover={{opacity:0.7}}>PRIVACY POLICY</Text>
                        <Text color={'whiteAlpha.700'} fontWeight={'400'}>Understand how we handle your data</Text>
                    </VStack>
                    </WrapItem>
                    <WrapItem>
                    <VStack align={'flex-start'}  justify={'center'} w={'fit-content'}>
                        <Text as={Link} href="#" _hover={{opacity:0.7}}>TERMS OF SERVICE</Text>
                        <Text color={'whiteAlpha.700'} fontWeight={'400'}>Review the terms of using our service</Text>
                    </VStack>
                    </WrapItem>
                    <WrapItem>
                    <VStack align={'center'} justify={'center'} w={'fit-content'}>
                        <Text>SOCIAL</Text>
                        <HStack width={'200px'}  justify={'space-between'} px={5} py={3}>
                            <Icon as={FaInstagram} color={'purple.500'} boxSize={6}/>
                            <Icon as={FaTwitter} color={'purple.500'} boxSize={6}/>
                            <Icon as={FaPinterest} color={'purple.500'} boxSize={6}/>
                            <Icon as={FaFacebook} color={'purple.500'} boxSize={6}/>
                        </HStack>
                    </VStack>
                    </WrapItem>
                    </Wrap>
                
            </Container>
       
    )
}