"use client";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Container, Heading, Text, VStack } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Page() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("/api/pagesettings").then((response) => {
      setData(response.data.terms.split("\n"));
    });
  }, []);

  return (
    <>
      <Header />
      <Container
        maxW={"100%"}
        bgImage={"/howitworksbg.jpg"}
        bgSize={"cover"}
        bgPosition={"center"}
        alignItems={"center"}
        justifyContent={"center"}
        display={"flex"}
        flexDir={"column"}
        gap={20}
        py={"100px"}
        minH={"100vh"}
      >
        <Heading color={"white"}>Terms & Conditions</Heading>

        <VStack
          alignItems="flex-start"
          spacing={4}
          px={{ base: 4, md: 12 }}
          maxW="1200px"
          w="100%"
        >
          {data.length > 0 &&
            data.map((item, index) => (
              <Text
                key={index}
                fontSize="lg"
                color="white"
                lineHeight="1.2"
                textAlign="justify"
              >
                {item}
              </Text>
            ))}
        </VStack>
      </Container>
      <Footer />
    </>
  );
}
