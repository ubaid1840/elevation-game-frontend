import Image from "next/image";
import styles from "./page.module.css";
import Header from "@/components/Header";
import HomePage from "@/components/Home";
import Challenge from "@/components/Challenge";
import How from "@/components/How";
import Categories from "@/components/Categories";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  return (
   <>
   
     
     <Header />
     <HomePage />
     <Challenge />
     <How />
     <Categories />
     <Testimonials />
     <Footer />
     </>
  );
}
