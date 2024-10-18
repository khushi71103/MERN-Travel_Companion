// src/ApolloClient.js
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

// Create the Apollo Client instance
const client = new ApolloClient({
    uri: 'http://localhost:8800/graphql', // Adjust if needed
    cache: new InMemoryCache(),
});

// Export the client and ApolloProvider for use in your application
export { client, ApolloProvider };
