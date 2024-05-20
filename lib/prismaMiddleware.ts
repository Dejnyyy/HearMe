import { PrismaClient } from '@prisma/client';

const createExtendedPrismaClient = () => {
  const prisma = new PrismaClient();

  return prisma.$extends({
    query: {
      vote: {
        async delete({ args, query }) {
          const voteId = args.where.id;
          console.log(`Starting delete process for vote with ID: ${voteId}`);

          try {
            const vote = await prisma.vote.findUnique({ where: { id: voteId } });
            
            if (!vote) {
              console.log(`Vote with ID: ${voteId} not found`);
              // Optionally, you could throw an error here if you want to stop the deletion process
              // throw new Error(`Vote with ID: ${voteId} not found`);
            } else {
              console.log(`Vote found:`, vote);

              await prisma.deletedVote.create({
                data: {
                  originalId: vote.id,
                  createdAt: vote.createdAt,
                  song: vote.song,
                  artist: vote.artist,
                  voteType: vote.voteType,
                  userId: vote.userId,
                },
              });
              console.log(`Vote with ID: ${voteId} has been archived`);
            }

            const result = await query(args);
            console.log(`Deletion process completed for vote with ID: ${voteId}`);
            return result;
          } catch (error) {
            console.error(`Error during delete process for vote with ID: ${voteId}`, error);
            throw error; // Re-throw the error after logging it
          }
        },
      },
    },
  });
};

export default createExtendedPrismaClient;
