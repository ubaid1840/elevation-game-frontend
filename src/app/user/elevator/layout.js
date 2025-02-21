"use client"
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import { usePathname } from "next/navigation";


export default function Layout({ children }) {

    const pathname = usePathname()

    return (
        <Sidebar LinkItems={GetLinkItems("user", "elevator")}>
            {children}
        </Sidebar>
    );
}