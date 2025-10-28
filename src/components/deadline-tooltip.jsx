import { Box, ListItem, Tooltip, UnorderedList } from "@chakra-ui/react"


const DeadlineTooltip = ({ children }) => {

    return (
        <Tooltip fontSize={'md'} hasArrow label={
            <Box p={2}>
                <UnorderedList>

                    <ListItem>This is the planned end date for the game. The administrator may extend or start the game early if all spots are not filled. The actual close date will be recorded once the game is processed.</ListItem>

                </UnorderedList>
            </Box>
        } >
            {children}
        </Tooltip>
    )
}

export default DeadlineTooltip