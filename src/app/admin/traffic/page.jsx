"use client";
import TableData from "@/components/ui/TableData";
import { UserContext } from "@/store/context/UserContext";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Heading,
  Box,
  Center,
  Spinner,
} from "@chakra-ui/react";
import axios from "axios";
import moment from "moment";
import { useContext, useEffect, useState } from "react";

export default function TrafficDashboard() {
  const [trafficData, setTrafficData] = useState([]);
  const { state: UserState } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (UserState.value.data?.id) fetchData();
  }, [UserState]);

  async function fetchData() {
    axios
      .get("/api/track")
      .then((response) => {
        if (response.data.length > 0) {
          const tempData = response.data.map((item, index) => {
            return {
              ...item,
              id: index,
              last_visited: moment(item.last_visited).format(
                "MM/DD/YYYY hh:mm A"
              ),
            };
          });
          setTrafficData([...tempData]);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const LoadingIndicator = () => (
    <Center height={"100vh"}>
      <Spinner color="purple.700" />
    </Center>
  );

  return loading ? (
    <LoadingIndicator />
  ) : (
    <Box p={8} bg="white">
      <Heading mb={6} color="purple.700">
        Website Traffic
      </Heading>

      {/* Traffic Data Table */}
      <TableData
        data={trafficData}
        columns={[
          { key: "page", value: "Page" },
          { key: "visits", value: "Visits" },
          { key: "last_visited", value: "Last Visited" },
        ]}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </Box>
  );
}
