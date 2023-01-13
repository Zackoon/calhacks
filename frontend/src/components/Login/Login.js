import React from 'react';
import {useEffect, useState} from 'react';

export default function Login() {

  const CLIENT_ID = "77be3b537e7c4a049890a7bfe298fa41"
  const REDIRECT_URI = "http://localhost:3000"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"

  const [token, setToken] = useState("")

    useEffect(() => {
        const hash = window.location.hash
        let token = window.localStorage.getItem("token")

        if (!token && hash) {
            token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

            window.location.hash = ""
            window.localStorage.setItem("token", token)
        }

        setToken(token)
        console.log(token)

    }, [])
  
  return(
    <div>
      <a href= {`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}><button>Login to Spotify</button></a>
      <a href="/">Join as a Guest</a>
    </div>
  )
}