# CoastCast v1.5.0 — Ocean IQ + Safety Guard

## Ocean IQ
- New Home intelligence panel combines tide stage, next NOAA turn, tide-movement strength and the next three strongest movement windows.
- New Moon & Light context shows moon phase, approximate illumination, sunrise and sunset.
- Moon data is deliberately treated as secondary context rather than a guaranteed bite predictor.

## NWS Safety Guard
- CoastCast now requests active National Weather Service alerts for the exact fishing point when Live Data refreshes.
- The Safety Guard combines NWS alerts with loaded wave height, wind gusts and thunderstorm conditions.
- Statuses are **LOWER RISK**, **CAUTION**, **HIGH RISK**, or **VERIFY**. None should be read as a declaration that a beach is safe.
- NWS alert health appears in the source-status chips.

## 7-Day Tide Planner
- NOAA high/low prediction request expanded from roughly 2 days to 7 days.
- Forecast now groups high/low events into a horizontally scrollable week view.
- Mid-cycle water-movement windows are calculated between adjacent high/low predictions.

## Nationwide destination-local time fix
- Open-Meteo destination timezone and UTC offset are retained in CoastCast.
- Hourly weather labels, sunrise/sunset, NOAA tide labels and Tide Intelligence are handled as fishing-destination local time instead of blindly converting them to the phone's timezone.
- This is especially important when planning trips across U.S. time zones.

## Departure Check
- Trips now has a pre-departure briefing combining NWS hazards, regulation-review status, Smart Gear progress and live forecast-source health.
- This remains a planning aid; local authorities, lifeguards, posted warnings and official alerts control.
