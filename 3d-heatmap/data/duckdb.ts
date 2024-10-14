// duckdb.ts
import { useEffect, useState } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';

// Import the DuckDB-Wasm assets using Vite's asset handling
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

export function useDuckDB() {
  const [db, setDb] = useState<duckdb.AsyncDuckDB | null>(null);

  useEffect(() => {
    async function initDuckDB() {
      const logger = new duckdb.ConsoleLogger();

      // Define the manual bundles
      const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
        mvp: {
          mainModule: duckdb_wasm,
          mainWorker: mvp_worker,
        },
        eh: {
          mainModule: duckdb_wasm_eh,
          mainWorker: eh_worker,
        },
      };

      // Select a bundle based on browser checks
      const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);

      // Instantiate the asynchronous version of DuckDB-Wasm
      const worker = new Worker(bundle.mainWorker);
      const db = new duckdb.AsyncDuckDB(logger, worker);

      // Instantiate the database with the selected bundle
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

      // Fetch the database file from your local server or public directory
      const response = await fetch('/acled_data.duckdb');
      const arrayBuffer = await response.arrayBuffer();

      // Register the database file with DuckDB-Wasm
      await db.registerFileBuffer('acled_data.duckdb', new Uint8Array(arrayBuffer));

      // Open the database
      const conn = await db.connect();
      await conn.query("ATTACH DATABASE 'acled_data.duckdb' AS acled");

      await conn.close();

      setDb(db);
    }

    initDuckDB();
  }, []);

  return db;
}
