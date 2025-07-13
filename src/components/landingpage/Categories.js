import { Container, Heading, SimpleGrid } from "@chakra-ui/react";
import CategoryCard from "../ui/CategoryCard";



export default function Categories() {

    return (
    <Container
      as="section"
      id="categories"
      maxW="100%"
      bgImage="/categoriesbg.jpg"
      bgSize="cover"
      bgPosition="center"
      py={{ base: "60px", md: "100px" }}
      px={{ base: 4, md: 8 }}
      display="flex"
      flexDir="column"
      alignItems="center"
      gap={10}
    >
      <Heading color="white" fontSize={{ base: "3xl", md: "5xl" }}>
        CATEGORIES
      </Heading>

      <SimpleGrid
        width="100%"
        justifyContent={{base : "center" , lg :"space-between"}}
        flexDir={'row'}
        flexWrap={'wrap'}
        display={'flex'}
        gap={10}
        
      >
        <CategoryCard title="TECHNOLOGY" spots="10" grandPrize="$20,000" />
        <CategoryCard title="HEALTHCARE" spots="2" grandPrize="$5,000" />
        <CategoryCard title="FINANCE" spots="5" grandPrize="$50,000" />
      </SimpleGrid>
    </Container>
  );
}