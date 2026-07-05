import { client } from './src/db';
import * as bcrypt from 'bcryptjs';

async function main() {
    const admin = await client.user.findFirst({
        where: { role: 'ADMIN' }
    });
    
    if (admin) {
        const hash = await bcrypt.hash('Admin@123', 10);
        await client.user.update({
            where: { id: admin.id },
            data: { password: hash }
        });
        console.log('Password reset to: Admin@123');
    } else {
        console.log('Admin not found');
    }
}

main().catch(console.error).finally(() => client.$disconnect());
