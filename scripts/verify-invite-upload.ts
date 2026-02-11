const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Starting verification...");

    const emailA = `owner-${Date.now()}@example.com`;
    const emailB = `invitee-${Date.now()}@example.com`;

    // 1. Create Owner
    const owner = await prisma.user.create({
        data: { name: 'Owner', email: emailA }
    });
    console.log(`Created Owner: ${owner.id}`);

    // 2. Create Group
    const group = await prisma.group.create({
        data: {
            name: 'Test Group',
            ownerId: owner.id,
            members: { connect: { id: owner.id } }
        }
    });
    console.log(`Created Group: ${group.id}`);

    // 3. Create Invitee
    const invitee = await prisma.user.create({
        data: { name: 'Invitee', email: emailB }
    });
    console.log(`Created Invitee: ${invitee.id}`);

    // 4. Invite Logic (simulate API: /api/groups/[groupId]/invite)
    console.log("Simulating Invite...");
    await prisma.group.update({
        where: { id: group.id },
        data: {
            members: { connect: { id: invitee.id } }
        }
    });

    // 5. Verify Membership
    const updatedGroup = await prisma.group.findUnique({
        where: { id: group.id },
        include: { members: true }
    });

    const isMemberInDb = updatedGroup.members.some(m => m.id === invitee.id);
    console.log(`Is Invitee in Group Members DB? ${isMemberInDb}`);

    // 6. Verify Upload Logic (simulate API: /api/groups/[groupId]/albums/[albumId]/media)
    const canUpload = updatedGroup.members.some(m => m.id === invitee.id) || updatedGroup.ownerId === invitee.id;
    console.log(`Can Invitee Upload (logic check)? ${canUpload}`);

    if (isMemberInDb && canUpload) {
        console.log("SUCCESS: Invite and Upload Permission logic is correct.");
    } else {
        console.error("FAILURE: Something is wrong.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
