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
  Input,
  Button,
  Select,
  Stack,
  VStack,
  Text,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import axios from "axios";

const UserManagement = () => {
  const [filter, setFilter] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    axios.get(`/api/users?role=user`).then((response) => {
      const temp = response.data;
      axios.get("/api/users?role=judge").then((res) => {
        const temp2 = res.data;
        const finalData = [...temp, ...temp2];
        setUsers(finalData);
      });
    });
  }

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const filteredUsers = users.filter((user) => {
    const matchesName = user.name.toLowerCase().includes(filter.toLowerCase());
    const matchesRole = selectedRole ? user.role === selectedRole.toLowerCase() : true;
    return matchesName && matchesRole;
  });

  async function handleLogs(id) {
    axios.get(`/api/users/${id}/logs`).then((response) => {
      setLogs(response.data);
    });
  }

  return (
    <Sidebar LinkItems={GetLinkItems("admin")}>
      <Box p={8} bg="white">
        <Heading mb={6} color="purple.700">
          User Management
        </Heading>

        {/* Filter Options */}
        <Stack spacing={4} mb={6}>
          <Input
            placeholder="Search by name"
            value={filter}
            onChange={handleFilterChange}
          />
          <Select
            placeholder="Filter by role"
            value={selectedRole}
            onChange={handleRoleChange}
          >
            <option value="Judge">Judge</option>
            <option value="User">User</option>
          </Select>
          <Button
            colorScheme="purple"
            onClick={() => {
              setFilter("");
              setSelectedRole("");
              setLogs([])
            }}
          >
            Clear Filters
          </Button>
        </Stack>

        {/* User Table */}
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Last Active</Th>
              <Th>Activity Log</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <Tr key={user.id}>
                  <Td>{user.name}</Td>
                  <Td>{user.email}</Td>
                  <Td>{user.role}</Td>
                  <Td>{user.lastActive}</Td>
                  <Td>
                    <Button
                      colorScheme="blue"
                      onClick={() => handleLogs(user.id)}
                    >
                      View Logs
                    </Button>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={5} textAlign="center">
                  No users found.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>

        {/* Activity Logs Section (optional) */}
        <VStack spacing={4} mt={8} align="start">
          <Heading size="md">User Activity Logs</Heading>
          <Text>
            {`Click on "View Logs" to see the detailed activity for each user.`}
          </Text>
          <UnorderedList>
            {logs.length > 0 &&
              logs.map((item, index) => (
                <ListItem key={index}>{item.action}</ListItem>
              ))}
          </UnorderedList>
        </VStack>
      </Box>
    </Sidebar>
  );
};

export default UserManagement;
