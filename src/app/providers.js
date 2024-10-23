"use client"
import { ChakraProvider, defineStyleConfig, extendTheme } from '@chakra-ui/react'
import { PrimeReactProvider } from 'primereact/api';

export function Providers({ children }) {


    const InputStyles = {
        variants: {
            outline: {
                field: {
                    borderColor: '#D0D5DD',
                    bg: '#FFFFFF',
                    _focus: {
                        boxShadow: "0px 0px 3px 3px #b2d8d8",
                        borderColor: '#b2d8d8'
                    },
                    _hover: {
                        borderColor: '#b2d8d8'
                    },
                    _disabled: {
                        backgroundColor: '#F9FAFB',
                        borderColor: '#D0D5DD',
                        color: '#667085',
                        boxShadow: "0px 0px 1px 1px #1018280D",
                        opacity: 1,
                        fontSize: '14px'
                    }
                },
            },
        },
    };

    const SelectStyles = {
        variants: {
            outline: {
                field: {
                    backgroundColor: '#ffffff',
                    borderColor: '#D0D5DD',
                    _focus: {
                        boxShadow: "0px 0px 3px 3px #b2d8d8",
                        borderColor: '#b2d8d8'
                    },
                    _hover: {
                        borderColor: '#b2d8d8'
                    },
                },
            },
        },
    };

    const TextareaStyles = {
        variants: {
            outline: {
                backgroundColor: '#FFFFFF',
                borderColor: '#D0D5DD',
                _focus: {
                    boxShadow: "0px 0px 3px 3px #b2d8d8",
                    borderColor: '#b2d8d8'
                },
                _hover: {
                    borderColor: '#b2d8d8'
                },
                _disabled: {
                    backgroundColor: '#F9FAFB',
                    borderColor: '#D0D5DD',
                    color: '#667085',
                    boxShadow: "0px 0px 1px 1px #1018280D",
                    opacity: 1,
                    fontSize: '14px'
                }
            },
        },
    };

    const TextStyle = {
        variants: {
            'heading': {
                fontWeight: "600",
                fontSize: '30px',
                color: '#000000',
                width: 'inherit'
            },
            'description': {
                color: '#667085',
                fontWeight: '400',
                fontSize: '16px',
                width: 'inherit'

            },
            'subheading': {
                fontSize: "14px",
                fontWeight: "500 ",
                color: '#344054',
                width: 'inherit'

            },
            'link': {
                color: '#66b2b2',
                fontWeight: '400',
                fontSize: '16px',
                width: 'inherit'

            },
        },
    };

    const customTheme = extendTheme({
        components: {
            Input: InputStyles,
            Select: SelectStyles,
            Textarea: TextareaStyles,
            Text: TextStyle
        },
    });

    return (


        <ChakraProvider theme={customTheme}>
            <PrimeReactProvider>
                {children}
            </PrimeReactProvider>
        </ChakraProvider>



    )
}