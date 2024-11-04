"use client"
import Header from "@/components/Header";
import HomePage from "@/components/landingpage/Home";
import Challenge from "@/components/landingpage/Challenge";
import How from "@/components/landingpage/How";
import Categories from "@/components/landingpage/Categories";
import Testimonials from "@/components/landingpage/Testimonials";
import Footer from "@/components/Footer";
import Judges from "@/components/landingpage/Judges";
import { LightMode } from "@chakra-ui/react";

export default function Home() {
  return (
    <>
      <LightMode>
        <Header />
        <HomePage />
        <Challenge />
        <How />
        <Categories />
        <Judges />
        <Testimonials />
        <Footer />
      </LightMode>
    </>
  );
}
