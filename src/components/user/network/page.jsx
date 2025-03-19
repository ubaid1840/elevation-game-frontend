"use client";
import React, { useContext, useEffect, useState } from "react";
import { Box, Center, Heading, useColorModeValue } from "@chakra-ui/react";
import Tree from "react-d3-tree";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import { UserContext } from "@/store/context/UserContext";
import axios from "axios";
import getDisplayPicture from "@/lib/getDisplayPicture";

export default function NetworkPage() {
  const { state: UserState } = useContext(UserContext);
  const [teamMembersData, setTeamMembersData] = useState({});

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData(UserState.value.data?.id);
    }
  }, [UserState.value.data]);

  async function fetchData(id) {
    axios.get(`/api/users/${id}/network`).then((response) => {
      console.log(response.data);
      setTeamMembersData(response.data);
    });
  }

  const RenderRectSvgNode = ({ nodeDatum, toggleNode }) => {
    const [image, setImage] = useState(null);

    useEffect(() => {
      if (nodeDatum?.attributes?.email) {
        getDisplayPicture(nodeDatum?.attributes?.email).then((url) => {
          setImage(url);
        });
      }
    }, []);

    return (
      <g onClick={toggleNode} cursor="pointer">
        {/* Render profile picture */}
        {image ? (
          <image
            href={image}
            x="-20"
            y="-20"
            width="40"
            height="40"
            clipPath="circle(50%)"
          />
        ) : (
          <circle cx="0" cy="0" r="15" fill="gray" />
        )}

        {/* Node text */}
        <text fill="black" strokeWidth="1" x="30">
          {nodeDatum.name}
        </text>

        <text fill="gray" x="30" dy="20" strokeWidth="0.5">
          Referrals: {nodeDatum.attributes?.referrals}
        </text>
      </g>
    );
  };

  return (
    <>
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
                renderCustomNodeElement={(props) => (
                  <RenderRectSvgNode {...props} />
                )}
              />
            </Box>
          </Center>
        )}
      </Box>
    </>
  );
}
