"use client";
import React, { useEffect, useRef } from "react";
import {
  Box,
  Heading,
  Stack,
  Text,
  Button,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import { CSVLink } from "react-csv"; // Import CSVLink from react-csv
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";

export default function Page() {
  const chartRef = useRef(null);

  useEffect(() => {
    const root = am5.Root.new(chartRef.current);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelY: "zoom",
      })
    );

    // Create axes
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

    // Create series
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Earnings",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        categoryXField: "category",
      })
    );

    // Sample data for earnings
    const data = [
      { category: "Tier 1", value: 200 },
      { category: "Tier 2", value: 150 },
      { category: "Tier 3", value: 100 },
    ];

    series.data.setAll(data);
    xAxis.data.setAll(data);

    // Clean up chart on unmount
    return () => {
      root.dispose();
    };
  }, []);

  
  const csvData = [
    ["Category", "Value"],
    ["Tier 1", 200],
    ["Tier 2", 150],
    ["Tier 3", 100],
  ];

  return (
    <Sidebar LinkItems={GetLinkItems("user")}>
    <Box p={8}  bg="white">
      <Heading mb={6} color="purple.700">Reports and Analytics</Heading>

      {/* Residual Incentive Income Breakdown Section */}
      <Box mb={8}>
        <Heading size="md" mb={4}>Residual Incentive Income Breakdown</Heading>
        <Text mb={2}>
          {"Systematic calculation of payout amounts for each participant based on their network's performance."}
        </Text>
        <Text mb={2}>{"Breakdown by tier, game, and referral activity."}</Text>
      </Box>

      {/* Team Members Report Section */}
      <Box mb={8}>
        <Heading size="md" mb={4}>Team Members Report</Heading>
        <Text mb={2}>
         {"Overview of participants' team structures, including active members, their progress, and earnings."}
        </Text>
        <Table variant="striped" colorScheme="gray">
          <Thead>
            <Tr>
              <Th>Member Name</Th>
              <Th>Progress</Th>
              <Th>Earned</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>John Doe</Td>
              <Td>75%</Td>
              <Td>$300</Td>
            </Tr>
            <Tr>
              <Td>Jane Smith</Td>
              <Td>50%</Td>
              <Td>$200</Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>

      {/* Winner Status Board Section */}
      <Box mb={8}>
        <Heading size="md" mb={4}>Winner Status Board</Heading>
        <Text mb={2}>Real-time leaderboard displaying the current standings of participants and previous winners.</Text>
        <Table variant="striped" colorScheme="gray">
          <Thead>
            <Tr>
              <Th>Rank</Th>
              <Th>Participant</Th>
              <Th>Points</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>1</Td>
              <Td>John Doe</Td>
              <Td>1200</Td>
            </Tr>
            <Tr>
              <Td>2</Td>
              <Td>Jane Smith</Td>
              <Td>950</Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>

      {/* Other Reports Section */}
      <Box mb={8}>
        <Heading size="md" mb={4}>Other Reports</Heading>
        <Text mb={2}>Customizable report options for various metrics related to game performance, participation rates, and financial summaries.</Text>
      </Box>

      {/* Integration with Charts */}
      <Box ref={chartRef} style={{ width: "100%", height: "500px" }} mb={8} />

      {/* Export Functionality */}
      <CSVLink
        data={csvData}
        filename="earnings_report.csv"
        style={{
          textDecoration: "none",
        }}>
        <Button colorScheme="purple" size="lg">
          Export Reports (CSV)
        </Button>
      </CSVLink>
    </Box>
    </Sidebar>
  );
}
