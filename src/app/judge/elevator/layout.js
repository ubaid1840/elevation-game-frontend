"use client"
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";


export default function Layout({ children }) {

    return (
        <Sidebar LinkItems={GetLinkItems("judge", "elevator")}>
            {children}
        </Sidebar>
    );
}