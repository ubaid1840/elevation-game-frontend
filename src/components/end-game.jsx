"use client"

import { Box, Button, Flex, FormControl, FormLabel, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Textarea, useDisclosure, useToast } from "@chakra-ui/react"
import axios from "axios"
import { useState } from "react"


const EndGame = ({ type = "", gameid = null, onRefresh, onClick, isOpen, onClose }) => {
    const [loading, setLoading] = useState(false)
    const [reason, setReason] = useState("")
   
    const toast = useToast();

    function handleClose() {

        onClose()
        setReason("")
    }

    async function handleSubmit() {
        if (!gameid) return

        setLoading(true)

        try {
            await axios.post(`/api/endgame`, {
                type,
                game_id: gameid,
                reason
            })
            onRefresh()
            handleClose()

        } catch (e) {

            toast({
                title: "Error",
                description: e.response.data.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });

        } finally {
            setLoading(false)
        }




    }



    return (
        <>
            <Button
                colorScheme="red"
                size={"lg"}
                onClick={onClick}
                mx={4}
                mb={2}
            >
                End Game
            </Button>

            <Modal isOpen={isOpen} onClose={handleClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>End Game</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl mt={6}>
                            <FormLabel htmlFor="reason" fontWeight="bold">
                                Reason:
                            </FormLabel>
                            <Textarea

                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Type your reason here..."
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" onClick={handleClose}>
                            Close
                        </Button>
                        <Button
                        isDisabled={loading || !reason || !gameid}
                            ml={3}
                            isLoading={loading}
                            colorScheme="purple"
                            onClick={() => {
                                handleSubmit()
                            }}
                        >
                            Submit
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default EndGame