import React from 'react';
import ReactDOM from 'react-dom/client';
import { client, ApolloProvider } from './ApolloClient';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>
);