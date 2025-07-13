const { VStack, Image, Box, Text } = require("@chakra-ui/react")


const CategoryCard = ({ title, spots, grandPrize }) => {
  return (
    <VStack
      align="center"
      spacing={0}
      w={{base : "100%", lg : "400px"}}
      borderRadius="md"
      boxShadow="lg"
    >
      <Box
        w="100%"
        h={{ base: "80px", md: "100px" }}
        bg="purple.800"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text
          color="white"
          fontSize={{ base: "lg", md: "xl" }}
          fontWeight="600"
          textAlign="center"
        >
          {title}
        </Text>
      </Box>

      <Box
        w="100%"
        h={{ base: "80px", md: "100px" }}
        bg="white"
        display="flex"
        flexDir="column"
        alignItems="center"
        justifyContent="center"
        px={4}
        textAlign="center"
      >
        <Text fontSize={{ base: "sm", md: "md" }} fontWeight="700">
          Spots Remaining: {spots}
        </Text>
        <Text fontSize={{ base: "sm", md: "md" }} fontWeight="700">
          Grand Prize: {grandPrize}
        </Text>
      </Box>
    </VStack>
  );
};
export default CategoryCard