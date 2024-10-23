"use client";
import React, { useState } from "react";
import {
  Box,
  Heading,
  Stack,
  Text,
  Textarea,
  Button,
  Divider,
  FormControl,
  FormLabel,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";

// Sample data for a single game with more comments
const gameDetailData = {
  id: 1,
  title: "Game Idea 1",
  createdBy: "Judge A",
  remainingJudges: ["Judge B", "Judge C"],
  participants: [
    { id: 1, name: "Participant 1", videoLink: "https://example.com/video1" },
    { id: 2, name: "Participant 2", videoLink: "https://example.com/video2" },
    { id: 3, name: "Participant 3", videoLink: "https://example.com/video3" },
    { id: 4, name: "Participant 4", videoLink: "https://example.com/video4" },
    { id: 5, name: "Participant 5", videoLink: "https://example.com/video5" },
  ],
  comments: [
    { id: 1, user: "Participant 1", comment: "Can we add more rules?" },
    { id: 2, user: "Participant 2", comment: "What is the scoring system?" },
    { id: 3, user: "Participant 3", comment: "Is there a time limit?" },
    { id: 4, user: "Participant 4", comment: "How will the winner be determined?" },
    { id: 5, user: "Participant 5", comment: "Can we have a demo?" },
    { id: 6, user: "Participant 1", comment: "What materials are allowed?" },
    { id: 7, user: "Participant 2", comment: "Will there be any penalties?" },
    { id: 8, user: "Participant 3", comment: "Can we extend the deadline?" },
    { id: 9, user: "Participant 4", comment: "What is the prize pool?" },
    { id: 10, user: "Participant 5", comment: "Who are the judges?" },
  ],
  currentRound: 1,
  totalRounds: 5,
};

export default function GameDetailPage() {
  const [replies, setReplies] = useState({});
  const [replyText, setReplyText] = useState("");
  const [newComment, setNewComment] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [critique, setCritique] = useState("");
  const [score, setScore] = useState(0);

  const handleReplyChange = (commentId) => (event) => {
    setReplies({ ...replies, [commentId]: event.target.value });
  };

  const handleReplySubmit = (commentId) => {
    console.log(`Reply to Comment ID: ${commentId}`, replies[commentId]);
    setReplyText("");
    setReplies({ ...replies, [commentId]: "" });
  };

  const handleCommentChange = (event) => {
    setNewComment(event.target.value);
  };

  const handleCommentSubmit = () => {
    console.log(`New Comment Submitted: ${newComment}`);
    setNewComment("");
  };

  const handleNextRound = () => {
    if (gameDetailData.currentRound < gameDetailData.totalRounds) {
      console.log(`Proceeding to Round ${gameDetailData.currentRound + 1}`);
    } else {
      console.log("All rounds are completed.");
    }
  };

  const handleParticipantClick = (participant) => {
    setSelectedParticipant(participant);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCritique("");
    setScore(0);
  };

  const handleSubmitCritique = () => {
    console.log(`Critique for ${selectedParticipant.name}: ${critique}`);
    console.log(`Score for ${selectedParticipant.name}: ${score}`);
    handleModalClose();
  };

  return (
    <Sidebar LinkItems={GetLinkItems("judge")}>
      <Box p={8} bg="white">
        <Heading mb={6} color="purple.700">{gameDetailData.title}</Heading>

        <Text fontWeight="bold" color="purple.600">Created By: {gameDetailData.createdBy}</Text>
        
        <Text fontWeight="bold" color="purple.600" mt={4}>Remaining Judges:</Text>
        <Stack spacing={1} mb={6}>
          {gameDetailData.remainingJudges.map((judge, index) => (
            <Text key={index} color="purple.500">{judge}</Text>
          ))}
        </Stack>

        <Text fontWeight="bold" color="purple.600">Participants:</Text>
        <Stack spacing={2} mb={6}>
          {gameDetailData.participants.map((participant) => (
            <Text key={participant.id} color="purple.500">
              <Button variant="link" color="blue.500" onClick={() => handleParticipantClick(participant)}>
                {participant.name}
              </Button>: <a href={participant.videoLink} target="_blank" rel="noopener noreferrer" style={{ color: 'blue.500' }}>{participant.videoLink}</a>
            </Text>
          ))}
        </Stack>

        <Text fontWeight="bold" color="purple.600">Current Round: {gameDetailData.currentRound}/{gameDetailData.totalRounds}</Text>
        <Button colorScheme="purple" mt={4} onClick={handleNextRound}>
          Next Round
        </Button>

        <Text fontWeight="bold" color="purple.600" mt={6}>Comments:</Text>
        <Stack spacing={4} mb={6}>
          {gameDetailData.comments.map((comment) => (
            <Box key={comment.id} borderWidth="1px" borderRadius="md" p={3}>
              <Text fontWeight="bold">{comment.user}:</Text>
              <Text>{comment.comment}</Text>

              <Text
                color="blue.500"
                cursor="pointer"
                onClick={() => setReplies({ ...replies, [comment.id]: replies[comment.id] === undefined ? "" : undefined })}
              >
                {replies[comment.id] === undefined ? "Reply" : "Cancel"}
              </Text>

              {replies[comment.id] !== undefined && (
                <FormControl mt={4}>
                  <FormLabel htmlFor={`reply-${comment.id}`} fontWeight="bold">Your Reply:</FormLabel>
                  <Textarea
                    id={`reply-${comment.id}`}
                    value={replies[comment.id] || ""}
                    onChange={handleReplyChange(comment.id)}
                    placeholder="Type your reply here..."
                  />
                  <Button
                    colorScheme="purple"
                    mt={2}
                    onClick={() => handleReplySubmit(comment.id)}
                  >
                    Submit Reply
                  </Button>
                </FormControl>
              )}
            </Box>
          ))}
        </Stack>

        <FormControl mt={4}>
          <FormLabel htmlFor="new-comment" fontWeight="bold">Add a Comment:</FormLabel>
          <Textarea
            id="new-comment"
            value={newComment}
            onChange={handleCommentChange}
            placeholder="Type your comment here..."
          />
          <Button
            colorScheme="purple"
            mt={2}
            onClick={handleCommentSubmit}
          >
            Submit Comment
          </Button>
        </FormControl>

        {/* Modal for critique */}
        <Modal isOpen={isModalOpen} onClose={handleModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Critique for {selectedParticipant?.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <FormLabel htmlFor="critique" fontWeight="bold">Critique:</FormLabel>
                <Textarea
                  id="critique"
                  value={critique}
                  onChange={(e) => setCritique(e.target.value)}
                  placeholder="Type your critique here..."
                />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel htmlFor="score" fontWeight="bold">Score:</FormLabel>
                <NumberInput
                  id="score"
                  value={score}
                  onChange={(valueString) => setScore(parseFloat(valueString))}
                  min={0}
                  max={10}
                  precision={1}
                  step={0.1}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="purple" onClick={handleSubmitCritique}>
                Submit Critique
              </Button>
              <Button variant="ghost" onClick={handleModalClose} ml={3}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Sidebar>
  );
}
