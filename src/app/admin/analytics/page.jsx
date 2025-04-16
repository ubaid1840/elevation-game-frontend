"use client";
import RenderProfilePicture from "@/components/RenderProfilePicture";
import Pagination from "@/components/ui/Pagination";
import { UserContext } from "@/store/context/UserContext";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Input,
  Spacer,
  Tab,
  Table,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack
} from "@chakra-ui/react";
import axios from "axios";
import { useCallback, useContext, useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { IoIosArrowRoundDown, IoIosArrowRoundUp } from "react-icons/io";

export default function Analytics() {
  return (
    <Box p={8} bg="white">
      <Heading mb={6} color="purple.700">
        Analytics
      </Heading>

      <Tabs>
        <TabList>
          <Tab>Elevator Pitch</Tab>
          <Tab>Trivia</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <ElevatorSection />
            <ElevatorSectionGame />
          </TabPanel>
          <TabPanel>
            <TriviaSection />
            <TriviaGameSection /> 
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

const TriviaSection = () => {
  const { state: UserState } = useContext(UserContext);
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState("");
  const [csvData, setCsvData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData();
    }
  }, [UserState.value.data]);


  async function fetchData() {
    axios.get(`/api/trivia/leaderboard`).then((response) => {
      if (response.data.length > 0) {
        const temp = response.data.map((item, index) => {
          return {
            id: index,
            game_title: item.game_title,
            user_name: item.user_name,
            rank: item.rank,
            total_referrals: item.total_referrals,
            game_fee : item.game_fee,
            game_prize: item.game_prize,
            winner_status: item.winner_status,
            user_email: item.user_email,
          };
        });
        setParticipants([...temp]);

        const csvFormattedData = [
          ["Title", "Player", "Rank", "Game Referral Earning","Entry fee", "Prize"],
          ...temp
            .filter((item) => item.winner_status === "Won")
            .map((tx) => [
              tx.game_title,
              tx.user_name,
              tx.rank,
              tx.total_referrals,
              tx.game_fee,
              tx.game_prize,
            ]),
        ];

        setCsvData(csvFormattedData);
      }
    });
  }

  const filteredUsers = participants.filter((user) => {
    const matchesName = user.user_name
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesName;
  });

  const RenderTableData = useCallback(() => {
   
    return (
      <TriviaTableData
        data={filteredUsers}
        columns={[
          { key: "game_title", value: "Title" },
          { key: "user_name", value: "Player" },
          { key: "rank", value: "Rank" },
          { key: "total_referrals", value: "Game Referral Earning" },
          { key: "game_fee", value: "Entry fee" },
          { key: "game_prize", value: "Prize money" },
          { key: "winner_status", value: "Winning status" },
        ]}
      
      />
    );
  }, [filteredUsers]);

  return (
    <Box p={8}>
      {/* Leaderboard Header */}
      <VStack spacing={4} align="start">
        <Heading size="lg" color="purple.700" textAlign="center" mb={6}>
          Data By Users
        </Heading>
        {/* <Divider borderColor="purple.400" /> */}
      </VStack>

      <Input
        placeholder="Search by player name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {csvData.length > 0 && (
        <Flex mt={5}>
          <Spacer />
          <CSVLink data={csvData} filename="analytics_trivia_winners.csv">
            <Button colorScheme="purple">Export Winners List (CSV)</Button>
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

const TriviaGameSection = () => {
    const { state: UserState } = useContext(UserContext);
    const [participants, setParticipants] = useState([]);
    const [search, setSearch] = useState("");
    const [csvData, setCsvData] = useState([]);
  
    useEffect(() => {
      if (UserState.value.data?.id) {
        fetchData();
      }
    }, [UserState.value.data]);
  
  
    async function fetchData() {
      axios.get(`/api/trivia/leaderboard/game`).then((response) => {
        if (response.data.length > 0) {
          console.log(response.data)
          const temp = response.data.map((item, index) => {
            return {
              id: index,
              game_title: item.game_title,
              user_name: item.top_player.user_name,
              total_enrollments: item.total_enrollments,
              game_prize: item.game_prize,
              game_fee : item.game_fee,
              revenue_genarated : Number(item.total_enrollments) * Number(item.game_prize),
              winner_status: item.top_player.winner_status,
              user_email: item.top_player.user_email,
            };
          });
          setParticipants([...temp]);
  
          const csvFormattedData = [
            ["Title", "Player", "Total Participants","Entry fee", "Prize Money", "Revenue Generated", "Winner Status"],
            ...temp
              .map((tx) => [
                tx.game_title,
                tx.user_name,
                tx.total_enrollments,
                tx.game_fee,
                tx.game_prize,
                tx.revenue_genarated,
                tx.winner_status
              ]),
          ];
  
          setCsvData(csvFormattedData);
        }
      });
    }
  
    const filteredUsers = participants.filter((user) => {
      const matchesName = user.game_title
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesName;
    });
  
    const RenderTableData = useCallback(() => {
     
      return (
        <TriviaTableData
          data={filteredUsers}
          columns={[
            { key: "game_title", value: "Title" },
            { key: "user_name", value: "Top Player" },
            { key: "total_enrollments", value: "Total Participants" },
            { key: "game_fee", value: "Entry fee" },
            { key: "game_prize", value: "Prize money" },
            { key: "revenue_genarated", value: "Revenue Generated" },
            { key: "winner_status", value: "Winning status" },
          ]}
        
        />
      );
    }, [filteredUsers]);
  
    return (
      <Box p={8}>
        {/* Leaderboard Header */}
        <VStack spacing={4} align="start">
          <Heading size="lg" color="purple.700" textAlign="center" mb={6}>
            Data By Game
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
            <CSVLink data={csvData} filename="analytics_trivia_game.csv">
              <Button colorScheme="purple">Export Game Record (CSV)</Button>
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


  const ElevatorSection = () => {
    const { state: UserState } = useContext(UserContext);
    const [participants, setParticipants] = useState([]);
    const [search, setSearch] = useState("");
    const [csvData, setCsvData] = useState([]);
  
    useEffect(() => {
      if (UserState.value.data?.id) {
        fetchData();
      }
    }, [UserState.value.data]);
  
  
    async function fetchData() {
      axios.get(`/api/analytics?type=user`).then((response) => {
        if (response.data.length > 0) {
           
          const temp = response.data.map((item, index) => {
            return {
              id: index,
              game_title: item.game_title,
              user_name: item.user_name,
              rank: item.rank,
            score : item.totalScore,
              game_prize: item.prize_amount,
              winner_status: item.winner_status,
              user_email: item.user_email,
            };
          });
          setParticipants([...temp]);
  
          const csvFormattedData = [
            ["Title", "Player", "Rank", "Score", "Prize"],
            ...temp
              .filter((item) => item.winner_status === "Won")
              .map((tx) => [
                tx.game_title,
                tx.user_name,
                tx.rank,
                tx.score,
                tx.game_prize,
              ]),
          ];
  
          setCsvData(csvFormattedData);
        }
      });
    }
  
    const filteredUsers = participants.filter((user) => {
      const matchesName = user.user_name
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesName;
    });
  
    const RenderTableData = useCallback(() => {
     
      return (
        <TriviaTableData
          data={filteredUsers}
          columns={[
            { key: "game_title", value: "Title" },
            { key: "user_name", value: "Player" },
            { key: "rank", value: "Rank" },
            { key: "score", value: "Score" },
            { key: "game_prize", value: "Prize money" },
            { key: "winner_status", value: "Winning status" },
          ]}
     
        />
      );
    }, [filteredUsers]);
  
    return (
      <Box p={8}>
        {/* Leaderboard Header */}
        <VStack spacing={4} align="start">
          <Heading size="lg" color="purple.700" textAlign="center" mb={6}>
            Data By Users
          </Heading>
          {/* <Divider borderColor="purple.400" /> */}
        </VStack>
  
        <Input
          placeholder="Search by player name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
  
        {csvData.length > 0 && (
          <Flex mt={5}>
            <Spacer />
            <CSVLink data={csvData} filename="analytics_trivia_winners.csv">
              <Button colorScheme="purple">Export Winners List (CSV)</Button>
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

  
  const ElevatorSectionGame = () => {
    const { state: UserState } = useContext(UserContext);
    const [participants, setParticipants] = useState([]);
    const [search, setSearch] = useState("");
    const [csvData, setCsvData] = useState([]);
  
    useEffect(() => {
      if (UserState.value.data?.id) {
        fetchData();
      }
    }, [UserState.value.data]);
  
  
    async function fetchData() {
        axios.get(`/api/analytics?type=game`).then((response) => {
          
          if (response.data.length > 0) {
            //   console.log(response.data)
            const temp = response.data.map((item, index) => {
              return {
                id: index,
                game_title: item.game_title,
                user_name: item?.top_player?.user_name || "Unknown",
              score : item?.top_player?.totalScore || "",
                game_prize: item.prize_amount,
                enrollments : item.total_enrollments,
                revenue_generated: Number(item.total_enrollments) * Number(item.prize_amount),
                user_email: item?.top_player?.user_email || "",
              };
            });

            setParticipants([...temp]);
    
            const csvFormattedData = [
              ["Title", "Player", "Score", "Prize", "Participants", "Game Revenue"],
              ...temp
                .map((tx) => [
                  tx.game_title,
                  tx.user_name,
                  tx.score,
                  tx.game_prize,
                  tx.enrollments,
                  tx.revenue_generated
                ]),
            ];
    
            setCsvData(csvFormattedData);
          }
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
        <TriviaTableData
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
    }, [filteredUsers]);
  
    return (
      <Box p={8}>
        {/* Leaderboard Header */}
        <VStack spacing={4} align="start">
          <Heading size="lg" color="purple.700" textAlign="center" mb={6}>
            Data By Game
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
  

const TriviaTableData = ({
  data,
  columns,
  onClickRow,
  rowClickable = false,

}) => {
  const [localData, setLocalData] = useState(data || []);
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1)
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
                  No data found.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </>
  );
};
