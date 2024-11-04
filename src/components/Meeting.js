"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import { usePathname, useRouter } from "next/navigation";
import { UserContext } from "@/store/context/UserContext";

function randomID(len = 5) {
    const chars =
        "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP";
    let result = "";
    for (let i = 0; i < len; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export default function Meeting({ page }) {
    const callContainerRef = useRef(null);
    const [roomID, setRoomID] = useState(randomID(5));
    const { state: UserState } = useContext(UserContext)
    const router = useRouter()
    let zegoInstance;

    async function handleJoinRoom(room) {
        router.push(`/judge/meeting?roomID=${room}`, undefined, { shallow: true })
    }

    useEffect(() => {
        const search = new URLSearchParams(window.location.search).get("roomID");
        if (search) {
            setRoomID(search);
        }

        const initMeeting = async (fullURL) => {
            const userID = UserState.value.data.email;
            const userName = UserState.value.data.email;

            const token = ZegoUIKitPrebuilt.generateKitTokenForTest(
                58911582,
                "38ab2dbdfd68c429298a1dfbf8de2a5c",
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
                        handleJoinRoom(roomID)
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
        <Sidebar LinkItems={GetLinkItems(page)}>
            <div ref={callContainerRef} style={{ width: "100%", height: "100vh" }}></div>
        </Sidebar>
    );
}