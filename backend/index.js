const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./routes/users");
const pinRoute = require("./routes/pins");

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => console.log(err));

// Use routes
app.use("/api/users", userRoute);
app.use("/api/pins", pinRoute);

// Define GraphQL schema
const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
  }

  type Pin {
    id: ID!
    title: String!
    description: String
  }

  type Query {
    getUsers: [User]
    getPins: [Pin]
  }

  type Mutation {
    addUser(username: String!, email: String!): User
    addPin(title: String!, description: String): Pin
  }
`;

// Define resolvers
const resolvers = {
  Query: {
    getUsers: async () => await User.find(),
    getPins: async () => await Pin.find(),
  },
  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const newUser = new User({ username, email, password });
      return await newUser.save();
    },
    addPin: async (parent, { title, description }) => {
      const newPin = new Pin({ title, description });
      return await newPin.save();
    },
  },
};

// Create an instance of Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Create an async function to start the server
const startServer = async () => {
  await server.start();
  server.applyMiddleware({ app });

  app.listen({ port: 8800 }, () => {
    console.log(`Backend server is running at http://localhost:8800${server.graphqlPath}`);
  });
};

// Call the startServer function
startServer().catch((error) => {
  console.error("Error starting the server:", error);
});
