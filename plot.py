import pandas as pd
import matplotlib.pyplot as plt


df = pd.read_csv('tweets_per_month.csv')

df['Month'] = pd.to_datetime(df['Month'], format='%B %Y')

df = df.sort_values('Month')

plt.figure(figsize=(12, 6))
plt.plot(df['Month'], df['Number of Tweets'], marker='o', color='blue', linewidth=2)

plt.title('Number of Tweets Over Time', fontsize=16)
plt.xlabel('Month', fontsize=12)
plt.ylabel('Number of Tweets', fontsize=12)
plt.grid(True, linestyle='--', alpha=0.6)
plt.tight_layout()

plt.xticks(rotation=45)

plt.show()