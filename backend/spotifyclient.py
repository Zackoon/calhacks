import json

import requests

class SpotifyClient:
    """SpotifyClient performs operations using the Spotify API."""

    def __init__(self, authorization_token):
        """
        :param authorization_token (str): Spotify API token
        :param user_id (str): Spotify user id
        """
        self._authorization_token = authorization_token
        self._user_id = None


    def init_user(self):
        url = 'https://api.spotify.com/v1/me'
        response = self._place_get_api_request(url).json()
        self._user_id = response['id']

    def add_track_to_playlist(self, track_uri, playlist_name):

        # checking if dittycal exists
        url = f"https://api.spotify.com/v1/users/{self._user_id}/playlists"
        response = self._place_get_api_request(url)
        response_json = response.json()
        playlist_id = None

        # print(response_json)

        for playlist in response_json["items"]:
            if playlist['name'] == playlist_name:
                playlist_id = playlist['id']
                break
        
        if not playlist_id:
            playlist_id = self.create_playlist(playlist_name)

        data = json.dumps([track_uri])
        # print(data)
        # print(playlist_id)
        url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks"
        response = self._place_post_api_request(url, data)
        # print(response.json())
        return response_json


    def create_playlist(self, name):
        """
        :param name (str): New playlist name
        :return playlist (Playlist): Newly created playlist
        """
        data = json.dumps({
            "name": name,
            "description": "Recommended songs",
            "public": True
        })
        url = f"https://api.spotify.com/v1/users/{self._user_id}/playlists"

        response = self._place_post_api_request(url, data)
        response_json = response.json()

        # create playlist
        playlist_id = response_json["id"]
        return playlist_id

    def _place_get_api_request(self, url):
        response = requests.get(
            url,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self._authorization_token}"
            }
        )
        return response

    def _place_post_api_request(self, url, data):
        response = requests.post(
            url,
            data=data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self._authorization_token}"
            }
        )
        return response