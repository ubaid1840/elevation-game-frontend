
"use client";

import Pagination from "@/components/ui/Pagination";
import { UserContext } from "@/store/context/UserContext";
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Badge,
    Button,
    useToast, Heading, Stack, Box,
    Input,
    Flex,
    Spacer,
    HStack,
    Icon,
    Text
} from "@chakra-ui/react";
import axios from "axios";
import moment from "moment";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { IoIosArrowRoundDown, IoIosArrowRoundUp } from "react-icons/io";

export default function WithdrawPage() {

    const toast = useToast();
    const { state: UserState } = useContext(UserContext);
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)

    const [csvData, setCsvData] = useState([]);

    const [search, setSearch] = useState("")

    useEffect(() => {
        if (UserState.value.data?.id) {
            fetchData(UserState.value.data?.id)
        }
    }, [UserState])

    async function fetchData(id) {
        if (!id) return
        setLoading(true)

        try {
            const response = await axios.get(`/api/withdraw`)
            setData(response.data)

        } catch (error) {
            toast({
                title: "Error",
                description: e?.response?.data?.message || "Error fetchind data",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false)
        }

    }

    useEffect(() => {
        if (data.length > 0) {
            const filteredData = data.filter((user) => {
                return Object.values(user).some((val) =>
                    String(val).toLowerCase().includes(search.toLowerCase())
                );
            });
            const csvFormattedData = [
                [
                    "User Name",
                    "Email",
                    "Role",
                    "Package",
                    "Requested Amount",
                    "Residual Income",
                    "Status",
                    "Created At",
                    "Referrer",
                ],
                ...filteredData.map((item) => [
                    item.user_name,
                    item.user_email,
                    item.user_role,
                    item.user_package || "-",
                    `$${item.requested_amount}`,
                    item.user_residual_income,
                    item.status,
                    moment(item.created_at).format("DD-MM-YYYY HH:mm A"),
                    item.referrer_name || "No referrer",
                ]),
            ];

            setCsvData(csvFormattedData);
        }
    }, [data, search]);




    const filteredData = data.filter((user) => {
        return Object.values(user).some((val) =>
            String(val).toLowerCase().includes(search.toLowerCase())
        );
    });



    return (
        <Box p={8} bg="white">
            <Heading mb={6} color="purple.700">
                Withdrawal requests
            </Heading>

            {csvData.length > 0 && (
                <Flex my={5}>
                    <Spacer />
                    <CSVLink data={csvData} filename="withdrawals.csv">
                        <Button colorScheme="purple">Export withdrawal List (CSV)</Button>
                    </CSVLink>
                </Flex>
            )}

            <Stack spacing={4}>

                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search data" />
                <WithdrawTable data={filteredData} loading={loading} />

            </Stack>
        </Box>
    );
}


function WithdrawTable({ data, loading }) {

    const [currentPage, setCurrentPage] = useState(1);

    const [localData, setLocalData] = useState([])
    const [sortOrder, setSortOrder] = useState("asc");
    const rowsPerPage = 10;
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = localData.slice(indexOfFirstRow, indexOfLastRow);
    const [columnIndex, setColumnIndex] = useState(Array.from({ length: columns && columns.length }, () => ({ active: false })))

    useEffect(() => {
        setLocalData(data)
    }, [data])

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

    const statusColor = (status) => {
        switch (status) {
            case "Approved":
                return "blue";
            case "Rejected":
                return "red";
            case "Paid":
                return "green";
            default:
                return "gray";
        }
    };


    return (
        <>
            <Pagination currentPage={currentPage} data={localData} onChange={setCurrentPage} />
            <TableContainer bg="white" p={4}>
                <Table variant="simple">
                    <Thead bg="gray.100">
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
                                        <Text>{item.label}</Text>
                                        {columnIndex && columnIndex.length > 0 && columnIndex[index]?.active &&
                                            <Icon as={sortOrder === 'desc' ? IoIosArrowRoundDown : IoIosArrowRoundUp} boxSize={5} />}
                                    </HStack>


                                </Th>
                            ))}
                            <Th>Action</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {currentRows?.map((item, index) => (
                            <Tr key={index}>
                                <Td>{item.user_name}</Td>
                                <Td>{item.user_email}</Td>
                                <Td>{item.user_role}</Td>
                                <Td>{item.user_package || "-"}</Td>
                                <Td>
                                    <Badge colorScheme="purple" px={2} py={1} borderRadius="md">
                                        ${item.requested_amount}
                                    </Badge>
                                </Td>
                                <Td>
                                    {item.user_residual_income}
                                </Td>
                                <Td>
                                    <Badge colorScheme={statusColor(item.status)}>
                                        {item.status}
                                    </Badge>
                                </Td>
                                <Td>{moment(item.created_at).format("DD-MM-YYYY HH:mm A")}</Td>
                                <Td>{item.referrer_name || "No referrer"}</Td>
                                <Td>
                                    <Button
                                        as={Link}
                                        href={`/admin/withdraw/${item.id}`}
                                        size="sm"
                                        colorScheme="purple"
                                        isLoading={loading}
                                    >
                                        Open Detail
                                    </Button>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        </>
    );
}

const columns = [
    { label: "User", key: "user_name" },
    { label: "Email", key: "user_email" },
    { label: "Role", key: "user_role" },
    { label: "Package", key: "user_package" },
    { label: "Amount", key: "requested_amount" },
    { label: "Income Balance", key: "user_residual_income" },
    { label: "Status", key: "status" },
    { label: "Requested Date", key: "created_at" },
    { label: "Referrer", key: "referrer_name" },
]
