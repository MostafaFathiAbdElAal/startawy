/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

const generateMeetingLink = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const part1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const part3 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `https://meet.google.com/${part1}-${part2}-${part3}`;
};

function logFulfillment(message: string) {
  const logPath = path.join(process.cwd(), "fulfillment_debug.log");
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
}

export async function fulfillPayment(session: any) {
  const metadata = session.metadata;

  if (!metadata) {
    logFulfillment("ERROR: No metadata found in session");
    throw new Error("No metadata found in session");
  }

  const type = metadata.type;
  const founderIdStr = metadata.founderId;
  const amount = session.amount_total ? session.amount_total / 100 : 0;

  logFulfillment(`Starting fulfillment for session ${session.id}, type: ${type}, founderId: ${founderIdStr}`);

  try {
    const founderId = parseInt(founderIdStr);
    if (isNaN(founderId)) {
        logFulfillment(`ERROR: Invalid founderId: ${founderIdStr}`);
        throw new Error(`Invalid founderId: ${founderIdStr}`);
    }

    if (type === "consultation") {
      const consultantIdStr = metadata.consultantId;
      const dateStr = metadata.date; // e.g., "2026-03-10"
      const timeStr = metadata.time; // e.g., "09:00 AM"

      logFulfillment(`Parsing consultation details: consultantId=${consultantIdStr}, date=${dateStr}, time=${timeStr}`);

      if (!consultantIdStr || !dateStr || !timeStr) {
          logFulfillment("ERROR: Missing consultation metadata fields (consultantId, date, or time)");
          throw new Error("Missing consultation metadata fields");
      }

      const consultantId = parseInt(consultantIdStr);
      if (isNaN(consultantId)) {
          logFulfillment(`ERROR: Invalid consultantId: ${consultantIdStr}`);
          throw new Error(`Invalid consultantId: ${consultantIdStr}`);
      }

      // Merge date and time strings into a single Date object
      const timeParts = timeStr.split(' ');
      if (timeParts.length !== 2) {
          logFulfillment(`ERROR: Invalid time format: ${timeStr}`);
          throw new Error(`Invalid time format: ${timeStr}`);
      }
      
      const [time, period] = timeParts;
      const [hStr, mStr] = time.split(':');
      const h = parseInt(hStr);
      const minutes = parseInt(mStr);
      
      if (isNaN(h) || isNaN(minutes)) {
          logFulfillment(`ERROR: Could not parse time components: h=${hStr}, m=${mStr}`);
          throw new Error("Could not parse time components");
      }

      let hours = h;
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      const sessionDate = new Date(dateStr);
      if (isNaN(sessionDate.getTime())) {
          logFulfillment(`ERROR: Invalid date format: ${dateStr}`);
          throw new Error(`Invalid date format: ${dateStr}`);
      }
      sessionDate.setHours(hours, minutes, 0, 0);

      logFulfillment(`Fulfillment target date: ${sessionDate.toISOString()}`);

      // Check if session already exists for this stripe session ID
      const existingSession = await prisma.session.findFirst({
        where: { notes: { contains: session.id } }
      });

      if (existingSession) {
        logFulfillment(`Session ${session.id} already fulfilled (Consultation). Skipping.`);
        return true;
      }

      // Generate Meeting Link
      const meetingLink = generateMeetingLink();
      logFulfillment(`Generated meeting link: ${meetingLink}`);

      // 1. Create Consultation Session (Step 1: Basic Data)
      // We exclude meetingLink here to bypass the "Unknown argument" Prisma Client error
      const consultation = await prisma.session.create({
        data: {
          founderId: founderId,
          consultantId: consultantId,
          date: sessionDate,
          duration: "1 Hour",
          notes: `Booked via Stripe (Session: ${session.id})`,
          paymentStatus: "PAID",
        },
      });

      logFulfillment(`Database record created: Session ID ${consultation.id}`);

      // 1.1 Update Meeting Link using Raw SQL (Bypasses Prisma Client validation)
      if (meetingLink) {
        try {
          await (prisma as any).$executeRaw`UPDATE Session SET meetingLink = ${meetingLink} WHERE id = ${consultation.id}`;
          logFulfillment(`Meeting link updated via Raw SQL for Session ${consultation.id}`);
        } catch (rawError) {
          logFulfillment(`WARNING: Failed to update meetingLink via Raw SQL: ${rawError}`);
          // We don't throw here to ensure payment record is still created
        }
      }

      // 2. record Payment
      await prisma.payment.create({
        data: {
          founderId: founderId,
          sessionId: consultation.id,
          paymentType: "Consultation",
          paymentMethod: "Stripe",
          amount: amount,
          transDate: new Date(),
        },
      });

      
      logFulfillment(`Database record created: Payment for Session ID ${consultation.id}`);
      logFulfillment(`[SUCCESS] Fulfillment complete for founder ${founderId}`);

    } else if (type === "subscription") {
      const planName = metadata.planName;
      logFulfillment(`Processing subscription: ${planName}`);

      // 1. Record Payment
      const payment = await prisma.payment.create({
        data: {
          founderId: founderId,
          paymentType: planName,
          paymentMethod: "Stripe",
          amount: amount,
          transDate: new Date(),
        },
      });

      // 2. Create Subscription
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await prisma.subscription.create({
        data: {
          paymentId: payment.id,
          status: "ACTIVE",
          trialType: planName === "Free Trial" ? "TRIAL" : "PAID",
          startDate: startDate,
          endDate: endDate,
        },
      });
      
      logFulfillment(`[SUCCESS] ${planName} subscription activated for founder ${founderId}`);
    }
    return true;
  } catch (dbError) {
    logFulfillment(`[CRASH] Database error during fulfillment: ${dbError}`);
    if (dbError instanceof Error) {
        logFulfillment(`Stack Trace: ${dbError.stack}`);
    }
    console.error("[FULFILLMENT] Database error during fulfillment:", dbError);
    throw dbError;
  }
}

