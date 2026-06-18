import sys
import time
from typing import Dict, List, Optional

import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

# TMDB API Setup
API_KEY = "5b3d102c1008401084deca35285b6022"
BASE_URL = "https://api.themoviedb.org/3"
LANGUAGE = "bg-BG"
TV_DETAILS_URL = f"{BASE_URL}/tv"
PERSON_DETAILS_URL = f"{BASE_URL}/person"
VIDSRC_URL = "https://vidsrc.me/embed/tv"

# API Upload endpoint
API_UPLOAD_URL = "http://localhost:3000/api/v/1/movies/import-tv-series"
API_X_TOKEN = "l1z7C9Bu6fl3PS3XDpkfd6rLexVqoG32mMZSJcRpYgY5OFGwge0aZCGccmViGtLw"


def requests_retry_session(
    retries=3,
    backoff_factor=0.3,
    status_forcelist=(500, 502, 504),
    session=None,
):
    session = session or requests.Session()
    retry = Retry(
        total=retries,
        read=retries,
        connect=retries,
        backoff_factor=backoff_factor,
        status_forcelist=status_forcelist,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)

    # Add browser-like headers to bypass Cloudflare
    session.headers.update(
        {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.9",
            "Origin": "https://filmi9.com",
            "Referer": "https://filmi9.com/",
            "sec-ch-ua": '"Google Chrome";v="115", "Chromium";v="115", "Not-A.Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
        }
    )

    return session


def get_json_response(url: str, params: Dict[str, str]) -> Optional[Dict]:
    try:
        response = requests_retry_session().get(url, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching data from {url}: {e}")
        return None


def get_tv_details(tv_id: int) -> Optional[Dict]:
    params = {
        "api_key": API_KEY,
        "language": LANGUAGE,
        "append_to_response": "credits,videos,external_ids",
    }
    return get_json_response(f"{TV_DETAILS_URL}/{tv_id}", params)


def get_season_details(tv_id: int, season_number: int) -> Optional[Dict]:
    params = {
        "api_key": API_KEY,
        "language": LANGUAGE,
    }
    return get_json_response(f"{TV_DETAILS_URL}/{tv_id}/season/{season_number}", params)


def get_actor_details(actor_id: int) -> Optional[Dict]:
    params = {"api_key": API_KEY, "language": LANGUAGE}
    return get_json_response(f"{PERSON_DETAILS_URL}/{actor_id}", params)


def check_episode_link(
    imdb_id: str, season_number: int, episode_number: int
) -> Optional[str]:
    if not imdb_id:
        return None

    video_url = (
        f"{VIDSRC_URL}?imdb={imdb_id}&season={season_number}&episode={episode_number}"
    )
    try:
        # Use GET request instead of HEAD
        response = requests_retry_session().get(
            video_url, timeout=10, allow_redirects=True
        )

        # Check if response contains content indicating it's available
        # For most streaming sites, if a 404 or error page is not shown, the content exists
        if response.status_code == 200 and len(response.text) > 100:
            # Video is likely available if we got a non-empty response
            return video_url
        else:
            print(
                f"Episode check failed: Status {response.status_code}, Content length: {len(response.text)}"
            )
            return None
    except requests.RequestException as e:
        print(f"Error checking episode link: {e}")
        return None


def get_trailer_url(videos: List[Dict]) -> Optional[str]:
    for video in videos:
        if video.get("type") == "Trailer" and video.get("site") == "YouTube":
            return f"https://www.youtube.com/watch?v={video.get('key')}"
    return None


def process_and_upload_tv_series(tv_id: int, season_number: int) -> bool:
    print(f"Processing TV series with TMDB ID: {tv_id}, Season: {season_number}")

    # Get TV series details
    tv_details = get_tv_details(tv_id)
    if not tv_details:
        print(f"Failed to fetch details for TV series ID: {tv_id}")
        return False

    # Get the IMDB ID from external_ids
    imdb_id = tv_details.get("external_ids", {}).get("imdb_id")
    if not imdb_id:
        print(f"No IMDB ID found for TV series ID: {tv_id}")
        return False

    # Get season details
    season_details = get_season_details(tv_id, season_number)
    if not season_details:
        print(
            f"Failed to fetch details for Season {season_number} of TV series ID: {tv_id}"
        )
        return False

    print(
        f"Processing {tv_details.get('name')} - Season {season_number}, Episodes: {len(season_details.get('episodes', []))}"
    )

    # Check if episodes are available and create episodes array
    episodes = []
    for episode in season_details.get("episodes", []):
        episode_number = episode.get("episode_number")
        video_url = check_episode_link(imdb_id, season_number, episode_number)

        if video_url:
            episodes.append(
                {
                    "episodeNumber": episode_number,
                    "videoUrl": video_url,
                    "sources": [],
                    "subtitles": [],
                }
            )
            print(f"Episode {episode_number} available")
        else:
            print(f"Episode {episode_number} not available")

        # Small delay to avoid rate limiting
        time.sleep(0.5)

    if not episodes:
        print(
            f"No episodes available for {tv_details.get('name')} - Season {season_number}"
        )
        return False

    # Get trailer URL
    trailer_url = get_trailer_url(tv_details.get("videos", {}).get("results", []))

    # Get credits information
    credits = tv_details.get("credits", {})
    director = next(
        (
            member["name"]
            for member in credits.get("crew", [])
            if member["job"] == "Director" or member["job"] == "Creator"
        ),
        None,
    )

    # Get actors information
    actors = []
    for actor in credits.get("cast", [])[:5]:
        actor_details = get_actor_details(actor["id"])
        if actor_details:
            actors.append(
                {
                    "name": actor_details.get("name"),
                    "image": (
                        f"https://image.tmdb.org/t/p/original{actor_details.get('profile_path')}"
                        if actor_details.get("profile_path")
                        else None
                    ),
                }
            )
            time.sleep(0.5)  # Small delay between actor requests

    # Prepare TV series data object
    tv_data = {
        "title": tv_details.get("name"),
        "tmdb_id": tv_details.get("id"),
        "description": tv_details.get("overview"),
        "movieImage": (
            f"https://image.tmdb.org/t/p/original{tv_details.get('poster_path')}"
            if tv_details.get("poster_path")
            else None
        ),
        "coverPhoto": (
            f"https://image.tmdb.org/t/p/original{tv_details.get('backdrop_path')}"
            if tv_details.get("backdrop_path")
            else None
        ),
        "imdb_id": imdb_id,
        "rating": tv_details.get("vote_average"),
        "genres": [genre["name"] for genre in tv_details.get("genres", [])],
        "year": (
            int(tv_details.get("first_air_date", "")[:4])
            if tv_details.get("first_air_date")
            else None
        ),
        "director": director,
        "selectedActors": actors,
        "production_companies": [
            company["name"] for company in tv_details.get("production_companies", [])
        ],
        "countries": [
            country["name"] for country in tv_details.get("production_countries", [])
        ],
        "tailerUrl": trailer_url,
        "type": "series",
        "seasson": season_number,
        "episodes": episodes,
        "episodesCount": len(episodes),
        "lastAddedEpisodeDate": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        "videoType": "iframe",
        "language": "bg",
        "quality": "hd",
        "hasSubtitles": True,
        "isBgAudio": False,
    }

    # Truncate large text fields to avoid oversized payloads
    if tv_data["description"] and len(tv_data["description"]) > 1000:
        tv_data["description"] = tv_data["description"][:1000] + "..."

    # Clean up any None values or empty lists that might cause issues
    for key in list(tv_data.keys()):
        if tv_data[key] is None or (
            isinstance(tv_data[key], list) and len(tv_data[key]) == 0
        ):
            tv_data[key] = ""

    try:
        print(f"Sending request to {API_UPLOAD_URL}")
        headers = {
            "x-token": API_X_TOKEN,
            "Content-Type": "application/json",
            # Cloudflare specific headers
            "CF-IPCountry": "BG",  # If your site is geo-restricted
        }

        session = requests_retry_session(
            retries=2,  # Reduce retries to avoid getting blocked
            backoff_factor=1.5,  # Longer wait between retries
            status_forcelist=(429, 500, 502, 503, 504, 520),
        )

        # Add a delay before sending to avoid rate limiting
        time.sleep(2)

        print(
            f"Uploading TV series: {tv_data['title']} - Season {season_number} (size: {len(str(tv_data))} chars)"
        )
        response = session.post(
            API_UPLOAD_URL,
            json=tv_data,
            headers=headers,
            timeout=30,
        )

        print(f"Response status: {response.status_code}")
        if response.text:
            print(f"Response body: {response.text[:500]}...")

        response.raise_for_status()
        print(
            f"Successfully uploaded TV series: {tv_data['title']} - Season {season_number}"
        )
        return True
    except requests.RequestException as e:
        print(
            f"Failed to upload TV series {tv_data['title']} - Season {season_number}: {str(e)}"
        )
        print(f"Request details: URL={API_UPLOAD_URL}, Headers={headers}")
        if hasattr(e, "response") and e.response is not None:
            print(f"Response status: {e.response.status_code}")
            print(f"Response body: {e.response.text[:500]}...")
        return False


def main():
    if len(sys.argv) != 3:
        print("Usage: python tmdb_tv.py <tmdb_id> <season_number>")
        print("Example: python tmdb_tv.py 1399 1")
        sys.exit(1)

    try:
        tmdb_id = int(sys.argv[1])
        season_number = int(sys.argv[2])
    except ValueError:
        print("Error: TMDB ID and season number must be integers")
        sys.exit(1)

    success = process_and_upload_tv_series(tmdb_id, season_number)
    if success:
        print("TV series processing and upload completed successfully")
    else:
        print("Failed to process or upload TV series")
        sys.exit(1)


if __name__ == "__main__":
    main()
