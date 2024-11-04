"use client";
import React, { useEffect, useState } from "react";
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
import axios from "axios";

const FinancialOverview = () => {
  const [payments, setPayments] = useState([]);
  const [emailContent, setEmailContent] = useState("");
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    axios.get("/api/finance").then((response) => {
      if (response.data.length > 0) {
        const temp = response.data.filter((item) => item.role !== "admin");

        setPayments([...temp]);
      }
    });
  }

  const handleSendNotifications = () => {
    toast({
      title: "Notifications Sent",
      description: "Bulk email and text notifications sent to participants.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Sidebar LinkItems={GetLinkItems("admin")}>
      <Box p={8} bg="white">
        <Heading mb={6} color="purple.700">
          Financial Overview
        </Heading>

        {/* Payments Table */}
        <Table variant="simple" mb={8}>
          <Thead>
            <Tr>
              <Th>Participant</Th>
              <Th>Amount ($)</Th>
              {/* <Th>Date</Th> */}
            </Tr>
          </Thead>
          <Tbody>
            {payments.length > 0 ? (
              payments.map((payment) => (
                <Tr key={payment.id}>
                  <Td>{payment.name}</Td>
                  <Td>
                    {Number(payment.tier1) +
                      Number(payment.tier2) +
                      Number(payment.tier3)}
                  </Td>
                  {/* <Td>{payment.date}</Td> */}
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
        href="#"
          data={payments.map(({ name, tier1, tier2, tier3 }) => ({
            Participant: name,
            Amount: Number(tier1) + Number(tier2) + Number(tier3),
          }))}
          filename={"financial-overview.csv"}
          className="btn btn-primary"
          target="_blank"
        >
          <Button colorScheme="purple" mb={4}>
            Export Financial Data
          </Button>
        </CSVLink>

        {/* Email Notifications */}
        <Heading size="md" mb={4}>
          Send Notifications
        </Heading>
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
