"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Stack,
  Textarea,
  Select,
  useToast,
  Input,
  VStack,
  Flex,
  Spacer,
  HStack,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { CSVLink } from "react-csv";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import axios from "axios";
import TableData from "@/components/ui/TableData";
import moment from "moment";
import Pagination from "@/components/ui/Pagination";
import RenderProfilePicture from "@/components/RenderProfilePicture";

const FinancialOverview = () => {
  const [payments, setPayments] = useState([]);
  const [emailContent, setEmailContent] = useState("");
  const toast = useToast();
  const [notificationType, setNotificationType] = useState("email");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    axios.get("/api/finance").then((response) => {
      if (response.data.length > 0) {
        const temp = response.data.filter((item) => item.role !== "admin");
        setPayments([...temp]);
      }
    }).finally(()=>{
      setLoading(false)
    })
  }

  async function handleSendNotifications(msg) {
    axios
      .post("/api/notification", {
        msg: msg,
        type: notificationType,
      })
      .then(() => {
        toast({
          title: "Notifications Sent",
          description: "Notifications sent to participants.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      });
  }

  const filteredUsers = payments.filter((payment) => {
    const matchesName = payment.name
      .toLowerCase()
      .includes(filter.toLowerCase());
    return matchesName;
  });

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const RenderTable = useCallback(() => {
    return (
      <TableData
      loading={loading}
        data={filteredUsers.map((item) => {
          return {
            id: item.id,
            name: item.name,
            amount:
              Number(item.tier1) + Number(item.tier2) + Number(item.tier3),
            trivia_total: Number(item.trivia_total),
          };
        })}
        columns={[
          { key: "name", value: "Name" },
          { key: "amount", value: "Elevator Earnings ($)" },
          { key: "trivia_total", value: "Trivia Earnings ($)" },
        ]}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    );
  }, [filteredUsers, loading]);

  return (
    <Box p={8} bg="white">
      <Heading mb={6} color="purple.700">
        Financial Overview
      </Heading>

      <Input
        placeholder="Search by name"
        value={filter}
        onChange={handleFilterChange}
      />

      {payments.length > 0 && (
        <Flex mt={5}>
          <Spacer />
          <CSVLink
            href="#"
            data={payments.map(
              ({ name, tier1, tier2, tier3, trivia_total }) => ({
                Participant: name,
                Elevator: Number(tier1) + Number(tier2) + Number(tier3),
                Trivia: Number(trivia_total),
              })
            )}
            filename={"financial-overview.csv"}
            className="btn btn-primary"
            target="_blank"
          >
            <Button colorScheme="purple"> Export Financial Data</Button>
          </CSVLink>
        </Flex>
      )}

      {/* Payments Table */}
      <RenderTable />

      {/* Export Reports */}

      <UserSection />

      {/* Email Notifications */}
      <Heading size="md" my={4}>
        Send Notifications
      </Heading>
      <Textarea
        placeholder="Type your message here..."
        value={emailContent}
        onChange={(e) => setEmailContent(e.target.value)}
        mb={4}
      />
      <Select
        value={notificationType}
        onChange={(e) => setNotificationType(e.target.value)}
        placeholder="Select Notification Type"
        mb={4}
      >
        <option value="email">Email</option>
        <option value="sms">SMS</option>
      </Select>
      <Button
        isDisabled={!emailContent || !notificationType}
        colorScheme="green"
        onClick={() => {
          toast({
            title: "Sending",
            description: "Notifications in progress...",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          const msg = emailContent;
          handleSendNotifications(msg);
          setEmailContent("");
        }}
      >
        Send Notifications
      </Button>
    </Box>
  );
};

const UserSection = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    axios
      .get("/api/finance/users")
      .then((response) => {
        const apiData = [...response.data];
        setData(apiData);

        const csvFormattedData = [
          [
            "Participant",
            "Referral# from",
            "Tier",
            "Membership",
            "Purchase",
            "Percentage",
            "Total Elevator",
            "Total Trivia",
            "Date",
          ],

          ...apiData.map((tx) => [
            tx?.user_name || "",
            tx?.referral_from || "",
            tx.tier || "",
            tx?.package || "",
            tx?.purchase || "",
            tx?.percentage || "",
            tx?.total_elevator || "",
            tx?.total_trivia || "",
            tx?.date || "",
          ]),
        ];

        setCsvData(csvFormattedData);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const filteredUsers = data.filter((user) => {
    const matchesName = user?.user_name
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesName;
  });

  const RenderTableData = useCallback(() => {
    return (
      <UserTableData
        loading={loading}
        data={filteredUsers}
        columns={[
          { key: "user_name", value: "Participant" },
          { key: "referral_from", value: "Referral# from" },
          { key: "tier", value: "Tier" },
          { key: "package", value: "Membership" },
          { key: "purchase", value: "Purchase" },
          { key: "percentage", value: "Percentage" },
          { key: "total_elevator", value: "Elevator" },
          { key: "total_trivia", value: "Trivia" },
          { key: "date", value: "Date" },
        ]}
      />
    );
  }, [filteredUsers, loading]);

  return (
    <Box w={"100%"} mt={4}>
      <VStack spacing={4} align="start">
        <Heading size="lg" color="purple.700" textAlign="center" mb={6}>
          Participants Data
        </Heading>
        {/* <Divider borderColor="purple.400" /> */}
      </VStack>

      <Input
        placeholder="Search by game"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {csvData.length > 0 && (
        <Flex mt={5}>
          <Spacer />
          <CSVLink data={csvData} filename="participants_data.csv">
            <Button colorScheme="purple">Export Participants Data (CSV)</Button>
          </CSVLink>
        </Flex>
      )}

      <RenderTableData />
    </Box>
  );
};

const UserTableData = ({
  data,
  columns,
  onClickRow,
  rowClickable = false,
  loading = false,
}) => {
  const [localData, setLocalData] = useState(data || []);
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = localData.slice(indexOfFirstRow, indexOfLastRow);
  const [columnIndex, setColumnIndex] = useState(
    Array.from({ length: columns && columns.length }, () => ({ active: false }))
  );

  const handleSort = (key, index) => {
    setColumnIndex((prevState) =>
      prevState.map((eachState, i) => ({
        active: i === index,
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

  const RenderRow = ({
    value,
    user,
    onClickRow,
    rowClickable = false,
    index,
    original_key,
  }) => {
    return (
      <Td width={"350px"}>
        {original_key === "user_name" ? (
          <HStack>
            <RenderProfilePicture email={user.user_email} name={value} />
            <Text
              cursor={index === 1 && rowClickable && "pointer"}
              onClick={onClickRow}
            >
              {value}
            </Text>
          </HStack>
        ) : (
          <Text
            cursor={index === 1 && rowClickable && "pointer"}
            onClick={onClickRow}
          >
            {value}
          </Text>
        )}
      </Td>
    );
  };

  return (
    <>
      <Pagination
        currentPage={currentPage}
        data={localData}
        onChange={setCurrentPage}
      />
      <Box overflowX={"auto"}>
        <Table variant="simple">
          <Thead>
            <Tr>
              {columns.map((item, index) => (
                <Th
                  key={index}
                  onClick={() => {
                    if (item.key) {
                      handleSort(item.key, index);
                    }
                  }}
                  _hover={{ cursor: "pointer" }}
                >
                  <HStack gap={0}>
                    <Text>{item.value}</Text>
                    {columnIndex &&
                      columnIndex.length > 0 &&
                      columnIndex[index]?.active && (
                        <Icon
                          as={
                            sortOrder === "desc"
                              ? IoIosArrowRoundDown
                              : IoIosArrowRoundUp
                          }
                          boxSize={5}
                        />
                      )}
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
                      original_key={col.key}
                      user={user}
                      onClickRow={() => {
                        if (rowClickable) {
                          onClickRow(user.id);
                        }
                      }}
                      rowClickable={rowClickable}
                    />
                  ))}
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={9} textAlign="center">
                  {loading ? <Spinner /> : "No data found"}
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </>
  );
};

export default FinancialOverview;
