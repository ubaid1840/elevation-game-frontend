"use client";

import { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import axios from "axios";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";

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
  const [loading, setLoading] = useState(false);
  const [newPackage, setNewPackage] = useState("");
  const [newPackagePrice, setNewPackagePrice] = useState("");
  const [dataLoading, setDataLoading] = useState(true);

  const packageOptions = ["Silver", "Iridium", "Gold", "Platinum"];

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    axios
      .get("/api/settings")
      .then((response) => {
        setSettings(response.data);
      })
      .finally(() => {
        setDataLoading(false);
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
    } catch (error) {
      console.error("Error updating setting:", error);
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

  return (
    <>
      {dataLoading ? (
        <Center w={"100%"} height={"100vh"}>
          <Spinner />
        </Center>
      ) : (
        <Box p={8} bg="white">
          <Heading mb={6} color="purple.700">
            Settings
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
        </Box>
      )}
    </>
  );
}
