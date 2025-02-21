"use client"
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import { usePathname } from "next/navigation";


export default function Layout({ children }) {

    const pathname = usePathname()

    return (
        <Sidebar LinkItems={GetLinkItems("judge", "elevator")}>
            {children}
        </Sidebar>
    );
}