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
} from "@chakra-ui/react";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import axios from "axios";
import { Link } from "react-feather";
import { usePathname, useRouter } from "next/navigation";
import TableData from "@/components/ui/TableData";

const GameManagement = () => {
  const [games, setGames] = useState([]);
  const [gameName, setGameName] = useState("");
  const [spots, setSpots] = useState("");
  const [editingGame, setEditingGame] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pathname = usePathname();
  const router = useRouter();
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    axios.get("/api/games/admin").then((response) => {
      setGames(response.data);
    });
  }

  const handleAddOrEditGame = () => {
    if (editingGame) {
      setGames((prev) =>
        prev.map((game) =>
          game.id === editingGame.id
            ? { ...game, name: gameName, spots: Number(spots) }
            : game
        )
      );
    } else {
      const newGame = {
        id: games.length + 1,
        name: gameName,
        spots: Number(spots),
        participants: 0,
      };
      setGames((prev) => [...prev, newGame]);
    }
    resetForm();
    onClose();
  };

  // const handleEditGame = (game) => {
  //   setGameName(game.name);
  //   setSpots(game.spots);
  //   setEditingGame(game);
  //   onOpen();
  // };

  // const handleDeleteGame = (id) => {
  //   setGames((prev) => prev.filter((game) => game.id !== id));
  // };

  const resetForm = () => {
    setGameName("");
    setSpots("");
    setEditingGame(null);
  };

  const filteredGames = games.filter((game) => {
    const matchesName = game.title.toLowerCase().includes(filter.toLowerCase());
    return matchesName;
  });

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  async function handleRemoveGame(val) {
    axios.delete(`/api/games/${val}`).then(() => {
      fetchData();
    });
  }

  function handleShareGame(id) {
    const gameLink = `${window.location.origin}/game/${id}`;
    navigator.clipboard.writeText(gameLink).then(() => {
      alert("Game link copied to clipboard!");
    });
  }

  const RenderTable = useCallback(() => {
    return (
      <TableData
      rowClickable={true}
      onClickRow={(i)=> router.push(`/admin/gamemanagement/${i}`)}
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
          { value: "Action" },
        ]}
        button={true}
        buttonText={"Remove"}
        onButtonClick={(val) => handleRemoveGame(val)}
        button2={true}
        buttonText2={"Share"}
        onButtonClick2={(val) => handleShareGame(val)}
      />
    );
  }, [filteredGames]);

  return (
    <Sidebar LinkItems={GetLinkItems("admin")}>
      <Box p={8} bg="white">
        <Heading mb={6} color="purple.700">
          Game Management
        </Heading>

        <Input
          placeholder="Search by name"
          value={filter}
          onChange={handleFilterChange}
        />

        <Button
          colorScheme="purple"
          my={4}
          onClick={() => router.push(`${pathname}/creategame`)}
        >
          Add New Game
        </Button>

        {/* Game Table */}

        <RenderTable />
        {/* Modal for Add/Edit Game */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {editingGame ? "Edit Game" : "Add New Game"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4}>
                <Input
                  placeholder="Game Name"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Total Spots"
                  value={spots}
                  onChange={(e) => setSpots(e.target.value)}
                />
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={handleAddOrEditGame}>
                {editingGame ? "Update Game" : "Add Game"}
              </Button>
              <Button ml={3} onClick={onClose}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Sidebar>
  );
};

export default GameManagement;
