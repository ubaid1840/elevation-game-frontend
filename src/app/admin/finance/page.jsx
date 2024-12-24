"use client";
import React, { useCallback, useEffect, useState } from "react";
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
  Input,
} from "@chakra-ui/react";
import { CSVLink } from "react-csv";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import axios from "axios";
import TableData from "@/components/ui/TableData";

const FinancialOverview = () => {
  const [payments, setPayments] = useState([]);
  const [emailContent, setEmailContent] = useState("");
  const toast = useToast();
  const [notificationType, setNotificationType] = useState("email");
  const [filter, setFilter] = useState("");

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

  async function handleSendNotifications(msg) {
    axios
      .post("/api/notification", {
        msg: msg,
        type: notificationType,
      })  
      .then(() => {
        toast({
          title: "Notifications Sent",
          description: "Notifications sent to participants.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      });
  }

  const filteredUsers = payments.filter((payment) => {
    const matchesName = payment.name
      .toLowerCase()
      .includes(filter.toLowerCase());
    return matchesName;
  });

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const RenderTable = useCallback(() => {
    return (
      <TableData
        data={filteredUsers.map((item) => {
          return {
            id: item.id,
            name: item.name,
            amount:
              Number(item.tier1) + Number(item.tier2) + Number(item.tier3),
          };
        })}
        columns={[
          { key: "name", value: "Name" },
          { key: "amount", value: "Amount ($)" },
        ]}
      />
    );
  }, [filteredUsers]);

  return (
    <Sidebar LinkItems={GetLinkItems("admin")}>
      <Box p={8} bg="white">
        <Heading mb={6} color="purple.700">
          Financial Overview
        </Heading>

        <Input
            placeholder="Search by name"
            value={filter}
            onChange={handleFilterChange}
          />

        {/* Payments Table */}
        <RenderTable />

        {/* Export Reports */}
        {payments.length > 0 && (
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
            <Button colorScheme="purple" my={4}>
              Export Financial Data
            </Button>
          </CSVLink>
        )}

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
        <Select
          value={notificationType}
          onChange={(e) => setNotificationType(e.target.value)}
          placeholder="Select Notification Type"
          mb={4}
        >
          <option value="email">Email</option>
          <option value="sms">SMS</option>
        </Select>
        <Button
          isDisabled={!emailContent || !notificationType}
          colorScheme="green"
          onClick={() => {
            toast({
              title: "Sending",
              description: "Notifications in progress...",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            const msg = emailContent;
            handleSendNotifications(msg);
            setEmailContent("");
          }}
        >
          Send Notifications
        </Button>
      </Box>
    </Sidebar>
  );
};

export default FinancialOverview;
