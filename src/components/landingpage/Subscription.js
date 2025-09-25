"use client";
import { UserContext } from "@/store/context/UserContext";
import {
    Box,
    Button,
    Flex,
    Heading,
    ListItem,
    Radio,
    RadioGroup,
    Stack,
    Text,
    Tooltip,
    UnorderedList,
    useToast
} from "@chakra-ui/react";
import axios from "axios";
import moment from "moment";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import SquareCheckout from "../square/checkout";

export default function SubscriptionPage({ page }) {
    const [selectedPlan, setSelectedPlan] = useState("");
    const [amount, setAmount] = useState(0);
    const { state: UserState } = useContext(UserContext);
    const [subscriptionOptions, setSubscriptionOptions] = useState([]);
    const [currentPlan, setCurrentPlan] = useState("");
    const [annualFee, setAnnualFee] = useState(0)
    const [judgePromoteLoading, setJudgePromoteLoading] = useState(false)
    const toast = useToast()

    useEffect(() => {

        if (UserState.value.data?.email) {
            setCurrentPlan(UserState.value.data.package || "No current plan")
            fetchData();
        }
    }, [UserState.value.data]);

    async function fetchData() {
        axios.get("/api/settings")
            .then((response) => {
                const temp = [...response.data]
                temp.sort((a, b) => a.price - b.price)
                setSubscriptionOptions([...temp]);
            });
    }

    const handlePlanChange = (value) => {
        if (annualFee !== 0) {
            setAnnualFee(0)
        }
        setSelectedPlan(value);
        const temp = subscriptionOptions.filter((item) => item.label === value);
        setAmount(temp[0].price);
    };

    async function handlePromoteToJudge() {
        setJudgePromoteLoading(true)
        setSelectedPlan("")
        axios.get(`/api/users/${UserState.value.data?.id}/promote`).then((response) => {
            if (response.data.error) {
                toast({
                    duration: 3000,
                    isClosable: true,
                    title: "Error",
                    description: response.data.error,
                    status: "error"
                })
            } else {
                setAnnualFee(750)
            }
        }).finally(() => {
            setJudgePromoteLoading(false)
        })
    }

    return (
        <>
            <Box p={8} bg="white">
                <Heading mb={2} color="purple.700">
                    Current Plan: <Text as="span" color="green.500">{currentPlan}</Text>
                </Heading>



                {currentPlan &&
                    <Text fontSize={'lg'} color="purple.700">
                        Expiry: <Text as="span" color={UserState.value.data?.monthlySubscriptionStatus ? "green.500" : "red.500"}>{UserState.value.data && UserState.value.data?.package_expiry ? moment(UserState.value.data.package_expiry).format("MMM DD, yyyy") : "Expired"}</Text>
                    </Text>
                }

                {page == 'judge' ?
                    UserState.value.data && UserState.value.data?.annualSubscriptionStatus ?
                        <Text fontSize={'lg'} color="purple.700">
                            Annual Judge payment expiry: {UserState.value.data?.annual_package_expiry && <Text as="span" color="green.500">{moment(UserState.value.data?.annual_package_expiry).format("MMM DD, yyyy")}</Text>}
                        </Text>
                        :
                        <Flex align={'center'}>
                            <Text fontSize={'lg'} color="purple.700">
                                Annual Judge payment expiry: {UserState.value.data?.annual_package_expiry && <Text as="span" color="red.500">{moment(UserState.value.data?.annual_package_expiry).format("MMM DD, yyyy")}</Text>}
                            </Text>
                            <Button as={Link} href={'/judgepayment'} ml={4} colorScheme="purple">Renew annual subscription</Button>
                        </Flex>
                    : null}

                {subscriptionOptions.length > 0 && page == 'user' &&
                    <Tooltip fontSize={'md'} hasArrow label={
                        <Box p={2}>
                            <UnorderedList>
                                <ListItem>Must have  Platinum subscription</ListItem>
                                <ListItem>Must have 50 referrals with Platinum subscription</ListItem>
                                <ListItem>Pay an annual fee of $750</ListItem>
                            </UnorderedList>
                        </Box>
                    } >
                        <Button isLoading={judgePromoteLoading} isDisabled={judgePromoteLoading} my={6} colorScheme="purple" onClick={() => handlePromoteToJudge()}>Become a Judge</Button>
                    </Tooltip>
                }

                <Heading mb={6} color="purple.700">
                    Choose Your Subscription Plan
                </Heading>

                <RadioGroup onChange={handlePlanChange} value={selectedPlan} mb={6}>
                    <Stack spacing={4}>
                        {subscriptionOptions.length > 0 && subscriptionOptions.map((option) => (

                            <Radio key={option.id} value={option.label}>
                                {option.label} - ${option.price}
                            </Radio>
                        ))}
                    </Stack>
                </RadioGroup>


                {annualFee !== 0
                    ?
                    <Box maxW={'500px'}>
                        {annualFee !== 0 && UserState.value.data?.email && (

                            <SquareCheckout amount={annualFee} plan={"Promotion"}
                                user={UserState.value.data} />

                        )}
                    </Box>
                    :
                    <Box maxW={'500px'}>
                        {amount !== 0 && UserState.value.data?.email && selectedPlan && (
                            <SquareCheckout amount={amount} plan={selectedPlan} user={UserState.value.data} />
                        )}
                    </Box>
                }
            </Box>
        </>
    );
}
