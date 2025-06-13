import { NextResponse } from 'next/server';
import { userService } from '@/services/user';

export async function POST() {
  const currentUser = await userService.getUser();

  return NextResponse.json(currentUser);
}

export async function GET() {
  const currentUser = await userService.getUser();

  return NextResponse.json(currentUser);
}
