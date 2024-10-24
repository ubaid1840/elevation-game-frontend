import { Box, Container, Heading, HStack, Image, SimpleGrid, Stack, Text, VStack } from "@chakra-ui/react";
import CategoryCard from "../ui/CategoryCard";



export default function Categories() {

    return (
        <Container as={"section"} id="categories" maxW={'100%'} bgImage={'/categoriesbg.jpg'} bgSize={'cover'} bgPosition={'center'} alignItems={'center'} justifyContent={'center'} display={'flex'} flexDir={'column'} gap={20} py={'100px'}>

            <Heading color={'white'}>CATEGORIES</Heading>
            <SimpleGrid columns={[1, 2, 3]} spacing={5}>
                <CategoryCard title={"TECHNOLOGY"} spots={"10"} />
                <CategoryCard title={"HEALTHCARE"} spots={"2"} />
                <CategoryCard title={"FINANCE"} spots={"5"} />

            </SimpleGrid>

        </Container>
    )
}