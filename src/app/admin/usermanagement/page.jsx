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
  Input,
  Button,
  Select,
  Stack,
  VStack,
  Text,
} from "@chakra-ui/react";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";

const UserManagement = () => {
  const [filter, setFilter] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [users] = useState([
    {
      id: 1,
      name: "Alice Smith",
      email: "alice@example.com",
      role: "Admin",
      lastActive: "2024-10-20",
    },
    {
      id: 2,
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "User",
      lastActive: "2024-10-22",
    },
    {
      id: 3,
      name: "Charlie Brown",
      email: "charlie@example.com",
      role: "User",
      lastActive: "2024-10-18",
    },
    // Add more users as needed
  ]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const filteredUsers = users.filter((user) => {
    const matchesName = user.name.toLowerCase().includes(filter.toLowerCase());
    const matchesRole = selectedRole ? user.role === selectedRole : true;
    return matchesName && matchesRole;
  });

  return (
    <Sidebar LinkItems={GetLinkItems("admin")}>
      <Box p={8}  bg="white">
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
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </Select>
          <Button
            colorScheme="purple"
            onClick={() => {
              setFilter("");
              setSelectedRole("");
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
                      onClick={() =>
                        alert(`Showing activity logs for ${user.name}`)
                      }
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
        </VStack>
      </Box>
    </Sidebar>
  );
};

export default UserManagement;
