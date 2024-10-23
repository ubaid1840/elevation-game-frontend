"use client";
import React from "react";
import { Box, Heading, useColorModeValue } from "@chakra-ui/react";
import Tree from "react-d3-tree";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";

// Sample data for team members
const teamMembersData = {
    name: "You (Participant A)",
    children: [
      {
        name: "Participant B",
        attributes: {
          referrals: 2, // Example value for total referrals
        },
        children: [
          {
            name: "Participant D",
            attributes: {
              referrals: 1, // Example value for total referrals
            },
            children: [],
          },
        ],
      },
      {
        name: "Participant C",
        attributes: {
          referrals: 3, // Example value for total referrals
        },
        children: [
          {
            name: "Participant E",
            attributes: {
              referrals: 0, // Example value for total referrals
            },
            children: [],
          },
          {
            name: "Participant F",
            attributes: {
              referrals: 2, // Example value for total referrals
            },
            children: [],
          },
        ],
      },
    ],
  };
export default function TeamMembersPage() {
  const handleNodeClick = (nodeData) => {
    console.log("Clicked node:", nodeData);
  };

  return (
    <Sidebar LinkItems={GetLinkItems("user")}>
      <Box p={8} bg={useColorModeValue("white", "gray.800")}>
        <Heading mb={6} color="purple.700">Your Team Members</Heading>
        <Box height="600px"> {/* Set height for the tree */}
            <div id="tree-wrapper" style={{ width: '100%', height: '100%' }}>
          <Tree 
          orientation="vertical"
            data={teamMembersData} 
            onNodeClick={handleNodeClick}
            translate={{ x: 100, y: 50 }} // Adjust translation as needed
            pathFunc="diagonal" // Change path function for different styles
          />
          </div>
        </Box>
      </Box>
    </Sidebar>
  );
}
