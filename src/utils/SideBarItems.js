"use client"
import { BsCashStack } from "react-icons/bs";
import { FaUserFriends } from "react-icons/fa";
import { GiTakeMyMoney } from "react-icons/gi";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { MdMultilineChart, MdOutlineGamepad, MdOutlineLeaderboard, MdOutlineSchedule } from "react-icons/md";
import { PiNetworkDuotone } from "react-icons/pi";
import { RiDashboard3Line, RiTeamLine } from "react-icons/ri";
import { SiGotomeeting, SiNintendogamecube } from "react-icons/si";
import { SlGameController } from "react-icons/sl";
import { TbReport } from "react-icons/tb";
import { VscGame } from "react-icons/vsc";
import { FaMoneyBillWave } from "react-icons/fa";


const GetLinkItems = (role, type) => {
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
                {
                    name: "Analytics",
                    icon: TbReport,
                    path: `/admin/analytics`,
                },
                {
                    name: "Traffic",
                    icon: MdMultilineChart,
                    path: `/admin/traffic`,
                },
                 {
                    name: "Withdrawal Request",
                    icon: FaMoneyBillWave,
                    path: `/admin/withdraw`,
                },

            ];
        case 'judge':
            return [
                {
                    name: "Dashboard",
                    icon: SlGameController,
                    path: `/judge/${type}/gamedetails`,
                },
                {
                    name: "Create Game",
                    icon: SiNintendogamecube,
                    path: `/judge/${type}/creategame`,
                },
                {
                    name: "Availability",
                    icon: MdOutlineSchedule,
                    path: `/judge/${type}/schedule`,
                },
                {
                    name: "Meeting",
                    icon: SiGotomeeting,
                    path: `/judge/${type}/meeting`,
                },
                {
                    name: "My Earning",
                    icon: GiTakeMyMoney,
                    path: `/judge/${type}/myearning`,
                },
                {
                    name: "Network",
                    icon: PiNetworkDuotone,
                    path: `/judge/${type}/network`,
                },
                  {
                    name: "Withdraw",
                    icon: FaMoneyBillWave,
                    path: `/user/${type}/withdraw`,
                },


            ];
        case 'user':
            return [
                {
                    name: "Dashboard",
                    icon: RiDashboard3Line,
                    path: `/user/${type}/dashboard`,
                },
                {
                    name: "Enrolled Games",
                    icon: VscGame,
                    path: `/user/${type}/enrolledgames`,
                },
                {
                    name: "Leaderboard",
                    icon: MdOutlineLeaderboard,
                    path: `/user/${type}/leaderboard`,
                },
                {
                    name: "My Earning",
                    icon: GiTakeMyMoney,
                    path: `/user/${type}/myearning`,
                },

                {
                    name: "Judges Interaction",
                    icon: IoCalendarNumberOutline,
                    path: `/user/${type}/judgesinteraction`,
                },
                {
                    name: "Report",
                    icon: TbReport,
                    path: `/user/${type}/report`,
                },
                {
                    name: "Network",
                    icon: PiNetworkDuotone,
                    path: `/user/${type}/network`,
                },

                {
                    name: "Withdraw",
                    icon: FaMoneyBillWave,
                    path: `/user/${type}/withdraw`,
                },

            ];
        default:
            return [];
    }
};

export default GetLinkItems;
