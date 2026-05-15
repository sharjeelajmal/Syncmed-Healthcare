import * as Pusher from 'pusher-js';

// Robust constructor detection for different module systems
const PusherClass = (Pusher as any).Pusher || (Pusher as any).default || Pusher;

export const pusherClient = typeof window !== 'undefined'
  ? new PusherClass(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      }
    )
  : null;
