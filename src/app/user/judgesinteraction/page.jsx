"use client";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  Divider,
} from "@chakra-ui/react";
import { Calendar } from "primereact/calendar"; // Import PrimeReact Calendar
import { useState } from "react";

export default function Page() {
  const [date, setDate] = useState(null);
  
  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleBookSession = () => {
    
    console.log("Critique session booked for:", date);
  };

  return (
    <Sidebar LinkItems={GetLinkItems("user")}>
    <Box p={8} >
    
      <Box bg="purple.50" p={6} borderRadius="lg" boxShadow="md" mb={8}>
        <Heading size="lg" mb={4}>
          Schedule Critiques
        </Heading>
        <Divider borderColor="gray.400" mb={4} />
        <Text fontSize="md" mb={4}>
          Select a date below to book a critique session with a judge.
        </Text>

        {/* PrimeReact Calendar for selecting dates */}
        <Calendar
          value={date}
          onChange={(e) => handleDateChange(e.value)}
          showIcon
          className="custom-calendar"
          dateFormat="mm/dd/yy" // Format for display
          style={{ width: '100%', marginBottom: '20px' }} // Style for full width
        />

        {/* Availability of judges */}
        <VStack align="start" spacing={4} mt={6}>
          <Text fontWeight="bold" fontSize="lg">
            Judge Availability:
          </Text>
          <Text fontSize="sm">
            - Judge 1: Available on Wednesdays and Fridays<br />
            - Judge 2: Available on Mondays and Thursdays<br />
            - Judge 3: Available on weekends
          </Text>
        </VStack>

        {/* Book Session Button */}
        <Button
          colorScheme="purple"
          size="lg"
          mt={6}
          onClick={handleBookSession}
          isDisabled={!date} // Disable if no date is selected
        >
          Book Critique Session
        </Button>
      </Box>
    </Box>
    </Sidebar>
  );
}
