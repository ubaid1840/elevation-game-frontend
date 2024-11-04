"use client"

import { useState, useEffect } from "react";
import { Box, Heading, Table, Thead, Tr, Th, Tbody, Td, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Stack, Input, useDisclosure } from "@chakra-ui/react";
import axios from "axios";
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SideBarItems";

export default function Page() {
  const [settings, setSettings] = useState([]);
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [label, setLabel] = useState("");
  const [price, setPrice] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch settings data
    async function fetchSettings() {
      try {
        const response = await axios.get("/api/settings");
        setSettings(response.data);
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    }
    fetchSettings();
  }, []);

  const handleEditSetting = (setting) => {
    setSelectedSetting(setting);
    setLabel(setting.label);
    setPrice(setting.price);
    onOpen();
  };

  const handleSaveSetting = async () => {
    setLoading(true);
    try {
      await axios.put(`/api/settings`, {
        id: selectedSetting.id,
        label,
        price,
      });
      // Update state and close modal
      setSettings((prevSettings) =>
        prevSettings.map((s) =>
          s.id === selectedSetting.id ? { ...s, label, price } : s
        )
      );
      onClose();
    } catch (error) {
      console.error("Error updating setting:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sidebar LinkItems={GetLinkItems("admin")}>
      <Box p={8} bg="white">
        <Heading mb={6} color="purple.700">
          Settings Management
        </Heading>

        {/* Settings Table */}
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
              settings.map((setting) => (
                <Tr key={setting.id}>
                  <Td>{setting.id}</Td>
                  <Td>{setting.label}</Td>
                  <Td>${setting.price}</Td>
                  <Td>
                    <Button colorScheme="blue" onClick={() => handleEditSetting(setting)}>
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

        {/* Modal for Edit Setting */}
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
    </Sidebar>
  );
}
