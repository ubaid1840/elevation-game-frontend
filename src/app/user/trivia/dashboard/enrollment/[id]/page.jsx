"use client";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Box,
  Heading,
  Stack,
  Text,
  Button,
  Progress,
  VStack,
  RadioGroup,
  Radio,
  Badge,
  Grid,
  GridItem,
  Divider,
  useToast,
  Skeleton,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Spinner,
  useDisclosure,
  Checkbox,
} from "@chakra-ui/react";
import axios from "axios";
import { UserContext } from "@/store/context/UserContext";
import moment from "moment";
import { redirect, useRouter } from "next/navigation";
import { debounce } from "@/utils/debounce";

export default function Page({ params }) {
  const { state: UserState } = useContext(UserContext);
  const router = useRouter();
  const toast = useToast();

  const [gameDetailData, setGameDetailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [instructions, setInstructions] = useState([]);

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (UserState.value.data?.id) {
      debouncedFetchData(params.id);
    }
  }, [UserState.value.data]);

  const debouncedFetchData = useCallback(
    debounce((id) => {
      fetchData(id);
    }, 3000),
    []
  );

  async function fetchData(id) {
    try {
      const response = await axios.get(`/api/trivia/game/${id}`);
      if (response.data?.game?.description) {
        const splitData = response.data.game.description.split("\n");
        setInstructions(splitData);
      }
      setGameDetailData(response.data);
    } catch (e) {
      console.log("Error fetching game details:", e.message);
      toast({
        title: e?.response?.data?.message || e?.message,
        status: "error",
      });
    }
  }

  async function handleEnroll() {
    setLoading(true);
    axios
      .put(`/api/trivia/game/${params.id}`, {
        user_id: UserState.value.data.id,
      })
      .then(() => {
        router.push(`/user/trivia/enrolledgames/${params.id}`);
      })
      .catch((e) => {
        console.log(e);
        toast({
          title: "Error",
          description: e?.response?.data?.message || e?.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <Box p={8} minH="100vh">
      <Box p={6} borderRadius="md" mb={6}>
        <Heading mb={4} color="purple.400">
          {gameDetailData?.game?.title}
        </Heading>

        <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={4}>
          <GridItem>
            <Text fontWeight="bold">
              Prize:{" "}
              <Badge colorScheme="green">${gameDetailData?.game?.prize}</Badge>
            </Text>
          </GridItem>
          <GridItem>
            <Text fontWeight="bold">
              Winner:{" "}
              {gameDetailData?.game?.winner ? (
                <Badge colorScheme="purple">
                  {gameDetailData?.game?.winner_name}
                </Badge>
              ) : (
                "TBA"
              )}
            </Text>
          </GridItem>
          <GridItem>
            <Text fontWeight="bold">
              Created By:{" "}
              <Badge colorScheme="blue">
                {gameDetailData?.game?.created_by_name}
              </Badge>
            </Text>
          </GridItem>

          <GridItem>
            <Text fontWeight="bold">
              Category: {gameDetailData?.game?.category}
            </Text>
          </GridItem>

          <GridItem>
            <Text fontWeight="bold">
              Start Date:{" "}
              {gameDetailData?.game?.start_date
                ? moment(gameDetailData.game.start_date).format("MM/DD/YYYY")
                : ""}
            </Text>
          </GridItem>

          <GridItem>
            <Text fontWeight="bold">
              Deadline:{" "}
              {gameDetailData?.game?.deadline
                ? moment(gameDetailData.game.deadline).format("MM/DD/YYYY")
                : ""}
            </Text>
          </GridItem>

          <GridItem>
            <Text fontWeight="bold">
              Spots Available: {gameDetailData?.game?.spots_remaining}
            </Text>
          </GridItem>

          <GridItem>
            <Text fontWeight="bold">
              Total Participants: {gameDetailData?.game?.total_participants}
            </Text>
          </GridItem>
        </Grid>

        {instructions.length > 0 && (
          <>
            <Text fontSize="md">
              <strong>Game Instructions:</strong>
            </Text>
            <VStack align={"flex-start"} gap={0}>
              {instructions.map((eachInstruction, index) => (
                <Text key={index} fontSize="sm">
                  {`- ${eachInstruction}`}
                </Text>
              ))}
            </VStack>
          </>
        )}

        <Divider my={4} />
        {gameDetailData?.game && (
          <Button
            onClick={() => onOpen()}
            colorScheme="blue"
            disabled={
              gameDetailData.game.spots_remaining === 0 ||
              moment().isBefore(moment(gameDetailData.game.startDate), "day")
            }
          >
            Play Game
          </Button>
        )}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Pre-Start Confirmation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack
              spacing={5}
              p={6}
            >
              <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                Please confirm you understand:
              </Text>

              <Stack spacing={3} pl={4}>
                <Text color="gray.700">
                  1. ✔️ Winner is based on accuracy (most correct answers)
                </Text>
                <Text color="gray.700">
                  2. ⏱️ Time matters — fastest time breaks ties
                </Text>
                <Text color="gray.700">3. 🚫 You only get one attempt</Text>
                <Text color="gray.700">
                  4. 🏁 Game ends when spots = 0, not the deadline
                </Text>
                <Text color="gray.700">
                  5. 📊 Results are revealed only when the game officially ends
                </Text>
              </Stack>

              <Checkbox
                isChecked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                colorScheme="blue"
                size="md"
              >
                <Text color="gray.800">
                  I understand and agree to the rules.
                </Text>
              </Checkbox>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              isLoading={loading}
              isDisabled={!checked}
              colorScheme="blue"
              onClick={handleEnroll}
            >
              Continue
            </Button>
            <Button ml={3} onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
