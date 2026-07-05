import { client } from './src/db';

async function main() {
    const admin = await client.user.findFirst({
        where: { role: 'ADMIN' }
    });
    console.log(admin);
}

main().catch(console.error).finally(() => client.$disconnect());
