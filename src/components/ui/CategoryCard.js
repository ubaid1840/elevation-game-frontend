const { VStack, Image, Box, Text } = require("@chakra-ui/react")


const CategoryCard = ({title, spots, grandPrize}) => {

    return (
        <VStack align={'center'} mx={10} w={'300px'} gap={0}>
       <Box w={'100%'} h={'100px'} bg={'purple.800'} display={'flex'} alignItems={'center'} justifyContent={'center'}>
       <Text color={'white'} fontSize={'xl'} fontWeight={'600'}>
                {title}
            </Text>
       </Box>

        <Box w={'100%'} h={'80px'} bg={'white'} display={'flex'} flexDir={'column'} alignItems={'center'} justifyContent={'center'}>
            <Text fontSize={'md'} fontWeight={'700'}>
                Spots Remaining: {spots}
            </Text>
            <Text fontSize={'md'} fontWeight={'700'}>
                Grand Prize: {grandPrize}
            </Text>
        </Box>
</VStack>
    )
}

export default CategoryCard