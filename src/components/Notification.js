"use client";
import { db } from "@/config/firebase";
import { UserContext } from "@/store/context/UserContext";
import { TimeIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Heading,
    HStack,
    Input,
    Stack,
    Text,
    VStack
} from "@chakra-ui/react";
import { and, collection, deleteDoc, doc, onSnapshot, query, where } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import axios from "@/lib/axiosInstance";


const NotificationManagement = ({ page }) => {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState("");
    const { state: UserState, } = useContext(UserContext)

    useEffect(() => {
        if (UserState.value.data?.email) {

            const searchEmail = UserState.value.data?.email
            const searchId = UserState.value.data?.id
            let q = null
            if (page === 'admin') {
                q = query(
                    collection(db, "notifications"),
                    and(where("to", "==", searchEmail), where("status", "==", "pending"))
                );
            } else {
                q = query(
                    collection(db, "notifications"),
                    and(where("to", "==", searchId), where("status", "==", "pending"))
                );
            }

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                let list = [];

                querySnapshot.forEach(async (doc) => {
                    list.push({ ...doc.data(), id: doc.id })
                });
                list.sort((a, b) => b.timestamp - a.timestamp)

                setNotifications([...list]);
            });

            return () => unsubscribe();
        }

    }, [UserState.value.data]);



    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    const filteredNotifications = notifications.filter((notification) => {
        const matchesTitle = notification.title
            .toLowerCase()
            .includes(filter.toLowerCase());
        return matchesTitle;
    });

    async function handleMarkAsRead(id) {
        deleteDoc(doc(db, "notifications", id))
    }

    async function handleClearNotifications() {
        const promises = notifications.map(async (notification) => {
            const notificationRef = doc(db, "notifications", notification.id);
            return await deleteDoc(notificationRef);
        });

        try {
            await Promise.all(promises);
            console.log("All notifications cleared!");
        } catch (error) {
            console.error("Error clearing notifications:", error);
        }
    }

    return (
        <>
            <Box p={8} bg="white" minH="100vh">
                <Heading mb={6} color="purple.700">
                    Notifications
                </Heading>

                <Stack direction={["column", "row"]} spacing={4} mb={6}>
                    <Input
                        placeholder="Search notifications"
                        value={filter}
                        onChange={handleFilterChange}
                    />

                    <Button
                        colorScheme="purple"
                        onClick={() => {
                            handleClearNotifications()
                        }}
                    >
                        Clear Notifications
                    </Button>
                </Stack>

                {/* Notifications List */}
                <VStack spacing={4} align="stretch">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification) => (
                            <Box
                                key={notification.id}
                                p={4}
                                borderWidth="1px"
                                borderRadius="md"
                                bg={"blue.50"}
                                borderColor={"blue.200"}
                            >
                                <HStack justify="space-between">
                                    <Heading size="sm" color="gray.800">
                                        {notification.title}
                                    </Heading>

                                </HStack>
                                <Text mt={2} color="gray.600">
                                    {notification.message}
                                </Text>
                                <HStack mt={2} color="gray.500" fontSize="sm">
                                    <TimeIcon />
                                    <Text>
                                        {new Date(notification.timestamp).toLocaleString()}
                                    </Text>
                                </HStack>
                                <Text _hover={{ cursor: 'pointer' }} onClick={() => {
                                    handleMarkAsRead(notification.id)
                                }} mt={2} fontSize={'12px'}>Mark as read</Text>
                            </Box>
                        ))
                    ) : (
                        <Text color="gray.500" textAlign="center">
                            No notifications to display.
                        </Text>
                    )}
                </VStack>
            </Box>
        </>
    );
};



export default NotificationManagement;
