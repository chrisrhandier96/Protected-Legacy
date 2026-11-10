"""Tell Bing, Yandex, Seznam and Naver (IndexNow) which pages changed. Run once after a production deploy:
    python3 tools/indexnow.py            # every URL in sitemap.xml
    python3 tools/indexnow.py /guias/inundacion/ /en/guides/flood/   # only these
The key file /7cfc983ec2e2ffe0fb73434c6acc4973.txt must be live first. Google does not use IndexNow; for Google, submit the sitemap in Search Console."""
import json, re, sys, urllib.request
BASE, KEY = "https://www.protectedlegacyfl.com", "7cfc983ec2e2ffe0fb73434c6acc4973"
urls = [BASE + u for u in sys.argv[1:]] or re.findall(r"<loc>([^<]+)</loc>", open("sitemap.xml", encoding="utf-8").read())
body = json.dumps({"host": "www.protectedlegacyfl.com", "key": KEY, "keyLocation": f"{BASE}/{KEY}.txt", "urlList": urls}).encode()
req = urllib.request.Request("https://api.indexnow.org/indexnow", data=body, headers={"Content-Type": "application/json; charset=utf-8"})
with urllib.request.urlopen(req, timeout=30) as r:
    print(r.status, f"{len(urls)} URLs sent")  # 200 or 202 means accepted
