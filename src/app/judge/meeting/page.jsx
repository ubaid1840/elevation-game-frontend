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
  Link,
  Text,
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
  const router = useRouter()

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData(UserState.value.data.id);
    }
  }, [UserState.value.data]);

  async function fetchData(id) {
    axios.get(`/api/booking/judge/${id}`).then((response) => {
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
    });
  }

  async function handleStartSession(item) {
    setSelectedGroup(item);
    setSession(true);
  }

  return (
    <Sidebar LinkItems={GetLinkItems("judge")}>
      {session ? (
        selectedGroup && (
          <MeetingComponent
            page={"judge"}
            onEndMeeting={() => {
              fetchData(UserState.value.data.id);
              setSession(false);
              setSelectedGroup(null);
            }}
            group={selectedGroup}
          />
        )
      ) : (
        <Box p={8} bg="white">
          <VStack spacing={4} align="stretch">
            <Heading mb={2} color="purple.700">
              My Bookings
            </Heading>
            {myBookings
              .sort(
                (a, b) => moment(b.date).valueOf() - moment(a.date).valueOf()
              )
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
                      _hover={{cursor:'pointer', textDecorationLine : true}}
                        color="teal.500"
                        onClick={()=>{
                          router.push(`${group.data[0].meeting_link.replace("user", "judge")}`, undefined, { shallow: true })
                          setSelectedGroup(group)
                          setSession(true)
                        }}
                      >
                        Join Meeting
                      </Text>
                    )}
                    {(group.data[0].status !== "Ended" &&
                      moment(group.date).isSameOrAfter(
                        moment().startOf("day")
                      )) && (
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
                  </VStack>
                </Box>
              ))}
          </VStack>
        </Box>
      )}
    </Sidebar>
  );
}
