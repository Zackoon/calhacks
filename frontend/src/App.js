import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import LikedSongs from "./components/LikedSongs";
import NavBar from "./components/NavBar";
import React, { useState, useEffect } from 'react';

const buttonStyle = {
  backgroundColor: "#009688",
  borderRadius: 10,
  paddingVertical: 10,
  paddingHorizontal: 12,
  fontSize: 18,
  color: "#fff",
  fontWeight: "bold",
  alignSelf: "center",
  textTransform: "uppercase"
} 


function App() {
  const CLIENT_ID = "77be3b537e7c4a049890a7bfe298fa41"
  const REDIRECT_URI = "http://localhost:3000"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"
  const SCOPES = "playlist-modify-private playlist-modify-public user-read-recently-played"

  const [token, setToken] = useState("")

  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }

  useEffect(() => {
      const hash = window.location.hash
      let token = window.localStorage.getItem("token")

      if (!token && hash) {
          token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

          window.location.hash = ""
          window.localStorage.setItem("token", token)
      }
      console.log(token)
      setToken(token)
  }, [])


  if (!token) {
      return (
        <div className="App">
          <header className="App-header">
              <h1>DittyCal</h1>
                  <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES}`}><button style = {buttonStyle}>Login
                      to Spotify</button></a>
          </header>
      </div>  
      )
  }

  const sendToPlaylist = (uri) => 
    fetch("/data-right/save", {
      method: 'POST',
      body: JSON.stringify({
        songID: uri,
        userToken: token
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      }
    }).then(function (response) {
      if (response.ok) {
        return response.json();
      }
      return Promise.reject(response);
    }).then(function (data) {
      console.log(data);
    }).catch(function (error) {
      console.warn('Something went wrong.', error);
    });
  
  return (
    <Router>
    <NavBar logoutAction = {logout}/>
      <Routes>
        <Route path="/" element={<Home handleLike = {sendToPlaylist} />} />
        <Route path = "/liked" element = {<LikedSongs/>} />
      </Routes>
    </Router>
  );
}

export default App;
