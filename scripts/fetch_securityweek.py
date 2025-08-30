import feedparser
from datetime import datetime, timedelta
from pathlib import Path
import re
import time

# Define multiple RSS sources with different update frequencies
RSS_SOURCES = [
    {
        "name": "SecurityWeek",
        "url": "https://feeds.feedburner.com/Securityweek",
        "description": "Latest cybersecurity news",
        "daily_news": True
    },
    {
        "name": "The Hacker News",
        "url": "https://feeds.feedburner.com/TheHackersNews",
        "description": "Cybersecurity news and insights",
        "daily_news": True
    },
    {
        "name": "Schneier on Security",
        "url": "https://www.schneier.com/feed/atom/",
        "description": "Security news and analysis by Bruce Schneier",
        "daily_news": True
    },
    {
        "name": "Google Security Blog",
        "url": "https://feeds.feedburner.com/GoogleOnlineSecurityBlog",
        "description": "Security insights from Google",
        "daily_news": False  # Research blog, posts less frequently
    },
    {
        "name": "Trail of Bits Blog",
        "url": "https://blog.trailofbits.com/feed/",
        "description": "Security research and insights from Trail of Bits",
        "daily_news": False  # Research blog, posts less frequently
    },
    {
        "name": "Nebelwelt",
        "url": "https://nebelwelt.net/blog/feeds/all.atom.xml",
        "description": "Security research and insights",
        "daily_news": False  # Research blog, posts less frequently
    }
]

# Number of days to look back for "recent" news
DAYS_LOOKBACK = 3
DAYS_LOOKBACK_RESEARCH = 14  # Longer lookback for research blogs

# Maximum number of entries to process per source (before filtering)
MAX_ENTRIES_PER_SOURCE = 10

# File to track previously seen entries to avoid repetition
SEEN_ENTRIES_FILE = Path("src/content/updates/.seen_entries.txt")

# Define keywords to filter news entries
KEYWORDS = [
    "vulnerability", "exploit", "breach", "malware",
    "phishing", "zero-day", "CVE", "patch",
    "attack", "data leak", "AI",  "chip",
    "backdoor",
    "Google", "Nvidia", "Microsoft", "ChatGPT",
    "Apple", "GPU"
]

EXCLUDE_KEYWORDS = [
    "China", "Russia", "North Korea"
]

def load_seen_entries():
    """Load previously seen entry URLs from file"""
    if SEEN_ENTRIES_FILE.exists():
        with SEEN_ENTRIES_FILE.open("r", encoding="utf-8") as f:
            return set(line.strip() for line in f if line.strip())
    return set()

def save_seen_entries(seen_entries):
    """Save seen entry URLs to file"""
    SEEN_ENTRIES_FILE.parent.mkdir(parents=True, exist_ok=True)
    with SEEN_ENTRIES_FILE.open("w", encoding="utf-8") as f:
        for url in sorted(seen_entries):
            f.write(f"{url}\n")

def is_recent_entry(entry, source, days_back=None):
    """Check if entry was published within the appropriate lookback period"""
    if days_back is None:
        # Use different lookback periods based on source type
        days_back = DAYS_LOOKBACK if source.get('daily_news', True) else DAYS_LOOKBACK_RESEARCH
    
    try:
        # Get published date from entry
        if hasattr(entry, 'published_parsed') and entry.published_parsed:
            entry_date = datetime(*entry.published_parsed[:6])
        elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
            entry_date = datetime(*entry.updated_parsed[:6])
        else:
            # If no date info, assume it's old
            return False
        
        # Check if within the lookback period
        cutoff_date = datetime.now() - timedelta(days=days_back)
        return entry_date >= cutoff_date
    
    except Exception as e:
        # If we can't parse the date, exclude it
        return False

def contains_keywords(text, keywords):
    """Check if text contains any of the specified keywords (case-insensitive)"""
    text_lower = text.lower()
    return any(keyword.lower() in text_lower for keyword in keywords)

def filter_entries_by_keywords(entries, include_keywords, exclude_keywords=None):
    """Filter entries that contain relevant keywords but exclude unwanted ones"""
    filtered_entries = []
    for entry in entries:
        title = getattr(entry, 'title', '')
        summary = getattr(entry, 'summary', '')
        
        # Check if title or summary contains any include keywords
        has_include_keywords = contains_keywords(title, include_keywords) or contains_keywords(summary, include_keywords)
        
        # Check if title or summary contains any exclude keywords
        has_exclude_keywords = False
        if exclude_keywords:
            has_exclude_keywords = contains_keywords(title, exclude_keywords) or contains_keywords(summary, exclude_keywords)
        
        # Include entry if it has include keywords but no exclude keywords
        if has_include_keywords and not has_exclude_keywords:
            filtered_entries.append(entry)
    
    return filtered_entries

def fetch_and_filter_from_source(source, keywords, exclude_keywords=None, seen_entries=None):
    """Fetch and filter entries from a single RSS source"""
    if seen_entries is None:
        seen_entries = set()
    
    try:
        print(f"Fetching from {source['name']}...")
        feed = feedparser.parse(source['url'])
        
        if not feed.entries:
            print(f"  Warning: No entries found from {source['name']}")
            return []
        
        # Limit to first N entries before any processing
        limited_entries = feed.entries[:MAX_ENTRIES_PER_SOURCE]
        print(f"  Processing first {len(limited_entries)} entries out of {len(feed.entries)} total")
        
        # Filter out previously seen entries
        unseen_entries = [entry for entry in limited_entries if getattr(entry, 'link', '') not in seen_entries]
        
        # Then filter by date (with different lookback for research blogs)
        lookback_days = DAYS_LOOKBACK if source.get('daily_news', True) else DAYS_LOOKBACK_RESEARCH
        recent_entries = [entry for entry in unseen_entries if is_recent_entry(entry, source)]
        
        print(f"  Found {len(recent_entries)} new recent entries (using {lookback_days}-day lookback)")
        
        if not recent_entries:
            source_type = "daily news" if source.get('daily_news', True) else "research blog"
            print(f"  No new recent entries found from {source['name']} ({source_type})")
            return []
        
        # Finally filter by keywords
        filtered_entries = filter_entries_by_keywords(recent_entries, keywords, exclude_keywords)
        
        print(f"  Found {len(filtered_entries)} relevant new entries")
        return [(entry, source) for entry in filtered_entries]
    
    except Exception as e:
        print(f"  Error fetching from {source['name']}: {e}")
        return []

# Load previously seen entries to avoid repetition
seen_entries = load_seen_entries()

# Fetch and aggregate entries from all sources
all_filtered_entries = []
new_seen_entries = set(seen_entries)  # Copy existing seen entries

for source in RSS_SOURCES:
    source_entries = fetch_and_filter_from_source(source, KEYWORDS, EXCLUDE_KEYWORDS, seen_entries)
    all_filtered_entries.extend(source_entries)
    
    # Add new entry URLs to seen entries
    for entry, _ in source_entries:
        if hasattr(entry, 'link'):
            new_seen_entries.add(entry.link)

# Sort entries by publication date (newest first)
all_filtered_entries.sort(key=lambda x: getattr(x[0], 'published_parsed', (0,0,0,0,0,0,0,0,0)), reverse=True)

today = datetime.now().strftime("%Y-%m-%d")
md_path = Path(f"src/content/updates/{today}-security.md")
md_path.parent.mkdir(parents=True, exist_ok=True)

with md_path.open("w", encoding="utf-8") as f:
    f.write(f"---\ntitle: Security News – {today}\ndate: {today}\ntags: [security, news]\n---\n\n")
    
    if all_filtered_entries:
        # Count sources by type for better summary
        daily_sources = [s for s in RSS_SOURCES if s.get('daily_news', True)]
        research_sources = [s for s in RSS_SOURCES if not s.get('daily_news', True)]
        
        summary_text = f"*Found {len(all_filtered_entries)} relevant security news items from "
        if daily_sources and research_sources:
            summary_text += f"the last {DAYS_LOOKBACK} days (daily news) and {DAYS_LOOKBACK_RESEARCH} days (research blogs) "
        elif daily_sources:
            summary_text += f"the last {DAYS_LOOKBACK} days "
        else:
            summary_text += f"the last {DAYS_LOOKBACK_RESEARCH} days "
        summary_text += f"across {len(RSS_SOURCES)} sources (max {MAX_ENTRIES_PER_SOURCE} entries per source).*\n\n"
        
        f.write(summary_text)
        
        # Group entries by source
        current_source = None
        for entry, source in all_filtered_entries:
            if current_source != source['name']:
                if current_source is not None:
                    f.write("\n")
                f.write(f"## {source['name']}\n")
                f.write(f"*{source['description']}*\n\n")
                current_source = source['name']
            
            # Add date information to make recency clear
            entry_date = ""
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                entry_date = datetime(*entry.published_parsed[:6]).strftime(" - %B %d, %Y")
            elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                entry_date = datetime(*entry.updated_parsed[:6]).strftime(" - %B %d, %Y")
            
            f.write(f"### [{entry.title}]({entry.link}){entry_date}\n\n")
            f.write(f"{entry.summary}\n\n")
    else:
        f.write(f"No relevant security news found from the specified time periods matching the keywords.\n\n")

# Save updated seen entries to prevent showing the same content again
save_seen_entries(new_seen_entries)

# Count sources by type for summary
daily_sources = [s for s in RSS_SOURCES if s.get('daily_news', True)]
research_sources = [s for s in RSS_SOURCES if not s.get('daily_news', True)]

print(f"\nSummary:")
print(f"- Processed {len(RSS_SOURCES)} RSS sources:")
print(f"  • {len(daily_sources)} daily news sources ({DAYS_LOOKBACK}-day lookback)")
print(f"  • {len(research_sources)} research blogs ({DAYS_LOOKBACK_RESEARCH}-day lookback)")
print(f"- Max {MAX_ENTRIES_PER_SOURCE} entries per source before filtering")
print(f"- Found {len(all_filtered_entries)} new matching entries")
print(f"- Tracking {len(new_seen_entries)} total seen entries to prevent repetition")
print(f"- Security news saved to: {md_path}")
