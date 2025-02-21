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
  useToast,
} from "@chakra-ui/react";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import axios from "axios";
import TableData from "@/components/ui/TableData";

const JudgeManagement = () => {
  const [judges, setJudges] = useState([]);
  const [judgeName, setJudgeName] = useState("");
  const [email, setEmail] = useState("");
  const [editingJudge, setEditingJudge] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    axios.get(`/api/users`, { params: { role: "judge" } }).then((response) => {
      setJudges(response.data);
    });
  }

  const handleAddOrEditJudge = () => {
    axios
      .post("/api/users", {
        name: judgeName,
        email: email.toLocaleLowerCase(),
        schedule: {},
        role: "judge",
      })
      .then(() => {
        toast({
          title: "Success",
          description: "New judge added successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        resetForm();
        onClose();
        fetchData();
      })
      .catch((e) => {
        toast({
          title: "Error",
          description: e?.response?.data?.message || e?.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setLoading(false);
      });
  };

  const resetForm = () => {
    setJudgeName("");
    setEmail("");
    setEditingJudge(null);
    setLoading(false);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredJudges = judges.filter((judge) => {
    const matchesName = judge.name.toLowerCase().includes(filter.toLowerCase());
    return matchesName;
  });

  async function handleJudgeStatus(id) {
    axios
      .put(`/api/users/${id}`, {
        role: "user",
      })
      .then(() => {
        const temp = judges.filter((item) => item.id !== id);
        setJudges([...temp]);
        toast({
          title: "Success",
          description: "Judge removed successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }) .catch((e) => {
        toast({
          title: "Error",
          description: e?.response?.data?.message || e?.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      });
  }

  const RenderTable = useCallback(() => {
    return (
      <TableData
        data={filteredJudges.map((item) => {
          return { id: item.id, name: item.name, email: item.email };
        })}
        columns={[
          { key: "name", value: "Name" },
          { key: "email", value: "Email" },
          { value: "Suspend" },
        ]}
        button={true}
        buttonText={"Remove"}
        onButtonClick={(val) => handleJudgeStatus(val)}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    );
  }, [filteredJudges]);

  return (
    <>
      <Box p={8} bg="white">
        <Heading mb={6} color="purple.700">
          Judge Management
        </Heading>

        <Input
          placeholder="Search by name"
          value={filter}
          onChange={handleFilterChange}
        />

        <Button colorScheme="purple" my={4} onClick={onOpen}>
          Add New Judge
        </Button>

        {/* Judge Table */}

        <RenderTable />

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
    </>
  );
};

export default JudgeManagement;
