import { theme } from "@/data/data";
import { Image, Text } from "@chakra-ui/react";


export default function Logo() {
    return (
        <div style={{ display: "flex" }}>
           
            <Text ml={1} color={"purple.800"} fontSize="18px" fontWeight="600">
                Game
            </Text>
            <Text color={"purple.600"} fontSize="18px">
                Elevation
            </Text>
        </div>
    )
}