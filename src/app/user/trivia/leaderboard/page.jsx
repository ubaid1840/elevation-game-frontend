"use client";
import RenderProfilePicture from "@/components/RenderProfilePicture";
import Sidebar from "@/components/sidebar";
import Pagination from "@/components/ui/Pagination";
import { UserContext } from "@/store/context/UserContext";
import GetLinkItems from "@/utils/SideBarItems";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Divider,
  Badge,
  useBreakpointValue,
  Tooltip,
  Button,
  Input,
  Spinner,
  Switch,
  Icon,
} from "@chakra-ui/react";
import axios from "axios";
import { useCallback, useContext, useEffect, useState } from "react";
import { IoIosArrowRoundUp, IoIosArrowRoundDown } from "react-icons/io";

export default function Page() {
  const { state: UserState } = useContext(UserContext);
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState("");

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
            winner_status: item.winner_status,
            user_email: item.user_email,
            game_prize : item.game_prize
          };
        });
        setParticipants([...temp]);
      }
    });
  }

  const filteredUsers = participants.filter((user) => {
    const matchesName = user.user_name.toLowerCase().includes(search.toLowerCase());
    return matchesName
  });

  const RenderTableData = useCallback(() => {
    
    return (
      <TableData
        data={filteredUsers}
        columns={[
          { key: "game_title", value: "Title" },
          { key: "user_name", value: "Player" },
          { key: "rank", value: "Rank" },
          { key: "total_referrals", value: "Game Referral Earning" },
          { key: "game_prize", value: "Prize money" },
          { key: "winner_status", value: "Winning status" },
        ]}
      />
    );
  }, [filteredUsers]);

  return (
    <>
      <Box p={8}>
        {/* Leaderboard Header */}
        <VStack spacing={4} align="start">
          <Heading size="lg" color="purple.700" textAlign="center" mb={6}>
            Leaderboard
          </Heading>
          {/* <Divider borderColor="purple.400" /> */}
        </VStack>

        <Input
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Rankings Table */}
        <RenderTableData />

        {/*      
      <HStack justifyContent="center" mt={8}>
        <Button colorScheme="purple" size="lg" onClick={() => alert('See details')}>
          View Detailed Rankings
        </Button>
      </HStack> */}
      </Box>
    </>
  );
}

const TableData = ({
  data,
  columns,
  button = false,
  buttonText,
  onButtonClick,
  onSwitchClick,
  button2 = false,
  buttonText2,
  onButtonClick2,
  special = false,
  onClickRow,
  rowClickable = false,

}) => {
  const [localData, setLocalData] = useState(data || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("asc");
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
    const [rowLoading, setRowLoading] = useState(false);

    return (
      <Td width={"350px"}>
        {typeof value === "boolean" ? (
          rowLoading ? (
            <Spinner />
          ) : (
            <Switch
              isChecked={value}
              onChange={(e) => {
                setRowLoading(true);
                onSwitchClick({ id: user.id, status: e.target.checked });
              }}
            />
          )
        ) : original_key === "user_name" ? (
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
                  {Object.entries(user).map(([key, value], i) =>
                    key && (key === "id" || key === "user_email") ? null : (
                      <RenderRow
                        key={i}
                        index={i}
                        value={value}
                        original_key={key}
                        user={user}
                        onClickRow={() => {
                          if (rowClickable) {
                            onClickRow(user.id);
                          }
                        }}
                        rowClickable={rowClickable}
                      />
                    )
                  )}

                  {button && (
                    <Td>
                      <HStack>
                        <Button
                          colorScheme="blue"
                          onClick={() => onButtonClick(user.id)}
                        >
                          {buttonText}
                        </Button>
                        {special
                          ? button2 &&
                            user?.role === "user" && (
                              <Button
                                colorScheme="teal"
                                onClick={() => onButtonClick2(user.id)}
                              >
                                {buttonText2}
                              </Button>
                            )
                          : button2 && (
                              <Button
                                colorScheme="teal"
                                onClick={() => onButtonClick2(user.id)}
                              >
                                {buttonText2}
                              </Button>
                            )}
                      </HStack>
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
  );
};
