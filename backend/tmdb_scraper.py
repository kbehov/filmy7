import os
import time
from typing import Dict, List, Optional

import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

# TMDB API Setup
API_KEY = "5b3d102c1008401084deca35285b6022"
BASE_URL = "https://api.themoviedb.org/3"
LANGUAGE = "pl-PL"  # Russian language
MOVIE_LIST_URL = f"{BASE_URL}/discover/movie"
MOVIE_DETAILS_URL = f"{BASE_URL}/movie"
GENRE_LIST_URL = f"{BASE_URL}/genre/movie/list"
PERSON_DETAILS_URL = f"{BASE_URL}/person"
VIDSRC_URL = "https://vsembed.ru/embed/movie"

# API Upload endpoint
API_UPLOAD_URL = "http://localhost:8081/api/v/1/movies/import"
API_X_TOKEN = "l1z7C9Bu6fl3PS3XDpkfd6rLexVqoG32mMZSJcRpYgY5OFGwge0aZCGccmViGtLw"

# File paths for storing state
CURRENT_PAGE_FILE = "current_page.txt"
PROCESSED_MOVIES_FILE = "processed_movies.txt"


# Configure retries for requests
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
            "Origin": "https://filmivip.com",
            "Referer": "https://filmivip.com/",
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


def get_genre_mapping() -> Dict[int, str]:
    params = {"api_key": API_KEY, "language": LANGUAGE}
    data = get_json_response(GENRE_LIST_URL, params)
    return (
        {genre["id"]: genre["name"] for genre in data.get("genres", [])} if data else {}
    )


def get_movie_details(movie_id: int) -> Optional[Dict]:
    params = {
        "api_key": API_KEY,
        "language": LANGUAGE,
        "append_to_response": "credits,videos",
    }
    return get_json_response(f"{MOVIE_DETAILS_URL}/{movie_id}", params)


def get_actor_details(actor_id: int) -> Optional[Dict]:
    params = {"api_key": API_KEY, "language": LANGUAGE}
    return get_json_response(f"{PERSON_DETAILS_URL}/{actor_id}", params)


def check_video_link(imdb_id: str) -> Optional[str]:
    if not imdb_id:
        return None
    video_url = f"{VIDSRC_URL}?imdb={imdb_id}&ds_lang=pl"
    try:
        response = requests_retry_session().head(video_url, timeout=10)
        return video_url if response.status_code == 200 else None
    except requests.RequestException:
        return None


def get_trailer_url(videos: List[Dict]) -> Optional[str]:
    # First try to find Bulgarian trailer
    for video in videos:
        if (
            video.get("type") == "Trailer"
            and video.get("site") == "YouTube"
            and video.get("iso_639_1") == "ru"
        ):  # Bulgarian language code
            return f"https://www.youtube.com/watch?v={video.get('key')}"

    # If no Bulgarian trailer, try English trailer
    for video in videos:
        if (
            video.get("type") == "Trailer"
            and video.get("site") == "YouTube"
            and video.get("iso_639_1") == "en"
        ):  # English language code
            return f"https://www.youtube.com/watch?v={video.get('key')}"

    # If no specific language trailer found, get any trailer
    for video in videos:
        if video.get("type") == "Trailer" and video.get("site") == "YouTube":
            return f"https://www.youtube.com/watch?v={video.get('key')}"

    return None


def process_movie(movie: Dict, genre_map: Dict[int, str]) -> Optional[Dict]:
    movie_details = get_movie_details(movie["id"])
    if not movie_details:
        return None

    videos = movie_details.get("videos", {}).get("results", [])
    trailer_url = get_trailer_url(videos)

    imdb_id = movie_details.get("imdb_id")
    if not imdb_id:
        print(f"No IMDB ID found for movie ID: {movie['id']}")
        return None

    video_url = check_video_link(imdb_id)
    if not video_url:
        return None

    credits = movie_details.get("credits", {})
    director = next(
        (
            member["name"]
            for member in credits.get("crew", [])
            if member["job"] == "Director"
        ),
        None,
    )

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
    title = movie_details.get("title")
    original_title = movie_details.get("original_title")

    if title == original_title:
        print(f"Skipping {title} - No Bulgarian translation available")
        return None
    release_year = (
        movie_details.get("release_date", "")[:4]
        if movie_details.get("release_date")
        else ""
    )

    # Format data to match controllers/movies.js importer payload
    movie_data = {
        "name": movie_details.get("title"),
        "original_title": movie_details.get("original_title"),
        "tmdb_id": movie_details.get("id"),
        "description": movie_details.get("overview"),
        "poster": (
            f"https://image.tmdb.org/t/p/original{movie_details.get('poster_path')}"
            if movie_details.get("poster_path")
            else None
        ),
        "backdrop_image": (
            f"https://image.tmdb.org/t/p/original{movie_details.get('backdrop_path')}"
            if movie_details.get("backdrop_path")
            else None
        ),
        "imdb_id": imdb_id,
        "imdb_rating": movie_details.get("vote_average"),
        "genres": [genre["name"] for genre in movie_details.get("genres", [])],
        "duration": movie_details.get("runtime"),
        "release_year": release_year,
        "director": director,
        "actors": actors,
        "contentType": "movie",
        "video_url": video_url,
        "trailer_url": trailer_url,
        "budget": movie_details.get("budget"),
        "production_companies": [
            company.get("name")
            for company in movie_details.get("production_companies", [])
            if company.get("name")
        ],
        "countries_of_origin": [
            country.get("name")
            for country in movie_details.get("production_countries", [])
            if country.get("name")
        ],
    }

    # Truncate large text fields to avoid oversized payloads
    if movie_data["description"] and len(movie_data["description"]) > 1000:
        movie_data["description"] = movie_data["description"][:1000] + "..."

    # Keep list fields as arrays; only normalize scalar None values.
    for key in list(movie_data.keys()):
        if movie_data[key] is None:
            movie_data[key] = ""

    return movie_data


def save_current_page(page: int):
    with open(CURRENT_PAGE_FILE, "w", encoding="utf-8") as f:
        f.write(str(page))


def load_current_page() -> int:
    if os.path.exists(CURRENT_PAGE_FILE):
        with open(CURRENT_PAGE_FILE, "r", encoding="utf-8") as f:
            return int(f.read())
    return 1


def upload_movie_to_api(movie_data: Dict) -> bool:
    """Upload a single movie to the API endpoint."""
    try:
        print(
            f"Uploading movie: {movie_data['name']} (TMDB ID: {movie_data['tmdb_id']})"
        )
        headers = {
            "x-token": API_X_TOKEN,
            "Content-Type": "application/json",
            "CF-IPCountry": "RU",
        }

        session = requests_retry_session(
            retries=2,  # Reduce retries to avoid getting blocked
            backoff_factor=1.5,  # Longer wait between retries
            status_forcelist=(429, 500, 502, 503, 504, 520),
        )

        # Add a delay before sending to avoid rate limiting
        time.sleep(0.5)

        response = session.post(
            API_UPLOAD_URL,
            json=movie_data,
            headers=headers,
            timeout=30,
        )

        print(f"Response status: {response.status_code}")
        if response.text:
            print(f"Response body: {response.text[:500]}...")

        response.raise_for_status()
        print(f"Successfully uploaded movie: {movie_data['name']}")
        return True
    except requests.RequestException as e:
        print(f"Failed to upload movie {movie_data.get('name', 'Unknown')}: {str(e)}")
        if hasattr(e, "response") and e.response is not None:
            print(f"Response status: {e.response.status_code}")
            print(f"Response body: {e.response.text[:500]}...")
        return False


def load_processed_movies() -> set:
    if os.path.exists(PROCESSED_MOVIES_FILE):
        with open(PROCESSED_MOVIES_FILE, "r", encoding="utf-8") as f:
            return set(line.strip() for line in f)
    return set()


def save_processed_movie(tmdb_id: int):
    with open(PROCESSED_MOVIES_FILE, "a", encoding="utf-8") as f:
        f.write(f"{tmdb_id}\n")


def get_movies(start_page: Optional[int] = None):
    page = start_page or load_current_page()
    genre_map = get_genre_mapping()
    processed_movies = load_processed_movies()
    uploaded_count = 0
    failed_count = 0

    while True:
        print(f"Scraping page {page}...")
        params = {
            "api_key": API_KEY,
            "language": LANGUAGE,
            "page": str(page),
            # "sort_by": "vote_average.asc",
            "vote_average.gte": 4.1,  # Keep only movies with rating > 4
            "vote_count.gte": 10,  # Avoid low-vote titles with unstable ratings
            "primary_release_date.gte": "1980-01-01",  # Keep release year > 1980,
            "primary_release_date.lte": "2023-01-01",  # Keep release year > 1980
        }
        data = get_json_response(MOVIE_LIST_URL, params)

        if not data or "results" not in data:
            break

        for movie in data["results"]:
            if str(movie["id"]) in processed_movies:
                print(f"Skipping already processed movie: {movie['title']}")
                continue

            movie_data = process_movie(movie, genre_map)
            if movie_data:
                success = upload_movie_to_api(movie_data)
                if success:
                    save_processed_movie(movie_data["tmdb_id"])
                    uploaded_count += 1
                    print(
                        f"✓ Uploaded: {movie_data['name']} ({movie_data['release_year']}) - Trailer: {movie_data.get('trailer_url', 'N/A')}"
                    )
                else:
                    failed_count += 1
                    save_processed_movie(movie_data["tmdb_id"])
                    print(
                        f"✗ Failed to upload: {movie_data['name']} ({movie_data['release_year']})"
                    )
            time.sleep(0.5)

        save_current_page(page)

        if page >= data.get("total_pages", 1):
            break
        page += 1

    print(f"\n=== Scraping Summary ===")
    print(f"Total uploaded: {uploaded_count}")
    print(f"Total failed: {failed_count}")
    print(f"Total processed: {len(processed_movies)}")


if __name__ == "__main__":
    start_page = load_current_page()
    get_movies(start_page)
