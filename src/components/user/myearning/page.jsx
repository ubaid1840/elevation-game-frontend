"use client";
import TableData from "@/components/ui/TableData";
import { UserContext } from "@/store/context/UserContext";
import {
  Box,
  Button,
  Divider,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  VStack
} from "@chakra-ui/react";
import axios from "axios";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { CSVLink } from "react-csv";

export default function Page() { 
  const { state: UserState } = useContext(UserContext);
  const [csvData, setCsvData] = useState([]);
  const [winnings, setWinnings] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData(UserState.value.data.id);
    }
  }, [UserState.value.data]);

  async function fetchData(id) {
    axios.get(`/api/users/${id}/earning`).then((response) => {

    
      const tempData = response.data.map((item)=>{
            return {
          id : item.id,
          amount: item.transaction_type?.includes("entry") ?  -Math.abs(item.amount) : Math.abs(item.amount),
          transaction_type: item.transaction_type,
          refer_to : item.referral_user?.name || "N/A",
          created_at: moment(new Date(item.created_at)).format("DD/MM/YYYY"),
        };
      })
      setTableData([...tempData])

      const transactions = response.data;
      const winnings = [];
      const earnings = [];
      let totalWinnings = 0;
      let totalEarnings = 0;

      transactions.forEach((transaction) => {
        if (transaction.transaction_type.includes('winning')) {
          winnings.push(transaction);
          totalWinnings += Number(transaction.amount);
        } else if (transaction.transaction_type.includes("referral")) {
          earnings.push(transaction);
          totalEarnings += Number(transaction.amount);
        }
      });

      setWinnings(totalWinnings.toFixed(2));
      setEarnings(totalEarnings.toFixed(2));
      const csvFormattedData = [
        ["Amount", "Reason","Refer to" ,"Date"],
        ...tempData.map((tx) => [
          tx.amount,
          tx.transaction_type,
          tx.refer_to,
          tx.created_at
        ]),
      ];

      setCsvData(csvFormattedData);
    });
  }

  const RenderTableData = useCallback(() => {
   
    return (
      <Box w={"100%"}>
        <TableData
          data={tableData}
          columns={[
            { key: "amount", value: "Amount ($)" },
            { key: "transaction_type", value: "Reason" },
            { key: "refer_to", value: "Refer to" },
            { key: "created_at", value: "Date" },
          ]}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </Box>
    );
  }, [tableData, currentPage]);

  return (
    <Box p={8}>
      <VStack spacing={6} align="start">
        {/* Earnings Header */}
        <Heading size="lg" color="purple.700">
          My Earnings
        </Heading>
        <Divider borderColor="purple.400" />

         {UserState.value.data?.package === "Platinum" ? (
                  <Text fontSize="md">
                    You can earn <strong>20%, 10% and 5%</strong> from unique referral
                    numbers. Additionally, you can earn at least <strong>3%</strong> and up to <strong>60%</strong> or more of the Trivia game fee based on referral performance and network activity.
                  </Text>
                ) : UserState.value.data?.package === "Gold" ? (
                  <Text fontSize="md">
                    You can earn <strong>10%, 5% and 2.5%</strong> from unique referral
                    numbers. Additionally, you can earn at least <strong>3%</strong> and up to <strong>60%</strong> or more of the Trivia game fee based on referral performance and network activity.
                  </Text>
                ) : UserState.value.data?.package === "Iridium" ? (
                  <Text fontSize="md">
                    You can earn <strong>5%, 2.5% and 1.25%</strong> from unique
                    referral numbers. Additionally, you can earn at least <strong>3%</strong> and up to <strong>60%</strong> or more of the Trivia game fee based on referral performance and network activity.
                  </Text>
                ) : null}

        

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
        <RenderTableData />
      </VStack>
    </Box>
  );
}
