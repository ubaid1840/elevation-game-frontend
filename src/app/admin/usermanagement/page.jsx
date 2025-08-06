"use client";
import TableData from "@/components/ui/TableData";
import {
  Box,
  Button,
  Center,
  FormLabel,
  Heading,
  Input,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Stack,
  Text,
  UnorderedList,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";

const UserManagement = () => {
  const [filter, setFilter] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [referralLoading, setReferralLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newReferral, setNewReferral] = useState("");
  const toast = useToast();

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
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function handlePromote(id) {
    axios
      .put(`/api/users/${id}?checkwaiver=true`, {
        role: "judge",
      })
      .then(() => {
        const updatedUsers = users.map((eachUser) =>
          eachUser.id === id ? { ...eachUser, role: "judge" } : eachUser
        );

        setUsers([...updatedUsers]);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function handleRowClick(val) {
    setNewReferral(val.referral_code);
    setSelectedUser(val);
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
            referral_code: item.referral_code,
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
          { key: "referral_code", value: "Referral Code" },
          { key: "last_active", value: "Last Active" },
          { key: "active", value: "Active" },
        ]}
        button={true}
        buttonText={"View Logs"}
        onButtonClick={(val) => {
          handleLogs(val);
        }}
        onSwitchClick={(val) => {
          setLoading(true);
          handleChangeStatus(val);
        }}
        button2={true}
        buttonText2={"Promote to judge"}
        onButtonClick2={(val) => {
          setLoading(true);
          handlePromote(val);
        }}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        editButton={true}
        onEditClick={handleRowClick}
      />
    );
  }, [filteredUsers]);

  const LoadingIndicator = () => {
    return (
      <Center height={"100vh"}>
        <Spinner color="black" />
      </Center>
    );
  };

  async function handleSaveNewReferral() {
    const id = selectedUser?.id;

    if (!id) return;
    setReferralLoading(true);
    axios
      .put(`/api/users/${selectedUser?.id}`, {
        referral_code: newReferral,
      })
      .then(() => {
        setUsers((prevState) =>
          prevState.map((item) =>
            item.id === id ? { ...item, referral_code: newReferral } : item
          )
        );
        setSelectedUser(null);
      })
      .catch((e) => {
        toast({
          title: "Error",
          description: e.response.data?.error || e.response.data?.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => {
        setReferralLoading(false);
      });
  }

  return (
    <>
      {loading ? (
        <LoadingIndicator />
      ) : (
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
          <LogsSection logs={logs} />

          <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Edit Referral</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Stack spacing={2}>
                  <FormLabel mb={0}>Name</FormLabel>
                  <Input value={selectedUser?.name || ""} disabled />

                  <FormLabel mb={0}>Email</FormLabel>
                  <Input value={selectedUser?.email || ""} disabled />
                  <FormLabel mb={0}>Referral Code</FormLabel>
                  <Input
                    placeholder="Enter referral code"
                    value={newReferral}
                    onChange={(e) =>
                      setNewReferral(e.target.value?.toUpperCase())
                    }
                  />
                </Stack>
              </ModalBody>
              <ModalFooter>
                <Button
                  isDisabled={referralLoading || !newReferral}
                  colorScheme="blue"
                  onClick={handleSaveNewReferral}
                >
                  {referralLoading && <Spinner size={"sm"} mr={1} />} Save
                </Button>
                <Button ml={3} onClick={() => setSelectedUser(null)}>
                  Cancel
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Box>
      )}
    </>
  );
};

const LogsSection = ({ logs }) => {
  return (
    <VStack spacing={4} mt={8} align="start">
      <Heading size="md">User Activity Logs</Heading>
      <Text>{`Click on "View Logs" to see the detailed activity for each user.`}</Text>
      <UnorderedList>
        {logs.length > 0 &&
          logs.map((item, index) => (
            <ListItem key={index}>
              {new Date(item.created_at).toLocaleDateString("en-US")}{" "}
              {item.action}
            </ListItem>
          ))}
      </UnorderedList>
    </VStack>
  );
};

export default UserManagement;
