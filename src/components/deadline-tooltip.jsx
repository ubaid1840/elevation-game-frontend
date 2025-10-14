import { Box, ListItem, Tooltip, UnorderedList } from "@chakra-ui/react"


const DeadlineTooltip = ({ children }) => {

    return (
        <Tooltip fontSize={'md'} hasArrow label={
            <Box p={2}>
                <UnorderedList>

                    <ListItem>This is the estimated date when the game may close or advance. The actual end depends on activity — the game only closes when all spots are filled, the admin advances it, or it becomes inactive.</ListItem>

                </UnorderedList>
            </Box>
        } >
            {children}
        </Tooltip>
    )
}

export default DeadlineTooltip