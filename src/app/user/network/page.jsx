"use client";
import React from "react";
import { Box, Heading, useColorModeValue } from "@chakra-ui/react";
import Tree from "react-d3-tree";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";


const teamMembersData = {
    name: "You (Participant A)",
    children: [
      {
        name: "Participant B",
        attributes: {
          referrals: 2, 
        },
        children: [
          {
            name: "Participant D",
            attributes: {
              referrals: 1, 
            },
            children: [],
          },
        ],
      },
      {
        name: "Participant C",
        attributes: {
          referrals: 3, 
        },
        children: [
          {
            name: "Participant E",
            attributes: {
              referrals: 0, 
            },
            children: [],
          },
          {
            name: "Participant F",
            attributes: {
              referrals: 2, 
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
        <Box height="600px"> 
            <div id="tree-wrapper" style={{ width: '100%', height: '100%' }}>
          <Tree 
          orientation="vertical"
            data={teamMembersData} 
            onNodeClick={handleNodeClick}
            translate={{ x: 100, y: 50 }}
            pathFunc="diagonal"
          />
          </div>
        </Box>
      </Box>
    </Sidebar>
  );
}
