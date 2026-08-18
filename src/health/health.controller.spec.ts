import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  it('should return ok status', () => {
    const result = controller.check();
    expect(result.status).toBe('ok');
    expect(result).toHaveProperty('uptime');
    expect(result).toHaveProperty('timestamp');
  });
});
