"use client";
import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  Container,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Page() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "Support Request Submitted",
      description: "We will get back to you shortly.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <>
      <Header />
      <Container
        display={"flex"}
        maxW={"100%"}
        bgImage={"/contact.jpg"}
        bgSize={"cover"}
        bgPosition={"center"}
        height={"100vh"}
        alignItems={"center"}
        justifyContent={"center"}
        color={"white"}
        pt={{base : 2, md : 20}}
      >
        <Box
          maxW={"2xl"}
          w={"full"}
          bg={useColorModeValue("whiteAlpha.200", "gray.700")}
          boxShadow={"2xl"}
          rounded={"lg"}
          p={8}
        >
          <Heading mb={4} color="white" fontWeight={"700"}>
            CONTACT
          </Heading>
          <Text mb={4}>
            If you have additional queries, please fill out the form below:
          </Text>
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <FormControl isRequired mb={4}>
              <FormLabel>Name</FormLabel>
              <Input
                color="gray.400"
                borderRadius={"2px"}
                border={"1px solid"}
                borderColor={"#484848"}
                bg={"gray.800"}
                _placeholder={{ color: "gray.500" }}
                _focus={{ borderColor: "purple.400" }}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your Name"
              />
            </FormControl>
            <FormControl isRequired mb={4}>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Your Email"
                color="gray.400"
                borderRadius={"2px"}
                border={"1px solid"}
                borderColor={"#484848"}
                bg={"gray.800"}
                _placeholder={{ color: "gray.500" }}
                _focus={{ borderColor: "purple.400" }}
              />
            </FormControl>
            <FormControl isRequired mb={4}>
              <FormLabel>Message</FormLabel>
              <Textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Your Message"
                size="sm"
                color="gray.400"
                borderRadius={"2px"}
                border={"1px solid"}
                borderColor={"#484848"}
                bg={"gray.800"}
                _placeholder={{ color: "gray.500" }}
                _focus={{ borderColor: "purple.400" }}
              />
            </FormControl>
            <Button colorScheme="purple" type="submit">
              Submit
            </Button>
          </form>

          <Box mt={8}>
            <Heading size="md" mb={2}>
              Contact Support
            </Heading>
            <Text>
              If you need immediate assistance, feel free to reach out to us:
            </Text>
            <Text>Email: support@example.com</Text>
            <Text>Phone: (123) 456-7890</Text>
          </Box>
        </Box>
      </Container>
      <Footer />
    </>
  );
}
