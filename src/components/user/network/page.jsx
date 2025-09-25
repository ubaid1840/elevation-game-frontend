"use client";
import getDisplayPicture from "@/lib/getDisplayPicture";
import { UserContext } from "@/store/context/UserContext";
import { Box, Center, Heading, Spinner, useColorModeValue } from "@chakra-ui/react";
import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import Tree from "react-d3-tree";

export default function NetworkPage() {
  const { state: UserState } = useContext(UserContext);
  const [treeData, setTreeData] = useState(null);
  const treeContainerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 }); // fallback
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchRoot(UserState.value.data?.id);
    }
  }, [UserState.value.data]);

  async function fetchRoot(id) {
    setLoading(true);
    try {
      const res = await axios.get(`/api/users/${id}/network`);
      setTreeData(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function fetchChildren(nodeId) {
    const res = await axios.get(`/api/users/${nodeId}/network?children=true`);
    return res.data;
  }

  // ResizeObserver hook
  useEffect(() => {
    if (!treeContainerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });

    observer.observe(treeContainerRef.current);

    return () => observer.disconnect();
  }, []);

  // Recalculate once treeData is loaded
  useEffect(() => {
    if (treeData && treeContainerRef.current) {
      const { offsetWidth, offsetHeight } = treeContainerRef.current;
      if (offsetWidth > 0 && offsetHeight > 0) {
        setDimensions({ width: offsetWidth, height: offsetHeight });
      }
    }
  }, [treeData]);

  const RenderRectSvgNode = ({ nodeDatum, toggleNode }) => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (nodeDatum?.attributes?.email) {
        getDisplayPicture(nodeDatum?.attributes?.email).then((url) => {
          setImage(url);
        }).catch(()=>{
          console.log("error fetching picture")
        })
      }
    }, [nodeDatum?.attributes?.email]);

    const handleClick = async () => {
      if (nodeDatum.children && nodeDatum.children.length === 0) {
        setLoading(true);
        try {
          const children = await fetchChildren(nodeDatum.id);

          const updateTree = (node, id, newChildren) => {
            if (node.id === id) {
              return { ...node, children: newChildren };
            }
            if (!node.children) return node;

            return {
              ...node,
              children: node.children.map((child) =>
                updateTree(child, id, newChildren)
              ),
            };
          };

          const newTree = updateTree(treeData, nodeDatum.id, children);
          setTreeData(newTree);
        } finally {
          setLoading(false);
        }
      }
      toggleNode();
    };

    return (
      <g onClick={handleClick} cursor="pointer">
        {loading ? (
          <text fill="purple" x="30" dy="40" fontSize="10">
            Loading...
          </text>
        ) : image ? (
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
    <Box p={8} bg={useColorModeValue("white", "gray.800")}>
      <Heading mb={6} color="purple.700">
        Your Team Members
      </Heading>
      {loading ? (
        <Center w={"100%"} h={"100%"}>
          <Spinner />
        </Center>
      ) : (
        treeData && (
          <Center w="100%">
            <Box
              ref={treeContainerRef}
              height="80vh"
              width="100%"
              id="tree-wrapper"
              overflow="hidden"
            >
              {dimensions.width > 0 && dimensions.height > 0 && (
                <Tree
                  orientation="vertical"
                  data={treeData}
                  translate={{
                    x: dimensions.width / 2,
                    y: dimensions.height / 6,
                  }}
                  pathFunc="diagonal"
                  zoomable
                  collapsible
                  renderCustomNodeElement={(props) => (
                    <RenderRectSvgNode {...props} />
                  )}
                />
              )}
            </Box>
          </Center>
        )
      )}
    </Box>
  );
}
