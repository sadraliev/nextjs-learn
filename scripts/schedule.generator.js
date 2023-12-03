function generateSchedule(
  startDate,
  endDate,
  daysOfWeek = [0, 1, 2, 3, 4, 5, 6],
  startTime = [],
  endTime = []
) {
  if (startDate > endDate) {
    throw new Error("startDate must be less than endDate");
  }

  const schedule = [];

  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const dayOfWeek = date.getUTCDay();

    if (daysOfWeek.includes(dayOfWeek)) {
      const startDateTime = new Date(date);
      const endDateTime = new Date(date);

      const [
        startHours = 0,
        startMinutes = 0,
        startSeconds = 0,
        startMilliseconds = 0,
      ] = startTime;
      const [
        endHours = 0,
        endMinutes = 0,
        endSeconds = 0,
        endMilliseconds = 0,
      ] = endTime;

      startDateTime.setUTCHours(
        startHours,
        startMinutes,
        startSeconds,
        startMilliseconds
      );
      endDateTime.setUTCHours(
        endHours,
        endMinutes,
        endSeconds,
        endMilliseconds
      );

      schedule.push({
        lessonStartTime: startDateTime.toISOString(),
        lessonEndTime: endDateTime.toISOString(),
      });
    }
  }

  return schedule;
}

module.exports = {
  generateSchedule,
};
