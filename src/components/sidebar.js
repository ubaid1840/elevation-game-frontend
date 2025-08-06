"use client"

import {
    Badge,
    Box,
    Button,
    CloseButton,
    Divider,
    Drawer,
    DrawerContent,
    Flex,
    HStack,
    Icon,
    IconButton,
    ListItem,
    Text,
    Tooltip,
    UnorderedList,
    useColorModeValue,
    useDisclosure,
    useToast
} from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { FiLogOut, FiMenu } from "react-icons/fi";

import { auth, db } from "@/config/firebase";
import useCheckSession from "@/lib/checkSession";
import { UserContext } from "@/store/context/UserContext";
import { signOut } from "firebase/auth";
import { and, collection, onSnapshot, query, where } from "firebase/firestore";
import { CgProfile } from "react-icons/cg";
import { LuArrowRightLeft } from "react-icons/lu";
import { MdAttachMoney, MdNotificationsActive, MdSettings } from "react-icons/md";
import Logo from "./logo";

export default function Sidebar({ children, LinkItems, settingsLink, currentPage, id }) {

    const { isOpen, onOpen, onClose } = useDisclosure();
    const checkSession = useCheckSession()
    const { state: UserState, setUser } = useContext(UserContext)
    const [haveNotifications, setHaveNotifications] = useState(0)
    const toast = useToast()

    useEffect(() => {
        let unsubscribe;

        checkSession()
            .then((res) => {
                if (res.error) {
                    console.log(res.error);
                }
                if (typeof res === "function") {
                    unsubscribe = res;
                }
                if (res.user) {
                    setUser(res.user)
                    if (res?.user?.downgraded) {
                        toast({
                            title: "Judge status revoked",
                            description: "You can visit subscription page to activate your judge status again.",
                            status: "success",
                            duration: 5000,
                            isClosable: true,
                        });
                    }
                }
            })

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    useEffect(() => {
        if (UserState.value.data?.email) {
            const searchEmail = UserState.value.data?.email
            const searchId = UserState.value.data?.id
            let q = null
            if (UserState.value.data?.role === 'admin') {
                q = query(
                    collection(db, "notifications"),
                    and(where("to", "==", searchEmail), where("status", "==", "pending"))
                );
            } else {
                q = query(
                    collection(db, "notifications"),
                    and(where("to", "==", searchId), where("status", "==", "pending"))
                );
            }

            const unsubscribe = onSnapshot(q, (snapshot) => {
                let list = []
                snapshot.forEach((doc) => {
                    list.push(doc.data())
                })

                setHaveNotifications(list.length)

            });

            return () => unsubscribe();
        }

    }, [UserState.value.data])



    return (

        <Box
            minH="100vh"
        >
            <SidebarContent
                haveNotifications={haveNotifications}
                id={id}
                settingsLink={settingsLink}
                LinkItems={LinkItems}
                onClose={() => onClose}
                display={{ base: "none", md: "flex" }}
            />
            <Drawer
                autoFocus={false}
                isOpen={isOpen}
                placement="left"
                onClose={onClose}
                returnFocusOnClose={false}
                onOverlayClick={onClose}
                size="full"
                zIndex={9999}
            >
                <DrawerContent>
                    <SidebarContent id={id} haveNotifications={haveNotifications} settingsLink={settingsLink} LinkItems={LinkItems} display="flex" onClose={onClose} />
                </DrawerContent>
            </Drawer>
            <MobileNav display={{ base: "flex", md: "none" }} onOpen={onOpen} />
            <Box ml={{ base: 0, md: '280px' }} display={"flex"} flexDir={'column'}>
                {children}
            </Box>

        </Box>
    );
}

const SidebarContent = ({ LinkItems, settingsLink, onClose, haveNotifications, ...rest }) => {


    const pathname = usePathname()
    const { state: UserState, setUser } = useContext(UserContext)
    const currentAdditionalPath = pathname.includes("trivia") ? "/trivia" : pathname.includes("elevator") ? "/elevator" : ""
    const otherAdditionalPath = pathname.includes("trivia") ? "/elevator" : pathname.includes("elevator") ? "/trivia" : ""

    return (
        <Box
            w={{ base: "full", md: '280px' }}
            pos="fixed"
            minHeight={"full"}
            flexDirection={"column"}
            justifyContent={"space-between"}
            bg={'#F5F8FF'}
            borderRightWidth={1}
            borderRightColor="#EAECF0"
            {...rest}
        >
            <div>
                <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
                    <Logo />
                    <CloseButton
                        display={{ base: "flex", md: "none" }}
                        onClick={onClose}
                    />
                </Flex>

                {LinkItems.map((link, index) =>
                (
                    link?.name === 'Report' && pathname.includes("trivia") ? null :
                        <NavItem
                            onClose={onClose}
                            isActive={pathname.includes(link.path)}
                            key={link.name}
                            icon={link.icon}
                            path={`${link.path}`}
                        >
                            {link.name}
                        </NavItem>
                )
                )}
            </div>
            <Flex
                w={'100%'}
                flexDir={'column'}>

                <Divider color={'#EAECF0'} width={'250px'} alignSelf={'center'} />
                {UserState.value.data?.email &&
                    <>

                        {UserState.value.data?.role != 'admin' &&
                            <>
                                <Tooltip fontSize={'md'} hasArrow label={
                                    <Box p={2}>
                                        <UnorderedList>
                                            {pathname.includes("trivia") ?
                                                <ListItem>Switch to Elevator dashboard</ListItem>
                                                :
                                                <ListItem>Switch to Trivia dashboard</ListItem>
                                            }
                                        </UnorderedList>
                                    </Box>
                                } >
                                    <Button variant={"ghost"}>
                                        <NavItem
                                            onClose={onClose}
                                            isActive={false}
                                            icon={LuArrowRightLeft}
                                            path={`/${UserState.value.data?.role}${otherAdditionalPath}`}
                                        >
                                            Switch Dashboard
                                        </NavItem>
                                    </Button>
                                </Tooltip>

                                <NavItem
                                    onClose={onClose}
                                    isActive={pathname.includes('profile')}
                                    icon={CgProfile}
                                    path={`/${UserState.value.data?.role}${currentAdditionalPath}/profile`}
                                >
                                    Profile
                                </NavItem>
                            </>

                        }
                        <NavItem
                            onClose={onClose}
                            haveNotifications={haveNotifications}
                            isActive={pathname.includes('notifications')}
                            icon={MdNotificationsActive}
                            path={`/${UserState.value.data?.role}${currentAdditionalPath}/notifications`}
                        >
                            Notifications
                        </NavItem>
                        {UserState.value.data?.role == 'admin'
                            ?
                            <NavItem
                                onClose={onClose}
                                isActive={pathname.includes('settings')}
                                icon={MdSettings}
                                path={`/admin/settings`}
                            >
                                Settings
                            </NavItem>

                            :
                            <NavItem
                                onClose={onClose}
                                isActive={pathname.includes('subscription')}
                                icon={MdAttachMoney}
                                path={`/${UserState.value.data?.role}${currentAdditionalPath}/subscription`}
                            >
                                Subscription
                            </NavItem>
                        }

                        <HStack width={'100%'} align={'center'} justify={'space-between'} p={5}>
                            <Icon as={FiLogOut} boxSize={6} color={'#667085'} _hover={{ color: '#008080', cursor: 'pointer' }} onClick={() => {
                                signOut(auth)
                                setUser(null)
                            }} />
                            <Text>{UserState.value.data?.name}</Text>
                        </HStack>
                    </>}

            </Flex>
        </Box>
    );
};

const NavItem = ({ icon, children, path, isActive, haveNotifications, onClose, ...rest }) => {
    const { state: UserState } = useContext(UserContext)
    const pathname = usePathname()

    const user = UserState?.value?.data;

    let href = '#';


    if (user?.role === 'user') {
        if (pathname.includes('elevator') && user?.navigationAllowed) {
            href = path;
        }
        else if (pathname.includes('trivia')) {
            href = path;
        }
        else if (path.includes("subscription") || children.includes("Switch")) {
            href = path;
        }

    } else if (user?.role === 'judge') {
        if (user?.navigationAllowed || pathname.includes("trivia")) {
            href = path;
        }
        if (path.includes("subscription") || children.includes("Switch")) {
            href = path;
        }

    } else if (user?.role == 'admin') {
        href = path
    }

    return (
        <Link
            onClick={onClose}
            href={href}
            style={{ textDecoration: "none", fontSize: "14px", fontWeight: "300", height: '40px' }}
            _focus={{ boxShadow: "none" }}
        >
            {children === "Notifications"
                ?
                <>
                    <Flex
                        align="center"
                        p="2"
                        my="1"
                        mx="4"
                        borderRadius="lg"
                        role="group"
                        cursor="pointer"
                        _hover={{
                            color: "purple.500",
                        }}
                        fontSize={'16px'}
                        fontWeight={'500'}
                        color={isActive ? "purple.500" : href == '#' ? '#8C96A6FF' : '#344054'}
                        {...rest}
                    >
                        {icon && (
                            <Icon
                                mr="4"
                                _groupHover={{
                                    color: "purple.500",
                                }}
                                boxSize={5}
                                as={icon}
                            />
                        )}
                        {children}
                        {haveNotifications !== 0 &&
                            <Badge colorScheme="red" borderRadius={8} ml={1}>{haveNotifications}</Badge>
                            // <Center ml={2} bg={'red'} borderRadius={'full'} w={'20px'} h={'20px'}>
                            //     <Text color={'white'} fontSize={'12px'}>{}</Text>
                            // </Center>
                        }
                    </Flex>

                </>
                :
                <Flex
                    align="center"
                    p="2"
                    my="1"
                    mx="4"
                    borderRadius="lg"
                    role="group"
                    cursor="pointer"
                    _hover={{
                        color: "purple.500",
                    }}
                    fontSize={'16px'}
                    fontWeight={'500'}
                    color={isActive ? "purple.500" : href == '#' ? '#8C96A6FF' : '#344054'}
                    {...rest}
                >
                    {icon && (
                        <Icon
                            mr="4"
                            _groupHover={{
                                color: "purple.500",
                            }}
                            boxSize={5}
                            as={icon}
                        />
                    )}
                    {children}
                </Flex>
            }
        </Link>
    );
};

const MobileNav = ({ onOpen, ...rest }) => {
    return (
        <Flex
            ml={{ base: 0, md: 60 }}
            px={{ base: 4, md: 24 }}
            height="20"
            alignItems="center"
            bg={useColorModeValue("white", "gray.900")}
            borderBottomWidth="1px"
            borderBottomColor={useColorModeValue("gray.200", "gray.700")}
            justifyContent="flex-start"
            {...rest}
        >
            <IconButton
                variant="outline"
                onClick={onOpen}
                aria-label="open menu"
                icon={<FiMenu />}
            />

            {/* <Logo /> */}
        </Flex>
    );
};
