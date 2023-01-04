from tkinter import Label
from flask import Flask, request,send_from_directory
from flask_cors import CORS, cross_origin
import pandas as pd
import numpy as np
import sklearn
from sklearn.metrics.pairwise import euclidean_distances
from sklearn.preprocessing import MinMaxScaler
import seaborn as sns
import matplotlib.pyplot as plt
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import os
import psycopg2
from dotenv import load_dotenv
load_dotenv()  # take environment variables from .env.

# Create a cursor.
#pg_conn_string = os.environ["PG_CONN_STRING"]
#connection = psycopg2.connect(pg_conn_string)

#cursor = connection.cursor()

# Create a table
# def create_tables():
#     cursor.execute("CREATE TABLE liked_songs ( \
#     uri STRING NOT NULL,\
#     name TEXT NOT NULL\
#     )")
#     connection.commit()

client_credentials_manager = SpotifyClientCredentials(client_id=os.environ["SPOTIFY_CLIENT_ID"], client_secret=os.environ["SPOTIFY_CLIENT_SECRET"])
spotify = spotipy.Spotify(client_credentials_manager = client_credentials_manager)
data = pd.read_csv("song_data.csv")
features = ['duration_ms', 'explicit', 'valence', 'acousticness', 
             'danceability', 'energy', 'instrumentalness', 'key', 'liveness', 'loudness', 'mode', 'popularity',
             'speechiness', 'tempo']
def min_max_normalize(column):
    return (column - column.min()) / (column.max() - column.min())

def normalize_columns(df_):
    for col in df_[features]:
        df_[col] = min_max_normalize(df_[col])
    return df_

def label_data_distances(song_id, df):
    '''
    gives numerical value to each row, indicating the cosine similarity from the given song
    to every other song in the data set
    '''
    df_ = normalize_columns(df.copy())
    og_song = df_[df_['id'] == song_id]
    df_['distances'] = euclidean_distances([og_song[features].values.tolist()[0]],
                            df_[features].values.tolist())[0]
    return df_

def select_next_rec(df, song_id, top_n_songs_random_select = 30, min_popularity_score = 0.5, num_of_recs = 1
                    , left_or_right = 'right'):
    '''
    top_n_songs_random_select: closest n songs to original song, selected with probability 
        relative to how close the point is the original song
    min_popularity_score: minimum popularity score to be randomly selected
    '''
    df_ = label_data_distances(song_id, df).sort_values('distances', ascending = (left_or_right == 'right'))
    df_ = df_[df_['popularity'] >= min_popularity_score]
    df_ = df_.iloc[np.arange(1, top_n_songs_random_select + 1)]
    if left_or_right == "left":
        random_recs=np.random.choice(np.arange(len(df_)), size = num_of_recs, replace = False)
    else:
        random_recs = np.random.choice(np.arange(len(df_)),
                    p = [i/sum([1/i for i in df_['distances']]) for i in [1/i for i in df_['distances']]], 
                    size = num_of_recs, replace = False)
    return df_.iloc[random_recs]

def find_song_and_pics(uris):
    track_uris = ['spotify:track:' + uri for uri in uris]
    results = spotify.tracks(track_uris)
    return [(results['tracks'][i]['name'],
            results['tracks'][i]['id'],
            results['tracks'][i]['artists'][0]['name'], 
            results['tracks'][i]['album']['images'][len(results['tracks'][i]['album']['images']) - 1]['url'],
            results['tracks'][i]['preview_url']) for i in np.arange(len(results['tracks']))]

def driver_final_rec(df, song_id, top_n_songs_random_select = 1000, min_popularity_score = 0.5, num_of_recs = 1, left_or_right = 'right'):
    i = 0
    while True:
        i += 1
        possible_recs = select_next_rec(df, song_id, top_n_songs_random_select, num_of_recs = num_of_recs, left_or_right = left_or_right)
        uri_song_pic = find_song_and_pics(possible_recs['id'])
        if sum(["None" in "".join([str(i) for i in uri_song_pic[j]]) for j in np.arange(len(uri_song_pic))]) == 0:
            return uri_song_pic

def list_to_json(vals):
    return {"Songs": [{"Name": vals[i][0],
                "Uri": vals[i][1],
                "Artist": vals[i][2], 
                "Image": vals[i][3],
                "Audio": vals[i][4]} for i in np.arange(len(vals))]}

app = Flask(__name__, static_folder = 'dittycal/build', static_url_path="")
CORS(app)
@app.route('/data-right/<uri>', methods = ["POST","GET"])
@cross_origin()
def get_data_right(uri):
    vals = list_to_json(driver_final_rec(data, uri, num_of_recs = 1, left_or_right = 'right', top_n_songs_random_select = 50))
    return vals

@app.route('/data-left/<uri>', methods = ["POST","GET"])
@cross_origin()
def get_data_left(uri):
   vals = list_to_json(driver_final_rec(data, uri, num_of_recs = 1, left_or_right = 'left', top_n_songs_random_select = 10000))
   return vals

@app.route('/data-start/<uri>', methods = ["POST","GET"])
@cross_origin()
def get_data_start(uri):
    vals = list_to_json(driver_final_rec(data, np.random.choice(data["id"]), num_of_recs = 1, left_or_right = 'left'))
    return vals

#@app.route('/')
#@cross_origin()
#def serve():
    #return send_from_directory(app.static_folder,'index.html')


# @app.route('/add-liked/<label>', methods = ["POST","GET"])
# def add_to_liked(label):
#     def insert_data(uri,label):
#         cursor.execute(
#            f"INSERT INTO liked_songs (uri, name) VALUES ('{uri}', '{label}');"
#         )
#         connection.commit()
#     insert_data(123,label)
#     return 1

# @app.route('/get-liked', methods = ["GET"])
# def get_likes():
#     rows=cursor.execute("SELECT * FROM liked_songs")
#     print(rows)

if __name__ == '__main__':
    app.run(debug=True)