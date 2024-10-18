const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User"); // Import User model
const Pin = require("./models/Pin"); // Import Pin model
const cors = require("cors"); // Import cors

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => console.log(err));

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
    desc: String!
    rating: Int!
    lat: Float!
    long: Float!
    username: String!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    getUsers: [User]
    getPins: [Pin]
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!): AuthPayload!
    addPin(title: String!, desc: String!, rating: Int!, lat: Float!, long: Float!, username: String!): Pin
    login(username: String!, password: String!): AuthPayload!
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
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        throw new Error("Username or email already exists.");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = new User({ username, email, password: hashedPassword });
      const user = await newUser.save();

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      return { token, user };
    },
    login: async (parent, { username, password }) => {
      const user = await User.findOne({ username });
      if (!user) {
        throw new Error("User not found.");
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error("Invalid password.");
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      return { token, user };
    },
    addPin: async (parent, { title, desc, rating, lat, long, username }) => {
      const newPin = new Pin({ title, desc, rating, lat, long, username });
      return await newPin.save();
    },
  },
};

// Create an instance of Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Start the server
const startServer = async () => {
  await server.start();
  server.applyMiddleware({ app });

  app.listen({ port: 8800 }, () => {
    console.log(`Backend server is running at http://localhost:8800${server.graphqlPath}`);
  });
};

startServer().catch((error) => {
  console.error("Error starting the server:", error);
});
