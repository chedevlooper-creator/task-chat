import { describe, it, expect } from 'vitest';
import { ApiClient } from '../src/client';
import fs from 'fs/promises';

describe('Real Backend Logic Integration', () => {
  const client = new ApiClient({ 
    apiKey: 'sk_test_123',
    baseUrl: 'http://127.0.0.1:3000'
  });

  const testFilePath = '/workspace/tests/real_test_file.txt';

  it('should create and write to a file via backend', async () => {
    const res = await client.files.writeFile(testFilePath, 'hello real world');
    expect(res.success).toBe(true);
    expect(res.path).toBe(testFilePath);

    // Verify from local filesystem directly
    const localContent = await fs.readFile(testFilePath, 'utf-8');
    expect(localContent).toBe('hello real world');
  });

  it('should read the file via backend', async () => {
    const res = await client.files.readFile(testFilePath);
    expect(res.path).toBe(testFilePath);
    expect(res.content).toBe('hello real world');
  });

  it('should run a bash command via backend', async () => {
    const res = await client.computer.runBash('echo "bash test"');
    expect(res.exitCode).toBe(0);
    expect(res.stdout.trim()).toBe('bash test');
  });

  it('should delete the file via backend', async () => {
    const res = await client.files.deleteFile(testFilePath);
    expect(res.success).toBe(true);

    // Verify it is gone
    await expect(fs.access(testFilePath)).rejects.toThrow();
  });
});