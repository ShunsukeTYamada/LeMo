import os
from dotenv import load_dotenv
from googleapiclient.discovery import build
import datetime
from typing import List, Dict, Any

load_dotenv()

def get_youtube_client():
    """Returns an authenticated YouTube Data API client."""
    api_key = os.getenv("YOUTUBE_API_KEY")
    if not api_key or api_key == "YOUR_YOUTUBE_API_KEY_HERE":
         raise ValueError("YOUTUBE_API_KEY environment variable is not set")
    return build("youtube", "v3", developerKey=api_key)

# target categories (e.g. 10: Music, 24: Entertainment, 25: News & Politics, 27: Education, 28: Science & Technology, 17: Sports)
TARGET_CATEGORIES = ["10", "24", "25", "27", "28", "17"]

CATEGORY_QUERIES = {
    "10": "音楽 中学生 高校生 トレンド",
    "24": "エンタメ VLOG トレンド 中高生",
    "25": "ニュース 社会 経済 解説",
    "27": "教育 学習 中学 高校",
    "28": "テクノロジー IT 科学 解説",
    "17": "スポーツ 部活 大会"
}

def search_channels_by_category(youtube, category_id: str, max_items: int = 150) -> List[Dict[str, Any]]:
    """
    Search for channels related to a specific video category id.
    Uses safeSearch="strict" to ensure content is suitable.
    Paginates to find more unique channels.
    """
    query = CATEGORY_QUERIES.get(category_id, "子供向け")
    channel_ids = set()
    next_page_token = None
    
    # YouTube maximum results per page is 50
    # Loop until we have enough unique channels or run out of pages
    while len(channel_ids) < max_items:
        request = youtube.search().list(
            part="snippet",
            type="video",
            q=query,
            videoCategoryId=category_id,
            safeSearch="strict",
            regionCode="JP",
            relevanceLanguage="ja",
            maxResults=50,
            order="relevance",
            pageToken=next_page_token
        )
        response = request.execute()
        
        for item in response.get("items", []):
            channel_ids.add(item["snippet"]["channelId"])
            
        next_page_token = response.get("nextPageToken")
        if not next_page_token:
            break

    return list(channel_ids)

def get_channel_details(youtube, channel_ids: List[str]) -> List[Dict[str, Any]]:
    """
    Given a list of channel IDs, fetch their detailed stats (subscribers, video count).
    """
    channels_data = []
    # YouTube API allows max 50 IDs per request
    for i in range(0, len(channel_ids), 50):
        batch_ids = channel_ids[i:i + 50]
        request = youtube.channels().list(
            part="snippet,statistics",
            id=",".join(batch_ids)
        )
        response = request.execute()
        channels_data.extend(response.get("items", []))
    
    return channels_data

def filter_channels(channels: List[Dict[str, Any]], min_subscribers: int = 10000) -> List[Dict[str, Any]]:
    """
    Filter out channels based on strict criteria for kids.
    Currently filters by minimum subscriber count.
    More complex rules (like recent uploads) would require querying the channel's uploads playlist.
    """
    filtered = []
    for ch in channels:
        stats = ch.get("statistics", {})
        subscribers = int(stats.get("subscriberCount", 0))
        if subscribers >= min_subscribers:
            filtered.append(ch)
            
    return filtered

def discover_new_channels(min_subscribers: int = 10000) -> List[Dict[str, Any]]:
    """
    High-level flow to discover safe channels across predefined categories.
    """
    youtube = get_youtube_client()
    all_filtered_channels = []
    
    for category in TARGET_CATEGORIES:
        try:
            channel_ids = search_channels_by_category(youtube, category)
            print(f"Found {len(channel_ids)} unique channel IDs for category {category}")
            if not channel_ids:
                continue
            channels_details = get_channel_details(youtube, channel_ids)
            approved = filter_channels(channels_details, min_subscribers=min_subscribers)
            print(f"Approved {len(approved)} channels out of {len(channels_details)} for category {category}")
            
            # Attach category context for DB saving
            for ch in approved:
                ch["_discovered_category"] = category
                
            all_filtered_channels.extend(approved)
        except Exception as e:
            import traceback
            print(f"Error discovering category {category}: {e}")
            
    # Remove duplicates by channel ID
    unique_channels = {ch["id"]: ch for ch in all_filtered_channels}
    return list(unique_channels.values())


def get_recent_videos(channel_id: str, max_results: int = 10) -> List[Dict[str, Any]]:
    """
    Fetch recent videos for a specific channel.
    """
    youtube = get_youtube_client()
    
    # First, get the 'uploads' playlist ID for the channel
    # It's more efficient than searching by channelId
    channel_req = youtube.channels().list(
        part="contentDetails",
        id=channel_id
    )
    channel_res = channel_req.execute()
    
    if not channel_res.get("items"):
        return []
        
    uploads_playlist_id = channel_res["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]
    
    # Then fetch videos from the playlist
    playlist_req = youtube.playlistItems().list(
        part="snippet",
        playlistId=uploads_playlist_id,
        maxResults=max_results
    )
    playlist_res = playlist_req.execute()
    
    video_ids = [item["snippet"]["resourceId"]["videoId"] for item in playlist_res.get("items", [])]
    
    if not video_ids:
        return []
        
    # Finally, get full video details (metrics etc)
    videos_data = []
    for i in range(0, len(video_ids), 50):
        batch_ids = video_ids[i:i + 50]
        video_req = youtube.videos().list(
            part="snippet,statistics",
            id=",".join(batch_ids)
        )
        video_res = video_req.execute()
        videos_data.extend(video_res.get("items", []))
        
    return videos_data
