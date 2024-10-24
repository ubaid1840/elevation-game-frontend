"use client";
import {
  Box,
  Heading,
  Text,
  VStack,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Button,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";

export default function ProfilePage() {
  
  const [userInfo, setUserInfo] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    referralCode: "REF12345",
    password: "",
    newPassword: "",
  });

  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = () => {
    
    toast({
      title: "Password Changed",
      description: "Your password has been successfully changed.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box p={8} maxW="1000px" mx="auto" bg="white" borderRadius="lg" boxShadow="xl">
      <VStack spacing={6} align="start">
        {/* Profile Header */}
        <Heading size="lg" color="purple.700">
          Profile Information
        </Heading>
        <Divider borderColor="purple.400" />

        {/* User Information Section */}
        <FormControl id="name" isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            type="text"
            name="name"
            value={userInfo.name}
            onChange={handleChange}
            bg="gray.50"
            borderColor="purple.300"
            placeholder="Your name"
          />
        </FormControl>

        <FormControl id="email" isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            name="email"
            value={userInfo.email}
            onChange={handleChange}
            bg="gray.50"
            borderColor="purple.300"
            placeholder="Your email"
          />
        </FormControl>

        <HStack spacing={4} width="100%" align={'flex-end'}>
          <FormControl id="password" isRequired>
            <FormLabel>New Password</FormLabel>
            <Input
              type="password"
              name="newPassword"
              value={userInfo.newPassword}
              onChange={handleChange}
              bg="gray.50"
              borderColor="purple.300"
              placeholder="Enter new password"
            />
          </FormControl>

          <Button
          
            colorScheme="purple"
            onClick={handlePasswordChange}
            
          >
            Change Password
          </Button>
        </HStack>

        <FormControl id="referralCode" isRequired>
          <FormLabel>Referral Code</FormLabel>
          <Input
            type="text"
            name="referralCode"
            value={userInfo.referralCode}
            onChange={handleChange}
            isReadOnly
            bg="gray.100"
            borderColor="gray.300"
          />
        </FormControl>

        {/* Save Changes Button */}
        <Button
          colorScheme="purple"
          size="lg"
          width="full"
          mt={4}
          onClick={() => toast({
            title: "Profile Updated",
            description: "Your profile information has been updated.",
            status: "success",
            duration: 3000,
            isClosable: true,
          })}
        >
          Save Changes
        </Button>
      </VStack>
    </Box>
  );
}
