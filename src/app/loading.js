'use client'
import { Flex, Spinner, useColorModeValue } from '@chakra-ui/react'
export default function Loading() {
    return (
        <Flex flex={1} alignItems={'center'} justifyContent={'center'} height={'100vh'} bg={useColorModeValue("gray.900", "gray.800")}>
            <Spinner color='white'/>
        </Flex>
    )
}