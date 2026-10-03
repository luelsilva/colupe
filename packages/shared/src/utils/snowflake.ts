/**
 * ==============================================================================
 * Snowflake ID Generator - TypeScript / Bun
 * ==============================================================================
 * Layout (52 bits — seguro para Number.MAX_SAFE_INTEGER no JS):
 * ┌───────────────────┬──────────────┬──────────────────┐
 * │ 41 bits timestamp │ 4 bits wkr   │ 7 bits sequence  │
 * └───────────────────┴──────────────┴──────────────────┘
 * Epoch: 2026-01-01T00:00:00.000Z (1767225600000 ms)
 */

const CUSTOM_EPOCH = 1767225600000n; // 2026-01-01 00:00:00 UTC
const WORKER_BITS = 4n;
const SEQUENCE_BITS = 7n;
const MAX_WORKER_ID = (1n << WORKER_BITS) - 1n; // 15
const MAX_SEQUENCE = (1n << SEQUENCE_BITS) - 1n; // 127

let lastTimestamp = -1n;
let sequence = 0n;

export class SnowflakeGenerator {
  private workerId: bigint;

  constructor(workerId: number = 1) {
    if (workerId < 0 || BigInt(workerId) > MAX_WORKER_ID) {
      throw new Error(`Worker ID deve estar entre 0 e ${MAX_WORKER_ID}`);
    }
    this.workerId = BigInt(workerId);
  }

  public nextId(): number {
    let currentMs = BigInt(Date.now());

    if (currentMs < lastTimestamp) {
      throw new Error("Relógio do sistema retrocedeu! Recusando gerar ID.");
    }

    if (currentMs === lastTimestamp) {
      sequence = (sequence + 1n) & MAX_SEQUENCE;
      if (sequence === 0n) {
        // Sequência esgotada no mesmo ms, aguarda o próximo milissegundo
        while (currentMs <= lastTimestamp) {
          currentMs = BigInt(Date.now());
        }
      }
    } else {
      sequence = 0n;
    }

    lastTimestamp = currentMs;

    const timeDiff = currentMs - CUSTOM_EPOCH;
    const id = (timeDiff << (WORKER_BITS + SEQUENCE_BITS)) | (this.workerId << SEQUENCE_BITS) | sequence;

    return Number(id);
  }
}

export const defaultSnowflake = new SnowflakeGenerator(1);
export const generateSnowflakeId = (): number => defaultSnowflake.nextId();
