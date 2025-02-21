"use client";
import Sidebar from "@/components/sidebar";
import { UserContext } from "@/store/context/UserContext";
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
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { CSVLink } from "react-csv";

export default function Page() {
  const { state: UserState } = useContext(UserContext);
  const [csvData, setCsvData] = useState([]);
  const [winnings, setWinnings] = useState(0);
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData(UserState.value.data.id);
    }
  }, [UserState.value.data]);

  async function fetchData(id) {
    axios.get(`/api/trivia/users/${id}/earning`).then((response) => {
     
      const transactions = response.data;
      const winnings = [];
      const earnings = [];
      let totalWinnings = 0;
      let totalEarnings = 0;

      transactions.forEach((transaction) => {
        if (transaction.transaction_type === "winning") {
          winnings.push(transaction);
          totalWinnings += Number(transaction.amount); 
        } else if (transaction.transaction_type === "3% earning") {
          earnings.push(transaction);
          totalEarnings += Number(transaction.amount);
        }
      });

      setWinnings(totalWinnings);
      setEarnings(totalEarnings);
       const csvFormattedData = [
        ["Transaction Type", "Amount",],
        ...transactions.map(tx => [
            tx.transaction_type,
            tx.amount,
          
        ]),
        ["", "",],
        ["Total Winnings", totalWinnings],
        ["Total Earnings", totalEarnings]
    ];

    setCsvData(csvFormattedData);

    });
  }



  return (
    <>
      <Box p={8}>
        <VStack spacing={6} align="start">
          {/* Earnings Header */}
          <Heading size="lg" color="purple.700">
            My Earnings
          </Heading>
          <Divider borderColor="purple.400" />

          {/* Overview Section */}
          <Text fontSize="md">
            Participants can earn up to <strong>3%</strong> of Trivia game fee
            based on their unique referral numbers.
          </Text>

          {/* Total Earnings */}
          <Stat>
            <StatLabel fontSize="lg">Total game winnings</StatLabel>
            <StatNumber fontSize="2xl" color="green.500">
              ${winnings}
            </StatNumber>
          </Stat>

          <Stat>
            <StatLabel fontSize="lg">Total game referral earnings</StatLabel>
            <StatNumber fontSize="2xl" color="green.500">
              ${earnings}
            </StatNumber>
          </Stat>

        

         
          {csvData.length > 0 && (
            <CSVLink data={csvData} filename="earnings_report.csv">
              <Button colorScheme="purple">Export Earnings Report (CSV)</Button>
            </CSVLink>
          )}

       
        </VStack>
      </Box>
    </>
  );
}
