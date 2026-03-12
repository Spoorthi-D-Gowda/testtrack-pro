function isQuietHours(pref) {

  // If quiet hours are not set → notifications allowed
  if (!pref || !pref.quietStart || !pref.quietEnd) {
    return false;
  }

  try {

    const now = new Date();

    const currentMinutes =
      now.getHours() * 60 + now.getMinutes();

    const [startH, startM] =
      pref.quietStart.split(":").map(Number);

    const [endH, endM] =
      pref.quietEnd.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    // Case 1: quiet hours cross midnight
    // Example: 22:00 → 07:00
    if (startMinutes > endMinutes) {
      return (
        currentMinutes >= startMinutes ||
        currentMinutes <= endMinutes
      );
    }

    // Case 2: normal same-day quiet hours
    // Example: 13:00 → 17:00
    return (
      currentMinutes >= startMinutes &&
      currentMinutes <= endMinutes
    );

  } catch (err) {

    console.error("Quiet hours parse error:", err);

    // If anything fails → allow notifications
    return false;
  }
}

module.exports = { isQuietHours };