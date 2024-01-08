// Parses the time format "HH:MM:SS" (where HH and MM parts are entirely optional)
// into a single number of seconds
export function parseTimeToSeconds(timeString: string): number {
  // Split the time string into hours, minutes, and seconds
  const timeParts = timeString.split(':');

  // Extract hours, minutes, and seconds
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (timeParts.length === 3) {
    // If all three parts are present (HH:MM:SS)
    hours = parseInt(timeParts[0]);
    minutes = parseInt(timeParts[1]);
    seconds = parseInt(timeParts[2]);
  } else if (timeParts.length === 2) {
    // If only hours and minutes are present (HH:MM)
    minutes = parseInt(timeParts[0]);
    seconds = parseInt(timeParts[1]);
  } else if (timeParts.length === 1) {
    // If only seconds are present (SS)
    seconds = parseInt(timeParts[0]);
  }

  // Calculate total seconds
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  return totalSeconds;
}
