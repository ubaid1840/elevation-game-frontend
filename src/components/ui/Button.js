import { Button as ChakraButton } from "@chakra-ui/react"

const Button = ({ children, ...props }) => {
  return (
    <ChakraButton
      borderRadius={30}
      fontSize="18px"
      fontWeight="700"
      backgroundColor={"white"}
      color="#311748FF"
      variant="solid"
      border={'2px solid'}
      borderColor={'white'}
      _hover={{ bg:'#311748FF', color : 'white', borderColor : '#311748FF' }}
      {...props}
    >
      {children}
    </ChakraButton>
  )
}

export const GhostButton = ({ children, ...props }) => {
  return <ChakraButton
    padding={'20px'}
    borderRadius={30}
    fontSize="18px"
    fontWeight="600"
    backgroundColor={"#311748FF"}
    color={"white"}
    border={'2px solid'}
    _hover={{ opacity: 0.7 }}
    {...props}
  >
    {children}
  </ChakraButton>
}

export const DangerButton = ({ children, ...props }) => {
  return <ChakraButton

    boxShadow={"0px 0px 1px 1px #1018280D"}
    border="1px solid"
    borderColor="#FDA29B"
    backgroundColor="#FFFFFF"
    fontSize="14px"
    color="#B42318"
    fontWeight="500"
    variant="solid"
    _hover={{ opacity: 0.7 }}
    {...props}
  >
    {children}
  </ChakraButton>
}

export default Button