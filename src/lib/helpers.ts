export function trimText(input: string, maxLength: number = 100): string {
  if (input.length <= maxLength) return input;
  return input.substring(0, maxLength - 3) + "...";
}

export function getCurrentTimeInItaly(): Date {
  // Create a date object with the current UTC time
  const now = new Date();

  // Convert the UTC time to Italy's time
  const offsetItaly = 2; // Italy is in Central European Summer Time (UTC+2), but you might need to adjust this based on Daylight Saving Time
  now.setHours(now.getUTCHours() + offsetItaly);

  return now;
}

export function getCurrentTimeInGermany(): Date {
  return new Date(new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Berlin" }).format(new Date()));
}

export function formatTimeForItaly(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true, // This will format the time in 12-hour format with AM/PM
    timeZone: "Europe/Rome",
  };

  let formattedTime = new Intl.DateTimeFormat("en-US", options).format(date);

  // Append the time zone abbreviation. You can automate this with libraries like `moment-timezone`.
  // For simplicity, here I'm just appending "CET", but do remember that Italy switches between CET and CEST.
  formattedTime += " CET";

  return formattedTime;
}

export function formatTimeForGermany(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // Uses 24-hour format, correct for Germany
    timeZone: "Europe/Berlin",
    timeZoneName: "short",
  };

  return new Intl.DateTimeFormat("en-US", options).format(date);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// export function parseYamlDatetime(ddlStr: string): Date {
//   // Replace space with 'T' to make it a valid ISO 8601 string
//   const isoStr = ddlStr.replace(" ", "T") + "Z"; // Assumes input is UTC
//   return new Date(isoStr);
// }

// export function getRemainingTimeForConf(ddlStr: string): { now: Date; gap: number } {
//   const ddl = parseYamlDatetime(ddlStr);
//   const now = getCurrentTimeInGermany();
//   const gap = Math.max(0, ddl.getTime() - now.getTime()); // Ensure gap is non-negative
//   return { now, gap };
// }


// export function formatGap(gapTime: number): string {
//   const seconds = Math.floor((gapTime / 1000) % 60);
//   const minutes = Math.floor((gapTime / (1000 * 60)) % 60);
//   const hours = Math.floor((gapTime / (1000 * 60 * 60)) % 24);
//   const days = Math.floor(gapTime / (1000 * 60 * 60 * 24));

//   return `${days}d ${hours}h ${minutes}m ${seconds}s`;
// }