declare module 'sql.js' {
  export interface SqlJsConfig {
    locateFile?: (file: string, prefix: string) => string;
  }

  export interface SqlJsDatabase {
    run(sql: string): void;
    prepare(sql: string): any;
    export(): Uint8Array;
  }

  export interface SqlJsStatic {
    Database: new (data?: Uint8Array) => SqlJsDatabase;
  }

  export default function initSqlJs(config?: SqlJsConfig): Promise<SqlJsStatic>;
}