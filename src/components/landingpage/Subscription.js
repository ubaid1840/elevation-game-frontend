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
} from "@chakra-ui/react";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutPage from "../stripe/Checkout";
import convertToSubcurrency from "@/lib/ConvertToSubcurrency";
import { UserContext } from "@/store/context/UserContext";
import axios from "axios";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function SubscriptionPage({page}) {
    const [selectedPlan, setSelectedPlan] = useState("");
    const [amount, setAmount] = useState(null);
    const { state: UserState } = useContext(UserContext);
    const [subscriptionOptions, setSubscriptionOptions] = useState([]);
    const [currentPlan, setCurrentPlan] = useState("");

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
                temp.sort((a,b)=> a.price - b.price)
                setSubscriptionOptions([...temp]);
            });
    }

    const handlePlanChange = (value) => {
        setSelectedPlan(value);
        const temp = subscriptionOptions.filter((item) => item.label === value);
        setAmount(temp[0].price);
    };

    return (
        <Sidebar LinkItems={GetLinkItems(page)}>
            <Box p={8} bg="white">
                <Heading mb={6} color="purple.700">
                    Current Plan: <Text as="span" color="green.500">{currentPlan}</Text>
                </Heading>

                <Heading mb={6} color="purple.700">
                    Choose Your Subscription Plan
                </Heading>

                <RadioGroup onChange={handlePlanChange} value={selectedPlan} mb={6}>
                    <Stack spacing={4}>
                        {subscriptionOptions.length > 0 && subscriptionOptions.map((option) => (
                            <Radio key={option.id} value={option.label}>
                                {option.label} - ${option.price} / month
                            </Radio>
                        ))}
                    </Stack>
                </RadioGroup>

                <Box maxW={'500px'}>
                    {amount && UserState.value.data?.email && selectedPlan && (
                        <Elements stripe={stripePromise} options={{
                            mode: "payment",
                            amount: convertToSubcurrency(amount),
                            currency: "usd"
                        }}>
                            <CheckoutPage amount={amount} userID={UserState.value.data.id} plan={selectedPlan} />
                        </Elements>
                    )}
                </Box>
            </Box>
        </Sidebar>
    );
}
