import { NextResponse } from 'next/server';
import { ResultError } from './results';
export async function resultResponse(action: () => unknown | Promise<unknown>, status = 200) {
  try { return NextResponse.json(await action(), { status }); }
  catch (error) {
    if (error instanceof ResultError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('Could not persist parent follow-up:', error);
    return NextResponse.json({ error: 'Could not read or save the follow-up. Retry without starting a new session.' }, { status: 500 });
  }
}
export function sessionFrom(request: Request) {
  const id = new URL(request.url).searchParams.get('session_id');
  if (!id) throw new ResultError('session_id is required');
  return id;
}

export async function readJson(request: Request) {
  try { return await request.json(); } catch { throw new ResultError('Invalid JSON'); }
}
