"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Stack,
  Input,
  useDisclosure,
  Select,
  Center,
  Spinner,
  FormLabel,
  Flex,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";
import TableData from "@/components/ui/TableData";

export default function Page() {
  const [settings, setSettings] = useState([]);
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [label, setLabel] = useState("");
  const [price, setPrice] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onClose: onAddModalClose,
  } = useDisclosure();
  const [loading, setLoading] = useState(true);
  const [newPackage, setNewPackage] = useState("");
  const [newPackagePrice, setNewPackagePrice] = useState("");

  const packageOptions = ["Silver", "Iridium", "Gold", "Platinum"];
  const [percentage, setPercentage] = useState("");
  const [percentageID, setPercentageID] = useState("");
  const [categories, setCategories] = useState([]);

  const toast = useToast();
  const {
    isOpen: isOpenCategory,
    onOpen: onOpenCategory,
    onClose: onCloseCategory,
  } = useDisclosure();
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchTriviaSettings();
    fetchSettings();
  }, []);

  async function fetchTriviaSettings() {
    axios.get("/api/trivia/settings").then((response) => {
      setPercentage(response.data.referral_incentive_percentage);
      setPercentageID(response.data.id);
    });
  }

  async function fetchCategories() {
    axios.get("/api/categories").then((response) => {
      setCategories(response.data);
    });
  }

  async function fetchSettings() {
    axios
      .get("/api/settings")
      .then((response) => {
        setSettings(response.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const handleEditSetting = (setting) => {
    setSelectedSetting(setting);
    setLabel(setting.label);
    setPrice(setting.price);
    onOpen();
  };

  const handleSaveSetting = async () => {
    setLoading(true);
    try {
      await axios
        .put(`/api/settings`, {
          id: selectedSetting.id,
          label,
          price,
        })
        .then(() => {
          fetchSettings();
          onClose();
        });
      callSuccessToast();
    } catch (error) {
      console.error("Error updating setting:", error);
      callFailedToast();
    } finally {
      setLoading(false);
    }
  };

  const existingPackages = settings.map((setting) => setting.label);
  const availablePackages = packageOptions.filter(
    (pkg) => !existingPackages.includes(pkg)
  );

  const handleAddPackage = () => {
    if (newPackage && newPackagePrice) {
      setLoading(true);
      axios
        .post(`/api/settings`, {
          label: newPackage,
          price: newPackagePrice,
        })
        .then(() => {
          fetchSettings();
          onAddModalClose();
          setNewPackage("");
          setNewPackagePrice("");
          setLoading(false);
        });
    }
  };

  async function handleUpdateTriviaSettings() {
    setLoading(true);
    try {
      await axios
        .put(`/api/trivia/settings`, {
          percentage: percentage,
          id: percentageID,
        })
        .then(() => {
          fetchTriviaSettings();
          callSuccessToast();
        });
    } catch (error) {
      console.error("Error updating trivia settings:", error);
      callFailedToast();
    } finally {
      setLoading(false);
    }
  }

  function callSuccessToast() {
    toast({
      title: "Setting Updated",
      description: "Setting has been updated successfully",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  }
  function callFailedToast() {
    toast({
      title: "Setting Update Failed",
      description: "Setting update failed. Please try again.",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  }

  const handleAddNewCategory = () => {
    setLoading(true);
    axios
      .post("/api/categories", { value: newCategory })
      .then(() => {
        onCloseCategory();
        fetchCategories();
        callSuccessToast();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDeleteCategory = (val) => {
    axios
      .delete(`/api/categories/${val}`)
      .then(() => {
        onCloseCategory();
        fetchCategories();
        callSuccessToast();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const RenderCategoriesTable = useCallback(() => {
    const [currentPage, setCurrentPage] = useState(1);
    return (
      <TableData
        data={categories}
        columns={[{ key: "value", value: "Name" }]}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        button={true}
        buttonText={"Remove"}
        onButtonClick={(val) => {
          setLoading(true);
          handleDeleteCategory(val);
        }}
      />
    );
  }, [categories]);

  return (
    <>
      {loading ? (
        <Center w={"100%"} height={"100vh"}>
          <Spinner />
        </Center>
      ) : (
        <Box p={8} bg="white">
          <Heading mb={6} color="purple.700">
            Package Settings
          </Heading>
          {availablePackages?.length > 0 && (
            <Button colorScheme="green" mb={4} onClick={onAddModalOpen}>
              Add Package
            </Button>
          )}

          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Label</Th>
                <Th>Price</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {settings.length > 0 ? (
                settings.map((setting, index) => (
                  <Tr key={setting.id}>
                    <Td>{index + 1}</Td>
                    <Td>{setting.label}</Td>
                    <Td>${setting.price}</Td>
                    <Td>
                      <Button
                        colorScheme="blue"
                        onClick={() => handleEditSetting(setting)}
                      >
                        Edit
                      </Button>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={4} textAlign="center">
                    No settings found.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>

          <Heading my={6} color="purple.700">
            Trivia Settings
          </Heading>

          <Stack spacing={4}>
            <FormLabel>Referral incentive percentage</FormLabel>
            <Flex>
              <Input
                type="number"
                placeholder="Enter referral incentive percentage"
                value={percentage ? percentage : ""}
                onChange={(e) => {
                  setPercentage(Number(e.target.value));
                }}
              />
              <Button
                isDisabled={!percentage}
                colorScheme="blue"
                ml={3}
                onClick={handleUpdateTriviaSettings}
              >
                Update
              </Button>
            </Flex>
          </Stack>

          <Heading my={6} color="purple.700">
            Categories
          </Heading>

          <Button colorScheme="blue" onClick={onOpenCategory}>
            Add New Category
          </Button>

          <RenderCategoriesTable />

          <Modal isOpen={isAddModalOpen} onClose={onAddModalClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Add New Package</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Stack spacing={4}>
                  <Select
                    placeholder="Select Package"
                    value={newPackage}
                    onChange={(e) => setNewPackage(e.target.value)}
                  >
                    {availablePackages.map((pkg) => (
                      <option key={pkg} value={pkg}>
                        {pkg}
                      </option>
                    ))}
                  </Select>
                  <Input
                    placeholder="Price"
                    type="number"
                    step="0.01"
                    value={newPackagePrice}
                    onChange={(e) => setNewPackagePrice(e.target.value)}
                  />
                </Stack>
              </ModalBody>
              <ModalFooter>
                <Button
                  isLoading={loading}
                  colorScheme="green"
                  onClick={handleAddPackage}
                  isDisabled={!newPackage || !newPackagePrice}
                >
                  Add Package
                </Button>
                <Button ml={3} onClick={onAddModalClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Edit Setting Modal */}
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Edit Setting</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Stack spacing={4}>
                  <Input
                    placeholder="Label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  />
                  <Input
                    placeholder="Price"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </Stack>
              </ModalBody>
              <ModalFooter>
                <Button
                  isLoading={loading}
                  colorScheme="blue"
                  onClick={handleSaveSetting}
                >
                  Update Setting
                </Button>
                <Button ml={3} onClick={onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          <Modal isOpen={isOpenCategory} onClose={onCloseCategory}>
            <ModalOverlay />
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
        </Box>
      )}
    </>
  );
}
