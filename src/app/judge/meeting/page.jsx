"use client";
import dynamic from "next/dynamic";
const MeetingComponent = dynamic(() => import("@/components/Meeting"), {
  ssr: false,
});

export default function Page() {
  return <MeetingComponent page={"judge"}/>;
}
