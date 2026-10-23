import os
import sqlite3
import uuid
import re
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional

DB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data"))
DB_PATH = os.path.join(DB_DIR, "reviews.db")

# Simple In-Memory Rate Limiter: IP -> list of timestamps
_RATE_LIMIT_STORE: Dict[str, List[datetime]] = {}
MAX_REVIEWS_PER_HOUR = 5

SPAM_KEYWORDS = [
    "viagra", "casino", "free crypto", "buy followers", "telegram@", "whatsapp+",
    "http://", "https://", "earn money fast", "xxx"
]

def get_db_connection() -> sqlite3.Connection:
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_reviews_db():
    conn = get_db_connection()
    try:
        with conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS reviews (
                    id TEXT PRIMARY KEY,
                    area_id TEXT NOT NULL,
                    property_id TEXT,
                    overall_rating REAL NOT NULL,
                    rating_safety REAL NOT NULL,
                    rating_connectivity REAL NOT NULL,
                    rating_cleanliness REAL NOT NULL,
                    rating_noise REAL NOT NULL,
                    rating_water_power REAL NOT NULL,
                    rating_community REAL NOT NULL,
                    review_text TEXT NOT NULL,
                    resident_type TEXT NOT NULL,
                    duration_of_stay TEXT NOT NULL,
                    helpful_count INTEGER DEFAULT 0,
                    is_demo INTEGER DEFAULT 0,
                    created_at TEXT NOT NULL,
                    client_ip TEXT
                )
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_reviews_area_id ON reviews(area_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON reviews(property_id)")

        # Check if seed demo reviews are needed
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM reviews WHERE is_demo = 1")
        demo_count = cursor.fetchone()[0]
        if demo_count == 0:
            seed_demo_reviews(conn)
    finally:
        conn.close()

def seed_demo_reviews(conn: sqlite3.Connection):
    sample_reviews = [
        {
            "id": "rev-seed-sec62-1",
            "area_id": "sector-62-noida",
            "property_id": None,
            "overall_rating": 4.5,
            "rating_safety": 4.5,
            "rating_connectivity": 5.0,
            "rating_cleanliness": 4.0,
            "rating_noise": 3.5,
            "rating_water_power": 4.0,
            "rating_community": 4.5,
            "review_text": "Sector 62 has exceptional Blue Line metro connectivity and tech parks nearby. Very safe for evening walks, though traffic at Model Town crossing peaks during office hours.",
            "resident_type": "Owner",
            "duration_of_stay": "3+ years",
            "helpful_count": 14,
            "is_demo": 1,
            "created_at": "2026-01-15T10:30:00Z"
        },
        {
            "id": "rev-seed-sec62-2",
            "area_id": "sector-62-noida",
            "property_id": None,
            "overall_rating": 4.0,
            "rating_safety": 4.0,
            "rating_connectivity": 4.5,
            "rating_cleanliness": 3.8,
            "rating_noise": 3.0,
            "rating_water_power": 4.2,
            "rating_community": 4.0,
            "review_text": "Great educational institutions and Fortis Hospital right across. Water supply is reliable through Ganga jal pipelines. Noise is moderate along the expressway service lane.",
            "resident_type": "Tenant",
            "duration_of_stay": "1-3 years",
            "helpful_count": 8,
            "is_demo": 1,
            "created_at": "2026-01-18T14:15:00Z"
        },
        {
            "id": "rev-seed-sec150-1",
            "area_id": "noida-sec-150",
            "property_id": None,
            "overall_rating": 4.8,
            "rating_safety": 4.5,
            "rating_connectivity": 4.2,
            "rating_cleanliness": 5.0,
            "rating_noise": 5.0,
            "rating_water_power": 4.5,
            "rating_community": 4.8,
            "review_text": "Very peaceful, zero-noise, and low-density sector with the Shaheed Bhagat Singh sports city park. Best air quality in Noida. Upcoming retail plazas will make it even better.",
            "resident_type": "Owner",
            "duration_of_stay": "6-12 months",
            "helpful_count": 19,
            "is_demo": 1,
            "created_at": "2026-01-10T09:00:00Z"
        },
        {
            "id": "rev-seed-sec150-2",
            "area_id": "noida-sec-150",
            "property_id": None,
            "overall_rating": 4.2,
            "rating_safety": 4.0,
            "rating_connectivity": 3.8,
            "rating_cleanliness": 4.8,
            "rating_noise": 4.8,
            "rating_water_power": 4.0,
            "rating_community": 4.2,
            "review_text": "Greenery is top notch. Need a private vehicle or cab for quick transit as metro feeder buses are still expanding. Security within gated townships is excellent.",
            "resident_type": "Tenant",
            "duration_of_stay": "< 6 months",
            "helpful_count": 6,
            "is_demo": 1,
            "created_at": "2026-01-22T16:20:00Z"
        },
        {
            "id": "rev-seed-bengaluru-1",
            "area_id": "indiranagar-bengaluru",
            "property_id": None,
            "overall_rating": 4.6,
            "rating_safety": 4.8,
            "rating_connectivity": 4.5,
            "rating_cleanliness": 4.2,
            "rating_noise": 3.2,
            "rating_water_power": 4.0,
            "rating_community": 5.0,
            "review_text": "100ft Road and 12th Main have unmatched cafe culture and dining. Walkability to Purple line metro is awesome. Weekend nightlife gets slightly loud near main boulevards.",
            "resident_type": "Owner",
            "duration_of_stay": "3+ years",
            "helpful_count": 22,
            "is_demo": 1,
            "created_at": "2026-01-05T12:00:00Z"
        },
        {
            "id": "rev-seed-delhi-1",
            "area_id": "connaught-place-delhi",
            "property_id": None,
            "overall_rating": 4.4,
            "rating_safety": 4.6,
            "rating_connectivity": 5.0,
            "rating_cleanliness": 4.5,
            "rating_noise": 2.8,
            "rating_water_power": 4.5,
            "rating_community": 4.3,
            "review_text": "Center of the capital city with Rajiv Chowk interchange. Unrivaled heritage architecture and retail. Parking and peak rush hours require patience.",
            "resident_type": "Visitor",
            "duration_of_stay": "< 6 months",
            "helpful_count": 11,
            "is_demo": 1,
            "created_at": "2026-01-12T11:45:00Z"
        }
    ]

    with conn:
        for r in sample_reviews:
            conn.execute("""
                INSERT OR IGNORE INTO reviews (
                    id, area_id, property_id, overall_rating, rating_safety,
                    rating_connectivity, rating_cleanliness, rating_noise,
                    rating_water_power, rating_community, review_text,
                    resident_type, duration_of_stay, helpful_count, is_demo,
                    created_at, client_ip
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                r["id"], r["area_id"], r["property_id"], r["overall_rating"],
                r["rating_safety"], r["rating_connectivity"], r["rating_cleanliness"],
                r["rating_noise"], r["rating_water_power"], r["rating_community"],
                r["review_text"], r["resident_type"], r["duration_of_stay"],
                r["helpful_count"], r["is_demo"], r["created_at"], "127.0.0.1"
            ))

def sanitize_text(text: str) -> str:
    cleaned = re.sub(r'<[^>]*?>', '', text)
    return cleaned.strip()

def check_rate_limit(client_ip: str) -> bool:
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=1)
    timestamps = _RATE_LIMIT_STORE.get(client_ip, [])
    # Filter older timestamps
    valid_timestamps = [t for t in timestamps if t > cutoff]
    if len(valid_timestamps) >= MAX_REVIEWS_PER_HOUR:
        return False
    valid_timestamps.append(now)
    _RATE_LIMIT_STORE[client_ip] = valid_timestamps
    return True

def create_review(data: Dict[str, Any], client_ip: str = "127.0.0.1") -> Dict[str, Any]:
    # 1. Rate limiting
    if not check_rate_limit(client_ip):
        raise ValueError("Rate limit exceeded: You can submit at most 5 reviews per hour.")

    # 2. Text validation
    raw_text = data.get("review_text", "")
    sanitized = sanitize_text(raw_text)
    if len(sanitized) < 20:
        raise ValueError("Review text must be at least 20 characters long.")
    if len(sanitized) > 500:
        raise ValueError("Review text cannot exceed 500 characters.")

    # 3. Spam / Profanity check
    lower_text = sanitized.lower()
    for kw in SPAM_KEYWORDS:
        if kw in lower_text:
            raise ValueError(f"Review contains prohibited advertising or spam keywords.")

    # 4. Rating validations
    overall = float(data.get("overall_rating", 0))
    if overall < 1.0 or overall > 5.0:
        raise ValueError("Overall rating must be between 1.0 and 5.0.")

    def check_sub_rating(val: Any) -> float:
        v = float(val) if val is not None else overall
        return max(1.0, min(5.0, v))

    r_safety = check_sub_rating(data.get("rating_safety"))
    r_connectivity = check_sub_rating(data.get("rating_connectivity"))
    r_cleanliness = check_sub_rating(data.get("rating_cleanliness"))
    r_noise = check_sub_rating(data.get("rating_noise"))
    r_water_power = check_sub_rating(data.get("rating_water_power"))
    r_community = check_sub_rating(data.get("rating_community"))

    # 5. Resident type & duration
    resident_type = data.get("resident_type", "Tenant")
    if resident_type not in ["Owner", "Tenant", "Visitor"]:
        resident_type = "Tenant"

    duration = data.get("duration_of_stay", "1-3 years")
    area_id = str(data.get("area_id", "")).strip().lower()
    if not area_id:
        raise ValueError("area_id is required.")

    property_id = data.get("property_id")
    if property_id:
        property_id = str(property_id).strip()

    review_id = f"rev-{uuid.uuid4().hex[:10]}"
    created_at = datetime.now(timezone.utc).isoformat()

    conn = get_db_connection()
    try:
        with conn:
            conn.execute("""
                INSERT INTO reviews (
                    id, area_id, property_id, overall_rating, rating_safety,
                    rating_connectivity, rating_cleanliness, rating_noise,
                    rating_water_power, rating_community, review_text,
                    resident_type, duration_of_stay, helpful_count, is_demo,
                    created_at, client_ip
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                review_id, area_id, property_id, overall, r_safety,
                r_connectivity, r_cleanliness, r_noise, r_water_power,
                r_community, sanitized, resident_type, duration, 0, 0,
                created_at, client_ip
            ))
    finally:
        conn.close()

    return {
        "id": review_id,
        "area_id": area_id,
        "property_id": property_id,
        "overall_rating": overall,
        "rating_safety": r_safety,
        "rating_connectivity": r_connectivity,
        "rating_cleanliness": r_cleanliness,
        "rating_noise": r_noise,
        "rating_water_power": r_water_power,
        "rating_community": r_community,
        "review_text": sanitized,
        "resident_type": resident_type,
        "duration_of_stay": duration,
        "helpful_count": 0,
        "is_demo": False,
        "created_at": created_at
    }

def get_reviews_for_entity(
    area_id: Optional[str] = None,
    property_id: Optional[str] = None,
    resident_type: Optional[str] = None,
    sort_by: str = "helpful"
) -> Dict[str, Any]:
    init_reviews_db()
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        
        # Build query
        query_conditions = []
        params: List[Any] = []

        if area_id:
            query_conditions.append("(area_id = ? OR area_id LIKE ?)")
            params.append(area_id.lower())
            params.append(f"%{area_id.lower()}%")

        if property_id:
            query_conditions.append("property_id = ?")
            params.append(property_id)

        if resident_type and resident_type != "All":
            query_conditions.append("resident_type = ?")
            params.append(resident_type)

        where_clause = f"WHERE {' AND '.join(query_conditions)}" if query_conditions else ""

        # Order by
        if sort_by == "newest":
            order_clause = "ORDER BY created_at DESC"
        elif sort_by == "highest":
            order_clause = "ORDER BY overall_rating DESC, created_at DESC"
        elif sort_by == "lowest":
            order_clause = "ORDER BY overall_rating ASC, created_at DESC"
        else: # helpful
            order_clause = "ORDER BY helpful_count DESC, created_at DESC"

        full_query = f"SELECT * FROM reviews {where_clause} {order_clause}"
        cursor.execute(full_query, params)
        rows = cursor.fetchall()

        reviews_list = []
        rating_dist = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
        total_safety = 0.0
        total_connectivity = 0.0
        total_cleanliness = 0.0
        total_noise = 0.0
        total_water_power = 0.0
        total_community = 0.0
        total_overall = 0.0

        for r in rows:
            rev_dict = dict(r)
            rev_dict["is_demo"] = bool(rev_dict["is_demo"])
            reviews_list.append(rev_dict)

            overall_star = int(round(rev_dict["overall_rating"]))
            star_clamped = max(1, min(5, overall_star))
            rating_dist[star_clamped] = rating_dist.get(star_clamped, 0) + 1

            total_overall += rev_dict["overall_rating"]
            total_safety += rev_dict["rating_safety"]
            total_connectivity += rev_dict["rating_connectivity"]
            total_cleanliness += rev_dict["rating_cleanliness"]
            total_noise += rev_dict["rating_noise"]
            total_water_power += rev_dict["rating_water_power"]
            total_community += rev_dict["rating_community"]

        count = len(reviews_list)
        if count > 0:
            avg_overall = round(total_overall / count, 1)
            cat_averages = {
                "safety": round(total_safety / count, 1),
                "connectivity": round(total_connectivity / count, 1),
                "cleanliness": round(total_cleanliness / count, 1),
                "noise": round(total_noise / count, 1),
                "water_power": round(total_water_power / count, 1),
                "community": round(total_community / count, 1)
            }
        else:
            avg_overall = 0.0
            cat_averages = {
                "safety": 0.0,
                "connectivity": 0.0,
                "cleanliness": 0.0,
                "noise": 0.0,
                "water_power": 0.0,
                "community": 0.0
            }

        return {
            "area_id": area_id,
            "property_id": property_id,
            "stats": {
                "average_rating": avg_overall,
                "total_reviews": count,
                "rating_distribution": rating_dist,
                "category_averages": cat_averages
            },
            "reviews": reviews_list
        }
    finally:
        conn.close()

def vote_helpful(review_id: str) -> Dict[str, Any]:
    init_reviews_db()
    conn = get_db_connection()
    try:
        with conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = ?", (review_id,))
            if cursor.rowcount == 0:
                raise ValueError(f"Review with id '{review_id}' not found.")
            cursor.execute("SELECT id, helpful_count FROM reviews WHERE id = ?", (review_id,))
            updated = cursor.fetchone()
            return dict(updated)
    finally:
        conn.close()
