"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import { usePathname, useRouter } from "next/navigation";
import { UserContext } from "@/store/context/UserContext";
import axios from "axios";

function randomID(len = 5) {
    const chars =
        "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP";
    let result = "";
    for (let i = 0; i < len; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export default function Meeting({ page, onEndMeeting, group }) {
    const callContainerRef = useRef(null);
    const [roomID, setRoomID] = useState(randomID(5));
    const { state: UserState } = useContext(UserContext)
    const router = useRouter()
    const pathname = usePathname()
    let zegoInstance;

    async function handleJoinRoom(room) {
        router.push(`/judge/meeting?roomID=${room}`, undefined, { shallow: true })
        handleShareMeeting(`${pathname}?roomID=${room}`)
    }

    async function handleEndRoom(room) {
        handleEndMeeting()
    }
    async function handleShareMeeting(val) {
        const meeting_link = val.replace("judge", "user")
        group.data.map((eachItem) => {
            axios.put(`/api/booking/${eachItem.id}`, {
                meeting_link: meeting_link,
                status: 'Started'
            })
                .then((response) => {
                    // console.log(response.data)
                })
        })

    }

    async function handleEndMeeting() {
        const localData = group
        localData.data.map((eachItem) => {
            axios.put(`/api/booking/${eachItem.id}`, {
                meeting_link: "",
                status: "Ended"
            })
                .then((response) => {
                    // console.log(response.data)
                })
        })
        onEndMeeting()

    }

    useEffect(() => {
        const search = new URLSearchParams(window.location.search).get("roomID");
        if (search) {
            setRoomID(search);
        }

        const initMeeting = async (fullURL) => {
            const userID = UserState.value.data?.email;
            const userName = UserState.value.data?.email;

            const token = ZegoUIKitPrebuilt.generateKitTokenForTest(
                process.env.NEXT_PUBLIC_ZEGO_APPID,
                process.env.NEXT_PUBLIC_ZEGO_SECRET,
                roomID,
                userID,
                userName
            );

            zegoInstance = ZegoUIKitPrebuilt.create(token);
            const shareUrl = `${fullURL}?roomID=${roomID}`;
            if (page == 'judge') {
                zegoInstance.joinRoom({
                    container: callContainerRef.current,
                    sharedLinks: [
                        {
                            name: "Meeting link",
                            url: shareUrl.replace("judge", "user"),
                        },
                    ],
                    scenario: {
                        mode: ZegoUIKitPrebuilt.VideoConference,
                    },
                    onJoinRoom: () => {
                        if (page == 'judge' && group.data[0].status !== "Started") {
                            handleJoinRoom(roomID)
                        }

                    },
                    onLeaveRoom: () => {
                        if (page == 'judge') {
                            handleEndRoom(roomID)
                        }

                    }
                });
            } else {
                zegoInstance.joinRoom({
                    container: callContainerRef.current,
                    scenario: {
                        mode: ZegoUIKitPrebuilt.VideoConference,
                    },
                });
            }

        };

        if (typeof window !== "undefined" && UserState.value.data?.email && roomID) {
            const fullURL = window.location.href;
            initMeeting(fullURL);

        }

        return () => {
            if (zegoInstance) {
                zegoInstance.destroy();
            }
        };
    }, [roomID, UserState.value.data]);

    return (

        <div ref={callContainerRef} style={{ width: "100%", height: "100vh" }}></div>

    );
}