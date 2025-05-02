import { exec } from 'child_process';

const args = process.argv.slice(2); // Get arguments passed to the script

if (args.length === 0) {
  console.error('Error: Migration name is required.');
  console.log('Usage: npm run migration:generate <MigrationName>');
  process.exit(1);
}

const migrationName = args[0];
const command = `npm run typeorm -- migration:generate src/tracking/infrastructure/database/postgresql/migrations/${migrationName}`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Stdout: ${stdout}`);
});
