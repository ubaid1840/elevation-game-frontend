"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GameEnrollmentPage() {
  const router = useRouter();
  useEffect(() => {
    router.push("/user/dashboard");
  }, []);
}
