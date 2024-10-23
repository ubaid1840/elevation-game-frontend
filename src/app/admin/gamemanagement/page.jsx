"use client";
import React, { useState } from "react";
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

const GameManagement = () => {
  const [games, setGames] = useState([
    { id: 1, name: "Game 1", spots: 5, participants: 3 },
    { id: 2, name: "Game 2", spots: 10, participants: 7 },
  ]);
  const [gameName, setGameName] = useState("");
  const [spots, setSpots] = useState("");
  const [editingGame, setEditingGame] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  const handleEditGame = (game) => {
    setGameName(game.name);
    setSpots(game.spots);
    setEditingGame(game);
    onOpen();
  };

  const handleDeleteGame = (id) => {
    setGames((prev) => prev.filter((game) => game.id !== id));
  };

  const resetForm = () => {
    setGameName("");
    setSpots("");
    setEditingGame(null);
  };

  return (
    <Sidebar LinkItems={GetLinkItems("admin")}>
      <Box p={8} bg="white">
        <Heading mb={6} color="purple.700">
          Game Management
        </Heading>

        <Button colorScheme="purple" mb={4} onClick={onOpen}>
          Add New Game
        </Button>

        {/* Game Table */}
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Spots Remaining</Th>
              <Th>Participants</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {games.length > 0 ? (
              games.map((game) => (
                <Tr key={game.id}>
                  <Td>{game.name}</Td>
                  <Td>{game.spots - game.participants}</Td>
                  <Td>{game.participants}</Td>
                  <Td>
                    <Button
                      colorScheme="blue"
                      onClick={() => handleEditGame(game)}
                    >
                      Edit
                    </Button>
                    <Button
                      colorScheme="red"
                      onClick={() => handleDeleteGame(game.id)}
                      ml={2}
                    >
                      Delete
                    </Button>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={4} textAlign="center">
                  No games found.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>

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
