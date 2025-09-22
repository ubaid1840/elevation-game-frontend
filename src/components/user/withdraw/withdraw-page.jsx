"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    Textarea,
    Text,
    useToast,
    Heading,
    useDisclosure,
    HStack,
    Spacer,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    FormErrorMessage,
} from "@chakra-ui/react";
import { UserContext } from "@/store/context/UserContext";
import axios from "axios";
import TableData from "@/components/ui/TableData";
import moment from "moment";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/config/firebase";

export default function WithdrawPage() {
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("");
    const [note, setNote] = useState("");
    const toast = useToast();
    const { state: UserState, setUser } = useContext(UserContext);
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [submitLoading, setSubmitLoading] = useState(false)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [residualIncome, setResidualIncome] = useState(0)
    const [cashAppInfo, setCashAppInfo] = useState("")


    const [currentPage, setCurrentPage] = useState(1);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (UserState.value.data?.id) {
            fetchData(UserState.value.data?.id)
        }
    }, [UserState])

    async function fetchData(id) {
        if (!id) return
        setLoading(true)

        try {
            const response = await axios.get(`/api/users/${id}/withdraw`)
            setData(response.data.withdraw)
            setResidualIncome(response.data?.residual_income)
        } catch (error) {
            toast({
                title: "Error",
                description: e?.response?.data?.message || "Error fetchind data",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false)
        }

    }

    const validate = () => {
        const newErrors = {};

        if (!amount || Number(amount) < 10) {
            newErrors.amount = "Amount must be at least $10.";
        } else if (Number(amount) > residualIncome) {
            newErrors.amount = "Amount cannot exceed available residual income.";
        }

        if (!method) {
            newErrors.method = "Withdrawal method is required.";
        }

        if (method === "CashApp" && !cashAppInfo.trim()) {
            newErrors.cashAppInfo = "CashApp information is required.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitLoading(true)

        axios.post(`/api/users/${UserState.value.data?.id}/withdraw`, {
            requested_amount: Number(amount),
            method,
            note,
            cash_app_info: cashAppInfo
        }).then(async () => {
            toast({ title: 'Request submitted', status: "success", duration: 3000 });
            await fetchData(UserState.value.data?.id)
            addDoc(collection(db, "notifications"), {
                to: "admin@gmail.com",
                title: "Withdrawal request",
                message: `Got a new withdrawal request of ${Number(amount)}`,
                timestamp: moment().valueOf(),
                status: "pending",
            });

            setUser({ ...UserState.value.data, residual_income: Number(UserState.value.data?.residual_income || 0) - Number(amount) })

            onClose()
            setAmount("");
            setMethod("");
            setNote("");

        }).catch((e) => {
            toast({ title: e?.response?.data?.message || "Error saving data", status: "error", duration: 3000 });
        }).finally(() => {
            setSubmitLoading(false)
        })




    };

    const RenderTableData = useCallback(() => {
        return (
            <Box w={"100%"}>
                <TableData
                    loading={loading}
                    data={data.map((item) => {
                        return {
                            ...item,
                            created_at: moment(item.created_at).format(("DD/MM/YYYY"))
                        };
                    })}
                    columns={[
                        { key: "requested_amount", value: "Amount" },
                        { key: "method", value: "Method" },
                        { key: "status", value: "Status" },
                        { key: "admin_note", value: "Note" },
                        { key: "created_at", value: "Requested date" }
                    ]}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
            </Box>
        );
    }, [data, currentPage, loading]);

    return (
        <Box p={8} bg="white">
            <Heading mb={6} color="purple.700">
                Withdrawal requests
            </Heading>

            <HStack >
                <Spacer />
                <Button colorScheme="purple" onClick={onOpen}>
                    New request
                </Button>
            </HStack>

            <RenderTableData />




            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader> Withdraw Funds</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text mb={2}>
                            Available Residual Income:{" "}
                            <strong>${residualIncome}</strong>
                        </Text>

                        <form onSubmit={handleSubmit}>
                            <FormControl mb={4} isRequired>
                                <FormLabel>Amount ($)</FormLabel>
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter withdrawal amount"
                                    min={10}
                                    max={residualIncome}
                                />
                                {errors.amount && <FormErrorMessage>{errors.amount}</FormErrorMessage>}
                            </FormControl>

                            <FormControl mb={4} isRequired>
                                <FormLabel>Method</FormLabel>
                                <Select
                                    placeholder="Select method"
                                    value={method}
                                    onChange={(e) => setMethod(e.target.value)}
                                >
                                    <option value="CashApp">CashApp</option>
                                    <option value="Bank">Bank</option>
                                    <option value="Other">Other</option>
                                </Select>
                                {errors.method && <FormErrorMessage>{errors.method}</FormErrorMessage>}
                            </FormControl>

                            {method === 'CashApp' &&
                                <FormControl mb={4} isRequired>
                                    <FormLabel>CashApp Information</FormLabel>
                                    <Textarea
                                        value={cashAppInfo}
                                        onChange={(e) => setCashAppInfo(e.target.value)}
                                        placeholder="Enter Cash App details"
                                    />
                                    {errors.cashAppInfo && (
                                        <FormErrorMessage>{errors.cashAppInfo}</FormErrorMessage>
                                    )}
                                </FormControl>}

                            <FormControl mb={4}>
                                <FormLabel>Note / Details</FormLabel>
                                <Textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Enter account details or extra info"
                                />
                            </FormControl>

                            <Button
                                mb={2}
                                isLoading={submitLoading}
                                type="submit"
                                colorScheme="purple"
                                width="full"

                            >
                                Submit Request
                            </Button>
                        </form>

                    </ModalBody>

                </ModalContent>
            </Modal>

        </Box>
    );
}
