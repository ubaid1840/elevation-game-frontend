"use client";
import React, { useContext, useEffect, useState } from "react";
import {
    Box,
    Heading,
    Text,
    Button,
    Stack,
    Radio,
    RadioGroup,
    FormControl,
    FormLabel,
    Input,
    FormHelperText,
    Tooltip,
    UnorderedList,
    ListItem,
    useToast,
} from "@chakra-ui/react";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutPage from "../stripe/Checkout";
import convertToSubcurrency from "@/lib/ConvertToSubcurrency";
import { UserContext } from "@/store/context/UserContext";
import axios from "axios";
import moment from "moment";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function SubscriptionPage({ page }) {
    const [selectedPlan, setSelectedPlan] = useState("");
    const [amount, setAmount] = useState(0);
    const { state: UserState } = useContext(UserContext);
    const [subscriptionOptions, setSubscriptionOptions] = useState([]);
    const [currentPlan, setCurrentPlan] = useState("");
    const [annualFee, setAnnualFee] = useState(0)
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
        setSelectedPlan("")
        axios.get(`/api/users/${UserState.value.data.id}/promote`).then((response) => {
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
        })
    }

    return (
        <Sidebar LinkItems={GetLinkItems(page)}>
            <Box p={8} bg="white">
                <Heading mb={2} color="purple.700">
                    Current Plan: <Text as="span" color="green.500">{currentPlan}</Text>
                </Heading>

                {currentPlan &&
                    <Text fontSize={'lg'} color="purple.700">
                        Expiry: <Text as="span" color="green.500">{moment(UserState.value.data.package_expiry).format("MMM DD, yyyy")}</Text>
                    </Text>
                }

                {subscriptionOptions.length > 0 && page == 'user' &&
                    <Tooltip fontSize={'md'} hasArrow label={
                        <Box p={2}>
                            <UnorderedList>
                                <ListItem>Must have 50 referrals with Platinum subscription</ListItem>
                                <ListItem>Pay an annual fee of $750</ListItem>
                            </UnorderedList>
                        </Box>
                    } >
                        <Button my={6} colorScheme="purple" onClick={() => handlePromoteToJudge()}>Become a Judge</Button>
                    </Tooltip>
                }

                <Heading mb={6} color="purple.700">
                    Choose Your Subscription Plan
                </Heading>

                <RadioGroup onChange={handlePlanChange} value={selectedPlan} mb={6}>
                    <Stack spacing={4}>
                        {subscriptionOptions.length > 0 && subscriptionOptions.map((option) => (
                            // option.label !== "Silver" &&
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
                            <Elements stripe={stripePromise} options={{
                                mode: "payment",
                                amount: convertToSubcurrency(annualFee),
                                currency: "usd"
                            }}>
                                <CheckoutPage amount={annualFee} userID={UserState.value.data.id} plan={"Promotion"} />
                            </Elements>
                        )}
                    </Box>
                    :
                    <Box maxW={'500px'}>
                        {amount !== 0 && UserState.value.data?.email && selectedPlan && (
                            <Elements stripe={stripePromise} options={{
                                mode: "payment",
                                amount: convertToSubcurrency(amount),
                                currency: "usd"
                            }}>
                                <CheckoutPage amount={amount} userID={UserState.value.data.id} plan={selectedPlan} />
                            </Elements>
                        )}
                    </Box>
                }
            </Box>
        </Sidebar>
    );
}
