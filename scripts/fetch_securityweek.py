import feedparser
from datetime import datetime
from pathlib import Path

rss_url = "https://feeds.feedburner.com/Securityweek"
feed = feedparser.parse(rss_url)

today = datetime.now().strftime("%Y-%m-%d")
md_path = Path(f"src/content/updates/{today}-security.md")
md_path.parent.mkdir(parents=True, exist_ok=True)

with md_path.open("w", encoding="utf-8") as f:
    f.write(f"---\ntitle: Security News – {today}\ndate: {today}\ntags: [security, news]\n---\n\n")
    for entry in feed.entries[:5]:  # Just take top 5 for now
        f.write(f"### [{entry.title}]({entry.link})\n\n")
        f.write(f"{entry.summary}\n\n")
