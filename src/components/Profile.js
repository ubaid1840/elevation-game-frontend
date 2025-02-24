"use client";
import {
    Box,
    Heading,
    FormControl,
    FormLabel,
    Input,
    Button,
    VStack,
    useToast,
    Flex,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Text,
    Skeleton,
    Avatar,
    SkeletonCircle,
} from "@chakra-ui/react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import Sidebar from "./sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import { UserContext } from "@/store/context/UserContext";
import { app, auth, storage } from "@/config/firebase";
import { updatePassword, getAuth, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { initializeApp } from "firebase/app";

export default function ProfilePage({ page }) {
    const { state: UserState, setUser } = useContext(UserContext);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        password: "",
        confirmPassword: "",
        currentPassword: "",
    });
    const [isPasswordResetVisible, setIsPasswordResetVisible] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const toast = useToast();
    const [image, setImage] = useState(null)
    const inputRef = useRef()
    const [imageLoading, setImageLoading] = useState(true)

    useEffect(() => {
        if (UserState.value.data?.id) {
            setFormData({
                name: UserState.value.data?.name || "",
                phone: UserState.value.data?.phone || "",
                password: "",
                confirmPassword: "",
                currentPassword: "",
            });
            getDisplayPicture()
        }
    }, [UserState.value.data]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEditModalOpen = () => setIsEditModalOpen(true);
    const handleEditModalClose = () => setIsEditModalOpen(false);
    const handlePasswordResetToggle = () => setIsPasswordResetVisible(!isPasswordResetVisible);

    const handlePasswordUpdate = async () => {
        if (!formData.password || !formData.confirmPassword) {
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Passwords do not match.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const user = auth.currentUser;
        if (user) {
            const credential = EmailAuthProvider.credential(user.email, formData.currentPassword);

            reauthenticateWithCredential(user, credential)
                .then(() => {
                    updatePassword(user, formData.password)
                        .then(() => {
                            handlePasswordResetToggle()
                            toast({
                                title: "Password updated successfully.",
                                status: "success",
                                duration: 3000,
                                isClosable: true,
                            });
                        })
                        .catch((error) => {
                            toast({
                                title: "Error",
                                description: error.message,
                                status: "error",
                                duration: 3000,
                                isClosable: true,
                            });
                        });
                })
                .catch((error) => {
                    toast({
                        title: "Reauthentication failed.",
                        description: error.message,
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                });
        }
    };

    const handleNamePhoneUpdate = async () => {
        handleEditModalClose();
        axios
            .put(`/api/users/${UserState.value.data?.id}`, {
                name: formData.name,
                phone: formData.phone,
            })
            .then(() => {
                let temp = UserState.value.data;
                temp.name = formData.name;
                temp.phone = formData.phone;
                setUser(temp);
                toast({
                    title: "Profile updated successfully.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            })
            .catch((error) => {
                toast({
                    title: "Error",
                    description: error.response.data.message,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            });
    };


    const handleImage = (event) => {
        const fileList = Array.from(event.target.files);
        uploadImage(fileList[0]);
    };

    const uploadImage = async (imageToUpload) => {
        setImageLoading(true)

        const metadata = {
            contentType: "image/png",
        };
        const storageRef = ref(storage, `${UserState.value.data.email}/images/dp.png`);
        const uploadTask = uploadBytesResumable(
            storageRef,
            imageToUpload,
            metadata
        );
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log("Upload is " + progress + "% done");
                switch (snapshot.state) {
                    case "paused":
                        console.log("Upload is paused");
                        break;
                    case "running":
                        console.log("Upload is running");
                        break;
                }
            },
            (error) => {
                setImageLoading(false)
                toast({
                    title: "Error",
                    description: "Error saving image",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            },
            () => {
                setImageLoading(false)
                toast({
                    title: "Picture Saved",
                    description: "Profile picture updated successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });

                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setImage(downloadURL);
                });
            },

        );
    };


    async function getDisplayPicture() {

        const imageRef = ref(storage, `${UserState.value.data.email}/images/dp.png`);
        getDownloadURL(imageRef)
            .then((url) => {
                if (url) {
                    setImage(url);
                }
            })
            .catch((error) => {
                console.log(error?.message)
            }).finally(() => {
                setImageLoading(false)
            })
    }


    const RenderImage = useCallback(() => {
        return (
            <>
                <Avatar _hover={{ cursor: 'pointer' }} size="4xl" src={image} name={UserState.value.data?.name} onClick={() => {
                    if (inputRef.current) inputRef.current.click();
                }} />
                <input
                    style={{ display: "none" }}
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple={false}
                    onChange={(e) => handleImage(e)}
                ></input>
            </>

        )
    }, [image, imageLoading]);

    return (
        <>
            <Flex justify="center" align="center" minHeight="100vh" bg="white">
                <Box
                    maxWidth="400px"
                    width="100%"
                    bg="white"
                    boxShadow="xl"
                    borderRadius="lg"
                    p={6}
                >
                    <Heading as="h2" size="lg" color="purple.500" textAlign="center" mb={6}>
                        Profile Settings
                    </Heading>
                    <VStack spacing={4}>
                        {imageLoading ?
                            <SkeletonCircle size='40' />
                            :
                            <RenderImage />
                        }
                        <VStack
                            align="flex-start"
                            bg="gray.50"
                            p={4}
                            borderRadius="md"
                            boxShadow="base"
                            spacing={2}
                            width="100%"
                        >
                            <Box>
                                <Text fontSize="sm" color="purple.700" fontWeight="bold">
                                    Name:
                                </Text>
                                <Text fontSize="md" color="gray.800">
                                    {UserState.value.data?.name || "Not provided"}
                                </Text>
                            </Box>
                            <Box>
                                <Text fontSize="sm" color="purple.700" fontWeight="bold">
                                    Phone:
                                </Text>
                                <Text fontSize="md" color="gray.800">
                                    {UserState.value.data?.phone || "Not provided"}
                                </Text>
                            </Box>
                        </VStack>

                        <Button colorScheme="purple" width="100%" onClick={handleEditModalOpen}>
                            Edit Name and Phone
                        </Button>

                        {isPasswordResetVisible ? (
                            <>
                                <FormControl id="currentPassword">
                                    <FormLabel color="purple.700">Current Password</FormLabel>
                                    <Input
                                        type="password"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        placeholder="Enter current password"
                                        focusBorderColor="green.500"
                                    />
                                </FormControl>
                                <FormControl id="password">
                                    <FormLabel color="purple.700">New Password</FormLabel>
                                    <Input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter new password"
                                        focusBorderColor="green.500"
                                    />
                                </FormControl>
                                <FormControl id="confirmPassword">
                                    <FormLabel color="purple.700">Confirm Password</FormLabel>
                                    <Input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm new password"
                                        focusBorderColor="green.500"
                                    />
                                </FormControl>
                                <Button
                                    isDisabled={
                                        !formData.password ||
                                        !formData.confirmPassword ||
                                        formData.password !== formData.confirmPassword
                                    }
                                    colorScheme="green"
                                    width="100%"
                                    onClick={handlePasswordUpdate}
                                >
                                    Update Password
                                </Button>
                            </>
                        ) : (
                            <Button
                                colorScheme="purple"
                                width="100%"
                                onClick={handlePasswordResetToggle}
                            >
                                Change Password
                            </Button>
                        )}
                    </VStack>
                </Box>

                <Modal isOpen={isEditModalOpen} onClose={handleEditModalClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Edit Name and Phone</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <FormControl id="name">
                                <FormLabel>Name</FormLabel>
                                <Input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your new name"
                                    focusBorderColor="green.500"
                                />
                            </FormControl>
                            <FormControl id="phone" mt={4}>
                                <FormLabel>Phone Number</FormLabel>
                                <Input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter your new phone number"
                                    focusBorderColor="green.500"
                                />
                            </FormControl>
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme="purple" mr={3} onClick={handleNamePhoneUpdate}>
                                Save Changes
                            </Button>
                            <Button variant="ghost" onClick={handleEditModalClose}>
                                Cancel
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Flex>
        </>
    );
}
