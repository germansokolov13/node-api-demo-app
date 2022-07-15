import { execSync } from 'child_process';

export function updateSphinxIndex(): void {
  execSync('docker-compose exec -T sphinx-test bash /etc/sphinxsearch/update-index.sh');
}
