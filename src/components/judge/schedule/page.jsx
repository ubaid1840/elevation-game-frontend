"use client";
import Sidebar from "@/components/sidebar";
import { UserContext } from "@/store/context/UserContext";
import GetLinkItems from "@/utils/SideBarItems";
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  Divider,
  HStack,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import axios from "axios";
import { useContext, useEffect, useState } from "react";

export default function JudgeSchedule() {
  const { state: UserState, setUser } = useContext(UserContext);
  const [newAvailability, setNewAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    day: "",
    startTime: "",
  });

  useEffect(() => {
    console.log(UserState.value.data?.schedule);
  }, [UserState.value.data]);

  const handleAddAvailability = () => {
    if (formData.day && formData.startTime) {
      const newEntry = { [formData.day]: formData.startTime };
      const isDuplicate = newAvailability.some(
        (entry) => JSON.stringify(entry) === JSON.stringify(newEntry)
      );

      if (!isDuplicate) {
        setNewAvailability((prev) => [...prev, newEntry]);
        setFormData({ day: "", startTime: "" });
      } else {
        alert("This availability already exists!");
      }
    }
  };

 

  const handleSaveAllAvailability = async () => {

    axios
      .put(`/api/users/${UserState.value.data?.id}/schedule`, {
        schedule: newAvailability,
      })
      .then((response) => {
        let temp = UserState.value.data;
        temp.schedule = response.data.schedule;
        setUser(temp);
        setNewAvailability([]);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setLoading(false);
      });

    setLoading(false);
  };

  return (
    <>
      <Box p={8}>
        <Box bg="purple.50" p={6} borderRadius="lg" boxShadow="md" mb={8}>
          <Heading size="lg" mb={4}>
            Set Availability
          </Heading>
          <Divider borderColor="gray.400" mb={4} />
          <Text fontSize="md" mb={6}>
            Select the day and time you are available for critique sessions.
          </Text>

          {/* Display Existing Schedule */}
          <Box mb={6}>
            <Heading size="md" mb={4}>
              Existing Schedule
            </Heading>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Day</Th>
                  <Th>Time</Th>
                </Tr>
              </Thead>
              <Tbody>
                {UserState.value.data?.schedule &&
                  UserState.value.data.schedule.map((entry, index) =>
                    Object.entries(entry).map(([key, value]) => (
                      <Tr key={index}>
                        <Td>{key}</Td>
                        <Td>{value}</Td>
                      </Tr>
                    ))
                  )}
              </Tbody>
            </Table>
          </Box>

          {/* Form to Add New Availability */}
          <VStack alignItems="flex-start" width="100%" spacing={5}>
            <HStack width="100%" spacing={4}>
              <Text fontSize="md" fontWeight="semibold" width="25%">
                Day
              </Text>
              <Select
                placeholder="Select Day"
                value={formData.day}
                onChange={(e) =>
                  setFormData((prevState) => ({
                    ...prevState,
                    day: e.target.value,
                  }))
                }
                variant="outline"
                bg="white"
                borderColor="gray.300"
                width="75%"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
              </Select>
            </HStack>

            <HStack width="100%" spacing={4}>
              <Text fontSize="md" fontWeight="semibold" width="25%">
                Start Time
              </Text>
              <Select
                placeholder="Select Time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData((prevState) => ({
                    ...prevState,
                    startTime: e.target.value,
                  }))
                }
                variant="outline"
                bg="white"
                borderColor="gray.300"
                width="75%"
              >
                {[...Array(24)].map((_, i) => (
                  <option key={i} value={`${i.toString().padStart(2, "0")}:00`}>
                    {i.toString().padStart(2, "0")}:00
                  </option>
                ))}
              </Select>
            </HStack>

            <Button
              colorScheme="purple"
              onClick={handleAddAvailability}
              isDisabled={!formData.day || !formData.startTime}
              width="full"
            >
              Add Availability
            </Button>
          </VStack>

          {/* Display New Availabilities */}
          {newAvailability.length > 0 && (
            <Box mt={8}>
              <Heading size="md" mb={4}>
                New Availabilities
              </Heading>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Day</Th>
                    <Th>Time</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {newAvailability.map((entry, index) => {
                    const [day, time] = Object.entries(entry)[0];
                    return (
                      <Tr key={index}>
                        <Td>{day}</Td>
                        <Td>{time}</Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          )}

          {/* Final Save Button */}
          {newAvailability.length > 0 && (
            <Button
              isDisabled={!UserState.value.data?.id}
              isLoading={loading}
              colorScheme="purple"
              size="lg"
              mt={6}
              onClick={() => {
                setLoading(true);
                handleSaveAllAvailability();
              }}
              width="full"
            >
              Update Schedule
            </Button>
          )}
        </Box>
      </Box>
    </>
  );
}
