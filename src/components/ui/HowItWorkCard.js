const { VStack, Image, Box, Text, Center } = require("@chakra-ui/react")


const HowItWorkCard = ({title, img}) => {

    return (
        <VStack align={'center'} gap={5} mx={10}>
            <Center  bg={'gray.200'} borderRadius={100} p={5}>
            <Image src={img} width={'80px'} />
            </Center>
       
        <Box bg={'gray.200'} borderRadius={50} py={2} w={'200px'} display={'flex'} alignItems={'center'} justifyContent={'center'}>
            <Text fontSize={'md'} fontWeight={'700'}>
                {title}
            </Text>
        </Box>
</VStack>
    )
}

export default HowItWorkCard