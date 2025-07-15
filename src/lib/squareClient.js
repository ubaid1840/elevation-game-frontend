const { SquareClient, SquareEnvironment } = require("square");


const client = new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN, environment: SquareEnvironment.Production
});

export default client