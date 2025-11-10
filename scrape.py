import kagglehub
import csv
from datetime import datetime
from collections import Counter
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

# path = kagglehub.dataset_download("dadalyndell/elon-musk-tweets-2010-to-2025-march")
# input_file = 'all_musk_posts.csv'  
# output_file = 'tweet_dates.csv'  

# dates = []
# with open(input_file, 'r', encoding='utf-8') as f:
#     reader = csv.DictReader(f)
#     for row in reader:
#         if row['createdAt']:
#             date_str = row['createdAt'].split()[0]
#             dates.append(date_str)

# with open(output_file, 'w', encoding='utf-8', newline='') as f:
#     writer = csv.writer(f)
#     writer.writerow(['createdAt'])  
#     for date in dates:
#         writer.writerow([date])

# input_file = 'tweet_dates.csv' 
# dates = []

# with open(input_file, 'r', encoding='utf-8') as f:
#     reader = csv.DictReader(f)
#     for row in reader:
#         if row['createdAt']:
#             date_str = row['createdAt'].split()[0]
#             dt = datetime.strptime(date_str, '%Y-%m-%d')
            
#             if dt.year >= 2020:
#                 dates.append(date_str)

# daily_counts = Counter()
# monthly_counts = Counter()
# yearly_counts = Counter()
# day_of_month_counts = Counter()

# for date_str in dates:
#     dt = datetime.strptime(date_str, '%Y-%m-%d')
    
#     daily_counts[date_str] += 1
#     month_year = dt.strftime('%B %Y')
#     monthly_counts[month_year] += 1
#     yearly_counts[str(dt.year)] += 1
#     day_of_month_counts[dt.day] += 1

# with open('tweets_per_day.csv', 'w', encoding='utf-8', newline='') as f:
#     writer = csv.writer(f)
#     writer.writerow(['Date', 'Number of Tweets'])
#     for date in sorted(daily_counts.keys()):
#         writer.writerow([date, daily_counts[date]])

# with open('tweets_per_month.csv', 'w', encoding='utf-8', newline='') as f:
#     writer = csv.writer(f)
#     writer.writerow(['Month', 'Number of Tweets'])
#     sorted_months = sorted(monthly_counts.items(), 
#                           key=lambda x: datetime.strptime(x[0], '%B %Y'))
#     for month, count in sorted_months:
#         writer.writerow([month, count])

# with open('tweets_per_year.csv', 'w', encoding='utf-8', newline='') as f:
#     writer = csv.writer(f)
#     writer.writerow(['Year', 'Number of Tweets'])
#     for year in sorted(yearly_counts.keys()):
#         writer.writerow([year, yearly_counts[year]])

# with open('tweets_distribution_by_day_of_month.csv', 'w', encoding='utf-8', newline='') as f:
#     writer = csv.writer(f)
#     writer.writerow(['Day of Month', 'Number of Tweets'])
#     for day in sorted(day_of_month_counts.keys()):
#         writer.writerow([day, day_of_month_counts[day]])
