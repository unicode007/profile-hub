import { DEMO_HOTELS } from "@/components/hotel/demoData";
import type { Hotel, Booking } from "@/components/hotel/types";
import type { PhysicalRoom } from "@/components/hotel/PhysicalRoomManager";
import { addDays, subDays } from "date-fns";

export const demoHotels: Hotel[] = DEMO_HOTELS;

export const demoBookings: Booking[] = (() => {
  const list: Booking[] = [];
  DEMO_HOTELS.slice(0, 3).forEach((h, hi) => {
    h.roomTypes.slice(0, 2).forEach((rt, ri) => {
      const offset = hi * 4 + ri * 2;
      list.push({
        id: `BKD-${hi}-${ri}-1`,
        hotelId: h.id,
        hotelName: h.name,
        hotelImage: h.images?.[0],
        hotelAddress: `${h.location.address}, ${h.location.city}`,
        roomName: rt.name,
        planName: rt.plans[0]?.name || "Standard",
        checkIn: subDays(new Date(), 1 + offset),
        checkOut: addDays(new Date(), 2 + offset),
        guests: { adults: 2, children: 0 },
        rooms: 1,
        guestInfo: {
          firstName: ["Asha", "Ravi", "Priya", "Karan", "Neha", "Vikram"][offset % 6],
          lastName: ["Rao", "Mehta", "Kapoor", "Singh", "Patel", "Iyer"][offset % 6],
          email: `guest${offset}@example.com`,
          phone: "+91 98765 4321" + (offset % 10),
          country: "India",
        },
        totalAmount: 4500 + offset * 1100,
        status: (offset % 3 === 0 ? "checked-in" : offset % 3 === 1 ? "confirmed" : "completed") as Booking["status"],
        paymentMethod: "card",
        createdAt: subDays(new Date(), 5 + offset),
      });
    });
  });
  return list;
})();

export const demoPhysicalRooms: PhysicalRoom[] = (() => {
  const rooms: PhysicalRoom[] = [];
  DEMO_HOTELS.forEach((h) => {
    h.roomTypes.forEach((rt, rti) => {
      for (let i = 1; i <= 3; i++) {
        const num = `${rti + 1}${String(i).padStart(2, "0")}`;
        rooms.push({
          id: `${h.id}-${rt.id}-${i}`,
          roomNumber: num,
          floor: rti + 1,
          roomTypeId: rt.id,
          hotelId: h.id,
          hotelName: h.name,
          roomTypeName: rt.name,
          status: (["available", "occupied", "dirty", "cleaning", "maintenance", "available"][(rti + i) % 6]) as PhysicalRoom["status"],
          keyCardNumber: `KC-${num}`,
        });
      }
    });
  });
  return rooms;
})();

export const noopRoomUpdate = () => {};
export const noopAssign = () => {};
export const noopRelease = () => {};
export const noopAddCharge = () => {};
export const noopBookingUpdate = () => {};