"use client"
import { BsCashStack} from "react-icons/bs";
import { FaUserFriends } from "react-icons/fa";
import { MdOutlineGamepad, MdOutlineLeaderboard} from "react-icons/md";
import { RiDashboard3Line,  RiTeamLine } from "react-icons/ri";
import {  SiNintendogamecube } from "react-icons/si";
import { SlGameController } from "react-icons/sl";
import { GiTakeMyMoney } from "react-icons/gi";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { TbReport } from "react-icons/tb";
import { PiNetworkDuotone } from "react-icons/pi";
import { VscGame } from "react-icons/vsc";

const GetLinkItems = (role) => {
    switch (role) {
        case 'admin':
            return [
                {
                    name: "User Management",
                    icon: FaUserFriends,
                    path: `/admin/usermanagement`,
                },
                {
                    name: "Game Management",
                    icon: MdOutlineGamepad,
                    path: `/admin/gamemanagement`,
                },
                {
                    name: "Judge Management",
                    icon: RiTeamLine,
                    path: `/admin/judgemanagement`,
                },
                {
                    name: "Finance",
                    icon: BsCashStack,
                    path: `/admin/finance`,
                },
            ];
            case 'judge':
            return [
                {
                    name: "Dashboard",
                    icon: SlGameController ,
                    path: `/judge/gamedetails`,
                },
                {
                    name: "Create Game",
                    icon: SiNintendogamecube,
                    path: `/judge/creategame`,
                },
                
            ];
            case 'user':
                return [
                    {
                        name: "Dashboard",
                        icon: RiDashboard3Line,
                        path: `/user/dashboard`,
                    },
                    {
                        name: "Enrolled Games",
                        icon: VscGame,
                        path: `/user/enrolledgames`,
                    },
                    // {
                    //     name: "Competition Progress",
                    //     icon: RiFirstAidKitLine,
                    //     path: `/user/competitionprogress`,
                    // },
                   
                    // {
                    //     name: "Enrollment",
                    //     icon: RiFirstAidKitLine,
                    //     path: `enrollment`,
                    // },
                  
                    {
                        name: "Leaderboard",
                        icon: MdOutlineLeaderboard,
                        path: `/user/leaderboard`,
                    },
                    {
                        name: "My Earning",
                        icon: GiTakeMyMoney,
                        path: `/user/myearning`,
                    },
                   
                    {
                        name: "Judges Interaction",
                        icon: IoCalendarNumberOutline,
                        path: `/user/judgesinteraction`,
                    },
                    {
                        name: "Report",
                        icon: TbReport,
                        path: `/user/report`,
                    },
                    {
                        name: "Network",
                        icon: PiNetworkDuotone ,
                        path: `/user/network`,
                    },
                    
                ];
        default:
            return [];
    }
};

export default GetLinkItems;
