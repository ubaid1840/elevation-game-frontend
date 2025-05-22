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
  Input,
  Stack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Center,
  Spinner,
  Flex,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  FormLabel,
} from "@chakra-ui/react";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import TableData from "@/components/ui/TableData";
import Link from "next/link";

const GameManagement = () => {
  const [games, setGames] = useState([]);
  const [triviaGames, setTriviaGames] = useState([]);
  const pathname = usePathname();
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [triviaFilter, setTriviaFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [triviaCurrentPage, setTriviaCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
    fetchTriviaData();

  }, []);

 

  async function fetchData() {
    axios
      .get("/api/games/admin")
      .then((response) => {
        setGames(response.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function fetchTriviaData() {
    axios.get("/api/trivia/game/admin").then((response) => {
    
      setTriviaGames(response.data);
    });
  }

  const filteredGames = games.filter((game) => {
    const matchesName = game.title.toLowerCase().includes(filter.toLowerCase());
    return matchesName;
  });

  const filteredGamesTrivia = triviaGames.filter((game) => {
    const matchesName = game.title
      .toLowerCase()
      .includes(triviaFilter.toLowerCase());
    return matchesName;
  });

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  async function handleRemoveGame(val) {
    // console.log(val)
    axios
      .delete(`/api/games/${val}`)
      .then(() => {
        fetchData();
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function handleRemoveGameTrivia(val) {
    // console.log(val)
    axios
      .delete(`/api/trivia/game/${val}`)
      .then(() => {
        fetchTriviaData();
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function handleShareGame(id) {
    const gameLink = `${window.location.origin}/game/elevator/${id}`;
    navigator.clipboard.writeText(gameLink).then(() => {
      alert("Game link copied to clipboard!");
    });
  }

  function handleShareGameTrivia(id) {
    const gameLink = `${window.location.origin}/game/trivia/${id}?`;
    navigator.clipboard.writeText(gameLink).then(() => {
      alert("Game link copied to clipboard!");
    });
  }

  const RenderTable = useCallback(() => {
    return (
      <TableData
        rowClickable={true}
        onClickRow={(i) => router.push(`/admin/gamemanagement/elevator/${i}`)}
        data={filteredGames.map((item) => {
          return {
            id: item.id,
            title: item.title,
            spots_remaining: item.spots_remaining || 0,
            totalEnrollments: item.totalEnrollments,
            prize_amount: item.prize_amount,
          };
        })}
        columns={[
          { key: "title", value: "Name" },
          { key: "spots_remaining", value: "Spots Remaining" },
          { key: "totalEnrollments", value: "Participants" },
          { key: "prize_amount", value: "Grand Prize" },
        ]}
        button={true}
        buttonText={"Remove"}
        onButtonClick={(val) => {
          setLoading(true);
          handleRemoveGame(val);
        }}
        button2={true}
        buttonText2={"Share"}
        onButtonClick2={(val) => handleShareGame(val)}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    );
  }, [filteredGames]);

  const RenderTableTrivia = useCallback(() => {
    return (
      <TableData
        rowClickable={true}
        onClickRow={(i) => router.push(`/admin/gamemanagement/trivia/${i}`)}
        data={filteredGamesTrivia.map((item) => {
          return {
            id: item.id,
            title: item.title,
            fee: item.fee,
            prize: item.calculated_prize,
            spots_remaining: item.spots_remaining,
            total_participants: item.total_participants,
          };
        })}
        columns={[
          { key: "title", value: "Name" },
          { key: "fee", value: "Entry Fee" },
          { key: "prize", value: "Grand Prize" },
          { key: "spots_remaining", value: "Spots Remaining" },
          { key: "total_participants", value: "Total Participants" },
        ]}
        button={true}
        buttonText={"Remove"}
        onButtonClick={(val) => {
          setLoading(true);
          handleRemoveGameTrivia(val);
        }}
        button2={true}
        buttonText2={"Share"}
        onButtonClick2={(val) => handleShareGameTrivia(val)}
        currentPage={triviaCurrentPage}
        setCurrentPage={setTriviaCurrentPage}
      />
    );
  }, [filteredGamesTrivia]);

  return loading ? (
    <Center h={"100vh"}>
      <Spinner />
    </Center>
  ) : (
    <Box p={8} bg="white">
      <Heading mb={6} color="purple.700">
        Game Management
      </Heading>

      <Tabs>
        <TabList>
          <Tab>Elevator Pitch</Tab>
          <Tab>Trivia</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Input
              placeholder="Search by name"
              value={filter}
              onChange={handleFilterChange}
            />

            <Button
              as={Link}
              href={`${pathname}/creategame/elevator`}
              colorScheme="purple"
              my={4}
            >
              Add New Game
            </Button>

            <RenderTable />
          </TabPanel>
          <TabPanel>
            <Input
              placeholder="Search by name"
              value={triviaFilter}
              onChange={(e) => setTriviaFilter(e.target.value)}
            />
           
              <Button
              my={4}
                as={Link}
                href={`${pathname}/creategame/trivia`}
                colorScheme="purple"
              >
                Add New Game
              </Button>
           
            <RenderTableTrivia />
          </TabPanel>
        </TabPanels>
      </Tabs>

     
    </Box>
  );
};

export default GameManagement;
