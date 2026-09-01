import { SessionService } from './session.service';
import { InMemorySessionRepository } from './in-memory-session.repository';

describe('SessionService', () => {
  let service: SessionService;
  let repo: InMemorySessionRepository;

  beforeEach(() => {
    repo = new InMemorySessionRepository();
    service = new SessionService(repo);
  });

  it('creates a session', async () => {
    const session = await service.createSession(
      1,
      'refresh-token-123',
      'Chrome',
      '127.0.0.1',
    );
    expect(session.id).toBeGreaterThan(0);
    expect(session.device).toBe('Chrome');
    expect(session.ip).toBe('127.0.0.1');
  });

  it('finds session by refresh token', async () => {
    await service.createSession(1, 'token-abc');
    const found = await service.findSession('token-abc');
    expect(found).not.toBeNull();
    expect(found!.userId).toBe(1);
  });

  it('returns null for non-existent token', async () => {
    const found = await service.findSession('non-existent');
    expect(found).toBeNull();
  });

  it('lists sessions for a user', async () => {
    await service.createSession(1, 'token-1');
    await service.createSession(1, 'token-2');
    await service.createSession(2, 'token-3');

    const sessions = await service.listSessions(1);
    expect(sessions.length).toBe(2);
  });

  it('revokes a specific session', async () => {
    const s1 = await service.createSession(1, 'token-1');
    await service.createSession(1, 'token-2');

    await service.revokeSession(s1.id, 1);
    const sessions = await service.listSessions(1);
    expect(sessions.length).toBe(1);
  });

  it('revokes all sessions for a user', async () => {
    await service.createSession(1, 'token-1');
    await service.createSession(1, 'token-2');
    await service.revokeAllSessions(1);
    const sessions = await service.listSessions(1);
    expect(sessions.length).toBe(0);
  });

  it('rotates session (deletes old, creates new)', async () => {
    const old = await service.createSession(1, 'old-token');
    const newSession = await service.rotateSession(
      old.id,
      1,
      'new-token',
      'Firefox',
      '10.0.0.1',
    );

    expect(newSession.id).not.toBe(old.id);
    const sessions = await service.listSessions(1);
    expect(sessions.length).toBe(1);
    expect(sessions[0].device).toBe('Firefox');
  });
});
