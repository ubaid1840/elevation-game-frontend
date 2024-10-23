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

const JudgeManagement = () => {
  const [judges, setJudges] = useState([
    { id: 1, name: "Judge 1", schedule: "Monday 9 AM - 11 AM" },
    { id: 2, name: "Judge 2", schedule: "Tuesday 10 AM - 12 PM" },
  ]);
  const [judgeName, setJudgeName] = useState("");
  const [schedule, setSchedule] = useState("");
  const [editingJudge, setEditingJudge] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleAddOrEditJudge = () => {
    if (editingJudge) {
      setJudges((prev) =>
        prev.map((judge) =>
          judge.id === editingJudge.id
            ? { ...judge, name: judgeName, schedule: schedule }
            : judge
        )
      );
    } else {
      const newJudge = {
        id: judges.length + 1,
        name: judgeName,
        schedule: schedule,
      };
      setJudges((prev) => [...prev, newJudge]);
    }
    resetForm();
    onClose();
  };

  const handleEditJudge = (judge) => {
    setJudgeName(judge.name);
    setSchedule(judge.schedule);
    setEditingJudge(judge);
    onOpen();
  };

  const handleDeleteJudge = (id) => {
    setJudges((prev) => prev.filter((judge) => judge.id !== id));
  };

  const resetForm = () => {
    setJudgeName("");
    setSchedule("");
    setEditingJudge(null);
  };

  return (
    <Sidebar LinkItems={GetLinkItems("admin")}>
      <Box p={8} bg="white">
      <Heading mb={6} color="purple.700">Judge Management</Heading>

      <Button colorScheme="purple" mb={4} onClick={onOpen}>
        Add New Judge
      </Button>

      {/* Judge Table */}
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Schedule</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {judges.length > 0 ? (
            judges.map((judge) => (
              <Tr key={judge.id}>
                <Td>{judge.name}</Td>
                <Td>{judge.schedule}</Td>
                <Td>
                  <Button colorScheme="blue" onClick={() => handleEditJudge(judge)}>
                    Edit
                  </Button>
                  <Button colorScheme="red" onClick={() => handleDeleteJudge(judge.id)} ml={2}>
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={3} textAlign="center">
                No judges found.
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>

      {/* Modal for Add/Edit Judge */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingJudge ? "Edit Judge" : "Add New Judge"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Input
                placeholder="Judge Name"
                value={judgeName}
                onChange={(e) => setJudgeName(e.target.value)}
              />
              <Input
                placeholder="Schedule"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
              />
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleAddOrEditJudge}>
              {editingJudge ? "Update Judge" : "Add Judge"}
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

export default JudgeManagement;
