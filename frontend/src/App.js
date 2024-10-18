import * as React from 'react';
import { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { useQuery, useMutation, gql } from '@apollo/client';
import { MapPin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import StarIcon from '@mui/icons-material/Star';
import './app.css';

// Define GraphQL queries and mutations
const GET_PINS = gql`
  query GetPins {
    getPins {
      id
      title
      desc
      rating
      lat
      long
      username
      createdAt
    }
  }
`;

const ADD_PIN = gql`
  mutation AddPin($title: String!, $desc: String!, $rating: Int!, $lat: Float!, $long: Float!, $username: String!) {
    addPin(title: $title, desc: $desc, rating: $rating, lat: $lat, long: $long, username: $username) {
      id
      title
      desc
      rating
      lat
      long
      username
      createdAt
    }
  }
`;

const REGISTER_USER = gql`
  mutation AddUser($username: String!, $email: String!, $password: String!) {
    addUser(username: $username, email: $email, password: $password) {
      token
      user {
        id
        username
      }
    }
  }
`;

function MapApp() {
  const myStorage = window.localStorage;
  const [currentUsername, setCurrentUsername] = useState(myStorage.getItem('user'));
  const [pins, setPins] = useState([]);
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [newPlace, setNewPlace] = useState(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [star, setStar] = useState(0);
  const [viewport, setViewport] = useState({
    latitude: 47.040182,
    longitude: 17.071727,
    zoom: 4,
  });

  // States for registration
  const [showRegister, setShowRegister] = useState(false);
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const { loading, error, data } = useQuery(GET_PINS, {
    onCompleted: (data) => {
      console.log("Pins data received:", data.getPins); // Log the actual data here
      setPins(data.getPins);
    },
  });

  const [addPin] = useMutation(ADD_PIN);
  const [registerUser] = useMutation(REGISTER_USER);

  const handleMarkerClick = (id, lat, long) => {
    setCurrentPlaceId(id);
    setViewport({ ...viewport, latitude: lat, longitude: long });
  };

  const handleAddClick = (e) => {
    const [longitude, latitude] = e.lngLat;
    setNewPlace({
      lat: latitude,
      long: longitude,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPin = {
      title,
      desc,
      rating: star,
      lat: newPlace.lat,
      long: newPlace.long,
      username: currentUsername,
    };

    try {
      await addPin({
        variables: newPin,
        refetchQueries: [{ query: GET_PINS }],
      });
      setNewPlace(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    setCurrentUsername(null);
    myStorage.removeItem('user');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    console.log('Attempting to register user:', regUsername);
    try {
      const { data } = await registerUser({
        variables: {
          username: regUsername,
          email: regEmail,
          password: regPassword,
        },
      });
      const { token, user } = data.addUser;
      setCurrentUsername(user.username);
      myStorage.setItem('user', user.username); // Store username in local storage
      setShowRegister(false); // Close registration form
      console.log('Registration successful:', user.username);
    } catch (err) {
      console.error('Error during registration:', err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data</p>;

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <Map
        {...viewport}
        mapboxAccessToken="pk.eyJ1Ijoia2h1c2hpLWRldiIsImEiOiJjbTJlcTFtZ2cwMTFjMnJzOTIyMmlrbXlvIn0.tryEviFvIpwN8YGq178uaA"
        style={{ width: '100vw', height: '100vh' }}
        transitionDuration="200"
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onDblClick={currentUsername && handleAddClick}
      >
        {pins.map((p) => (
          <React.Fragment key={p.id}>
            <Marker latitude={p.lat} longitude={p.long}>
              <MapPin
                className="text-red-500 w-20 h-20"
                width={50}
                height={50}
                onClick={() => handleMarkerClick(p.id, p.lat, p.long)}
              />
            </Marker>
            {p.id === currentPlaceId && (
              <Popup
                latitude={p.lat}
                longitude={p.long}
                closeButton={true}
                closeOnClick={false}
                onClose={() => setCurrentPlaceId(null)}
                anchor="top"
              >
                <div className="card">
                  <label>Place</label>
                  <h4 className="place">{p.title}</h4>
                  <label>Review</label>
                  <p className="desc">{p.desc}</p>
                  <label>Rating</label>
                  <div className="stars">
                    {Array(p.rating).fill(<StarIcon className="star" />)}
                  </div>
                  <label>Information</label>
                  <span className="username">
                    Created by <b>{p.username}</b>
                  </span>
                  <span className="date">{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
              </Popup>
            )}
          </React.Fragment>
        ))}
        {newPlace && (
          <React.Fragment>
            <Marker latitude={newPlace.lat} longitude={newPlace.long}>
              <MapPin className="text-red-500 w-20 h-20" width={50} height={50} />
            </Marker>
            <Popup latitude={newPlace.lat} longitude={newPlace.long} closeButton={true} closeOnClick={false} onClose={() => setNewPlace(null)} anchor="top">
              <div>
                <form onSubmit={handleSubmit}>
                  <label>Title</label>
                  <input placeholder="Enter a title" autoFocus onChange={(e) => setTitle(e.target.value)} />
                  <label>Description</label>
                  <textarea placeholder="Say something about this place" onChange={(e) => setDesc(e.target.value)} />
                  <label>Rating</label>
                  <select onChange={(e) => setStar(parseInt(e.target.value))}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                  <button type="submit" className="submitButton">Add Pin</button>
                </form>
              </div>
            </Popup>
          </React.Fragment>
        )}
        {currentUsername ? (
          <button className="button logout" onClick={handleLogout}>
            Log out
          </button>
        ) : (
          <div className="buttons">
            <button className="button login">Log in</button>
            <button className="button register" onClick={() => setShowRegister(true)}>Register</button>
          </div>
        )}
      </Map>

      {/* Registration Form */}
      {showRegister && (
        <div className="registration-form">
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            <label>Username</label>
            <input type="text" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} required />
            <label>Email</label>
            <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
            <label>Password</label>
            <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
            <button type="submit" className="submitButton">Register</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default MapApp;
