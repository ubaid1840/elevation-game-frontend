"use client";
import React, { useState } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Stack,
  Textarea,
  Select,
  useToast,
} from "@chakra-ui/react";
import { CSVLink } from "react-csv";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";

const FinancialOverview = () => {
  const [payments, setPayments] = useState([
    { id: 1, participant: "Participant 1", amount: 100, date: "2024-01-01" },
    { id: 2, participant: "Participant 2", amount: 150, date: "2024-01-02" },
  ]);
  const [emailContent, setEmailContent] = useState("");
  const toast = useToast();

  const handleSendNotifications = () => {
    // Logic for sending notifications (e.g., API call)
    toast({
      title: "Notifications Sent",
      description: "Bulk email and text notifications sent to participants.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const financialData = payments.map(({ participant, amount, date }) => ({
    Participant: participant,
    Amount: amount,
    Date: date,
  }));

  return (
    <Sidebar LinkItems={GetLinkItems("admin")}>
      <Box p={8}  bg="white">
      <Heading mb={6} color="purple.700">Financial Overview</Heading>

      {/* Payments Table */}
      <Table variant="simple" mb={8}>
        <Thead>
          <Tr>
            <Th>Participant</Th>
            <Th>Amount ($)</Th>
            <Th>Date</Th>
          </Tr>
        </Thead>
        <Tbody>
          {payments.length > 0 ? (
            payments.map((payment) => (
              <Tr key={payment.id}>
                <Td>{payment.participant}</Td>
                <Td>{payment.amount}</Td>
                <Td>{payment.date}</Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={3} textAlign="center">
                No payments found.
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>

      {/* Export Reports */}
      <CSVLink
        data={financialData}
        filename={"financial-overview.csv"}
        className="btn btn-primary"
        target="_blank"
      >
        <Button colorScheme="purple" mb={4}>
          Export Financial Data
        </Button>
      </CSVLink>

      {/* Email Notifications */}
      <Heading size="md" mb={4}>Send Notifications</Heading>
      <Textarea
        placeholder="Type your message here..."
        value={emailContent}
        onChange={(e) => setEmailContent(e.target.value)}
        mb={4}
      />
      <Select placeholder="Select Notification Type" mb={4}>
        <option value="email">Email</option>
        <option value="sms">SMS</option>
      </Select>
      <Button colorScheme="green" onClick={handleSendNotifications}>
        Send Notifications
      </Button>
    </Box>
    </Sidebar>
  );
};

export default FinancialOverview;
