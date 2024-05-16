// lib/prismaMiddleware.ts
import { Prisma } from '@prisma/client';
import prisma from './prisma';

const logAndMoveDeletedVote: Prisma.Middleware = async (params, next) => {
  console.log(`Middleware triggered for action: ${params.action} on model: ${params.model}`);
  
  if (params.model === 'Vote' && params.action === 'delete') {
    const voteId = params.args.where.id;
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
  }

  return next(params);
};

export default logAndMoveDeletedVote;
