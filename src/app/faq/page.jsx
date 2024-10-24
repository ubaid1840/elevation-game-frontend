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
} from "@chakra-ui/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Page() {


  return (
    <>
      <Header />

      <Container
        display={"flex"}
        maxW={"100%"}
        bgImage={"/faq.jpg"}
        bgSize={"cover"}
        bgPosition={"center"}
        height={"100vh"}
        justifyContent={"center"}
        color={"white"}
        pt={{ base: 2, md: 20 }}
      >
        <Box p={8} w={"100%"}>
          <Heading mb={6} color="purple.500">
            Frequently Asked Questions
          </Heading>

          <Accordion allowMultiple>
            {/* Question 1 */}
            <AccordionItem borderColor="#919191FF">
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <strong> What is the purpose of this program?</strong>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <Text>
                  A: This program aims to help participants improve their skills
                  and maximize their earnings through networking.
                </Text>
              </AccordionPanel>
            </AccordionItem>

            {/* Question 2 */}
            <AccordionItem borderColor="#919191FF">
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <strong> How do I enroll in the program?</strong>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <Text>
                  A: You can enroll by filling out the registration form on our
                  website.
                </Text>
              </AccordionPanel>
            </AccordionItem>

            {/* Question 3 */}
            <AccordionItem borderColor="#919191FF">
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <strong> How do I record my pitch?</strong>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <Text>
                  A: You can record your pitch using the designated recording
                  feature available in your dashboard.
                </Text>
              </AccordionPanel>
            </AccordionItem>

            {/* Question 4 */}
            <AccordionItem borderColor="#919191FF">
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <strong> Who are the judges for the program?</strong>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <Text>
                  A: The judges are industry experts and successful
                  entrepreneurs.
                </Text>
              </AccordionPanel>
            </AccordionItem>

            {/* Question 5 */}
            <AccordionItem borderColor="#919191FF">
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <strong> How is residual income calculated?</strong>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <Text>
                  A: Residual income is calculated based on the performance of
                  your network.
                </Text>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Box>
      </Container>

      <Footer />
    </>
  );
}
