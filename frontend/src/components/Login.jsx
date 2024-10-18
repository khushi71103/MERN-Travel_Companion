import { Cancel, Room } from "@material-ui/icons";
import { useRef, useState } from "react";
import { useMutation, gql } from "@apollo/client";
import "./login.css";

// Define the login mutation
const LOGIN_USER = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      username
      token
    }
  }
`;

export default function Login({ setShowLogin, setCurrentUsername, myStorage }) {
  const [error, setError] = useState(false);
  const usernameRef = useRef();
  const passwordRef = useRef();

  // Use the login mutation
  const [login] = useMutation(LOGIN_USER, {
    onCompleted: (data) => {
      const { username, token } = data.login;
      setCurrentUsername(username);
      myStorage.setItem('user', username);
      myStorage.setItem('token', token); // Store the JWT token
      setShowLogin(false);
    },
    onError: () => {
      setError(true);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = {
      username: usernameRef.current.value,
      password: passwordRef.current.value,
    };

    // Call the mutation with the user credentials
    await login({ variables: user });
  };

  return (
    <div className="loginContainer">
      <div className="logo">
        <Room className="logoIcon" />
        <span>LamaPin</span>
      </div>
      <form onSubmit={handleSubmit}>
        <input autoFocus placeholder="username" ref={usernameRef} />
        <input
          type="password"
          min="6"
          placeholder="password"
          ref={passwordRef}
        />
        <button className="loginBtn" type="submit">
          Login
        </button>
        {error && <span className="failure">Something went wrong!</span>}
      </form>
      <Cancel className="loginCancel" onClick={() => setShowLogin(false)} />
    </div>
  );
}
