"use client";
import React, { useEffect, useState } from "react";
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
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/config/firebase";

const JudgeManagement = () => {
  const [judges, setJudges] = useState([]);
  const [judgeName, setJudgeName] = useState("");
  const [email, setEmail] = useState("");
  const [editingJudge, setEditingJudge] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    axios.get(`/api/users`, { params: { role: "judge" } }).then((response) => {
      setJudges(response.data);
    });
  }

  const handleAddOrEditJudge = () => {
    // if (editingJudge) {
    //   setJudges((prev) =>
    //     prev.map((judge) =>
    //       judge.id === editingJudge.id
    //         ? { ...judge, name: judgeName, email: email }
    //         : judge
    //     )
    //   );
    // } else {
    //   const newJudge = {
    //     id: judges.length + 1,
    //     name: judgeName,
    //     email: email,
    //   };
    //   setJudges((prev) => [...prev, newJudge]);
    // }
    axios
      .post("/api/users", {
        name: judgeName,
        email: email,
        schedule: {},
        role: "judge",
      })
      .then(() => {
        resetForm();
        onClose();
        fetchData();
      })
      .catch((e) => {
        setLoading(false);
      });
  };

  const handleDeleteJudge = (id) => {
    axios.delete(`/api/users/${id}`).then(() => {
      setJudges((prev) => prev.filter((judge) => judge.id !== id));
    });
  };

  const resetForm = () => {
    setJudgeName("");
    setEmail("");
    setEditingJudge(null);
    setLoading(false);
  };

  return (
    <Sidebar LinkItems={GetLinkItems("admin")}>
      <Box p={8} bg="white">
        <Heading mb={6} color="purple.700">
          Judge Management
        </Heading>

        <Button colorScheme="purple" mb={4} onClick={onOpen}>
          Add New Judge
        </Button>

        {/* Judge Table */}
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>email</Th>
              {/* <Th>Actions</Th> */}
            </Tr>
          </Thead>
          <Tbody>
            {judges.length > 0 ? (
              judges.map((judge, index) => (
                <Tr key={index}>
                  <Td>{judge.name}</Td>
                  <Td>{judge.email}</Td>
                  <Td>
                    {/* <Button colorScheme="blue" onClick={() => handleEditJudge(judge)}>
                    Edit
                  </Button> */}
                    {/* <Button
                      colorScheme="red"
                      onClick={() => handleDeleteJudge(judge.id)}
                      ml={2}
                    >
                      Delete
                    </Button> */}
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
            <ModalHeader>
              {editingJudge ? "Edit Judge" : "Add New Judge"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4}>
                <Input
                  placeholder="Judge Name"
                  value={judgeName}
                  onChange={(e) => setJudgeName(e.target.value)}
                />
                <Input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button
                isLoading={loading}
                colorScheme="blue"
                onClick={() => {
                  setLoading(true);
                  handleAddOrEditJudge();
                }}
              >
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
