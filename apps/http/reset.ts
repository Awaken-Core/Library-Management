import { client } from '@repo/db';
import { hashPassword } from './src/utils/password.js';

async function main() {
    const admin = await client.user.findFirst({
        where: { role: 'ADMIN' }
    });
    
    if (admin) {
        const hash = await hashPassword('Admin@123');
        await client.user.update({
            where: { id: admin.id },
            data: { password: hash }
        });
        console.log('Password successfully reset to: Admin@123');
    } else {
        console.log('Admin not found');
    }
}

main().catch(console.error).finally(() => client.$disconnect());
