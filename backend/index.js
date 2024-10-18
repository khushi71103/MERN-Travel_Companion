const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => console.log(err));

// Define your Mongoose schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
});

const PinSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
});

// Create Mongoose models
const User = mongoose.model("User", UserSchema);
const Pin = mongoose.model("Pin", PinSchema);

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
    getUsers: async () => {
      return await User.find();
    },
    getPins: async () => {
      return await Pin.find();
    },
  },
  Mutation: {
    addUser: async (parent, { username, email }) => {
      const newUser = new User({ username, email });
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

// Apply middleware to your Express app
server.applyMiddleware({ app });

// Start your Express server
app.listen({ port: 8800 }, () => {
  console.log(`Backend server is running at http://localhost:8800${server.graphqlPath}`);
});
