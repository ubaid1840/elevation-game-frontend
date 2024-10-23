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
} from "@chakra-ui/react";

const FAQAndSupport = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission logic (e.g., sending data to an API)
    toast({
      title: "Support Request Submitted",
      description: "We will get back to you shortly.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    setFormData({ name: "", email: "", message: "" }); // Reset form
  };

  return (
    <Box p={8}   bg="white">
      <Heading mb={6} color="purple.700">Frequently Asked Questions</Heading>

      {/* FAQ Section */}
      <Accordion allowMultiple mb={8}>
        {/* General Category */}
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              General
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <Text mb={2}><strong>Q: What is the purpose of this program?</strong></Text>
            <Text>A: This program aims to help participants improve their skills and maximize their earnings through networking.</Text>
          </AccordionPanel>
        </AccordionItem>

        {/* Enrollment Category */}
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              Enrollment
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <Text mb={2}><strong>Q: How do I enroll in the program?</strong></Text>
            <Text>A: You can enroll by filling out the registration form on our website.</Text>
          </AccordionPanel>
        </AccordionItem>

        {/* Pitch Recording Category */}
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              Pitch Recording
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <Text mb={2}><strong>Q: How do I record my pitch?</strong></Text>
            <Text>A: You can record your pitch using the designated recording feature available in your dashboard.</Text>
          </AccordionPanel>
        </AccordionItem>

        {/* Judges Category */}
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              Judges
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <Text mb={2}><strong>Q: Who are the judges for the program?</strong></Text>
            <Text>A: The judges are industry experts and successful entrepreneurs.</Text>
          </AccordionPanel>
        </AccordionItem>

        {/* Residual Income Category */}
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              Residual Income
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <Text mb={2}><strong>Q: How is residual income calculated?</strong></Text>
            <Text>A: Residual income is calculated based on the performance of your network.</Text>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      {/* Support Form Section */}
      <Heading mb={4} color="purple.700">Support Form</Heading>
      <Text mb={4}>If you have additional queries, please fill out the form below:</Text>
      <form onSubmit={handleSubmit}>
        <FormControl isRequired mb={4}>
          <FormLabel>Name</FormLabel>
          <Input
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
          />
        </FormControl>
        <Button colorScheme="purple" type="submit">
          Submit
        </Button>
      </form>

      {/* Support Contact Information */}
      <Box mt={8}>
        <Heading size="md" mb={2}>Contact Support</Heading>
        <Text>If you need immediate assistance, feel free to reach out to us:</Text>
        <Text>Email: support@example.com</Text>
        <Text>Phone: (123) 456-7890</Text>
      </Box>
    </Box>
  );
};

export default FAQAndSupport;
