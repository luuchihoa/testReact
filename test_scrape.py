
import urllib.request
from bs4 import BeautifulSoup
import re

def clean_text(text):
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

url = 'https://tgpsaigon.net/bai-viet/loi-chua-chua-nhat-16-thuong-nien-nam-a-40621'
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    print('Scraped successfully. Length:', len(html))
    # Extract just text body roughly
    body_start = html.find('<body')
    body_end = html.find('</body')
    if body_start != -1 and body_end != -1:
        body_text = clean_text(html[body_start:body_end])
        print(body_text[:3000])
except Exception as e:
    print('Failed', e)

