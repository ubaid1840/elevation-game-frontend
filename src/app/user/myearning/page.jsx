"use client";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useToast,
  Checkbox,
} from "@chakra-ui/react";
import { useState } from "react";
import { CSVLink } from "react-csv"; // For exporting to CSV

export default function MyEarningsPage() {
  // Dummy data for earnings and tiered income
  const [earnings] = useState({
    totalEarnings: 2000,
    tieredIncome: [
      { tier: "Tier 1", percentage: 20, amount: 400 },
      { tier: "Tier 2", percentage: 10, amount: 200 },
      { tier: "Tier 3", percentage: 5, amount: 100 },
    ],
  });

  const [emailNotifications, setEmailNotifications] = useState(false);
  const toast = useToast();

  const handleToggleEmailNotifications = () => {
    setEmailNotifications(!emailNotifications);
    toast({
      title: "Notification Preference Updated",
      description: emailNotifications
        ? "You will no longer receive email notifications."
        : "You will receive email notifications.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  // CSV data for export
  const csvData = [
    ["Tier", "Percentage", "Amount"],
    ...earnings.tieredIncome.map((income) => [
      income.tier,
      income.percentage + "%",
      `$${income.amount}`,
    ]),
  ];

  return (
    <Sidebar LinkItems={GetLinkItems("user")}>
    <Box p={8} bg="white" borderRadius="lg" boxShadow="xl">
      <VStack spacing={6} align="start">
        {/* Earnings Header */}
        <Heading size="lg" color="purple.700">
          My Earnings
        </Heading>
        <Divider borderColor="purple.400" />

        {/* Overview Section */}
        <Text fontSize="md">
          Participants can earn up to <strong>35%</strong> of any upgrades based on their unique referral numbers.
        </Text>

        {/* Total Earnings */}
        <Stat>
          <StatLabel fontSize="lg">Total Earnings</StatLabel>
          <StatNumber fontSize="2xl" color="green.500">
            ${earnings.totalEarnings}
          </StatNumber>
        </Stat>

        {/* Tiered Income Breakdown */}
        <Heading size="md" color="purple.600">
          Tiered Income Breakdown
        </Heading>
        <SimpleGrid columns={2} spacing={4} width="100%">
          {earnings.tieredIncome.map((income, index) => (
            <Box key={index} p={4} bg="gray.100" borderRadius="lg" boxShadow="md">
              <Text fontSize="lg">{income.tier}</Text>
              <Text fontSize="md" color="gray.600">
                Earn {income.percentage}%: ${income.amount}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        {/* Earnings Dashboard */}
        <Heading size="md" color="purple.600" mt={6}>
          Earnings Dashboard
        </Heading>
        <Text fontSize="md">Visual representation of your participant network will be here.</Text>

        {/* Report Export Feature */}
        <CSVLink data={csvData} filename="earnings_report.csv">
          <Button colorScheme="purple">Export Earnings Report (CSV)</Button>
        </CSVLink>

        {/* Email Notifications */}
        <HStack spacing={4} mt={4}>
          <Checkbox
            isChecked={emailNotifications}
            onChange={handleToggleEmailNotifications}
          >
            Receive email notifications for earnings updates and new referrals
          </Checkbox>
        </HStack>
      </VStack>
    </Box>
    </Sidebar>
  );
}
