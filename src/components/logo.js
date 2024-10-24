import { theme } from "@/data/data";
import { Image, Text } from "@chakra-ui/react";


export default function Logo({type}) {
    return (
        <div style={{ display: "flex" }}>
           
            <Text ml={1} color={type ? 'white' : "purple.800"} fontSize="18px" fontWeight="600">
                Game
            </Text>
            <Text color={ type ? 'white' : "purple.600"} fontSize="18px">
                Elevation
            </Text>
        </div>
    )
}