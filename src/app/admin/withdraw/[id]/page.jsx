"use client";

import { db } from "@/config/firebase";
import { UserContext } from "@/store/context/UserContext";
import {
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    RequiredIndicator,
    Select,
    Stack,
    Text,
    Textarea,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import moment from "moment";
import { useContext, useEffect, useState } from "react";

export default function WithdrawPage({ params }) {
    const [note, setNote] = useState("");
    const toast = useToast();
    const { state: UserState } = useContext(UserContext);
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [trxId, setTrxId] = useState("")
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        if (UserState.value.data?.id) {
            fetchData(UserState.value.data?.id);
        }
    }, [UserState]);

    async function fetchData(id) {
        if (!id) return;
        setLoading(true);

        try {
            const response = await axios.get(`/api/withdraw/${params.id}`);
            setData(response.data);
            setNote(response.data?.admin_note || "")
            setStatus(response.data?.status || "")
        } catch (e) {
            toast({
                title: "Error",
                description: e?.response?.data?.message || "Error fetching data",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (status === "Paid" && !trxId.trim()) {
            alert("Transaction ID is required when status is Paid");
            return;
        }

        setSubmitLoading(true);

        axios
            .put(`/api/withdraw/${data?.id}`, {
                admin_note: note,
                status: status,
                user_id: data?.user_id,
                trx_id: trxId
            })
            .then(async () => {
                toast({
                    title: "Request updated",
                    status: "success",
                    duration: 3000,
                });
                await fetchData(UserState.value.data?.id);

                setDoc(doc(db, "triggers", `${data?.user_id}-trigger`), {
                    timestamp: moment().valueOf(),
                })


                addDoc(collection(db, "notifications"), {
                    to: data?.user_id,
                    title: `Request ${status}`,
                    message: `Your withdrawal request is ${status}`,
                    timestamp: moment().valueOf(),
                    status: "pending",
                });

                setNote("");
                setStatus("");
                onClose();
            })
            .catch((e) => {
                toast({
                    title: e?.response?.data?.message || "Error saving data",
                    status: "error",
                    duration: 3000,
                });
            })
            .finally(() => {
                setSubmitLoading(false);
            });
    };

    const statusColor = (status) => {
        switch (status) {
            case "Approved":
                return "blue";
            case "Rejected":
                return "red";
            case "Paid":
                return "green";
            default:
                return "gray";
        }
    };

    function handleClose(val){
        setNote("")
        setStatus("")
        onClose(val)
    }

    return (
        <Box p={8} bg="gray.50" minH="100vh">
            <Heading mb={8} color="purple.700" size="lg" textAlign="center">
                Withdrawal Request
            </Heading>

            <Box
                maxW="3xl"
                mx="auto"
                bg="white"
                shadow="sm"
                rounded="xl"
                p={8}
                border="1px solid"
                borderColor="gray.100"
            >
                <Stack spacing={6}>
                    {/* Status */}
                    <Box display="flex" gap={2} alignItems="center">
                        <Text fontSize="sm" color="gray.500">
                            Status:
                        </Text>
                        <Badge
                            px={3}
                            py={1}
                            rounded="md"
                            fontSize="sm"
                            colorScheme={statusColor(data?.status)}
                        >
                            {data?.status}
                        </Badge>
                    </Box>

                    {/* User Info */}
                    <Box>
                        <Text fontSize="sm" color="gray.500">
                            User
                        </Text>
                        <Text fontWeight="semibold" fontSize="md">
                            {data?.user_name} ({data?.user_email})
                        </Text>
                    </Box>

                    <Flex gap={12}>
                        <Box>
                            <Text fontSize="sm" color="gray.500">
                                Role
                            </Text>
                            <Text fontWeight="semibold">{data?.user_role}</Text>
                        </Box>
                        <Box>
                            <Text fontSize="sm" color="gray.500">
                                Subscription
                            </Text>
                            <Text fontWeight="semibold">{data?.user_package}</Text>
                        </Box>
                    </Flex>

                    <Divider />

                    {/* Amounts */}
                    <Box>
                        <Text fontSize="sm" color="gray.500">
                            Amount Requested
                        </Text>
                        <Text fontWeight="bold" color="green.600" fontSize="2xl">
                            ${data?.requested_amount}
                        </Text>
                    </Box>

                    <Box>
                        <Text fontSize="sm" color="gray.500">
                            Residual Income (After Request)
                        </Text>
                        <Text fontWeight="bold" color="blue.600" fontSize="2xl">
                            $
                            {Number(data?.user_residual_income || 0)}
                        </Text>
                    </Box>

                    <Box>
                        <Text fontSize="sm" color="gray.500">
                            Request method
                        </Text>
                        <Text fontWeight="semibold">
                            {data?.method}
                        </Text>
                    </Box>

                    {data?.cash_app_info &&
                        <Box>
                            <Text fontSize="sm" color="gray.500">
                                CashApp detail
                            </Text>
                            <Text fontWeight="semibold">
                                {data?.cash_app_info}
                            </Text>
                        </Box>}

                    {/* Dates */}
                    <Box>
                        <Text fontSize="sm" color="gray.500">
                            Requested Date and Time
                        </Text>
                        <Text fontWeight="semibold">
                            {data?.created_at &&
                                moment(data.created_at).format("DD-MM-YYYY hh:mm A")}
                        </Text>
                    </Box>

                    {/* Referrer */}
                    <Box>
                        <Text fontSize="sm" color="gray.500">
                            Referrer
                        </Text>
                        <Text fontWeight="semibold">
                            {data?.referrer_name ? data.referrer_name : "No referrer"}
                        </Text>
                    </Box>

                    {data?.admin_note &&
                        <Box>
                            <Text fontSize="sm" color="gray.500">
                                Admin note
                            </Text>
                            <Text fontWeight="semibold">
                                {data?.admin_note}
                            </Text>
                        </Box>}
                </Stack>
            </Box>

            {(data?.status === 'Pending' || data?.status === 'Approved') &&
                <Flex justify="center" mt={8}>
                    <Button
                        onClick={() => {
                            onOpen()
                        }}
                        colorScheme="purple"
                        px={10}
                        size="lg"
                        rounded="xl"
                        shadow="md"
                    >
                        Take Action
                    </Button>
                </Flex>
            }

            {/* Action Modal */}
            <Modal isOpen={isOpen} onClose={handleClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Update Withdrawal Status</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <form onSubmit={handleSubmit}>
                            <FormControl mb={4}>
                                <FormLabel>User note</FormLabel>
                                <Textarea
                                    readOnly
                                    minH="150px"
                                    value={data?.note || ""}
                                    bg="gray.50"
                                />
                            </FormControl>

                            <FormControl mb={4} isRequired>
                                <FormLabel>Status</FormLabel>
                                <Select
                                    placeholder="Select status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Paid">Paid</option>
                                </Select>
                            </FormControl>

                            {status === 'Paid' &&
                                <FormControl mb={4}>
                                    <FormLabel>Trx Id</FormLabel>
                                    <Input
                                        value={trxId}
                                        onChange={(e) => setTrxId(e.target.value)}
                                        placeholder="Reference or transaction id"
                                    />
                                </FormControl>
                            }

                            <FormControl mb={4}>
                                <FormLabel>Admin Note / Details</FormLabel>
                                <Textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Add additional note (optional)"
                                />
                            </FormControl>

                            <Button
                                isLoading={submitLoading}
                                type="submit"
                                colorScheme="purple"
                                width="full"
                                rounded="md"
                                isDisabled={!status || submitLoading}
                            >
                                Update Status
                            </Button>
                        </form>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );

}
