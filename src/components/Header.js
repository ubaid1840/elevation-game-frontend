'use client';

import {
    ChevronDownIcon,
    CloseIcon,
    HamburgerIcon,
} from '@chakra-ui/icons';
import {
    Box,
    Collapse,
    Flex,
    Icon,
    IconButton,
    Stack,
    Text,
    useColorModeValue,
    useDisclosure
} from '@chakra-ui/react';
import Link from 'next/link';
import Logo from './logo';
import Button, { GhostButton } from './ui/Button';

export default function Header() {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Box pos={'fixed'} width={'100%'} zIndex={10}>
      <Flex
        bg={'#311748A0'}
        color={'white'}
        minH={'60px'}
        py={{ base: 2, md: 3, lg: 4 }}
        px={{ base: 4, md: 6, lg: 10 }}
        align={'center'}
        justify={'space-between'}
      >
        {/* Mobile Nav Toggle */}
        <Flex flex={{ base: 1, md: 'auto' }} ml={{ base: -2 }} display={{ base: 'flex', lg: 'none' }}>
          <IconButton
            onClick={onToggle}
            icon={isOpen ? <CloseIcon w={3} h={3} color={'white'} /> : <HamburgerIcon w={5} h={5} color={'white'} />}
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>

        {/* Logo */}
        <Flex flex={{ base: 1 }} justify={{ base: 'center', lg: 'flex-start' }}>
          <Box display={{ base: 'none', lg: 'flex' }}>
            <Logo type={'light'} />
          </Box>
        </Flex>

        {/* Desktop Nav */}
        <Flex display={{ base: 'none', lg: 'flex' }}>
          <DesktopNav />
        </Flex>

        {/* Buttons */}
        <Stack direction={'row'} spacing={{ base: 2, md: 4 }} ml={4}>
          <Button as={Link} href="/login">
            LOGIN
          </Button>
          <GhostButton as={Link} href="/signup">
            SIGN UP
          </GhostButton>
        </Stack>
      </Flex>

      {/* Mobile Nav */}
      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
}

// Desktop Navigation
const DesktopNav = () => {
  const linkColor = 'white';
  const linkHoverColor = 'gray.300';

  return (
    <Stack direction={'row'} spacing={6}>
      {NAV_ITEMS.map((navItem) => (
        <Link key={navItem.label} href={navItem.href ?? '#'}>
          <Text
            fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}
            fontWeight={500}
            color={linkColor}
            _hover={{
              textDecoration: 'underline',
              color: linkHoverColor,
            }}
          >
            {navItem.label}
          </Text>
        </Link>
      ))}
    </Stack>
  );
};

// Mobile Navigation
const MobileNav = () => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={{ base: 4, md: 6 }}
      display={{ lg: 'none' }}
      spacing={4}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={2} onClick={children && onToggle}>
      <Link href={href ?? '#'}>
        <Box
          py={2}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text fontWeight={600} fontSize={'md'} color={useColorModeValue('gray.600', 'gray.200')}>
            {label}
          </Text>
          {children && (
            <Icon
              as={ChevronDownIcon}
              transition={'all .25s ease-in-out'}
              transform={isOpen ? 'rotate(180deg)' : ''}
              w={5}
              h={5}
            />
          )}
        </Box>
      </Link>

      <Collapse in={isOpen} animateOpacity>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            children.map((child) => (
              <Link key={child.label} href={child.href}>
                <Box py={1}>{child.label}</Box>
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

const NAV_ITEMS = [
  {
    label: 'HOME',
    href: '/#home',
  },
  {
    label: 'HOW IT WORKS',
    href: '/#howitworks',
  },
  {
    label: 'CATEGORIES',
    href: '/#categories',
  },
  {
    label: 'JUDGES',
    href: '/#judges',
  },
  {
    label: 'FAQ',
    href: '/faq',
  },
  {
    label: 'CONTACT',
    href: '/contact',
  },
];
