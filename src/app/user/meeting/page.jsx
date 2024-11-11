"use client";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import dynamic from "next/dynamic";
const MeetingComponent = dynamic(() => import("@/components/Meeting"), {
  ssr: false,
});

export default function Page() {
  return (
    <Sidebar LinkItems={GetLinkItems("user")}>
      <MeetingComponent page={"user"} />
    </Sidebar>
  );
}
