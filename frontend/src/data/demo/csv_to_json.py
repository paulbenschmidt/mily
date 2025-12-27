#!/usr/bin/env python3
import csv
import json
from datetime import datetime

def convert_csv_to_json(csv_path, json_path):
    events = []

    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)

        for i, row in enumerate(reader, start=1):
            event_date = row['Date']
            now = datetime.now().isoformat() + 'Z'

            is_first_of_month = event_date.endswith("-01")
            is_first_of_year = event_date.endswith("-01-01")

            event = {
                "id": str(i),
                "user": "demo-user",
                "title": row['Title'],
                "description": row['Description'],
                "notes": row['Notes'],
                "event_date": event_date,
                "is_day_approximate": is_first_of_month,
                "is_month_approximate": is_first_of_year,
                "category": row['Category'],
                "privacy_level": row['Privacy'],
                "photos": [], # You need to manually add photos
                "tags": [],
                "created_at": now,
                "updated_at": now
            }
            events.append(event)

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(events, f, indent=2, ensure_ascii=False)

    print(f"Converted {len(events)} events to {json_path}")

if __name__ == "__main__":
    convert_csv_to_json("mily_timeline.csv", "demo-timeline.json")
