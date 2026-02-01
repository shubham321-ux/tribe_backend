import Booking from "./booking.model.js";
import { transporter } from "../../config/mail.js";

export const createBooking = async (req, res) => {
  const booking = await Booking.create(req.body);

  await transporter.sendMail({
    to: process.env.ADMIN_EMAIL,
    subject: "New Trip Booking",
    html: `<h3>${booking.name} booked a trip</h3>`
  });

  res.status(201).json({ message: "Booking successful" });
};
