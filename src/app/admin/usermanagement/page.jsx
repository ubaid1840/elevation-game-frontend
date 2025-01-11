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
  Input,
  Button,
  Select,
  Stack,
  VStack,
  Text,
  UnorderedList,
  ListItem,
  Flex,
  Icon,
  Center,
  Spinner,
} from "@chakra-ui/react";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import axios from "axios";
import moment from "moment";
import TableData from "@/components/ui/TableData";
import Loading from "@/app/loading";

const UserManagement = () => {
  const [filter, setFilter] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false)

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
    const matchesRole = selectedRole
      ? user.role === selectedRole.toLowerCase()
      : true;
    return matchesName && matchesRole;
  });

  async function handleLogs(id) {
    axios.get(`/api/users/${id}/logs`).then((response) => {
      setLogs(response.data);
    });
  }

  async function handleChangeStatus(item) {
    axios
      .put(`/api/users/${item.id}`, {
        status: item.status,
      })
      .then(() => {
        let temp = [];
        users.map((eachUser) => {
          if (item.id === eachUser.id) {
            temp.push({ ...eachUser, active: item.status });
          } else {
            temp.push(eachUser);
          }
        });
        setUsers([...temp]);
      }).finally(()=>{
        setLoading(false)
      })
  }

  async function handlePromote(id) {
    axios
      .put(`/api/users/${id}`, {
        role: "judge",
      })
      .then(() => {
        const updatedUsers = users.map((eachUser) =>
          eachUser.id === id ? { ...eachUser, role: "judge" } : eachUser
        );

        setUsers([...updatedUsers]);
      }).finally(()=>{
        setLoading(false)
      })
  }

  const RenderTable = useCallback(() => {
    return (
      <TableData
        special={true}
        data={filteredUsers.map((item) => {
          return {
            id: item.id,
            name: item.name,
            email: item.email,
            role: item.role,
            last_active: item.last_active
              ? moment(new Date(item.last_active)).format("MM/DD/YYYY hh:mm A")
              : "",
            active: item.active,
          };
        })}
        columns={[
          { key: "name", value: "Name" },
          { key: "email", value: "Email" },
          { key: "role", value: "Role" },
          { key: "last_active", value: "Last Active" },
          { key: "active", value: "Active" },
          { value: "Activity Log" },
        ]}
        button={true}
        buttonText={"View Logs"}
        onButtonClick={(val) => {
          handleLogs(val);
        }}
        onSwitchClick={(val) => {
          setLoading(true)
          handleChangeStatus(val);
        }}
        button2={true}
        buttonText2={"Promote to judge"}
        onButtonClick2={(val) => {
          setLoading(true)
          handlePromote(val)}}
      />
    );
  }, [filteredUsers]);

  const LoadingIndicator = () => {
    return (
      <Center height={'100vh'}>
        <Spinner color="black"/>
      </Center>
    )
  }

  return (
    <Sidebar LinkItems={GetLinkItems("admin")}>
      {loading ? <LoadingIndicator /> :
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
            placeholder="All"
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
              setLogs([]);
            }}
          >
            Clear Filters
          </Button>
        </Stack>

        {/* User Table */}
        <RenderTable />

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
}
     
    </Sidebar>
  );
};

export default UserManagement;
