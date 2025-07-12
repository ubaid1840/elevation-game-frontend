"use client";
import SquareCheckout from "@/components/square/checkout";
import { UserContext } from "@/store/context/UserContext";
import {
  Badge,
  Box,
  Button,
  Grid,
  GridItem,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
  useToast
} from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";

export default function GameEnrollmentPage({ params }) {
  const [game, setGame] = useState();
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { state: UserState } = useContext(UserContext);
  const [paymentData, setPaymentData] = useState({});
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [proceed, setProceed] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData();
    }
  }, [UserState.value.data]);

  async function fetchData() {
    axios.get(`/api/games/${params.id}`).then((response) => {
      setGame(response.data);
    });
  }

  const handleSubmit = (paymentIntent = null, price = null) => {
    axios
      .post("/api/games/enroll", {
        userId: UserState.value.data?.id,
        gameId: params.id,
        entryLevel: "PENDING",
        paymentIntent: paymentIntent,
        price: price,
      })
      .then((response) => {
        if (response.data?.alreadyEnrolled) {
          setPaymentData({ price: response.data?.price, game: params.id });
          setProceed(false);
          onOpen();
        } else {
          router.push("/user/elevator/dashboard");
        }
      })
      .catch((e) => {
        toast({
          title: "Error",
          description: e.response.data.message || e?.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        console.error("Error fetching data:", e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  function formatYouTubeURL(url) {
    if (url.includes("youtu.be")) {
      const videoId = url.split("youtu.be/")[1];
      return `https://www.youtube.com/embed/${videoId}`;

    } else if (url.includes("youtube.com/watch?v=")) {
      const videoId = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}`;

    } else if (url.includes("youtube.com/shorts/")) {
      const videoId = url.split("youtube.com/shorts/")[1];
      return `https://www.youtube.com/embed/${videoId}`;

    } else if (url.includes("m.youtube.com/watch?v=")) {
      const videoId = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    }

    return url;
  }

  return (
    <>
      <Box p={8} bg="white">
        {/* Game Title */}
        <Heading color="teal" mb={6} fontSize="2xl">
          {game?.title}
        </Heading>

        {/* Game Details Section */}
        <Box bg="gray.50" p={6} borderRadius="lg" boxShadow="md" mb={8}>
          <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={4}>
            <GridItem>
              <Text fontWeight="bold">Description:</Text>
              <Text fontSize="sm">{game?.description}</Text>
            </GridItem>
            <GridItem>
              <Text fontWeight="bold">Category:</Text>
              <Badge colorScheme="purple" fontSize="sm">
                {game?.category}
              </Badge>
            </GridItem>
            <GridItem>
              <Text fontWeight="bold">Total Spots:</Text>
              <Text fontSize="sm">{game?.total_spots}</Text>
            </GridItem>
            <GridItem>
              <Text fontWeight="bold">Spots Remaining:</Text>
              <Text fontSize="sm">{game?.spots_remaining}</Text>
            </GridItem>
            <GridItem>
              <Text fontWeight="bold">Total Rounds:</Text>
              <Text fontSize="sm">{game?.totalrounds}</Text>
            </GridItem>
            {/* <GridItem>
              <Text fontWeight="bold">Prize Amount:</Text>
              <Text fontSize="sm">${game?.prize_amount}</Text>
            </GridItem> */}
            <GridItem>
              <Text fontWeight="bold">Tier:</Text>
              <Text fontSize="sm">{game?.level}</Text>
            </GridItem>

            <GridItem>
              <Text fontWeight="bold">1st Prize:</Text>
              <Text fontSize="sm">${game?.first_prize}</Text>
            </GridItem>

            <GridItem>
              <Text fontWeight="bold">2nd Prize:</Text>
              <Text fontSize="sm">${game?.second_prize}</Text>
            </GridItem>
          </Grid>
        </Box>

        {/* Challenge Video Section */}
        {game?.video_link && (
          <Box my={6}>
            <Heading size="lg" color="purple.700" mb={2}>
              Challenge Video
            </Heading>
            <iframe
              width="100%"
              height="400"
              src={formatYouTubeURL(game.video_link)}
              title="Challenge Video"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </Box>
        )}

        {/* Enroll Button */}
        <Button
          colorScheme="teal"
          isLoading={loading}
          isDisabled={!game || !UserState.value.data?.navigationAllowed}
          onClick={() => {
            setLoading(true);
            handleSubmit();
          }}
          mt={6}
          width="100%"
        >
          Participate
        </Button>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Payment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {!proceed ? (
              <Stack dir="column">
                <Text fontSize="lg" color={"orange.600"}>
                  You already have an active subscription. This Elevator Pitch
                  game requires a separate participation fee. Proceeding will
                  initiate another active subscription entry for this game.
                </Text>

                <Button
                  onClick={() => {
                    setProceed(true);
                  }}
                  colorScheme="purple"
                  my={2}
                >
                  Proceed
                </Button>
              </Stack>
            ) : (
              <Stack dir="column">
                <SquareCheckout
                  amount={Number(paymentData.price)}
                  user={UserState.value.data?.id}
                  plan={"elevator"}
                  gameId={paymentData?.game}
                  onElevatorPayment={(intentId) => {
                    onClose();
                    setLoading(true);
                    handleSubmit(intentId, paymentData.price);
                  }}
                />
              </Stack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
