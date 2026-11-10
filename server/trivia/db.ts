import fs from 'fs';
import path from 'path';
import initSqlJs from 'sql.js';
import type { Trivia } from './types';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'trivia.db');

let db: any = null;

function persist() {
  fs.writeFileSync(DB_FILE, Buffer.from(db.export()));
}

async function initDb() {
  if (db) return db;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const SQL = await initSqlJs({});

  db = fs.existsSync(DB_FILE)
    ? new SQL.Database(new Uint8Array(fs.readFileSync(DB_FILE)))
    : new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS trivia_assignments (
      id TEXT PRIMARY KEY,
      browserId TEXT,
      date TEXT,
      category TEXT,
      title TEXT,
      explanation TEXT,
      doyaPoint TEXT,
      starter TEXT,
      target TEXT
    );
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_trivia_date ON trivia_assignments(date);');
  db.run('CREATE INDEX IF NOT EXISTS idx_trivia_browser_date ON trivia_assignments(browserId, date);');
  persist();
  return db;
}

export async function getAssignment(browserId: string, dateKey: string): Promise<Trivia | null> {
  await initDb();
  const stmt = db.prepare('SELECT * FROM trivia_assignments WHERE browserId = :b AND date = :d');
  stmt.bind({ ':b': browserId, ':d': dateKey });
  if (!stmt.step()) {
    stmt.free();
    return null;
  }
  const row = stmt.getAsObject();
  stmt.free();
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    explanation: row.explanation,
    doyaPoint: row.doyaPoint,
    starter: row.starter,
    target: JSON.parse(row.target || '[]'),
    date: row.date,
  } as Trivia;
}

export async function insertAssignment(trivia: Trivia, browserId: string) {
  await initDb();
  const stmt = db.prepare(`
    INSERT INTO trivia_assignments (id, browserId, date, category, title, explanation, doyaPoint, starter, target)
    VALUES (:id, :b, :d, :cat, :title, :exp, :doya, :starter, :target)
  `);
  stmt.bind({
    ':id': trivia.id,
    ':b': browserId,
    ':d': trivia.date,
    ':cat': trivia.category,
    ':title': trivia.title,
    ':exp': trivia.explanation,
    ':doya': trivia.doyaPoint,
    ':starter': trivia.starter,
    ':target': JSON.stringify(trivia.target),
  });
  stmt.run();
  stmt.free();
  persist();
}

export async function deleteAssignment(browserId: string, dateKey: string) {
  await initDb();
  const stmt = db.prepare('DELETE FROM trivia_assignments WHERE browserId = :b AND date = :d');
  stmt.bind({ ':b': browserId, ':d': dateKey });
  stmt.run();
  stmt.free();
  persist();
}

export async function getUsedTitles(dateKey: string): Promise<string[]> {
  await initDb();
  const stmt = db.prepare('SELECT title FROM trivia_assignments WHERE date = :d');
  stmt.bind({ ':d': dateKey });
  const titles: string[] = [];
  while (stmt.step()) {
    titles.push(String(stmt.getAsObject().title || ''));
  }
  stmt.free();
  return titles;
}

export async function pruneBefore(cutoffKey: string) {
  await initDb();
  const stmt = db.prepare('DELETE FROM trivia_assignments WHERE date < :c');
  stmt.bind({ ':c': cutoffKey });
  stmt.run();
  stmt.free();
  persist();
}
