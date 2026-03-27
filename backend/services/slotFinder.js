function mergeIntervals(intervals) {
  if (!intervals.length) return [];

  const sorted = intervals
    .map((interval) => ({
      start: new Date(interval.start),
      end: new Date(interval.end),
    }))
    .sort((a, b) => a.start - b.start);

  const merged = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const current = sorted[i];

    if (current.start <= last.end) {
      last.end = new Date(Math.max(last.end, current.end));
    } else {
      merged.push(current);
    }
  }

  return merged;
}

function getDatesInRange(startDateStr, endDateStr) {
  const dates = [];
  const current = new Date(startDateStr);
  const end = new Date(endDateStr);

  current.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function setTimeOnDate(date, hours, minutes = 0) {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function findAvailableSlots({
  busyIntervals,
  rangeStart,
  rangeEnd,
  durationMinutes,
  workStartHour = 9,
  workEndHour = 18,
  maxSuggestions = 5,
}) {
  const suggestions = [];
  const mergedBusy = mergeIntervals(busyIntervals);
  const days = getDatesInRange(rangeStart, rangeEnd);

  for (const day of days) {
    const workDayStart = setTimeOnDate(day, workStartHour, 0);
    const workDayEnd = setTimeOnDate(day, workEndHour, 0);

    const dayBusy = mergedBusy
      .filter(
        (interval) =>
          interval.end > workDayStart &&
          interval.start < workDayEnd &&
          interval.start.toDateString() === day.toDateString()
      )
      .sort((a, b) => a.start - b.start);

    let pointer = new Date(workDayStart);

    for (const interval of dayBusy) {
      if (interval.start > pointer) {
        const gapMinutes = (interval.start - pointer) / (1000 * 60);

        if (gapMinutes >= durationMinutes) {
          suggestions.push({
            start: new Date(pointer),
            end: new Date(pointer.getTime() + durationMinutes * 60000),
          });

          if (suggestions.length >= maxSuggestions) return suggestions;
        }
      }

      if (interval.end > pointer) {
        pointer = new Date(interval.end);
      }
    }

    const finalGapMinutes = (workDayEnd - pointer) / (1000 * 60);
    if (finalGapMinutes >= durationMinutes) {
      suggestions.push({
        start: new Date(pointer),
        end: new Date(pointer.getTime() + durationMinutes * 60000),
      });

      if (suggestions.length >= maxSuggestions) return suggestions;
    }
  }

  return suggestions;
}

module.exports = { findAvailableSlots };