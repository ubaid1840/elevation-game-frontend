import { Img } from "@chakra-ui/react";


export default function Logo({type}) {
    return (
        <div style={{ display: "flex" }}>
             <Img  height={'50px'} src={"/logo.png"} />
        </div>
    )
}