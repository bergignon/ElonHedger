import os
import random
import asyncio
from twikit import Client

USERNAME = 'bigbergbigbird'
EMAIL = 'businessduberg@gmail.com'
PASSWORD = 'ISSOU987'

with open("good_proxies.txt", "r") as f:
    proxies = [line.strip() for line in f if line.strip()]

proxy = proxies[4]
os.environ["HTTP_PROXY"] = f"http://{proxy}"
os.environ["HTTPS_PROXY"] = f"http://{proxy}"
print(f"Using proxy: {proxy}")

client = Client(language="en-US")

async def login():
    await client.login(
        auth_info_1=USERNAME,
        auth_info_2=EMAIL,
        password=PASSWORD,
    )
    client.save_cookies("cookies.json")
    tweets = await client.search_tweet('python', 'Latest')
    for tweet in tweets:
        print(tweet.user.name, tweet.text, tweet.created_at)

if __name__ == "__main__":
    asyncio.run(login())