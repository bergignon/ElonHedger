import asyncio
import aiohttp
from aiohttp import ClientConnectorError, ClientProxyConnectionError, ClientOSError

INPUT_FILE = "proxies_list.txt"
OUTPUT_FILE = "good_proxies.txt"
TEST_URL = "https://example.com" 
TIMEOUT = 10 

async def test_proxy(session, proxy):
    proxy_url = f"http://{proxy}"  # assumes HTTP proxy
    try:
        async with session.get(TEST_URL, proxy=proxy_url, timeout=TIMEOUT) as resp:
            if resp.status == 200:
                print(f"[OK] {proxy}")
                return proxy
            else:
                print(f"[FAIL] {proxy} - status {resp.status}")
                return None
    except Exception as e:
        print(f"[FAIL] {proxy} - {e}")
        return None

async def main():
    with open(INPUT_FILE, "r") as f:
        proxies = [line.strip() for line in f if line.strip()]

    good_proxies = []
    async with aiohttp.ClientSession() as session:
        tasks = [test_proxy(session, p) for p in proxies]
        for fut in asyncio.as_completed(tasks):
            result = await fut
            if result:
                good_proxies.append(result)

    # write working proxies
    with open(OUTPUT_FILE, "w") as f:
        for proxy in good_proxies:
            f.write(proxy + "\n")

    print(f"\nDone! {len(good_proxies)} proxies are working. Saved to {OUTPUT_FILE}.")

if __name__ == "__main__":
    asyncio.run(main())