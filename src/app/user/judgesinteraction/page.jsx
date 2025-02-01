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
  Select,
  Link,
  Center,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import moment from "moment";
import { Calendar } from "primereact/calendar";
import { useContext, useEffect, useState } from "react";

export default function Page() {
  const [date, setDate] = useState(new Date());
  const [allJudges, setAllJudges] = useState([]);
  const [selectedJudge, setSelectedJudge] = useState("");
  const [loading, setLoading] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedTime, setSelectedTime] = useState("");
  const { state: UserState } = useContext(UserContext);
  const toast = useToast();

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData(UserState.value.data?.id);
    }
  }, [UserState.value.data]);

  async function fetchData(id) {
    axios
      .get("/api/users?role=judge")
      .then((response) => {
        setAllJudges(response.data);
      })
      .then(() => {
        setDataLoading(false);
      })
      .catch((e) => {
        setDataLoading(false);
      });

    axios.get(`/api/booking/${id}`).then((response) => {
      if (response.data.length > 0) {
        const temp = response.data.filter((item) => item.status !== "Ended");
        setMyBookings([...temp]);
      }
    });
  }

  const handleJudgeChange = (event) => {
    setSelectedJudge(event.target.value);
  };

  const handleBookSession = () => {
    if (!date || !selectedJudge || !selectedTime) {
      console.error("Please select date, time and a judge.");
      return;
    }

    axios
      .post("/api/booking", {
        booked_by: Number(UserState.value.data?.id),
        booked_for: Number(selectedJudge),
        booking_date: moment(date).valueOf(),
        booking_time: selectedTime,
      })
      .then((response) => {
        fetchData(UserState.value.data?.id);
      })
      .catch((e) => {
        console.error("Error booking session:", e);

        toast({
          title: "Error",
          description: e.response?.data?.message || "Error",
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const formatScheduleString = (schedule, name) => {
    if (schedule && schedule.length === 0) return "";

    const dayOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const scheduleEntries = schedule.flatMap((entry) => Object.entries(entry));
    const sortedEntries = scheduleEntries.sort(
      ([dayA], [dayB]) => dayOrder.indexOf(dayA) - dayOrder.indexOf(dayB)
    );
    const formattedEntries = sortedEntries.map(([day, time], index, arr) => {
      if (index === arr.length - 1 && arr.length > 1) {
        return ` and ${day} at ${time}`;
      }
      return ` ${day} at ${time}${index < arr.length - 2 ? "," : ""}`;
    });

    return `Judge ${name}: Available on${formattedEntries.join("")}`;
  };

  return (
    <Sidebar LinkItems={GetLinkItems("user")}>
      {dataLoading ? (
        <Center w={"100%"} minH={"100vh"}>
          <Spinner />
        </Center>
      ) : (
        <Box p={8}>
          <Box bg="purple.50" p={6} borderRadius="lg" boxShadow="md" mb={8}>
            <Heading size="lg" mb={4}>
              Schedule Critiques
            </Heading>
            <Divider borderColor="gray.400" mb={4} />
            <Text fontSize="md" mb={4}>
              Select a date and judge below to book a critique session.
            </Text>

            <Select
              placeholder="Select a judge"
              value={selectedJudge}
              onChange={handleJudgeChange}
              mb={4}
            >
              {allJudges.map((judge) => (
                <option key={judge.id} value={judge.id}>
                  {judge.name}
                </option>
              ))}
            </Select>

            <Box
              bg={"white"}
              border={"1px solid"}
              borderColor={"#D0D5DD"}
              borderRadius={"md"}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              height={"40px"}
              px={4}
              mb={4}
            >
              <Calendar
                minDate={new Date()}
                id="session-booking"
                value={date}
                onChange={(e) => setDate(e.value)}
                showIcon
                className="custom-calendar"
                dateFormat="mm/dd/yy"
                style={{ width: "100%" }}
              />
            </Box>

            <Select
              isDisabled={!selectedJudge || !date}
              placeholder="Select Time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              variant="outline"
              bg="white"
              borderColor="gray.300"
              mb={4}
            >
              {allJudges
                .filter((judge) => judge.id === Number(selectedJudge))
                .flatMap((judge) => {
                  const filteredSchedule = judge.schedule?.filter((entry) => {
                    const day = Object.keys(entry)[0];
                    return day === moment(new Date(date)).format("dddd");
                  });
                  return filteredSchedule?.map(
                    (entry) => Object.values(entry)[0]
                  );
                })
                ?.map((time, index) => {
                  return (
                    <option key={index} value={time}>
                      {time}
                    </option>
                  );
                })}
            </Select>

            <VStack align="start" spacing={4} mt={6}>
              <Text fontWeight="bold" fontSize="lg">
                Judge Availability:
              </Text>
              {allJudges.map(
                (item, index) =>
                  item.schedule &&
                  item.schedule.length !== 0 && (
                    <Text key={index} fontSize="sm">
                      - {formatScheduleString(item.schedule, item.name)}
                      <br />
                    </Text>
                  )
              )}
            </VStack>

            <Button
              isLoading={loading}
              colorScheme="purple"
              size="lg"
              mt={6}
              onClick={() => {
                setLoading(true);
                handleBookSession();
              }}
              isDisabled={!date || !selectedJudge}
            >
              Book Critique Session
            </Button>
          </Box>

          {/* My Bookings Section */}
          <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
            <Heading size="md" mb={4}>
              My Bookings
            </Heading>
            <Divider borderColor="gray.400" mb={4} />
            <VStack align="start" spacing={4}>
              {myBookings.length > 0 ? (
                myBookings.map((booking, index) => (
                  <Box
                    key={index}
                    p={4}
                    w="100%"
                    border="1px solid #E2E8F0"
                    borderRadius="md"
                  >
                    <Text fontSize="md">
                      <strong>Date:</strong>{" "}
                      {moment(new Date(Number(booking.booking_date))).format(
                        "MM/DD/YYYY"
                      )}
                    </Text>
                    <Text fontSize="md">
                      <strong>Time:</strong> {booking?.booking_time}
                    </Text>
                    <Text fontSize="md">
                      <strong>Status:</strong> {booking.status}
                    </Text>

                    {booking.meeting_link ? (
                      <Link
                        href={booking.meeting_link}
                        color="teal.500"
                        target="blank"
                      >
                        Join Meeting
                      </Link>
                    ) : (
                      <Text color="gray.500">Meeting link not available</Text>
                    )}
                  </Box>
                ))
              ) : (
                <Text>No active bookings.</Text>
              )}
            </VStack>
          </Box>
        </Box>
      )}
    </Sidebar>
  );
}
