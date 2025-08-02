const { SquareClient, SquareEnvironment } = require("square");


const client = new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN, environment: process.env.NODE_ENV === 'development' ? SquareEnvironment.Sandbox : SquareEnvironment.Production,
});

export default client