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

model = auto_arima(
    y,
    seasonal=False,       
    stepwise=True,
    suppress_warnings=True,
    information_criterion="aic"
)
print(model.summary())
model.fit(y)

n_days = 15
forecast, conf_int = model.predict(n_periods=n_days, return_conf_int=True)

print("\nDaily forecast for next 15 days:")
for i, value in enumerate(forecast):
    print(f"Day {i+1}: {value:.2f}")

lower = conf_int[:, 0]
upper = conf_int[:, 1]
sigma_daily = (upper - forecast) / 1.96
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
p, d, q = model.order

model_sm = sm.tsa.SARIMAX(y, order=(p,d,q), seasonal_order=(0,0,0,0))
results = model_sm.fit(disp=False)

totals = []
for _ in range(n_sims):
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