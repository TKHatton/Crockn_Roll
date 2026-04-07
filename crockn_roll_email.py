"""
Crock N' Roll — Gmail Reminder Script
=======================================
Sends:
  - Friday 11:30 AM → "Hey, grocery time is coming" nudge
  - Saturday 11:30 AM → Another nudge if you haven't bought yet
  - Sunday 11:30 AM → "Tomorrow is grocery day" nudge
  - Tuesday 11:30 AM → Full grocery list

The Friday-Sunday nudges are SHORT — just "did you buy groceries?"
so your family can stop asking. The Tuesday one has the full list.

Setup:
  1. Gmail App Password: https://myaccount.google.com/apppasswords
  2. Create .env:
       GMAIL_ADDRESS=youremail@gmail.com
       GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
       EXTRA_RECIPIENTS=mom@gmail.com
  3. Test: python crockn_roll_email.py --send
  4. Cron: see bottom of file
"""

import os, sys, json, smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from pathlib import Path

ENV = Path(__file__).parent / ".env"
if ENV.exists():
    for line in ENV.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

GMAIL = os.getenv("GMAIL_ADDRESS", "you@gmail.com")
PASS = os.getenv("GMAIL_APP_PASSWORD", "xxxx xxxx xxxx xxxx")
EXTRA = [e.strip() for e in os.getenv("EXTRA_RECIPIENTS", "").split(",") if e.strip()]
DATA = Path(__file__).parent / "crockn_roll_data.json"

MEALS = [
    {"name":"🥩 Classic Pot Roast","items":["Chuck roast (2-3 lbs)","Baby potatoes (1.5 lb)","Baby carrots (1 lb)","Celery (4 stalks)","Onion soup mix","Beef broth (32 oz)"]},
    {"name":"🍗 Garlic Parm Chicken","items":["Chicken breasts (2 lbs)","BWW Garlic Parm sauce","Green beans frozen steamable","Baby potatoes (1.5 lb)","Chicken broth"]},
    {"name":"🌯 Chicken Enchilada Bowl","items":["Chicken breasts (2 lbs)","Enchilada sauce (2 cans)","Black beans","Corn","Rotel tomatoes","Cream cheese (8 oz)","Mexican cheese (8 oz)"]},
    {"name":"🍖 Smothered Pork Chops","items":["Bone-in pork chops (4)","Cream of chicken soup","Ranch mix packet","Baby potatoes (1.5 lb)","Baby carrots (1 lb)","Green beans frozen"]},
    {"name":"🫘 White Chicken Chili","items":["Chicken breasts (1.5 lbs)","White beans (2 cans)","Pinto beans","Salsa verde (16 oz)","Chicken broth (32 oz)","Green chiles","Frozen corn","Onion"]},
    {"name":"🐟 Tuna Noodle Casserole","items":["Canned tuna (3 cans)","Egg noodles (8 oz)","Cream of mushroom soup","Frozen peas","Peas & carrots mix","Cheddar cheese (8 oz)"]},
]

WEEKLY = [
    "LaCroix Tangerine 12-pack (×2)","Boost Chocolate 6-pack",
    "Boost Strawberry 6-pack","String cheese (12 ct)",
    "Hard boiled eggs (6 ct)","Canned tuna for lunches (4 cans)",
]

def load():
    return json.loads(DATA.read_text()) if DATA.exists() else {"idx":0,"custom":[],"have":[]}

def save(d):
    DATA.write_text(json.dumps(d, indent=2))

def pair(d):
    ps = [(0,1),(2,3),(4,5)]
    i = d["idx"] % len(ps)
    return MEALS[ps[i][0]], MEALS[ps[i][1]]

def advance(d):
    d["idx"] = (d["idx"]+1) % 3
    save(d)

def build(d):
    have = set(d.get("have",[]))
    a, b = pair(d)
    lines = [f"── {a['name']} ──"]
    lines += [f"  ☐ {i}" for i in a["items"] if i not in have]
    lines += ["", f"── {b['name']} ──"]
    lines += [f"  ☐ {i}" for i in b["items"] if i not in have]
    lines += ["","── 📦 WEEKLY ──"]
    lines += [f"  ☐ {i}" for i in WEEKLY if i not in have]
    if d.get("custom"):
        lines += ["","── 📝 EXTRAS ──"]
        lines += [f"  ☐ {i}" for i in d["custom"] if i not in have]
    return "\n".join(lines), a, b

def send_email(subject, html_body, plain_body):
    recipients = [GMAIL] + EXTRA
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = GMAIL
    msg["To"] = ", ".join(recipients)
    msg.attach(MIMEText(plain_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as srv:
            srv.login(GMAIL, PASS)
            srv.send_message(msg)
        print(f"✅ Sent to: {', '.join(recipients)}")
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
        return False

def send_nudge(day_label):
    """Short nudge email — just a reminder."""
    subject = f"Crock N' Roll — {day_label}"
    plain = f"Hey! {day_label}\n\nHave you ordered your groceries yet?\nOpen the app or check your Tuesday email for the full list.\n\n— Crock N' Roll"
    html = f"""<div style="font-family:-apple-system,sans-serif;max-width:400px;margin:0 auto;padding:20px">
    <div style="background:#FFF;border-radius:14px;padding:24px;border:1px solid #DCDCE0;text-align:center">
    <div style="font-size:20px;font-weight:800;margin-bottom:8px">Crock N' Roll</div>
    <div style="font-size:32px;margin:16px 0">🛒</div>
    <div style="font-size:16px;font-weight:600;color:#1D1D1F;margin-bottom:8px">{day_label}</div>
    <div style="font-size:14px;color:#5A5A64;line-height:1.6">Have you ordered your groceries yet?<br>Your list is ready in the app or your Tuesday email.</div>
    <div style="background:#FFC220;border-radius:8px;padding:10px;margin-top:16px;font-weight:700;font-size:13px;color:#004C91">Walmart is waiting for you</div>
    </div></div>"""
    send_email(subject, html, plain)

def send_full_list():
    """Tuesday — full grocery list."""
    d = load()
    txt, a, b = build(d)
    subject = "Crock N' Roll — Your Grocery List"
    plain = f"Crock N' Roll — Grocery List\n\nMeals: {a['name']} + {b['name']}\n\n{txt}\n\nWalmart"
    html = f"""<div style="font-family:-apple-system,sans-serif;max-width:480px;margin:0 auto;background:#F0F0F2;padding:20px;border-radius:16px">
    <div style="background:#FFF;border-radius:14px;padding:20px;border:1px solid #DCDCE0">
    <div style="font-size:20px;font-weight:800;margin-bottom:4px">Crock N' Roll</div>
    <div style="background:#E8F1FB;border-radius:10px;padding:12px;margin:12px 0">
    <div style="color:#0071DC;font-weight:600">🛒 Grocery Day</div>
    <div style="font-size:16px;margin-top:6px;font-weight:600">{a['name']}<br>{b['name']}</div></div>
    <pre style="color:#5A5A64;white-space:pre-wrap;font-family:-apple-system,sans-serif;font-size:13px;background:#F8F8FA;border-radius:10px;padding:14px;line-height:1.8">{txt}</pre>
    <div style="background:#FFC220;border-radius:8px;padding:10px;text-align:center;margin-top:14px;font-weight:700;font-size:13px;color:#004C91">🛒 WALMART</div>
    </div></div>"""
    send_email(subject, html, plain)
    advance(d)

def cli():
    d = load()
    while True:
        a, b = pair(d)
        print(f"\n{'='*44}\nCrock N' Roll\n{'='*44}")
        print(f"\nThis week: {a['name']} + {b['name']}")
        if EXTRA: print(f"Also sending to: {', '.join(EXTRA)}")
        print("\n [1] View list  [2] Send full list  [3] Send nudge")
        print(" [4] Add extra  [5] Next rotation  [6] All meals  [q] Quit\n")
        ch = input("→ ").strip().lower()
        if ch=="1": print(f"\n{build(d)[0]}")
        elif ch=="2": send_full_list()
        elif ch=="3": send_nudge("Grocery reminder!")
        elif ch=="4":
            i=input("Add: ").strip()
            if i: d.setdefault("custom",[]).append(i); save(d); print(f"  ✅ {i}")
        elif ch=="5": advance(d); a2,b2=pair(d); print(f"  → {a2['name']} + {b2['name']}")
        elif ch=="6":
            for i,m in enumerate(MEALS): print(f"  {i+1}. {m['name']}")
        elif ch=="q": print("\nRock and roll.\n"); break

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "--send":
            dow = datetime.now().weekday()
            if dow == 4:    # Friday
                send_nudge("Grocery time is coming up!")
            elif dow == 5:  # Saturday
                send_nudge("Have you ordered groceries?")
            elif dow == 6:  # Sunday
                send_nudge("Tomorrow is grocery day!")
            elif dow == 1:  # Tuesday
                send_full_list()
            else:
                print(f"Today is {datetime.now().strftime('%A')} — no email.")
        elif sys.argv[1] == "--nudge":
            send_nudge("Grocery reminder!")
        elif sys.argv[1] == "--list":
            send_full_list()
    else:
        cli()

"""
CRON (crontab -e)
─────────────────
# Crock N' Roll: nudges Fri-Sun, full list Tuesday, all at 11:30 AM
30 11 * * 2,5,6,0 cd /path/to/crockn-roll/backend && python3 crockn_roll_email.py --send

# Or separate if you want different times:
# 30 11 * * 5 cd /path/to/crockn-roll/backend && python3 crockn_roll_email.py --send  # Friday nudge
# 30 11 * * 6 cd /path/to/crockn-roll/backend && python3 crockn_roll_email.py --send  # Saturday nudge
# 30 11 * * 0 cd /path/to/crockn-roll/backend && python3 crockn_roll_email.py --send  # Sunday nudge
# 30 11 * * 2 cd /path/to/crockn-roll/backend && python3 crockn_roll_email.py --send  # Tuesday list

MANUAL COMMANDS
───────────────
python crockn_roll_email.py          # interactive CLI
python crockn_roll_email.py --send   # auto (checks day of week)
python crockn_roll_email.py --nudge  # force nudge now
python crockn_roll_email.py --list   # force full list now
"""
