"use client";
import React, { useContext, useEffect, useState } from "react";
import { Box, Center, Heading, useColorModeValue } from "@chakra-ui/react";
import Tree from "react-d3-tree";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import { UserContext } from "@/store/context/UserContext";
import axios from "axios";

export default function Page() {
  const { state: UserState } = useContext(UserContext);
  const [teamMembersData, setTeamMembersData] = useState({});

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData(UserState.value.data?.id);
    }
  }, [UserState.value.data]);

  async function fetchData(id) {
    axios.get(`/api/users/${id}/network`).then((response) => {
      setTeamMembersData(response.data);
    });
  }

  return (
    <Sidebar LinkItems={GetLinkItems("user")}>
      <Box p={8} bg={useColorModeValue("white", "gray.800")}>
        <Heading mb={6} color="purple.700">
          Your Team Members
        </Heading>
        {teamMembersData && (
          <Center w={"100%"}>
            <Box height="600px" id="tree-wrapper">
              <Tree
                orientation="vertical"
                data={teamMembersData}
                translate={{ x: 100, y: 50 }}
                pathFunc="diagonal"
              />
            </Box>
          </Center>
        )}
      </Box>
    </Sidebar>
  );
}
