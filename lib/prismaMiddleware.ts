import { PrismaClient } from '@prisma/client';

const createExtendedPrismaClient = () => {
  const prisma = new PrismaClient();

  return prisma.$extends({
    query: {
      vote: {
        async delete({ args, query }) {
          const voteId = args.where.id;
          const vote = await prisma.vote.findUnique({ where: { id: voteId } });

          if (vote) {
            console.log(`Moving deleted vote to DeletedVote table: ${voteId}`);
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
          }
          return query(args);
        },
      },
    },
  });
};

export default createExtendedPrismaClient;
