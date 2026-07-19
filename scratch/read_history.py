import json

log_path = r"C:\Users\usuario\.gemini\antigravity\brain\ab6693ff-1035-4e90-847d-507a8674e080\.system_generated\logs\transcript.jsonl"

with open(log_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get("type") == "USER_INPUT":
                print(f"--- USER INPUT ({data.get('created_at')}) ---")
                print(data.get("content"))
        except Exception as e:
            print("Error parsing line:", e)
