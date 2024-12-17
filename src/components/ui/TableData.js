import { useState } from "react"
import Pagination from "./Pagination"
import { Box, Table, Thead, Tr, Tbody, Th, Td, Button} from '@chakra-ui/react'


const TableData = ({ data, columns, button = false, buttonText, onButtonClick }) => {
    const [currentPage, setCurrentPage] = useState(1)
    const [localData, setLocalData] = useState(data || [])
    const [sortOrder, setSortOrder] = useState("asc");
    const rowsPerPage = 10;
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = localData.slice(indexOfFirstRow, indexOfLastRow);

    const handleSort = (key) => {
        const sortedData = [...localData].sort((a, b) => {
            if (sortOrder === "asc") {
                return a[key] > b[key] ? 1 : -1;
            } else {
                return a[key] < b[key] ? 1 : -1;
            }
        });
        setLocalData(sortedData);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    };


    return (
        <>
            <Pagination currentPage={currentPage} data={localData} onChange={setCurrentPage} />
            <Box overflowX={'auto'}>

                <Table variant="simple"  >
                    <Thead>
                        <Tr>
                            {columns.map((item, index) => (
                                <Th
                                    key={index}
                                    onClick={() => {
                                        if (item.key) {
                                            handleSort(item.key)
                                        }
                                    }}
                                    _hover={{ cursor: "pointer" }}
                                >
                                    {item.value}
                                </Th>
                            ))}

                        </Tr>
                    </Thead>
                    <Tbody>
                        {currentRows.length > 0 ? (
                            currentRows.map((user) => (
                                <Tr key={user.id}>
                                    {Object.entries(user).map(([key, value], i) => (
                                        key === "id" ? null :
                                            <Td key={i}>{value}</Td>

                                    ))}

                                    {button && (
                                        <Td>
                                            <Button
                                                colorScheme="blue"
                                                onClick={() => onButtonClick(user.id)}
                                            >
                                                {buttonText}
                                            </Button>
                                        </Td>
                                    )}
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan={5} textAlign="center">
                                    No data found.
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </Box>
        </>
    )
}

export default TableData