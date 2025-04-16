"use client";
import RenderProfilePicture from "@/components/RenderProfilePicture";
import Sidebar from "@/components/sidebar";
import Pagination from "@/components/ui/Pagination";
import TableData from "@/components/ui/TableData";
import { UserContext } from "@/store/context/UserContext";
import GetLinkItems from "@/utils/SideBarItems";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useToast,
  Checkbox,
  Input,
  Flex,
  Spacer,
  Table,
  Thead,
  Tr,
  Th,
  Icon,
  Tbody,
  Td,
  Spinner,
} from "@chakra-ui/react";
import axios from "axios";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { IoIosArrowRoundDown, IoIosArrowRoundUp } from "react-icons/io";


export default function Page() {
  const { state: UserState } = useContext(UserContext);
  const [csvData, setCsvData] = useState([]);
  const [winnings, setWinnings] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData(UserState.value.data.id);
    }
  }, [UserState.value.data]);

  async function fetchData(id) {
    axios.get(`/api/users/${id}/earning`).then((response) => {
      const tempData = response.data.map((item) => {
        return {
          id: item.id,
          amount: item.transaction_type?.includes("entry")
            ? -Math.abs(item.amount)
            : Math.abs(item.amount),
          transaction_type: item.transaction_type,
          refer_to: item.referral_user?.name || "N/A",
          created_at: moment(new Date(item.created_at)).format("DD/MM/YYYY"),
        };
      });
      setTableData([...tempData]);

      // console.log(response.data)
      // const tempData = response.data.map((item) => {
      //   let transactionType = item.transaction_type;

      //   if (transactionType === "referral earning") {
      //     transactionType = "Trivia game referral earning";
      //   } else if (transactionType === "winning") {
      //     transactionType = "Trivia game winning";
      //   }

      //   return {
      //     id : item.id,
      //     amount: transactionType.includes("entry") ?  -Math.abs(item.amount) : Math.abs(item.amount),
      //     transaction_type: transactionType,
      //     created_at: moment(new Date(item.created_at)).format("DD/MM/YYYY"),
      //   };
      // });

      // setTableData([...tempData]);

      const transactions = response.data;
      const winnings = [];
      const earnings = [];
      let totalWinnings = 0;
      let totalEarnings = 0;

      transactions.forEach((transaction) => {
        if (transaction.transaction_type.includes("winning")) {
          winnings.push(transaction);
          totalWinnings += Number(transaction.amount);
        } else if (transaction.transaction_type.includes("referral")) {
          earnings.push(transaction);
          totalEarnings += Number(transaction.amount);
        }
      });

      setEarnings(totalEarnings.toFixed(2));
      const csvFormattedData = [
        ["Amount", "Reason", "Refer to", "Date"],
        ...tempData.map((tx) => [
          tx.amount,
          tx.transaction_type,
          tx.refer_to,
          tx.created_at,
        ]),
      ];

      setCsvData(csvFormattedData);
    });
  }

  const RenderTableData = useCallback(() => {
    return (
      <Box w={"100%"}>
        <TableData
          data={tableData}
          columns={[
            { key: "amount", value: "Amount ($)" },
            { key: "transaction_type", value: "Reason" },
            { key: "refer_to", value: "Refer to" },
            { key: "created_at", value: "Date" },
          ]}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </Box>
    );
  }, [tableData, currentPage]);

  return (
    <Box p={8}>
      <VStack spacing={6} align="start">
        {/* Earnings Header */}
        <Heading size="lg" color="purple.700">
          My Earnings
        </Heading>
        <Divider borderColor="purple.400" />

        {UserState.value.data?.package === "Platinum" ? (
          <Text fontSize="md">
            You can earn <strong>20%, 10% and 5%</strong> from unique referral
            numbers.
          </Text>
        ) : UserState.value.data?.package === "Gold" ? (
          <Text fontSize="md">
            You can earn <strong>10%, 5% and 2.5%</strong> from unique referral
            numbers.
          </Text>
        ) : UserState.value.data?.package === "Iridium" ? (
          <Text fontSize="md">
            You can earn <strong>5%, 2.5% and 1.25%</strong> from unique
            referral numbers.
          </Text>
        ) : null}

        <Stat>
          <StatLabel fontSize="lg">Total referral earnings</StatLabel>
          <StatNumber fontSize="2xl" color="green.500">
            ${earnings}
          </StatNumber>
        </Stat>

        {csvData.length > 0 && (
          <CSVLink data={csvData} filename="earnings_report.csv">
            <Button colorScheme="purple">Export Earnings Report (CSV)</Button>
          </CSVLink>
        )}
        <RenderTableData />
        <GameSection />
      </VStack>
    </Box>
  );
}

const GameSection = () => {
  const { state: UserState } = useContext(UserContext);
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState("");
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData(UserState.value.data?.id);
    }
  }, [UserState.value.data]);

  async function fetchData(id) {
    axios
      .get(`/api/analytics/${id}?type=game`)
      .then((response) => {
        if (response.data.length > 0) {
          //   console.log(response.data)
          const temp = response.data.map((item, index) => {
            return {
              id: index,
              game_title: item.game_title,
              user_name: item?.top_player?.user_name || "Unknown",
              score: item?.top_player?.totalScore || "",
              game_prize: item.prize_amount,
              enrollments: item.total_enrollments,
              revenue_generated:
                Number(item.total_enrollments) * Number(item.prize_amount),
              user_email: item?.top_player?.user_email || "",
            };
          });

          setParticipants([...temp]);

          const csvFormattedData = [
            [
              "Title",
              "Player",
              "Score",
              "Prize",
              "Participants",
              "Game Revenue",
            ],
            ...temp.map((tx) => [
              tx.game_title,
              tx.user_name,
              tx.score,
              tx.game_prize,
              tx.enrollments,
              tx.revenue_generated,
            ]),
          ];

          setCsvData(csvFormattedData);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const filteredUsers = participants.filter((user) => {
    const matchesName = user?.game_title
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesName;
  });

  const RenderTableData = useCallback(() => {
    return (
      <GameTableData
        loading={loading}
        data={filteredUsers}
        columns={[
          { key: "game_title", value: "Title" },
          { key: "user_name", value: "Player" },
          { key: "score", value: "Score" },
          { key: "game_prize", value: "Prize money" },
          { key: "enrollments", value: "Total Participants" },
          { key: "revenue_generated", value: "Revenue Generated" },
        ]}
      />
    );
  }, [filteredUsers, loading]);

  return (
    <Box width={"100%"}>
      {/* Leaderboard Header */}
      <VStack spacing={4} align="start">
        <Heading size="lg" color="purple.700" textAlign="center" mb={6}>
          Games
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
          <CSVLink data={csvData} filename="analytics_trivia_winners.csv">
            <Button colorScheme="purple">Export Game Data (CSV)</Button>
          </CSVLink>
        </Flex>
      )}
      {/* Rankings Table */}
      <RenderTableData />

      {/*      
            <HStack justifyContent="center" mt={8}>
              <Button colorScheme="purple" size="lg" onClick={() => alert('See details')}>
                View Detailed Rankings
              </Button>
            </HStack> */}
    </Box>
  );
};

const GameTableData = ({
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
                <Td colSpan={5} textAlign="center">
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
