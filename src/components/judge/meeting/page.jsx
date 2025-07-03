"use client";
import { UserContext } from "@/store/context/UserContext";
import {
  Box,
  Button,
  Center,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";

export default function JudgeMeeting() {
  const { state: UserState } = useContext(UserContext);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [meetingLink, setMeetingLink] = useState("");

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData(UserState.value.data?.id);
    }
  }, [UserState.value.data]);

  async function fetchData(id) {
    axios
      .get(`/api/booking/judge/${id}`)
      .then((response) => {
        setMyBookings(response.data);
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
    try {
      onClose();
      axios
        .put(`/api/booking/${selectedGroup.id}`, {
          meeting_link: meetingLink,
          status: "Started",
        })
        .catch((error) => {
          console.error(
            `Error updating booking for item ${eachItem.id}:`,
            error
          );
        })
        .finally(() => {
          fetchData(UserState.value.data?.id);
        });
    } catch (error) {
      console.log(error);
    }
  }

  async function handleEndSession(group) {
    axios
      .put(`/api/booking/${group.id}`, {
        meeting_link: "",
        status: "Ended",
      })
      .catch((error) => {
        console.error(`Error updating booking for item ${eachItem.id}:`, error);
      })
      .finally(() => {
        fetchData(UserState.value.data?.id);
      });
  }

  function isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  }

  return (
    <>
      <Box p={8} bg="white">
        {!loading ? (
          <VStack spacing={4} align="stretch">
            <Heading mb={2} color="purple.700">
              My Bookings
            </Heading>
            {myBookings
              .sort(
                (a, b) =>
                  moment(Number(b.booking_date)).valueOf() -
                  moment(Number(a.booking_date)).valueOf()
              )
              .map((group, index) => (
                <Box
                  key={index}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor="gray.300"
                >
                  <VStack align={"flex-start"} gap={2}>
                    <Text fontSize="lg" fontWeight="bold" color="teal.400">
                      {moment(Number(group.booking_date)).format(
                        "MMM DD, yyyy"
                      )}
                    </Text>

                    <Text fontSize="sm">Time: {group?.booking_time}</Text>
                    <Text fontSize="sm">Status: {group?.status}</Text>
                    {group?.status == "Started" && (
                      <Text
                        _hover={{ cursor: "pointer", textDecorationLine: true }}
                        color="teal.500"
                        onClick={() => {
                          window.open(group?.meeting_link, "_blank");
                        }}
                      >
                        Join Meeting
                      </Text>
                    )}
                    {group?.status !== "Ended" &&
                      group?.status !== "Started" &&
                      moment(Number(group.booking_date)).isSameOrAfter(
                        moment().startOf("day")
                      ) && (
                        <Button
                          colorScheme="purple"
                          onClick={() => {
                            // setLoading(true)
                            handleStartSession(group);
                          }}
                        >
                          Start Session
                        </Button>
                      )}

                    {group?.status === "Started" &&
                      moment(Number(group.booking_date)).isSameOrAfter(
                        moment().startOf("day")
                      ) && (
                        <Button
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
        ) : (
          <Center style={{ width: "100%", height: "100vh" }}>
            <Spinner />
          </Center>
        )}
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
                {meetingLink && !isValidUrl(meetingLink) && (
                  <Text color={"red"} fontSize="sm">
                    Please enter a valid URL
                  </Text>
                )}
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button
                isDisabled={!meetingLink || !isValidUrl(meetingLink)}
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
    </>
  );
}
