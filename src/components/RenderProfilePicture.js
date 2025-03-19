const { default: getDisplayPicture } = require("@/lib/getDisplayPicture")
const { Avatar } = require("@chakra-ui/react")
const { useState, useEffect } = require("react")


const RenderProfilePicture = ({ email, name }) => {

    const [image, setImage] = useState(null)

    useEffect(() => {
        if (email) {
            getDisplayPicture(email).then((url) => {
                setImage(url)
            })
        }
    }, [email])

    return (
        <Avatar src={image} name={name} />
    )
}

export default RenderProfilePicture