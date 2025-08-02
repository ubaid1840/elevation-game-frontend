import { useState } from "react"
import Pagination from "./Pagination"
import { Box, Table, Thead, Tr, Tbody, Th, Td, Button, HStack, Checkbox, Switch, Spinner, Icon, Text, IconButton } from '@chakra-ui/react'
import { IoIosArrowRoundUp, IoIosArrowRoundDown } from "react-icons/io";
import { EditIcon } from "@chakra-ui/icons";


const TableData = ({ data, columns, button = false, buttonText, onButtonClick, onSwitchClick, button2 = false, buttonText2, onButtonClick2, special = false, onClickRow, rowClickable = false, currentPage, setCurrentPage, loading = false, editButton = false, onEditClick = (val) => { } }) => {

    const [localData, setLocalData] = useState(data || [])
    const [sortOrder, setSortOrder] = useState("asc");
    const rowsPerPage = 10;
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = localData.slice(indexOfFirstRow, indexOfLastRow);
    const [columnIndex, setColumnIndex] = useState(Array.from({ length: columns && columns.length }, () => ({ active: false })))

    const handleSort = (key, index) => {
        setColumnIndex((prevState) =>
            prevState.map((eachState, i) => ({
                active: i === index
            }))
        );
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

    const RenderRow = ({ value, user, onClickRow, rowClickable = false, index }) => {
        const [rowLoading, setRowLoading] = useState(false)

        return (
            <Td width={'350px'}>
                {
                    typeof value === "boolean" ?
                        rowLoading ?
                            <Spinner />
                            :
                            <Switch isChecked={value} onChange={(e) => {
                                setRowLoading(true)
                                onSwitchClick({ id: user.id, status: e.target.checked })
                            }} /> :
                        <Text cursor={index === 1 && rowClickable && 'pointer'} onClick={onClickRow}>
                            {value}
                        </Text>
                }
            </Td>
        )
    }


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
                                            handleSort(item.key, index)
                                        }
                                    }}
                                    _hover={{ cursor: "pointer" }}
                                >
                                    <HStack gap={0}>
                                        <Text>{item.value}</Text>
                                        {columnIndex && columnIndex.length > 0 && columnIndex[index]?.active &&
                                            <Icon as={sortOrder === 'desc' ? IoIosArrowRoundDown : IoIosArrowRoundUp} boxSize={5} />}
                                    </HStack>


                                </Th>
                            ))}

                        </Tr>
                    </Thead>
                    <Tbody>
                        {currentRows.length > 0 ? (
                            currentRows.map((user) => (
                                <Tr key={user.id}>
                                    {columns.map((col, i) => (
                                        <RenderRow
                                            key={i}
                                            index={i}
                                            value={user[col.key]}
                                            user={user}
                                            onClickRow={() => {
                                                if (rowClickable) {
                                                    onClickRow(user.id);
                                                }
                                            }}
                                            rowClickable={rowClickable}
                                        />
                                    ))}



                                    {(button || editButton || special || button2) && (
                                        <Td>
                                            <HStack>

                                                {editButton && onEditClick &&

                                                    <Button
                                                        colorScheme="gray"
                                                        onClick={() => onEditClick(user)}
                                                    >
                                                        Edit Referral
                                                    </Button>
                                                }

                                                {button &&

                                                    <Button
                                                        colorScheme="blue"
                                                        onClick={() => onButtonClick(user.id)}
                                                    >
                                                        {buttonText}
                                                    </Button>
                                                }
                                                {special ? button2 && user?.role === 'user' &&
                                                    <Button
                                                        colorScheme="teal"
                                                        onClick={() => onButtonClick2(user.id)}
                                                    >
                                                        {buttonText2}
                                                    </Button>
                                                    : button2 &&
                                                    <Button
                                                        colorScheme="teal"
                                                        onClick={() => onButtonClick2(user.id)}
                                                    >
                                                        {buttonText2}
                                                    </Button>
                                                }
                                            </HStack>

                                        </Td>
                                    )}

                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan={5} textAlign="center">
                                    {loading ? <Spinner /> : "No data found"}
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