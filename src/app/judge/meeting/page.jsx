"use client";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import { Button, Center, Flex } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { useState } from "react";
const MeetingComponent = dynamic(() => import("@/components/Meeting"), {
  ssr: false,
});

export default function Page() {
  const [session, setSession] = useState(false);
  return (
    <Sidebar LinkItems={GetLinkItems("judge")}>
      {session ? (
        <MeetingComponent page={"judge"} onEndMeeting={()=> setSession(false)}/>
      ) : (
        <Flex>
          <Center w={"100%"} minH={"100vh"}>
            <Button
              onClick={() => {
                setSession(true);
              }}
              colorScheme="purple"
            >
              Start Session
            </Button>
          </Center>
        </Flex>
      )}
    </Sidebar>
  );
}
