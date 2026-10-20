// O único banco em que os scripts da demo escrevem: o contêiner mm-demo-db (postgres:16-alpine), publicado na porta
// 5433 e com o volume mm-demo-pgdata. Antes de cada comando, confere que o alvo é ele; se não for, para. O banco de
// desenvolvimento (meetingmanager_db, volume pgdata, porta 5432) nunca é tocado.
import { execFileSync } from 'node:child_process';

export const DEMO_DB = { container: 'mm-demo-db', port: '5433', volume: 'mm-demo-pgdata', user: 'meeting_user', database: 'meeting_db' };

export function assertDemoDb() {
      let info;
      try {
            info = JSON.parse(execFileSync('docker', ['inspect', '--type', 'container', DEMO_DB.container], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }))[0];
      } catch {
            throw new Error(`no ${DEMO_DB.container} container: start the demo instance first (demo-instance.sh up)`);
      }
      const ports = info.HostConfig?.PortBindings?.['5432/tcp'] ?? [];
      const volumes = (info.Mounts ?? []).map((mount) => mount.Name);
      const problems = [];
      if (info.Name !== `/${DEMO_DB.container}`) problems.push(`name ${info.Name}`);
      if (!info.State?.Running) problems.push('not running');
      if (!String(info.Config?.Image).startsWith('postgres:16')) problems.push(`image ${info.Config?.Image}`);
      if (ports.length !== 1 || ports[0].HostPort !== DEMO_DB.port) problems.push(`published on ${ports.map((p) => p.HostPort).join(',') || 'no port'}`);
      if (!volumes.includes(DEMO_DB.volume)) problems.push(`volumes ${volumes.join(',') || 'none'}`);
      if (problems.length) throw new Error(`refusing to touch the database: ${DEMO_DB.container} is not the demo database (${problems.join('; ')})`);
}

/** Roda SQL no banco da demo e devolve as linhas (colunas separadas por tabulação). */
export function sql(query) {
      assertDemoDb();
      return execFileSync('docker', ['exec', '-i', DEMO_DB.container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', DEMO_DB.user, '-d', DEMO_DB.database, '-At', '-F', '\t'],
            { input: query, encoding: 'utf8' }).trim();
}

/** Um texto como literal SQL. */
export const lit = (value) => `'${String(value).replace(/'/g, "''")}'`;
