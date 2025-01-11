"use client";
import Sidebar from "@/components/sidebar";
import { UserContext } from "@/store/context/UserContext";
import GetLinkItems from "@/utils/SideBarItems";
import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Heading,
  HStack,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import moment from "moment";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
const MeetingComponent = dynamic(() => import("@/components/Meeting"), {
  ssr: false,
});

export default function Page() {
  const [session, setSession] = useState(false);
  const { state: UserState } = useContext(UserContext);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [meetingLink, setMeetingLink] = useState("");

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData(UserState.value.data.id);
    }
  }, [UserState.value.data]);

  async function fetchData(id) {
    axios
      .get(`/api/booking/judge/${id}`)
      .then((response) => {
        if (response.data.length > 0) {
          const bookings = response.data;
          const groupedData = bookings.reduce((acc, booking) => {
            const formattedDate = moment(
              new Date(Number(booking.booking_date))
            ).format("MM/DD/YYYY");
            let dateGroup = acc.find((group) => group.date === formattedDate);
            if (!dateGroup) {
              dateGroup = { date: formattedDate, data: [] };
              acc.push(dateGroup);
            }
            dateGroup.data.push(booking);
            return acc;
          }, []);
          setMyBookings(groupedData);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function handleStartSession(item) {
    setSelectedGroup(item);
    setMeetingLink("");
    onOpen();
  }

  async function handleShareLinkToAll() {
    onClose();
    const promises = selectedGroup.data.map((eachItem) => {
      return axios
        .put(`/api/booking/${eachItem.id}`, {
          meeting_link: meetingLink,
          status: "Started",
        })
        .catch((error) => {
          console.error(
            `Error updating booking for item ${eachItem.id}:`,
            error
          );
        });
    });

    await Promise.all(promises);
    fetchData(UserState.value.data.id);
  }

  async function handleEndSession(group) {
    const promises = group.data.map((eachItem) => {
      return axios
        .put(`/api/booking/${eachItem.id}`, {
          meeting_link: "",
          status: "Ended",
        })
        .catch((error) => {
          console.error(
            `Error updating booking for item ${eachItem.id}:`,
            error
          );
        });
    });

    await Promise.all(promises);
    fetchData(UserState.value.data.id);
  }

  return (
    <Sidebar LinkItems={GetLinkItems("judge")}>
      <Box p={8} bg="white">
        <VStack spacing={4} align="stretch">
          <Heading mb={2} color="purple.700">
            My Bookings
          </Heading>
          {myBookings
            .sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf())
            .map((group, index) => (
              <Box
                key={group.date}
                p={4}
                borderWidth="1px"
                borderRadius="md"
                borderColor="gray.300"
              >
                <VStack align={"flex-start"} gap={2}>
                  <Text fontSize="lg" fontWeight="bold" color="teal.400">
                    {moment(new Date(group.date)).format("MMM DD, yyyy")}
                  </Text>
                  <Text fontSize="sm">Status: {group.data[0].status}</Text>
                  {group.data[0].status == "Started" && (
                    <Text
                      _hover={{ cursor: "pointer", textDecorationLine: true }}
                      color="teal.500"
                      onClick={() => {
                        window.open(group.data[0].meeting_link, "_blank");
                      }}
                    >
                      Join Meeting
                    </Text>
                  )}
                  {group.data[0].status !== "Ended" &&
                    group.data[0].status !== "Started" &&
                    moment(group.date).isSameOrAfter(
                      moment().startOf("day")
                    ) && (
                      <Button
                        isLoading={loading}
                        colorScheme="purple"
                        onClick={() => {
                          // setLoading(true)
                          handleStartSession(group);
                        }}
                      >
                        Start Session
                      </Button>
                    )}

                  {group.data[0].status === "Started" &&
                    moment(group.date).isSameOrAfter(
                      moment().startOf("day")
                    ) && (
                      <Button
                        isLoading={loading}
                        colorScheme="red"
                        onClick={() => {
                          setLoading(true);
                          handleEndSession(group);
                        }}
                      >
                        End Session
                      </Button>
                    )}
                </VStack>
              </Box>
            ))}
        </VStack>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        {selectedGroup && (
          <ModalContent>
            <ModalHeader>{"Start session"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4}>
                <Input
                  placeholder="Meeting link"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                />
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="blue"
                onClick={() => {
                  setLoading(true);
                  handleShareLinkToAll();
                }}
              >
                Start
              </Button>
              <Button ml={3} onClick={onClose}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        )}
      </Modal>
    </Sidebar>
  );
}
