"use client";
import { UserContext } from "@/store/context/UserContext";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import {
  Box,
  Heading,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr
} from "@chakra-ui/react";
import axios from "axios";
import {
  useContext,
  useEffect,
  useRef,
  useState
} from "react";

export default function ReportPage() {
  const chartRef = useRef(null);
  const { state: UserState } = useContext(UserContext);
  const [data, setData] = useState();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData(UserState.value.data?.id);
    }
  }, [UserState.value.data]);

  async function fetchData(id) {
    axios.get(`/api/users/${id}/report`).then((response) => {
      setData(response.data);
      if (response.data.earnings) {
        setChartData([
          {
            category: "Tier 1",
            value: Number(response.data?.earnings?.tier1 || 0),
          },
          {
            category: "Tier 2",
            value: Number(response.data?.earnings?.tier2 || 0),
          },
          {
            category: "Tier 3",
            value: Number(response.data?.earnings?.tier3 || 0),
          },
        ]);
      }
    });
  }

  useEffect(() => {
    const root = am5.Root.new(chartRef.current);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelY: "zoom",
      })
    );

    
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: am5xy.AxisRendererX.new(root, {}),
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Earnings",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        categoryXField: "category",
      })
    );

    
    
    
    
    series.data.setAll(chartData);
    xAxis.data.setAll(chartData);

    
    return () => {
      root.dispose();
    };
  }, [chartData]);

  const csvData = [
    ["Category", "Value"],
    ["Tier 1", 200],
    ["Tier 2", 150],
    ["Tier 3", 100],
  ];

  return (
    <>
      <Box p={8} bg="white">
        <Heading mb={6} color="purple.700">
          Reports and Analytics
        </Heading>

        {/* Residual Incentive Income Breakdown Section */}
        <Box mb={8}>
          <Heading size="md" mb={4}>
            Residual Incentive Income Breakdown
          </Heading>
          <Text mb={2}>
            {
              "Systematic calculation of payout amounts for each participant based on their network's performance."
            }
          </Text>
          <Text mb={2}>
            {"Breakdown by tier, game, and referral activity."}
          </Text>
        </Box>

        {/* Team Members Report Section */}
        <Box mb={8}>
          <Heading size="md" mb={4}>
            Team Members Report
          </Heading>
          <Text mb={2}>
            {
              "Overview of participants' team structures, including active members, their progress, and earnings."
            }
          </Text>
          <Table variant="striped" colorScheme="gray">
            <Thead>
              <Tr>
                <Th>Member Name</Th>
                <Th>Plan</Th>
                <Th>Earned</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data?.referrals &&
                data.referrals.map((item, index) => (
                  <Tr key={index}>
                    <Td>{item.name}</Td>
                    <Td>{item.package}</Td>
                    <Td>${item.earning}</Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </Box>

        {/* Winner Status Board Section */}
        <Box mb={8}>
          <Heading size="md" mb={4}>
            Winner Status Board
          </Heading>
          <Text mb={2}>
            Real-time leaderboard displaying the current standings of
            participants and previous winners.
          </Text>
          <Table variant="striped" colorScheme="gray">
            <Thead>
              <Tr>
                <Th>Rank</Th>
                <Th>Participant</Th>
                <Th>Points</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data?.topTeamMembers &&
                data.topTeamMembers.map((item, index) => (
                  <Tr key={index}>
                    <Td>{index + 1}</Td>
                    <Td>{item.name}</Td>
                    <Td>{item.score}</Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </Box>

        {/* Other Reports Section */}
        <Box mb={8}>
          <Heading size="md" mb={4}>
            Other Reports
          </Heading>
          <Text mb={2}>
            Customizable report options for various metrics related to game
            performance, participation rates, and financial summaries.
          </Text>
        </Box>

        {/* Integration with Charts */}
        <Box ref={chartRef} style={{ width: "100%", height: "500px" }} mb={8} />

        {/* Export Functionality */}
        {/* <CSVLink
          data={csvData}
          filename="earnings_report.csv"
          style={{
            textDecoration: "none",
          }}
        >
          <Button colorScheme="purple" size="lg">
            Export Reports (CSV)
          </Button>
        </CSVLink> */}
      </Box>
    </>
  );
}
