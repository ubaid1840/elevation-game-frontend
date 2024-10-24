'use client'

import {
    Box,
    Flex,
    Text,
    IconButton,

    Stack,
    Collapse,
    Icon,
    Popover,
    PopoverTrigger,
    PopoverContent,
    useColorModeValue,
    useBreakpointValue,
    useDisclosure,
} from '@chakra-ui/react'
import {
    HamburgerIcon,
    CloseIcon,
    ChevronDownIcon,
    ChevronRightIcon,
} from '@chakra-ui/icons'
import Button, { GhostButton } from './ui/Button'
import Link from 'next/link'
import Logo from './logo'

export default function Header() {
    const { isOpen, onToggle } = useDisclosure()

    return (
        <Box pos={'fixed'} width={'100%'} zIndex={1}>
            <Flex
                bg={'#311748A0'}
                color={'white'}
                minH={'60px'}
                py={{ base: 2, md : 4 }}
                px={{ base: 4 }}

                align={'center'}
                justify={'space-between'}>
                <Flex
                    flex={{ base: 1, md: 'auto' }}
                    ml={{ base: -2 }}
                    display={{ base: 'flex', md: 'none' }}>
                    <IconButton
                        onClick={onToggle}
                        icon={isOpen ? <CloseIcon w={3} h={3}  color={'white'}/> : <HamburgerIcon w={5} h={5} color={'white'}/>}
                        variant={'ghost'}
                        aria-label={'Toggle Navigation'}
                    />

                </Flex>
                <Flex display={{ base: 'none', md: 'flex' }}>
                   <Logo type={'light'}/>
                </Flex>
                <Flex justify={'center'}>


                    <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
                        <DesktopNav />
                    </Flex>
                </Flex>

                <Stack

                    justify={'flex-end'}
                    direction={'row'}
                    spacing={6}>
                    <Button as={Link} href="/login">
                        LOGIN
                    </Button>
                    <GhostButton as={Link} href="/signup">
                        SIGN UP
                    </GhostButton>
                </Stack>
            </Flex>

            <Collapse in={isOpen} animateOpacity>
                <MobileNav />
            </Collapse>
        </Box>
    )
}

const DesktopNav = () => {

    return (
        <Stack direction={'row'} spacing={4}>
            {NAV_ITEMS.map((navItem) => (
                <Box key={navItem.label}>
                    <Box
                        as="a"
                        p={2}
                        href={navItem.href ?? '#'}
                        fontSize={'16px'}
                        fontWeight={500}
                        color={'white'}
                        _hover={{
                            textDecoration: 'underline',
                            opacity: 0.7
                        }}>
                        {navItem.label}
                    </Box>
                </Box>
            ))}
        </Stack>
    )
}

const MobileNav = () => {
    return (
        <Stack bg={useColorModeValue('white', 'gray.800')} p={4} display={{ md: 'none' }}>
            {NAV_ITEMS.map((navItem) => (
                <MobileNavItem key={navItem.label} {...navItem} />
            ))}
        </Stack>
    )
}

const MobileNavItem = ({ label, children, href }) => {
    const { isOpen, onToggle } = useDisclosure()

    return (
        <Stack spacing={4} onClick={children && onToggle}>
            <Box
                py={2}
                as="a"
                href={href ?? '#'}
                justifyContent="space-between"
                alignItems="center"
                _hover={{
                    textDecoration: 'none',
                }}>
                <Text fontWeight={600} color={useColorModeValue('gray.600', 'gray.200')}>
                    {label}
                </Text>
                {children && (
                    <Icon
                        as={ChevronDownIcon}
                        transition={'all .25s ease-in-out'}
                        transform={isOpen ? 'rotate(180deg)' : ''}
                        w={6}
                        h={6}
                    />
                )}
            </Box>

            <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
                <Stack
                    mt={2}
                    pl={4}
                    borderLeft={1}
                    borderStyle={'solid'}
                    borderColor={useColorModeValue('gray.200', 'gray.700')}
                    align={'start'}>
                    {children &&
                        children.map((child) => (
                            <Box as="a" key={child.label} py={2} href={child.href}>
                                {child.label}
                            </Box>
                        ))}
                </Stack>
            </Collapse>
        </Stack>
    )
}



const NAV_ITEMS = [
    {
        label: 'HOME',
        href: `${process.env.NEXT_PUBLIC_BASE_URL}#home`,  
    },
    {
        label: 'HOW IT WORKS',
        href: `${process.env.NEXT_PUBLIC_BASE_URL}#howitworks`,  
    },
    {
        label: 'CATEGORIES',
        href: `${process.env.NEXT_PUBLIC_BASE_URL}#categories`,  
    },
    {
        label: 'JUDGES',
        href: `${process.env.NEXT_PUBLIC_BASE_URL}#judges`,  
    },
    {
        label: 'FAQ',
        href: `${process.env.NEXT_PUBLIC_BASE_URL}/faq`,  
    },
    {
        label: 'CONTACT',
        href: `${process.env.NEXT_PUBLIC_BASE_URL}/contact`,  
    },
]