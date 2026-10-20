
export function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function calculateTotalPrice(pricePerNight, checkIn, checkOut) {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const timeDifference = checkOutDate - checkInDate;
  const numberOfNights = timeDifference / (1000 * 60 * 60 * 24);

  return pricePerNight * numberOfNights;
}
