import pandas as pd
import numpy as np
from pmdarima import auto_arima
import statsmodels.api as sm
from scipy.stats import norm
import warnings

warnings.filterwarnings('ignore', category=FutureWarning, module='statsmodels')
warnings.filterwarnings('ignore', category=UserWarning, module='statsmodels')

df = pd.read_csv("tweets_per_day.csv", parse_dates=["Date"], index_col="Date")
y = df["Number of Tweets"]

model_search = auto_arima(
    y,
    seasonal=False,       
    stepwise=True,
    suppress_warnings=True,
    information_criterion="aic"
)

p, d, q = model_search.order
model = sm.tsa.SARIMAX(y, order=(p, d, q), seasonal_order=(0, 0, 0, 0))
results = model.fit(disp=False)
print(results.summary())

n_days = 15
forecast_obj = results.get_forecast(steps=n_days)
forecast = forecast_obj.predicted_mean
conf_int = forecast_obj.conf_int()

print("\nDaily forecast for next 15 days:")
for i, value in enumerate(forecast):
    print(f"Day {i+1}: {value:.2f}")

lower = conf_int.iloc[:, 0].values
upper = conf_int.iloc[:, 1].values
sigma_daily = (upper - forecast.values) / 1.96
variance_daily = sigma_daily**2

expected_total = forecast.sum()
print(f"\nExpected total tweets in next {n_days} days: {expected_total:.2f}")

total_variance = variance_daily.sum()
total_std = np.sqrt(total_variance)
print(f"Std Dev: {total_std:.2f}")

lower_total = norm.ppf(0.025, expected_total, total_std)
upper_total = norm.ppf(0.975, expected_total, total_std)
print(f"\n95% CI: [{lower_total:.2f}, {upper_total:.2f}]")

n_sims = 10000

print(f"\nRunning {n_sims} Monte Carlo simulations...")
totals = []

for i in range(n_sims):
    if (i + 1) % 1000 == 0:
        print(f"  Completed {i+1}/{n_sims} simulations")
    
    sim = results.simulate(
        nsimulations=n_days,
        anchor='end',  
        repetitions=1
    )
    totals.append(sim.sum())

totals = np.array(totals)
mean_total = totals.mean()
std_total = totals.std()
ci_lower = np.percentile(totals, 2.5)
ci_upper = np.percentile(totals, 97.5)

print(f"\nMonte Carlo estimate for next {n_days} days:")
print(f"Mean: {mean_total:.2f}")
print(f"Std dev: {std_total:.2f}")
print(f"95% CI: [{ci_lower:.2f}, {ci_upper:.2f}]")

print(f"Mean difference: {abs(expected_total - mean_total):.2f}")
print(f"Std Dev difference: {abs(total_std - std_total):.2f}")