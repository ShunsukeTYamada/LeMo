import os
from dotenv import load_dotenv
from googleapiclient.discovery import build
import json

load_dotenv()
api_key = os.getenv("YOUTUBE_API_KEY")
youtube = build("youtube", "v3", developerKey=api_key)

req = youtube.search().list(
    part="snippet",
    type="video",
    q="童謡",
    safeSearch="strict",
    regionCode="JP",
    relevanceLanguage="ja",
    maxResults=5
)
res = req.execute()
print(json.dumps(res, indent=2))
