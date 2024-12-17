const { Flex, Button, Icon, Box } = require("@chakra-ui/react")
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";



const Pagination = ({currentPage, onChange, data,}) => {

  
    const totalPages = Math.ceil(data.length / 10);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            onChange(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            onChange(currentPage - 1);
        }
    };

    return (
        <Flex justifyContent="flex-end" alignItems="center" mt={4}>
            <Button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                variant={"ghost"}
                mr={2}
            >
                <Icon as={MdKeyboardArrowLeft} boxSize={8} />
            </Button>
            <Box>
                Page {currentPage} / {totalPages}
            </Box>
            <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                variant={"ghost"}
                ml={2}
            >
                <Icon as={MdKeyboardArrowRight} boxSize={8} />
            </Button>
        </Flex>
    )
}

export default Pagination