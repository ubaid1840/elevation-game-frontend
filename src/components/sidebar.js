"use client"

import React, { useCallback, useContext, useEffect, useState } from "react";
import {
    IconButton,
    Box,
    CloseButton,
    Flex,
    Icon,
    useColorModeValue,
    Drawer,
    DrawerContent,
    Text,
    useDisclosure,
    Image,
    Divider,
    HStack,
    Avatar,
    VStack,
    Switch,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    Heading,
    AccordionIcon,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    useToast,
    Center,
} from "@chakra-ui/react";
import { FiLogOut, FiMenu } from "react-icons/fi";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { theme } from "@/data/data";
import Link from "next/link";
import Button from "./ui/Button";
import { MdAttachMoney, MdNotificationsActive, MdOutlineEmergencyShare, MdSettings } from "react-icons/md";
import Logo from "./logo";
import useCheckSession from "@/lib/checkSession";
import { UserContext } from "@/store/context/UserContext";
import { signOut } from "firebase/auth";
import { auth, db } from "@/config/firebase";
import { CgProfile } from "react-icons/cg";
import { and, collection, onSnapshot, query, where } from "firebase/firestore";
import { debounce } from "@/utils/debounce";

export default function Sidebar({ children, LinkItems, settingsLink, currentPage, id }) {

    const { isOpen, onOpen, onClose } = useDisclosure();
    const checkSession = useCheckSession()
    const { state: UserState, setUser } = useContext(UserContext)
    const [haveNotifications, setHaveNotifications] = useState(0)

    useEffect(() => {
        checkSession().then((val) => {
            setUser(val.user)
        })

    }, [])

    useEffect(() => {
        if (UserState.value.data?.email) {
            const searchEmail = UserState.value.data?.email
            const searchId = UserState.value.data?.id
            let q = null
            if(UserState.value.data?.role === 'admin'){
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
            >
                <DrawerContent>
                    <SidebarContent  id={id} haveNotifications={haveNotifications} settingsLink={settingsLink} LinkItems={LinkItems} display="flex" onClose={onClose} />
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
    const { state: UserState } = useContext(UserContext)

    return (
        <Box
            w={{ base: "full", md: '280px' }}
            pos="fixed"
            minHeight={"full"}
            flexDirection={"column"}
            justifyContent={"space-between"}
            bg={theme.color.background}
            {...rest}
            borderRightWidth={1}
            borderRightColor="#EAECF0"
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
                {/* <NavItem
                    icon={IoIosNotificationsOutline}
                    path={`/notifications`}
                >
                    {t('notifications')}
                </NavItem>
                */}

                <Divider color={'#EAECF0'} width={'250px'} alignSelf={'center'} />
                {UserState.value.data?.email &&
                    <>

                        {UserState.value.data?.role != 'admin' &&
                            <NavItem
                            onClose={onClose}
                                isActive={pathname.includes('profile')}
                                icon={CgProfile}
                                path={`/${UserState.value.data?.role}/profile`}
                            >
                                Profile
                            </NavItem>
                        }
                        <NavItem
                         onClose={onClose}
                            haveNotifications={haveNotifications}
                            isActive={pathname.includes('notifications')}
                            icon={MdNotificationsActive}
                            path={`/${UserState.value.data?.role}/notifications`}
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
                                path={`/${UserState.value.data?.role}/subscription`}
                            >
                                Subscription
                            </NavItem>
                        }

                        <HStack width={'100%'} align={'center'} justify={'space-between'} p={5}>
                            <Icon as={FiLogOut} boxSize={6} color={'#667085'} _hover={{ color: theme.color.primary, cursor: 'pointer' }} onClick={() => signOut(auth)} />
                            <Text>{UserState.value.data?.name}</Text>
                        </HStack>
                    </>}

            </Flex>
        </Box>
    );
};

const NavItem = ({ icon, children, path, isActive, haveNotifications, onClose, ...rest }) => {


    return (
        <Link
        onClick={onClose}
            href={`${path}`}
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
                        color={isActive ? "purple.500" : '#344054'}
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
                            <Center ml={2} bg={'red'} borderRadius={'full'} w={'20px'} h={'20px'}>
                                <Text color={'white'} fontSize={'12px'}>{haveNotifications}</Text>
                            </Center>}
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
                    color={isActive ? "purple.500" : '#344054'}
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
