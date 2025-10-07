"use client";
import { db } from "@/config/firebase";
import { UserContext } from "@/store/context/UserContext";
import { CloseIcon } from "@chakra-ui/icons";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  Stack,
  Text,
  Textarea,
  useDisclosure,
  VStack
} from "@chakra-ui/react";
import axios from "axios";
import { addDoc, collection } from "firebase/firestore";
import moment from "moment";
import { useRouter } from "next/navigation";
import { Calendar } from "primereact/calendar";
import { useContext, useEffect, useState } from "react";

export default function Page() {
  const [title, setTitle] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [gameDescription, setGameDescription] = useState("");
  const [selectedJudges, setSelectedJudges] = useState([]);
  const [rounds, setRounds] = useState("");
  const [category, setCategory] = useState("");
  const [totalSpots, setTotalSpots] = useState("");
  const [deadline, setDeadline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableJudges, setAvailableJudges] = useState([]);
  const [level, setLevel] = useState("");
  const router = useRouter();
  const { state: UserState } = useContext(UserContext);
  const [allCategories, setAllCategories] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newCategory, setNewCategory] = useState("");
  const [pitchInstruction, setPitchInstruction] = useState("");
  const [missingFields, setMissingFields] = useState([]);
  const {
    isOpen: isMissingOpen,
    onOpen: onMissingOpen,
    onClose: onMissingClose,
  } = useDisclosure();

  useEffect(() => {
    if (UserState.value.data?.id) {
      fetchData();
      fetchCategories();
    }
  }, [UserState.value.data]);

  async function fetchData() {
    axios.get("/api/users?role=judge").then((response) => {
      const temp = response.data?.filter(
        (item) => item.id !== UserState.value.data?.id
      );
      setAvailableJudges([...temp]);
    });
  }

  async function fetchCategories() {
    axios.get("/api/categories").then((response) => {
      setAllCategories(response.data);
    });
  }

  const handleAddJudge = (event) => {
    const selectedJudgeId = parseInt(event.target.value);
    const selectedJudge = availableJudges.find(
      (judge) => judge.id === selectedJudgeId
    );

    if (selectedJudge && !selectedJudges.includes(selectedJudge)) {
      setSelectedJudges([...selectedJudges, selectedJudge]);
    }
  };

  function isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  const validateForm = () => {
    let missing = [];

    if (!title.trim()) missing.push("Game Title");
    if (!videoLink.trim()) {
      missing.push("Video Link")

    } else if (!isValidUrl(videoLink)) {
      missing.push("Broken Video Link")
    }
    if (!gameDescription.trim()) missing.push("Game Description");
    if (!pitchInstruction.trim()) missing.push("Pitch Instructions");
    if (!level) missing.push("Tier");
    if (!rounds || Number(rounds) <= 0) missing.push("Number of Rounds");
    if (!totalSpots || Number(totalSpots) <= 0)
      missing.push("Total Spots cannot be zero or empty");
    if (!category) missing.push("Game Category");
    if (!deadline) missing.push("Deadline");

    return missing;
  };

  const handleInitiateGame = async () => {

    const missing = validateForm();
    if (missing.length > 0) {
      setMissingFields(missing);
      onMissingOpen();
      return;
    }

    setLoading(true)

    const data = {
      title,
      description: gameDescription,
      totalRounds: Number(rounds),
      category,
      spotsRemaining: Number(totalSpots),
      additional_judges: selectedJudges.map((judge) => judge.id),
      total_spots: Number(totalSpots),
      video_link: videoLink,
      creator_id: UserState.value.data?.id,
      deadline,
      currentround: 0,
      level,
      pitch_instruction: pitchInstruction,
    };


    try {
      await axios.post("/api/games", data)
      addDoc(collection(db, "notifications"), {
        to: "admin@gmail.com",
        title: "Game created",
        message: `${UserState.value.data?.name || UserState.value.data?.email
          } initiated new game - ${title} `,
        timestamp: moment().valueOf(),
        status: "pending",
      });
      router.push("/judge/elevator");
    } catch (error) {
      console.error("Error initiating game:", error);

    } finally {
      setLoading(false);
    }
  };

  const handleRemoveJudge = (index) => {
    const temp = selectedJudges.filter((item, i) => i !== index);
    setSelectedJudges([...temp]);
  };

  const RenderJudges = ({ item, index, onClick }) => {
    return (
      <Box
        borderWidth="1px"
        borderRadius="md"
        p={4}
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Text>{item.name}</Text>
        <CloseIcon
          color={"red"}
          _hover={{ opacity: 0.7, cursor: "pointer" }}
          onClick={() => onClick(index)}
        />
      </Box>
    );
  };

  const handleAddNewCategory = () => {
    axios.post("/api/categories", { value: newCategory }).then(() => {
      onClose();
      fetchCategories();
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
      <Box p={8} bg="white" opacity={isOpen ? 0.3 : 1}>
        <Heading mb={6} color="purple.700">
          Create Game
        </Heading>

        <FormControl mb={6}>
          <FormLabel htmlFor="title">Game Title</FormLabel>
          <Input
            id="title"
            placeholder="Enter game title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormControl>

        <FormControl mb={6}>
          <FormLabel htmlFor="videoLink">Video Link</FormLabel>
          <Input
            id="videoLink"
            type="url"
            placeholder="Enter video link"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
          />
        </FormControl>

        <FormControl mb={6}>
          <FormLabel htmlFor="gameDescription">Game Description</FormLabel>
          <Textarea
            id="gameDescription"
            placeholder="Describe the game, rules, judging criteria, and resources."
            value={gameDescription}
            onChange={(e) => setGameDescription(e.target.value)}
            minHeight="200px"
          />
        </FormControl>

        <FormControl mb={6}>
          <FormLabel htmlFor="pitchInstruction">Pitch Instructions</FormLabel>
          <Textarea
            id="pitchInstruction"
            placeholder="Describe pitch instructions."
            value={pitchInstruction}
            onChange={(e) => setPitchInstruction(e.target.value)}
            minHeight="200px"
          />
        </FormControl>

        {videoLink && (
          <Box mb={6}>
            <Text fontWeight="bold" mb={2}>
              Challenge Video:
            </Text>
            <iframe
              width="100%"
              height="315"
              src={formatYouTubeURL(videoLink)}
              title="Challenge Video"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </Box>
        )}

        <FormControl mb={6}>
          <FormLabel htmlFor="level">Tier</FormLabel>
          <Select
            value={level}
            id="level"
            onChange={(e) => setLevel(e.target.value)}
            placeholder="Select tier"
          >
            <option value={"Platinum"}>Platinum</option>
            <option value={"Gold"}>Gold</option>
            <option value={"Iridium"}>Iridium</option>
            <option value={"Silver"}>Silver</option>
          </Select>
        </FormControl>

        <FormControl mb={6}>
          <FormLabel htmlFor="rounds">Number of Rounds</FormLabel>
          <Input
            min={1}
            id="rounds"
            type="number"
            value={rounds}
            onChange={(e) => {
              const value = e.target.value;
              if (!isNaN(value) && value.trim() !== "") {
                setRounds(parseInt(value));
              } else {
                setRounds("")
              }
            }}
            placeholder="Enter number of rounds"
          />
        </FormControl>

        <FormControl mb={6}>
          <FormLabel htmlFor="totalSpots">Total Spots</FormLabel>
          <Input
            min={1}
            id="totalSpots"
            type="number"
            value={totalSpots}
            onChange={(e) => {
              const value = e.target.value;
              if (!isNaN(value) && value.trim() !== "") {
                setTotalSpots(parseInt(value));
              } else {
                setTotalSpots("")
              }
            }}
            placeholder="Enter total spots available"
          />
        </FormControl>

        <FormControl mb={6}>
          <FormLabel htmlFor="deadline">Deadline</FormLabel>
          <Box
            border={"1px solid"}
            borderColor={"#D0D5DD"}
            borderRadius={"md"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            height={"40px"}
            px={4}
          >
            <Calendar
              minDate={new Date()}
              id="deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.value)}
              showIcon
              className="custom-calendar"
              dateFormat="mm/dd/yy"
              style={{ width: "100%" }}
            />
          </Box>
        </FormControl>



        <FormControl mb={6}>
          <FormLabel htmlFor="category">Game Category</FormLabel>
          <Select
            id="category"
            placeholder="Select category"
            value={category}
            onChange={(e) => {
              if (e.target.value === "Add New Category") onOpen();
              else setCategory(e.target.value);
            }}
          >
            {allCategories.length > 0 &&
              allCategories.map((item, index) => (
                <option key={index} value={item?.value}>
                  {item?.value}
                </option>
              ))}

            <option value="Add New Category">Add New Category</option>
          </Select>
        </FormControl>

        <FormControl mb={6}>
          <FormLabel htmlFor="addJudge">Add Additional Judges</FormLabel>
          <Select
            id="addJudge"
            onChange={handleAddJudge}
            placeholder="Select a judge"
          >
            {availableJudges.map((judge) => (
              <option key={judge.id} value={judge.id}>
                {judge.name}
              </option>
            ))}
          </Select>
        </FormControl>

        <Stack spacing={4} mb={6}>
          <Text fontWeight="bold">Selected Judges:</Text>
          {selectedJudges.map((judge, index) => (
            <RenderJudges
              key={index}
              item={judge}
              index={index}
              onClick={handleRemoveJudge}
            />
          ))}
        </Stack>

        <Button
          isDisabled={
            loading
          }
          isLoading={loading}
          colorScheme="purple"
          onClick={() => {
            handleInitiateGame();
          }}
        >
          Initiate Game
        </Button>
      </Box>


      <AlertDialog isOpen={isMissingOpen} onClose={onMissingClose}>
        {/* <AlertDialogOverlay /> */}
        <AlertDialogContent borderWidth={2} borderColor={'#cccccc'}>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Missing Fields
          </AlertDialogHeader>

          <AlertDialogBody>
            <Text>Please fill in the following fields:</Text>
            <VStack align="start" mt={3} maxH={"60vh"} overflowY={"auto"}>
              {missingFields.map((field, index) => (
                <Text key={index} color="red.500">
                  - {field}
                </Text>
              ))}
            </VStack>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button onClick={onMissingClose}>OK</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Add New Category</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Input
                placeholder="Category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleAddNewCategory}>
              Save
            </Button>
            <Button ml={3} onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
