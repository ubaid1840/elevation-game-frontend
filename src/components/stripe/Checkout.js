"use client"

import convertToSubcurrency from "@/lib/ConvertToSubcurrency"
import { Button, Spinner } from "@chakra-ui/react"
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import axios from "axios"
import { useEffect, useState } from "react"
const CheckoutPage = ({ amount, userID, plan }) => {
    const stripe = useStripe()
    const elements = useElements()
    const [clientSecret, setClientSecret] = useState(null)
    const [errorMessage, setErrorMessage] = useState()
    const [loading, setLoading] = useState(false)


    useEffect(() => {
        axios.post("/api/create-payment-intent", {
            amount: convertToSubcurrency(amount),
            plan : plan
        })
            .then((response) => {
                setClientSecret(response.data.clientSecret)
            })
    }, [amount])

  

    async function handleSubmit() {


        if (!stripe || !elements) {
            return
        }

        const { error: submitError } = await elements.submit()

        if (submitError) {
            setErrorMessage(submitError.message)
            setLoading(false)
            return
        }

        const { error } = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams: { return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?amount=${amount}&plan=${plan}` }
        })
           
        if (error) {
            setErrorMessage(error.message)
            setLoading(false)
        }

    }
    if (!clientSecret || !stripe || !elements) {
        return (
            <Spinner />
        )
    }
    return (
        <form >

            {clientSecret && <PaymentElement />}
            {errorMessage && <div>{errorMessage}</div>}
            <Button onClick={() => {
                setLoading(true)
                handleSubmit()
            }} isDisabled={!stripe || !elements} isLoading={loading} w={"100%"} bg="black" color={"white"} height={'50px'} mt={2}>Pay ${amount}</Button>
        </form>
    )
}

export default CheckoutPage